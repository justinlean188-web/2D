import { StudioConfig } from '../types';

/**
 * ExtendedPaperBallRenderer
 *
 * A single continuous 30-second timeline for "The Paper Ball Ricochet — 30s".
 * It keeps one room, one stickman rig, and one set of flat vector props across
 * all eight scenes. Everything is drawn procedurally in 1080x1920.
 */

type EyeStyle =
  | 'normal'
  | 'wide'
  | 'happy'
  | 'closed'
  | 'half'
  | 'cross'
  | 'spiral'
  | 'oneOpen'
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

type HandStyle = 'relaxed' | 'hold' | 'fist' | 'thumb' | 'point' | 'open';

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
  showRuler: boolean;
  showCalculator: boolean;
  birds: boolean;
  anger: boolean;
  sweat: boolean;
}

interface BallState {
  visible: boolean;
  held: boolean;
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  speed: number;
}

const TAU = Math.PI * 2;

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const smooth = (u: number) => {
  const x = clamp(u, 0, 1);
  return x * x * (3 - 2 * x);
};
const easeOut = (u: number) => 1 - Math.pow(1 - clamp(u, 0, 1), 2);
const easeIn = (u: number) => Math.pow(clamp(u, 0, 1), 2);

export class ExtendedPaperBallRenderer {
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
  private readonly trashTopY = 1305;
  private readonly trashW = 112;
  private readonly trashH = 155;

  private readonly charX = 590;
  private readonly headRadius = 70;

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
    this.renderSpilledPaper(ctx, t);

    const pose = this.getPose(t);
    const ball = this.getBallState(t);
    this.renderStickman(ctx, pose, t, ball);

    if (ball.visible && !ball.held) {
      this.renderBallTrail(ctx, t, ball);
      this.drawPaperBall(ctx, ball.x, ball.y, ball.rotation, ball.scaleX, ball.scaleY, 1);
    }

    this.renderEffects(ctx, t, pose, ball);
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

    if (t >= 8.0 && t < 11.0) {
      x = 590;
      y = 900;
      zoom = 1.07;
    } else if (t >= 15.0 && t < 19.0) {
      const ball = this.getBallState(t);
      zoom = 1.05;
      if (ball.visible && !ball.held) {
        x = 540 + (ball.x - 540) * 0.16;
        y = 960 + (ball.y - 960) * 0.11;
      }
    } else if (t >= 19.0 && t < 23.0) {
      x = 700;
      y = 1040;
      zoom = 1.27;
    } else if (t >= 23.0 && t < 27.0) {
      x = 660;
      y = 970;
      zoom = 1.08;
    } else if (t >= 27.0) {
      x = 815;
      y = 1125;
      zoom = 1.12;
    }

    let shakeX = 0;
    let shakeY = 0;
    const impacts = [
      { at: 1.8, amp: 7 },
      { at: 9.0, amp: 8 },
      { at: 9.6, amp: 13 },
      { at: 16.3, amp: 7 },
      { at: 17.0, amp: 8 },
      { at: 17.7, amp: 12 },
      { at: 23.0, amp: 3 },
      { at: 27.0, amp: 15 },
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

    // Right wall corner
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(1015, 255);
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

    const spin = t * 5.1;
    let bladeFlex = 0;
    if (t >= 17.7 && t <= 18.15) {
      const u = (t - 17.7) / 0.45;
      bladeFlex = Math.sin(u * Math.PI * 3.2) * 18 * (1 - u);
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
    if (t >= 17.7 && t <= 18.05) {
      const u = (t - 17.7) / 0.35;
      ctx.save();
      ctx.translate(95, 45);
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
  // TABLE
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

  // ==========================================================
  // TABLE LAMP
  // ==========================================================

  private renderTableLamp(ctx: CanvasRenderingContext2D, t: number) {
    ctx.save();
    ctx.translate(this.lampX, this.tableY);

    let wobble = 0;
    if (t >= 16.3 && t <= 17.4) {
      const u = (t - 16.3) / 1.1;
      wobble = Math.sin(u * Math.PI * 6) * 0.34 * Math.exp(-u * 3.1);
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

    if (t >= 16.3 && t <= 16.6) {
      const u = (t - 16.3) / 0.3;
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
    const tip = smooth((t - 26.95) / 0.38) * 1.32;
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

    // A couple of white crumple tips peeking over the rim after the win.
    if (t >= 23.0 && t < 26.95) {
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.arc(i * 24, -h - 2 + Math.abs(i) * 3, 10 - Math.abs(i) * 2, 0, TAU);
        ctx.fill();
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  private renderSpilledPaper(ctx: CanvasRenderingContext2D, t: number) {
    if (t < 27.0) return;

    const targets = [
      { x: 935, y: 1438, r: 22 },
      { x: 985, y: 1448, r: 19 },
      { x: 1025, y: 1432, r: 21 },
      { x: 890, y: 1450, r: 18 },
      { x: 965, y: 1412, r: 16 },
    ];

    const base = clamp((t - 27.0) / 0.55, 0, 1);
    targets.forEach((target, i) => {
      const delay = i * 0.055;
      const u = smooth(clamp((base - delay) / 0.72, 0, 1));
      const startX = this.trashX + 35;
      const startY = this.trashTopY + 10;
      const x = lerp(startX, target.x, u);
      const y = lerp(startY, target.y, u) - Math.sin(u * Math.PI) * (120 + i * 8);
      this.drawPaperBall(
        ctx,
        x,
        y,
        u * 3.4 + i,
        1 - (1 - u) * 0.05,
        1,
        1
      );
    });
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
      showRuler: false,
      showCalculator: false,
      birds: false,
      anger: false,
      sweat: false,
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
      showRuler: discrete.showRuler,
      showCalculator: discrete.showCalculator,
      birds: discrete.birds,
      anger: discrete.anger,
      sweat: discrete.sweat,
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
    let pose: Pose;

    if (t < 4.0) {
      pose = this.fromFrames(t, [
        [
          0.0,
          this.pose({
            face: 0,
            eye: 'normal',
            brow: 'neutral',
            mouth: 'flat',
            gazeX: 0.7,
            gazeY: -0.1,
            rightHand: { x: 78, y: -92 },
            rightHandStyle: 'hold',
            leftHand: { x: -58, y: -52 },
          }),
        ],
        [
          0.55,
          this.pose({
            face: 0,
            eye: 'normal',
            brow: 'neutral',
            mouth: 'flat',
            gazeX: 0.85,
            gazeY: -0.2,
            lean: -0.02,
            rightHand: { x: 70, y: -125 },
            rightHandStyle: 'hold',
          }),
        ],
        [
          0.8,
          this.pose({
            face: 0,
            eye: 'normal',
            brow: 'neutral',
            mouth: 'flat',
            gazeX: 0.9,
            gazeY: -0.15,
            lean: 0.09,
            rightHand: { x: 128, y: -170 },
            rightElbow: 26,
            rightHandStyle: 'relaxed',
          }),
        ],
        [
          1.05,
          this.pose({
            face: 0,
            eye: 'normal',
            brow: 'neutral',
            mouth: 'flat',
            gazeX: 0.9,
            gazeY: 0.05,
            lean: 0.1,
            rightHand: { x: 158, y: -128 },
            rightElbow: 15,
          }),
        ],
        [
          1.8,
          this.pose({
            face: 0,
            eye: 'normal',
            brow: 'neutral',
            mouth: 'flat',
            gazeX: 0.9,
            gazeY: 0.15,
            lean: 0.0,
            rightHand: { x: 62, y: -52 },
          }),
        ],
        [
          2.25,
          this.pose({
            face: 0.15,
            eye: 'normal',
            brow: 'neutral',
            mouth: 'flat',
            gazeX: 0.2,
            gazeY: 0,
            headTilt: 0.03,
            rightHand: { x: 62, y: -52 },
          }),
        ],
        [
          3.35,
          this.pose({
            face: 1,
            eye: 'wide',
            brow: 'oneRaised',
            mouth: 'flat',
            gazeX: 0,
            gazeY: 0,
            headTilt: 0.1,
            leftHand: { x: -45, y: -95 },
            leftElbow: 24,
            rightHand: { x: 50, y: -60 },
          }),
        ],
        [
          4.0,
          this.pose({
            face: 1,
            eye: 'wide',
            brow: 'oneRaised',
            mouth: 'flat',
            gazeX: 0,
            gazeY: 0,
            headTilt: 0.1,
            leftHand: { x: -45, y: -95 },
            leftElbow: 24,
            rightHand: { x: 50, y: -60 },
          }),
        ],
      ]);
    } else if (t < 8.0) {
      pose = this.fromFrames(t, [
        [
          4.0,
          this.pose({
            face: 0.7,
            eye: 'normal',
            brow: 'confused',
            mouth: 'flat',
            gazeX: 0.5,
            gazeY: 0,
            rightHand: { x: 50, y: -70 },
            leftHand: { x: -50, y: -80 },
          }),
        ],
        [
          4.22,
          this.pose({
            face: 1,
            eye: 'normal',
            brow: 'confused',
            mouth: 'o',
            gazeX: 0.15,
            gazeY: -0.1,
            leftHand: { x: -120, y: -150 },
            rightHand: { x: 55, y: -150 },
            leftElbow: -12,
            rightElbow: 24,
            leftFoot: { x: -54, y: 300 },
            rightFoot: { x: 58, y: 300 },
            showRuler: true,
            showCalculator: true,
            leftHandStyle: 'hold',
            rightHandStyle: 'hold',
          }),
        ],
        [
          5.3,
          this.pose({
            face: 0.8,
            eye: 'normal',
            brow: 'confused',
            mouth: 'grit',
            gazeX: 0.7,
            gazeY: 0.1,
            headTilt: 0.12,
            leftHand: { x: -80, y: -185 },
            rightHand: { x: 10, y: -255 },
            leftElbow: -18,
            rightElbow: 30,
            leftFoot: { x: -64, y: 300 },
            rightFoot: { x: 68, y: 300 },
            showRuler: true,
            showCalculator: true,
            leftHandStyle: 'hold',
            rightHandStyle: 'hold',
          }),
        ],
        [
          6.15,
          this.pose({
            face: 1,
            eye: 'normal',
            brow: 'determined',
            mouth: 'grit',
            gazeX: 0.85,
            gazeY: 0.1,
            headTilt: 0.02,
            leftHand: { x: -70, y: -85 },
            rightHand: { x: 22, y: -238 },
            leftElbow: -25,
            rightElbow: 28,
            leftFoot: { x: -78, y: 300 },
            rightFoot: { x: 82, y: 300 },
            showRuler: true,
            showCalculator: true,
            leftHandStyle: 'hold',
            rightHandStyle: 'hold',
          }),
        ],
        [
          6.6,
          this.pose({
            face: 1,
            eye: 'happy',
            brow: 'oneRaised',
            mouth: 'smirk',
            gazeX: 0,
            gazeY: 0,
            headTilt: -0.02,
            lean: 0.02,
            leftHand: { x: -68, y: -80 },
            rightHand: { x: 110, y: -330 },
            rightElbow: 20,
            leftElbow: -25,
            leftFoot: { x: -70, y: 300 },
            rightFoot: { x: 74, y: 300 },
            squashX: 0.98,
            squashY: 1.03,
            rightHandStyle: 'thumb',
          }),
        ],
        [
          7.2,
          this.pose({
            face: 1,
            eye: 'happy',
            brow: 'oneRaised',
            mouth: 'smile',
            gazeX: 0,
            gazeY: 0,
            leftHand: { x: -60, y: -70 },
            rightHand: { x: 105, y: -345 },
            leftElbow: -20,
            rightElbow: 24,
            leftFoot: { x: -70, y: 300 },
            rightFoot: { x: 74, y: 300 },
            rightHandStyle: 'thumb',
          }),
        ],
        [
          7.9,
          this.pose({
            face: 0.2,
            eye: 'normal',
            brow: 'determined',
            mouth: 'flat',
            gazeX: 0.8,
            gazeY: 0,
            rightHand: { x: 68, y: -105 },
            leftHand: { x: -58, y: -60 },
          }),
        ],
        [
          8.0,
          this.pose({
            face: 0,
            eye: 'normal',
            brow: 'determined',
            mouth: 'flat',
            gazeX: 0.8,
            gazeY: 0,
            rightHand: { x: 78, y: -110 },
            rightHandStyle: 'hold',
            leftHand: { x: -58, y: -60 },
          }),
        ],
      ]);
    } else if (t < 11.0) {
      pose = this.fromFrames(t, [
        [
          8.0,
          this.pose({
            face: 0,
            eye: 'normal',
            brow: 'determined',
            mouth: 'flat',
            gazeX: 0.8,
            gazeY: 0,
            rightHand: { x: 78, y: -110 },
            rightHandStyle: 'hold',
            leftHand: { x: -58, y: -60 },
          }),
        ],
        [
          8.2,
          this.pose({
            face: 0,
            eye: 'angry',
            brow: 'angry',
            mouth: 'grit',
            gazeX: 1,
            gazeY: 0,
            lean: -0.1,
            rightHand: { x: 92, y: -270 },
            rightElbow: 24,
            leftHand: { x: -86, y: -96 },
            leftElbow: -28,
            leftFoot: { x: -68, y: 300 },
            rightFoot: { x: 72, y: 300 },
            rightHandStyle: 'hold',
          }),
        ],
        [
          8.45,
          this.pose({
            face: 0,
            eye: 'normal',
            brow: 'determined',
            mouth: 'grit',
            gazeX: 1,
            gazeY: -0.1,
            lean: 0.12,
            rightHand: { x: 160, y: -240 },
            rightElbow: 20,
            leftHand: { x: -75, y: -90 },
            leftFoot: { x: -68, y: 300 },
            rightFoot: { x: 72, y: 300 },
          }),
        ],
        [
          8.8,
          this.pose({
            face: 0,
            eye: 'normal',
            brow: 'determined',
            mouth: 'grit',
            gazeX: 1,
            gazeY: 0,
            lean: 0.06,
            rightHand: { x: 130, y: -120 },
            leftHand: { x: -68, y: -80 },
          }),
        ],
        [
          9.0,
          this.pose({
            face: 1,
            eye: 'wide',
            brow: 'raised',
            mouth: 'o',
            gazeX: 0.8,
            gazeY: -0.3,
            rightHand: { x: 80, y: -90 },
            leftHand: { x: -75, y: -100 },
            headTilt: -0.02,
          }),
        ],
        [
          9.5,
          this.pose({
            face: 1,
            eye: 'wide',
            brow: 'fear',
            mouth: 'o',
            gazeX: 0.2,
            gazeY: -0.2,
            rightHand: { x: 82, y: -75 },
            leftHand: { x: -82, y: -75 },
            lean: 0,
            squashX: 0.92,
            squashY: 1.06,
          }),
        ],
        [
          9.62,
          this.pose({
            face: 1,
            eye: 'cross',
            brow: 'sad',
            mouth: 'o',
            gazeX: 0,
            gazeY: 0,
            headTilt: -0.14,
            lean: -0.04,
            rightHand: { x: 88, y: -80 },
            leftHand: { x: -88, y: -80 },
            squashX: 1.05,
            squashY: 0.94,
          }),
        ],
        [
          9.95,
          this.pose({
            face: 1,
            eye: 'cross',
            brow: 'sad',
            mouth: 'wobble',
            gazeX: 0,
            gazeY: 0,
            headTilt: 0.17,
            lean: 0.03,
            rightHand: { x: 92, y: -100 },
            leftHand: { x: -92, y: -100 },
            birds: true,
          }),
        ],
        [
          10.5,
          this.pose({
            face: 1,
            eye: 'spiral',
            brow: 'sad',
            mouth: 'wobble',
            gazeX: 0,
            gazeY: 0,
            headTilt: -0.1,
            lean: -0.02,
            rightHand: { x: 86, y: -95 },
            leftHand: { x: -86, y: -95 },
            birds: true,
          }),
        ],
        [
          11.0,
          this.pose({
            face: 1,
            eye: 'spiral',
            brow: 'sad',
            mouth: 'wobble',
            gazeX: 0,
            gazeY: 0,
            headTilt: 0.12,
            lean: 0.02,
            rightHand: { x: 88, y: -92 },
            leftHand: { x: -88, y: -92 },
            birds: true,
          }),
        ],
      ]);
    } else if (t < 15.0) {
      pose = this.fromFrames(t, [
        [
          11.0,
          this.pose({
            face: 1,
            eye: 'spiral',
            brow: 'sad',
            mouth: 'wobble',
            headTilt: 0.12,
            rightHand: { x: 88, y: -92 },
            leftHand: { x: -88, y: -92 },
            birds: true,
          }),
        ],
        [
          11.16,
          this.pose({
            face: 1,
            eye: 'angry',
            brow: 'angry',
            mouth: 'grit',
            headTilt: 0.02,
            lean: 0.06,
            rightHand: { x: 72, y: -100 },
            leftHand: { x: -72, y: -100 },
            anger: true,
            leftHandStyle: 'fist',
            rightHandStyle: 'fist',
          }),
        ],
        [
          11.6,
          this.pose({
            face: 1,
            eye: 'closed',
            brow: 'neutral',
            mouth: 'open',
            headTilt: -0.08,
            lean: 0,
            leftHand: { x: -108, y: -430 },
            rightHand: { x: 108, y: -430 },
            leftElbow: -34,
            rightElbow: 34,
            squashX: 0.93,
            squashY: 1.09,
            anger: true,
          }),
        ],
        [
          12.05,
          this.pose({
            face: 1,
            eye: 'normal',
            brow: 'determined',
            mouth: 'grit',
            leftHand: { x: -58, y: -90 },
            rightHand: { x: 58, y: -90 },
            leftHandStyle: 'fist',
            rightHandStyle: 'fist',
            anger: true,
          }),
        ],
        [
          12.42,
          this.pose({
            face: 1,
            eye: 'closed',
            brow: 'angry',
            mouth: 'grit',
            hipY: 1220,
            leftHand: { x: -58, y: -110 },
            rightHand: { x: 58, y: -110 },
            leftFoot: { x: -78, y: 240 },
            rightFoot: { x: 82, y: 240 },
            leftKnee: -38,
            rightKnee: 38,
            squashX: 1.04,
            squashY: 0.95,
            anger: true,
            leftHandStyle: 'fist',
            rightHandStyle: 'fist',
          }),
        ],
        [
          12.66,
          this.pose({
            face: 1,
            eye: 'normal',
            brow: 'determined',
            mouth: 'grit',
            hipY: 1160,
            leftFoot: { x: -72, y: 300 },
            rightFoot: { x: 76, y: 300 },
            leftHand: { x: -58, y: -90 },
            rightHand: { x: 58, y: -90 },
            leftHandStyle: 'fist',
            rightHandStyle: 'fist',
            anger: true,
          }),
        ],
        [
          12.92,
          this.pose({
            face: 1,
            eye: 'closed',
            brow: 'angry',
            mouth: 'grit',
            hipY: 1220,
            leftFoot: { x: -78, y: 240 },
            rightFoot: { x: 82, y: 240 },
            leftKnee: -38,
            rightKnee: 38,
            leftHand: { x: -58, y: -110 },
            rightHand: { x: 58, y: -110 },
            squashX: 1.04,
            squashY: 0.95,
            anger: true,
            leftHandStyle: 'fist',
            rightHandStyle: 'fist',
          }),
        ],
        [
          13.16,
          this.pose({
            face: 1,
            eye: 'normal',
            brow: 'determined',
            mouth: 'grit',
            hipY: 1160,
            leftFoot: { x: -72, y: 300 },
            rightFoot: { x: 76, y: 300 },
            leftHand: { x: -58, y: -90 },
            rightHand: { x: 58, y: -90 },
            leftHandStyle: 'fist',
            rightHandStyle: 'fist',
            anger: true,
          }),
        ],
        [
          13.35,
          this.pose({
            face: 0,
            eye: 'normal',
            brow: 'angry',
            mouth: 'grit',
            lean: 0.05,
            leftHand: { x: -58, y: -80 },
            rightHand: { x: 130, y: -180 },
            rightHandStyle: 'fist',
            anger: true,
          }),
        ],
        [
          14.05,
          this.pose({
            face: 0,
            eye: 'normal',
            brow: 'angry',
            mouth: 'grit',
            lean: 0.05,
            leftHand: { x: -58, y: -80 },
            rightHand: { x: 130, y: -180 },
            rightHandStyle: 'fist',
            anger: true,
          }),
        ],
        [
          14.2,
          this.pose({
            face: 1,
            eye: 'happy',
            brow: 'oneRaised',
            mouth: 'smile',
            lean: -0.05,
            leftHand: { x: -112, y: -300 },
            rightHand: { x: 112, y: -300 },
            leftElbow: 65,
            rightElbow: -65,
            leftFoot: { x: -70, y: 300 },
            rightFoot: { x: 74, y: 300 },
            squashX: 1.05,
            squashY: 0.97,
            leftHandStyle: 'fist',
            rightHandStyle: 'fist',
            anger: true,
          }),
        ],
        [
          14.62,
          this.pose({
            face: 0,
            eye: 'angry',
            brow: 'angry',
            mouth: 'grit',
            lean: 0.13,
            leftHand: { x: -78, y: -82 },
            rightHand: { x: 82, y: -82 },
            leftElbow: -30,
            rightElbow: 30,
            leftFoot: { x: -70, y: 300 },
            rightFoot: { x: 74, y: 300 },
            leftHandStyle: 'fist',
            rightHandStyle: 'fist',
            anger: true,
          }),
        ],
        [
          15.0,
          this.pose({
            face: 0,
            eye: 'normal',
            brow: 'angry',
            mouth: 'flat',
            lean: 0.02,
            rightHand: { x: 80, y: -120 },
            rightHandStyle: 'hold',
            leftHand: { x: -62, y: -72 },
            leftHandStyle: 'fist',
            leftFoot: { x: -70, y: 300 },
            rightFoot: { x: 74, y: 300 },
          }),
        ],
      ]);

      // Fast arm circles in the training montage.
      if (t >= 13.3 && t < 14.08) {
        const u = (t - 13.3) / 0.78;
        const angle = -1.1 + u * Math.PI * 4;
        pose.rightHand = {
          x: Math.cos(angle) * 155,
          y: -220 + Math.sin(angle) * 155,
        };
        pose.rightElbow = 16;
        pose.headTilt = Math.sin(u * TAU) * 0.05;
      }
    } else if (t < 19.0) {
      pose = this.fromFrames(t, [
        [
          15.0,
          this.pose({
            face: 0,
            eye: 'normal',
            brow: 'angry',
            mouth: 'flat',
            rightHand: { x: 80, y: -120 },
            rightHandStyle: 'hold',
            leftHand: { x: -62, y: -72 },
            leftFoot: { x: -70, y: 300 },
            rightFoot: { x: 74, y: 300 },
          }),
        ],
        [
          15.35,
          this.pose({
            face: 0,
            eye: 'angry',
            brow: 'angry',
            mouth: 'grit',
            lean: -0.09,
            rightHand: { x: -48, y: -292 },
            rightElbow: -18,
            rightHandStyle: 'hold',
            leftHand: { x: -82, y: -90 },
          }),
        ],
        [
          15.6,
          this.pose({
            face: 0,
            eye: 'normal',
            brow: 'determined',
            mouth: 'grit',
            lean: 0.13,
            rightHand: { x: 160, y: -242 },
            rightElbow: 20,
            leftHand: { x: -74, y: -88 },
          }),
        ],
        [
          16.3,
          this.pose({
            face: 1,
            eye: 'wide',
            brow: 'raised',
            mouth: 'o',
            gazeX: -0.8,
            gazeY: 0.1,
            headTilt: 0.06,
            lean: -0.03,
            leftHand: { x: -94, y: -145 },
            rightHand: { x: 82, y: -96 },
            leftElbow: -26,
            rightElbow: 32,
          }),
        ],
        [
          17.0,
          this.pose({
            face: 1,
            eye: 'wide',
            brow: 'fear',
            mouth: 'o',
            gazeX: -0.3,
            gazeY: 0.6,
            headTilt: -0.09,
            lean: -0.06,
            leftHand: { x: -112, y: -190 },
            rightHand: { x: 104, y: -160 },
            leftElbow: -38,
            rightElbow: 34,
          }),
        ],
        [
          17.7,
          this.pose({
            face: 1,
            eye: 'fear',
            brow: 'fear',
            mouth: 'o',
            gazeX: 0.3,
            gazeY: -0.8,
            headTilt: 0.14,
            lean: -0.13,
            leftHand: { x: -82, y: -245 },
            rightHand: { x: 82, y: -245 },
            leftElbow: -35,
            rightElbow: 35,
            squashX: 0.94,
            squashY: 1.06,
          }),
        ],
        [
          18.25,
          this.pose({
            face: 1,
            eye: 'wide',
            brow: 'confused',
            mouth: 'o',
            gazeX: 0.6,
            gazeY: 0.4,
            headTilt: 0.16,
            lean: 0.03,
            leftHand: { x: -92, y: -105 },
            rightHand: { x: 92, y: -115 },
            leftElbow: -24,
            rightElbow: 24,
          }),
        ],
        [
          19.0,
          this.pose({
            face: 1,
            eye: 'wide',
            brow: 'confused',
            mouth: 'o',
            gazeX: 0.7,
            gazeY: 0.3,
            headTilt: 0.1,
            lean: 0.03,
            leftHand: { x: -82, y: -142 },
            rightHand: { x: 82, y: -152 },
            leftElbow: -28,
            rightElbow: 28,
          }),
        ],
      ]);
    } else if (t < 23.0) {
      pose = this.fromFrames(t, [
        [
          19.0,
          this.pose({
            face: 1,
            eye: 'wide',
            brow: 'confused',
            mouth: 'o',
            gazeX: 0.7,
            gazeY: 0.3,
            headTilt: 0.1,
            lean: 0.03,
            leftHand: { x: -82, y: -142 },
            rightHand: { x: 82, y: -152 },
          }),
        ],
        [
          19.6,
          this.pose({
            face: 1,
            eye: 'wide',
            brow: 'fear',
            mouth: 'o',
            gazeX: 0.4,
            gazeY: 0.1,
            headTilt: -0.04,
            hipY: 1172,
            leftHand: { x: -55, y: -345 },
            rightHand: { x: 55, y: -345 },
            leftElbow: -38,
            rightElbow: 38,
            leftHandStyle: 'open',
            rightHandStyle: 'open',
          }),
        ],
        [
          20.6,
          this.pose({
            face: 1,
            eye: 'oneOpen',
            brow: 'fear',
            mouth: 'flat',
            gazeX: 0.2,
            gazeY: 0.1,
            headTilt: -0.03,
            hipY: 1172,
            leftHand: { x: -53, y: -348 },
            rightHand: { x: 53, y: -348 },
            leftElbow: -40,
            rightElbow: 40,
            leftHandStyle: 'open',
            rightHandStyle: 'open',
          }),
        ],
        [
          21.6,
          this.pose({
            face: 1,
            eye: 'wide',
            brow: 'fear',
            mouth: 'o',
            gazeX: 0.3,
            gazeY: 0.1,
            headTilt: 0.02,
            hipY: 1167,
            leftHand: { x: -55, y: -345 },
            rightHand: { x: 55, y: -345 },
            leftElbow: -38,
            rightElbow: 38,
            leftHandStyle: 'open',
            rightHandStyle: 'open',
          }),
        ],
        [
          22.4,
          this.pose({
            face: 1,
            eye: 'wide',
            brow: 'raised',
            mouth: 'flat',
            gazeX: 0.35,
            gazeY: 0.1,
            headTilt: -0.03,
            hipY: 1170,
            leftHand: { x: -55, y: -343 },
            rightHand: { x: 55, y: -343 },
            leftElbow: -38,
            rightElbow: 38,
            leftHandStyle: 'open',
            rightHandStyle: 'open',
          }),
        ],
        [
          23.0,
          this.pose({
            face: 1,
            eye: 'wide',
            brow: 'raised',
            mouth: 'flat',
            gazeX: 0.4,
            gazeY: 0.2,
            headTilt: -0.02,
            hipY: 1170,
            leftHand: { x: -55, y: -343 },
            rightHand: { x: 55, y: -343 },
            leftElbow: -38,
            rightElbow: 38,
            leftHandStyle: 'open',
            rightHandStyle: 'open',
          }),
        ],
      ]);
    } else if (t < 27.0) {
      pose = this.fromFrames(t, [
        [
          23.0,
          this.pose({
            face: 1,
            eye: 'wide',
            brow: 'fear',
            mouth: 'o',
            gazeX: 0.7,
            gazeY: 0.6,
            leftHand: { x: -55, y: -343 },
            rightHand: { x: 55, y: -343 },
            leftElbow: -38,
            rightElbow: 38,
          }),
        ],
        [
          23.32,
          this.pose({
            face: 1,
            eye: 'wide',
            brow: 'raised',
            mouth: 'o',
            gazeX: 0.6,
            gazeY: 0.5,
            leftHand: { x: -64, y: -205 },
            rightHand: { x: 64, y: -205 },
            leftElbow: -28,
            rightElbow: 28,
          }),
        ],
        [
          23.58,
          this.pose({
            face: 1,
            eye: 'happy',
            brow: 'raised',
            mouth: 'grin',
            gazeX: 0,
            gazeY: 0,
            jump: 82,
            leftHand: { x: -105, y: -390 },
            rightHand: { x: 105, y: -390 },
            leftElbow: -30,
            rightElbow: 30,
            leftFoot: { x: -42, y: 246 },
            rightFoot: { x: 46, y: 246 },
            leftKnee: -25,
            rightKnee: 25,
            squashX: 0.94,
            squashY: 1.07,
          }),
        ],
        [
          23.92,
          this.pose({
            face: 1,
            eye: 'happy',
            brow: 'raised',
            mouth: 'grin',
            jump: 0,
            leftHand: { x: -96, y: -255 },
            rightHand: { x: 96, y: -255 },
            leftElbow: -32,
            rightElbow: 32,
            leftFoot: { x: -55, y: 300 },
            rightFoot: { x: 60, y: 300 },
            squashX: 1.03,
            squashY: 0.96,
          }),
        ],
        [
          24.26,
          this.pose({
            face: 1,
            eye: 'happy',
            brow: 'raised',
            mouth: 'grin',
            jump: 74,
            leftHand: { x: -108, y: -400 },
            rightHand: { x: 108, y: -400 },
            leftElbow: -28,
            rightElbow: 28,
            leftFoot: { x: -45, y: 250 },
            rightFoot: { x: 50, y: 250 },
            leftKnee: -22,
            rightKnee: 22,
            squashX: 0.95,
            squashY: 1.06,
          }),
        ],
        [
          24.6,
          this.pose({
            face: 1,
            eye: 'happy',
            brow: 'raised',
            mouth: 'grin',
            jump: 0,
            leftHand: { x: -85, y: -245 },
            rightHand: { x: 85, y: -245 },
            leftElbow: -26,
            rightElbow: 26,
            leftFoot: { x: -55, y: 300 },
            rightFoot: { x: 60, y: 300 },
            squashX: 1.03,
            squashY: 0.96,
          }),
        ],
        [
          25.2,
          this.pose({
            hipX: 640,
            face: 1,
            eye: 'happy',
            brow: 'oneRaised',
            mouth: 'grin',
            jump: 4,
            leftHand: { x: -72, y: -450 },
            rightHand: { x: 72, y: -450 },
            leftElbow: -52,
            rightElbow: 52,
            leftFoot: { x: -58, y: 300 },
            rightFoot: { x: 64, y: 300 },
            squashX: 0.97,
            squashY: 1.05,
          }),
        ],
        [
          25.8,
          this.pose({
            hipX: 650,
            face: 1,
            eye: 'happy',
            brow: 'oneRaised',
            mouth: 'grin',
            jump: 8,
            leftHand: { x: -64, y: -462 },
            rightHand: { x: 64, y: -462 },
            leftElbow: -52,
            rightElbow: 52,
            leftFoot: { x: -58, y: 300 },
            rightFoot: { x: 64, y: 300 },
            squashX: 0.97,
            squashY: 1.05,
          }),
        ],
        [
          26.3,
          this.pose({
            hipX: 720,
            face: 1,
            eye: 'happy',
            brow: 'oneRaised',
            mouth: 'smirk',
            lean: 0.05,
            leftHand: { x: -62, y: -80 },
            rightHand: { x: 162, y: -228 },
            rightElbow: 12,
            leftFoot: { x: -60, y: 300 },
            rightFoot: { x: 76, y: 300 },
            rightHandStyle: 'point',
          }),
        ],
        [
          26.72,
          this.pose({
            hipX: 762,
            face: 1,
            eye: 'happy',
            brow: 'oneRaised',
            mouth: 'grin',
            lean: 0.07,
            leftHand: { x: -62, y: -82 },
            rightHand: { x: 166, y: -220 },
            rightElbow: 10,
            leftFoot: { x: -58, y: 300 },
            rightFoot: { x: 92, y: 280 },
            rightKnee: 18,
            rightHandStyle: 'point',
          }),
        ],
        [
          26.94,
          this.pose({
            hipX: 770,
            face: 1,
            eye: 'wide',
            brow: 'raised',
            mouth: 'o',
            lean: -0.05,
            jump: 10,
            leftHand: { x: -80, y: -205 },
            rightHand: { x: 100, y: -252 },
            leftFoot: { x: -58, y: 300 },
            rightFoot: { x: 145, y: 300 },
            rightKnee: 8,
          }),
        ],
        [
          27.0,
          this.pose({
            hipX: 770,
            face: 1,
            eye: 'wide',
            brow: 'fear',
            mouth: 'o',
            lean: -0.05,
            jump: 10,
            leftHand: { x: -80, y: -205 },
            rightHand: { x: 100, y: -252 },
            leftFoot: { x: -58, y: 300 },
            rightFoot: { x: 145, y: 300 },
            rightKnee: 8,
          }),
        ],
      ]);
    } else {
      pose = this.fromFrames(t, [
        [
          27.0,
          this.pose({
            hipX: 770,
            face: 1,
            eye: 'wide',
            brow: 'fear',
            mouth: 'o',
            lean: -0.05,
            jump: 10,
            leftHand: { x: -80, y: -205 },
            rightHand: { x: 100, y: -252 },
            leftFoot: { x: -58, y: 300 },
            rightFoot: { x: 145, y: 300 },
            rightKnee: 8,
          }),
        ],
        [
          27.3,
          this.pose({
            hipX: 768,
            face: 1,
            eye: 'wide',
            brow: 'sad',
            mouth: 'o',
            lean: 0.04,
            jump: 0,
            leftHand: { x: -68, y: -125 },
            rightHand: { x: 72, y: -125 },
            leftFoot: { x: -58, y: 300 },
            rightFoot: { x: 78, y: 300 },
          }),
        ],
        [
          27.8,
          this.pose({
            hipX: 762,
            face: 0.75,
            eye: 'deadpan',
            brow: 'sad',
            mouth: 'flat',
            gazeX: 0.9,
            gazeY: 0.65,
            headTilt: 0.2,
            lean: 0.06,
            leftHand: { x: -52, y: -45 },
            rightHand: { x: 50, y: -45 },
            leftFoot: { x: -58, y: 300 },
            rightFoot: { x: 68, y: 300 },
          }),
        ],
        [
          28.45,
          this.pose({
            hipX: 760,
            face: 1,
            eye: 'deadpan',
            brow: 'sad',
            mouth: 'flat',
            gazeX: 0,
            gazeY: 0,
            headTilt: 0.06,
            lean: 0.05,
            leftHand: { x: -45, y: -38 },
            rightHand: { x: 45, y: -38 },
            leftFoot: { x: -58, y: 300 },
            rightFoot: { x: 64, y: 300 },
          }),
        ],
        [
          30.0,
          this.pose({
            hipX: 760,
            face: 1,
            eye: 'deadpan',
            brow: 'sad',
            mouth: 'flat',
            gazeX: 0,
            gazeY: 0,
            headTilt: -0.02,
            lean: 0.05,
            leftHand: { x: -45, y: -38 },
            rightHand: { x: 45, y: -38 },
            leftFoot: { x: -58, y: 300 },
            rightFoot: { x: 64, y: 300 },
          }),
        ],
      ]);
    }

    // A couple of carefully timed blinks.
    if ((t > 3.05 && t < 3.18) || (t > 7.25 && t < 7.38) || (t > 29.2 && t < 29.34)) {
      pose.eye = 'closed';
    }

    return pose;
  }

  // ==========================================================
  // BALL TRAJECTORY
  // ==========================================================

  private quad(p0: Vec, p1: Vec, p2: Vec, u: number): Vec {
    const v = 1 - u;
    return {
      x: v * v * p0.x + 2 * v * u * p1.x + u * u * p2.x,
      y: v * v * p0.y + 2 * v * u * p1.y + u * u * p2.y,
    };
  }

  private hiddenBall(): BallState {
    return { visible: false, held: false, x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1, speed: 0 };
  }

  private heldBall(): BallState {
    return { visible: true, held: true, x: 0, y: 0, rotation: 0.2, scaleX: 0.9, scaleY: 0.9, speed: 0 };
  }

  private getBallState(t: number): BallState {
    if (t < 0.8) return this.heldBall();

    if (t < 1.8) {
      const u = smooth((t - 0.8) / 1.0);
      const p = this.quad({ x: 715, y: 990 }, { x: 825, y: 520 }, { x: 1008, y: 760 }, u);
      return {
        visible: true,
        held: false,
        x: p.x,
        y: p.y,
        rotation: t * 9,
        scaleX: 1.04,
        scaleY: 0.96,
        speed: 18,
      };
    }

    if (t < 2.4) {
      const u = easeIn((t - 1.8) / 0.6);
      const p = this.quad({ x: 1008, y: 760 }, { x: 1090, y: 960 }, { x: 970, y: 1290 }, u);
      return {
        visible: true,
        held: false,
        x: p.x,
        y: p.y,
        rotation: t * 12,
        scaleX: 1,
        scaleY: 1,
        speed: 9,
      };
    }

    // He is busy measuring, calculating, and celebrating the plan; the next
    // ball only appears when he reaches for the wind-up at 8.0s.
    if (t < 8.0) return this.hiddenBall();
    if (t < 8.45) return this.heldBall();

    if (t < 9.0) {
      const u = smooth((t - 8.45) / 0.55);
      const p = this.quad({ x: 750, y: 925 }, { x: 900, y: 430 }, { x: 1008, y: 700 }, u);
      return {
        visible: true,
        held: false,
        x: p.x,
        y: p.y,
        rotation: t * 11,
        scaleX: 1.05,
        scaleY: 0.95,
        speed: 22,
      };
    }

    if (t < 9.6) {
      const u = smooth((t - 9.0) / 0.6);
      const p = this.quad({ x: 1008, y: 700 }, { x: 800, y: 770 }, { x: 620, y: 795 }, u);
      return {
        visible: true,
        held: false,
        x: p.x,
        y: p.y,
        rotation: -t * 12,
        scaleX: 1.08,
        scaleY: 0.92,
        speed: 19,
      };
    }

    if (t < 9.95) {
      const u = easeIn((t - 9.6) / 0.35);
      const p = this.quad({ x: 620, y: 795 }, { x: 650, y: 1080 }, { x: 690, y: 1435 }, u);
      return {
        visible: true,
        held: false,
        x: p.x,
        y: p.y,
        rotation: t * 7,
        scaleX: 1,
        scaleY: 1,
        speed: 8,
      };
    }

    // No floating ball during the training montage; the next one appears in
    // his hand on the throw at 15.6s.
    if (t < 15.6) return this.hiddenBall();

    if (t < 16.3) {
      const u = smooth((t - 15.6) / 0.7);
      const p = this.quad({ x: 750, y: 920 }, { x: 500, y: 610 }, { x: 272, y: 1018 }, u);
      return {
        visible: true,
        held: false,
        x: p.x,
        y: p.y,
        rotation: t * 12,
        scaleX: 1.04,
        scaleY: 0.96,
        speed: 24,
      };
    }

    if (t < 17.0) {
      const u = smooth((t - 16.3) / 0.7);
      const p = this.quad({ x: 272, y: 1018 }, { x: 330, y: 1100 }, { x: 452, y: 1118 }, u);
      return {
        visible: true,
        held: false,
        x: p.x,
        y: p.y,
        rotation: t * 14,
        scaleX: 1.03,
        scaleY: 0.97,
        speed: 17,
      };
    }

    if (t < 17.7) {
      const u = smooth((t - 17.0) / 0.7);
      const p = this.quad({ x: 452, y: 1118 }, { x: 530, y: 780 }, { x: 650, y: 470 }, u);
      return {
        visible: true,
        held: false,
        x: p.x,
        y: p.y,
        rotation: t * 16,
        scaleX: 1.06,
        scaleY: 0.94,
        speed: 22,
      };
    }

    if (t < 18.7) {
      const u = smooth((t - 17.7) / 1.0);
      const p = this.quad({ x: 650, y: 470 }, { x: 930, y: 570 }, { x: 835, y: 875 }, u);
      return {
        visible: true,
        held: false,
        x: p.x,
        y: p.y,
        rotation: t * 13,
        scaleX: 1.04,
        scaleY: 0.96,
        speed: 18,
      };
    }

    if (t < 19.0) {
      const u = smooth((t - 18.7) / 0.3);
      return {
        visible: true,
        held: false,
        x: lerp(835, 850, u),
        y: lerp(875, 900, u),
        rotation: t * 9,
        scaleX: 1,
        scaleY: 1,
        speed: 8,
      };
    }

    if (t < 20.0) {
      const u = easeOut((t - 19.0) / 1.0);
      return {
        visible: true,
        held: false,
        x: lerp(850, 865, u),
        y: lerp(900, 1030, u),
        rotation: t * 4,
        scaleX: 1,
        scaleY: 1,
        speed: 4,
      };
    }

    if (t < 21.5) {
      const u = smooth((t - 20.0) / 1.5);
      return {
        visible: true,
        held: false,
        x: lerp(865, 880, u),
        y: lerp(1030, 1150, u),
        rotation: t * 2.4,
        scaleX: 1,
        scaleY: 1,
        speed: 2,
      };
    }

    if (t < 22.5) {
      const u = smooth((t - 21.5) / 1.0);
      return {
        visible: true,
        held: false,
        x: lerp(880, 888, u),
        y: lerp(1150, 1240, u),
        rotation: t * 1.6,
        scaleX: 1,
        scaleY: 1,
        speed: 1,
      };
    }

    if (t < 23.0) {
      const u = easeIn((t - 22.5) / 0.5);
      return {
        visible: true,
        held: false,
        x: lerp(888, 892, u),
        y: lerp(1240, this.trashTopY, u),
        rotation: t * 1.1,
        scaleX: 1,
        scaleY: 1,
        speed: 2,
      };
    }

    return this.hiddenBall();
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

  private renderStickman(
    ctx: CanvasRenderingContext2D,
    pose: Pose,
    t: number,
    ball: BallState
  ) {
    ctx.save();
    ctx.strokeStyle = '#000000';
    ctx.fillStyle = '#000000';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.translate(pose.hipX, pose.hipY - pose.jump);
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

    if (pose.birds) {
      this.drawDizzyBirds(ctx, t);
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

    // Props held in the hands
    if (pose.showRuler) {
      this.drawRuler(ctx, pose.leftHand);
    }
    if (pose.showCalculator) {
      this.drawCalculator(ctx, pose.rightHand);
    }

    // The championship trophy is deliberately drawn as an imaginary dashed
    // silhouette while he mimes lifting it over his head.
    if (t >= 25.2 && t < 26.05) {
      this.drawImaginaryTrophy(ctx);
    }

    // Held paper ball
    if (ball.visible && ball.held) {
      this.drawPaperBall(
        ctx,
        pose.rightHand.x,
        pose.rightHand.y,
        ball.rotation,
        0.9,
        0.9,
        1
      );
    }

    // Arm-circle whoosh trails
    if (t >= 13.3 && t < 14.08) {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.lineWidth = 3;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(0, -220, 155, -1.2 - i * 0.22, 0.8 - i * 0.22);
        ctx.stroke();
      }
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

    this.drawEye(ctx, leftEyeX, eyeY, pose.eye, pupilX, pupilY);
    this.drawEye(ctx, rightEyeX, eyeY, pose.eye, pupilX, pupilY);

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
    pupilY: number
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

    if (style === 'oneOpen') {
      // The left eye stays shut; the right eye opens wide.
      if (x < 0) {
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(x - 8, y);
        ctx.lineTo(x + 8, y);
        ctx.stroke();
      } else {
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.arc(x, y, 11, 0, TAU);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x + pupilX, y + pupilY, 4.8, 0, TAU);
        ctx.fill();
      }
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

    if (style === 'spiral') {
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 4.5; a += 0.25) {
        const r = 1.4 + a * 0.85;
        const px = x + Math.cos(a) * r;
        const py = y + Math.sin(a) * r;
        if (a === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
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
      ctx.arc(x + pupilX, y + pupilY, 4.8, 0, TAU);
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

  private drawDizzyBirds(ctx: CanvasRenderingContext2D, t: number) {
    ctx.save();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const a = t * 2.2 + i * 2.1;
      const x = Math.cos(a) * 112;
      const y = -25 + Math.sin(a) * 30;
      const flap = Math.sin(t * 14 + i * 2) * 4;
      ctx.beginPath();
      ctx.moveTo(x - 13, y);
      ctx.quadraticCurveTo(x - 6, y - 9 - flap, x, y);
      ctx.quadraticCurveTo(x + 6, y - 9 + flap, x + 13, y);
      ctx.stroke();
    }
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
  // PROPS HELD BY THE CHARACTER
  // ==========================================================

  private drawRuler(ctx: CanvasRenderingContext2D, hand: Vec) {
    ctx.save();
    ctx.translate(hand.x, hand.y);
    ctx.rotate(-0.42);
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
  }

  private drawImaginaryTrophy(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(0, -492);
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

  private drawCalculator(ctx: CanvasRenderingContext2D, hand: Vec) {
    ctx.save();
    ctx.translate(hand.x, hand.y);
    ctx.rotate(0.08);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.rect(-37, -48, 74, 96);
    ctx.fill();
    ctx.stroke();
    ctx.strokeRect(-27, -37, 54, 20);
    ctx.fillStyle = '#000000';
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 2; col++) {
        ctx.beginPath();
        ctx.arc(-16 + col * 31, -4 + row * 17, 5, 0, TAU);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // ==========================================================
  // PAPER BALL
  // ==========================================================

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

  private renderBallTrail(ctx: CanvasRenderingContext2D, t: number, ball: BallState) {
    if (ball.speed < 10) return;
    for (let i = 1; i <= 3; i++) {
      const prev = this.getBallState(Math.max(0, t - i * 0.045));
      if (!prev.visible || prev.held) continue;
      this.drawPaperBall(
        ctx,
        prev.x,
        prev.y,
        prev.rotation,
        prev.scaleX,
        prev.scaleY,
        0.16 / i
      );
    }
  }

  // ==========================================================
  // EFFECTS
  // ==========================================================

  private renderEffects(
    ctx: CanvasRenderingContext2D,
    t: number,
    pose: Pose,
    ball: BallState
  ) {
    // Wall miss
    this.impactBurst(ctx, t, 1.8, 0.24, 1015, 760, 70);
    // Wall rebound / second throw
    this.impactBurst(ctx, t, 9.0, 0.22, 1015, 700, 65);
    // Forehead bonk
    this.impactBurst(ctx, t, 9.6, 0.32, 620, 795, 85);
    this.stars(ctx, t, 9.62, 0.55, 620, 795, 4);
    // Lamp
    this.impactBurst(ctx, t, 16.3, 0.28, 272, 1018, 75);
    // Table
    this.impactBurst(ctx, t, 17.0, 0.22, 452, 1118, 55);
    // Fan
    this.impactBurst(ctx, t, 17.7, 0.32, 650, 470, 80);
    // Trash plop
    this.impactBurst(ctx, t, 23.0, 0.25, 900, 1305, 42);
    // Crash
    this.impactBurst(ctx, t, 27.0, 0.42, 930, 1400, 110);

    // Celebration sparkles
    if (t >= 23.4 && t < 27.0) {
      const sparklePositions = [
        { x: 500, y: 690 },
        { x: 720, y: 620 },
        { x: 860, y: 820 },
        { x: 450, y: 980 },
        { x: 760, y: 1060 },
      ];
      sparklePositions.forEach((p, i) => {
        const pulse = Math.sin((t - 23.4) * 7 + i * 1.7);
        if (pulse > 0.25) {
          this.sparkle(ctx, p.x, p.y, 11 + pulse * 8, 0.35 + pulse * 0.35);
        }
      });
    }

    // A little dust/impact line under the training squats.
    if (t >= 12.4 && t < 13.3) {
      const local = (t - 12.4) * 5;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.lineWidth = 3;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(520 - i * 12, 1440 - local * 4 - i * 4);
        ctx.lineTo(500 - i * 14, 1448 - local * 4 - i * 4);
        ctx.stroke();
      }
    }

    // Small trajectory accent during the pinball sequence.
    if (t >= 15.6 && t < 19.0 && ball.visible && !ball.held) {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, 32, 0, TAU);
      ctx.stroke();
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
