import type { StudioConfig } from '../types';

const TAU = Math.PI * 2;
const WIDTH = 1080;
const HEIGHT = 1920;

const INK = '#141414';
const WHITE = '#ffffff';
const FLOOR = '#f2f2f4';
const FLOOR_LINE = '#d9d9e0';

const BEANIE = '#e63946';
const BEANIE_DEEP = '#b3222e';
const SHIRT = '#ffd166';

const PENCIL_BODY = '#ffd166';
const PENCIL_ERASER = '#e63946';
const PENCIL_GRAPHITE = '#4d4d4d';

const BOOK = '#ef4444';
const DESK = '#e7e5e4';

const FLOOR_Y = 1500;
const HIP_Y = 1200;
const HEAD_R = 70;

const CHAR_X = 540;
const DESK_LEFT = 230;
const DESK_RIGHT = 850;
const DESK_TOP = 1180;
const DESK_H = 46;
const BOOK_X = 420;

type MouthShape = 'flat' | 'smile' | 'grin' | 'o' | 'frown' | 'grit' | 'smirk';
type BrowShape = 'normal' | 'angry' | 'raised' | 'sad' | 'cocky' | 'determined';
type EyeShape = 'open' | 'wide' | 'squint' | 'shut' | 'happy' | 'peek';
type LookDir = 'front' | 'down' | 'up';

interface Pt { x: number; y: number; }

interface Pose {
  lean: number;
  headTilt: number;
  headDrop: number;
  headTurn: number;
  look: LookDir;
  mouth: MouthShape;
  brow: BrowShape;
  eye: EyeShape;
  legs: 'stand' | 'wide';
  handL: Pt;
  handR: Pt;
  bendL: 1 | -1;
  bendR: 1 | -1;
  fistL: boolean;
  fistR: boolean;
  beanieOn: boolean;
  anger: number;
}

interface CaptionLine { text: string; from: number; to: number; }
interface CameraKey { t: number; x: number; y: number; zoom: number; }
interface Arm { sx: number; sy: number; ex: number; ey: number; hx: number; hy: number; }

const CAPTIONS: CaptionLine[] = [
  { text: 'I WILL LAND THIS PENCIL PERFECTLY!', from: 0.15, to: 4.85 },
  { text: "WHY WON'T IT STAND UP?!", from: 5.14, to: 9.94 },
  { text: 'PRACTICE MAKES PERFECT!', from: 10.14, to: 14.94 },
  { text: 'I ACTUALLY DID IT!!!', from: 15.14, to: 21.94 },
  { text: 'WAIT… THAT\'S NOT THE DESK! 💀', from: 22.14, to: 29.72 },
];

const CAMERA_KEYS: CameraKey[] = [
  { t: 0.0, x: 540, y: 900, zoom: 2.05 },
  { t: 4.6, x: 540, y: 900, zoom: 1.35 },
  { t: 5.1, x: 540, y: 900, zoom: 1.35 },
  { t: 6.4, x: 540, y: 940, zoom: 1.15 },
  { t: 7.6, x: 540, y: 940, zoom: 1.15 },
  { t: 8.1, x: 540, y: 940, zoom: 1.35 },
  { t: 10.1, x: 540, y: 900, zoom: 1.35 },
  { t: 14.5, x: 540, y: 880, zoom: 1.35 },
  { t: 15.1, x: 540, y: 880, zoom: 2.05 },
  { t: 21.4, x: 540, y: 900, zoom: 1.35 },
  { t: 22.1, x: 540, y: 900, zoom: 1.35 },
  { t: 22.6, x: 540, y: 900, zoom: 2.05 },
  { t: 27.0, x: 540, y: 900, zoom: 2.05 },
  { t: 28.0, x: 540, y: 880, zoom: 2.2 },
  { t: 30.0, x: 540, y: 880, zoom: 2.2 },
];

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
function bell(t: number, a: number, b: number, amp: number) {
  if (t <= a || t >= b) return 0;
  return Math.sin(((t - a) / (b - a)) * Math.PI) * amp;
}
function lerpPt(a: { x: number; y: number }, b: { x: number; y: number }, u: number) {
  return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u) };
}

export class PencilLandingRenderer {
  readonly width = WIDTH;
  readonly height = HEIGHT;

  private readonly floorY = FLOOR_Y;
  private readonly hipY = HIP_Y;
  private readonly headR = HEAD_R;

  private readonly captions = CAPTIONS;

  render(ctx: CanvasRenderingContext2D, time: number, config: StudioConfig) {
    void config;
    const t = clamp(time, 0, 30);

    ctx.save();
    ctx.fillStyle = WHITE;
    ctx.fillRect(-200, -200, WIDTH + 400, HEIGHT + 400);

    this.applyCamera(ctx, t);
    this.renderStage(ctx);

    const x = this.charX(t);
    const hipY = this.hipY - this.charHop(t);
    const pose = this.poseAt(t);
    const arms = this.computeArms(pose, x, hipY);

    this.renderShadows(ctx, t, x, hipY);

    // He stands behind the desk: body, then desk, then the pencil on top of
    // it, then the arms and head so the hands can grip the pencil.
    this.drawStickman(ctx, x, hipY, pose, arms, t, 'body');
    this.drawDesk(ctx);
    this.drawPencil(ctx, t);
    this.drawBook(ctx);
    this.drawStickman(ctx, x, hipY, pose, arms, t, 'front');

    this.restoreCamera(ctx);
    ctx.restore();

    this.drawCaptions(ctx, t);
  }

  private applyCamera(ctx: CanvasRenderingContext2D, t: number) {
    let prev = CAMERA_KEYS[0];
    let next = CAMERA_KEYS[CAMERA_KEYS.length - 1];
    for (let i = 0; i < CAMERA_KEYS.length - 1; i++) {
      const a = CAMERA_KEYS[i];
      const b = CAMERA_KEYS[i + 1];
      if (t >= a.t && t <= b.t) {
        prev = a;
        next = b;
        break;
      }
    }
    let cx = prev.x;
    let cy = prev.y;
    let zoom = prev.zoom;
    if (next.t > prev.t) {
      const u = smooth((t - prev.t) / (next.t - prev.t));
      cx = lerp(prev.x, next.x, u);
      cy = lerp(prev.y, next.y, u);
      zoom = lerp(prev.zoom, next.zoom, u);
    }
    ctx.translate(WIDTH / 2, HEIGHT / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-cx, -cy);
  }

  private restoreCamera(ctx: CanvasRenderingContext2D) {
    ctx.restore();
  }

  private renderStage(ctx: CanvasRenderingContext2D) {
    // Floor band.
    ctx.fillStyle = FLOOR;
    ctx.fillRect(-200, this.floorY, WIDTH + 400, HEIGHT - this.floorY + 200);
    ctx.strokeStyle = FLOOR_LINE;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-200, this.floorY);
    ctx.lineTo(WIDTH + 200, this.floorY);
    ctx.stroke();
  }

  private renderShadows(ctx: CanvasRenderingContext2D, t: number, x: number, hipY: number) {
    ctx.fillStyle = 'rgba(20, 20, 20, 0.08)';
    const lifted = clamp((this.hipY - hipY) / 30, 0, 1);
    ctx.beginPath();
    ctx.ellipse(x, this.floorY - 8, lerp(84, 62, lifted), 14, 0, 0, TAU);
    ctx.fill();
  }

  private charX(t: number): number {
    return CHAR_X - bell(t, 9.7, 10.6, 34) - bell(t, 12.15, 12.45, 4);
  }

  private charHop(t: number): number {
    return bell(t, 23.0, 23.4, 30) + bell(t, 24.4, 24.8, 34) + bell(t, 26.1, 26.35, 12);
  }

  // ------------------------------------------------------------------
  // Pose
  // ------------------------------------------------------------------

  private defaultPose(): Pose {
    return {
      lean: 0,
      headTilt: 0,
      headDrop: 0,
      headTurn: 0,
      look: 'front',
      mouth: 'flat',
      brow: 'angry',
      eye: 'squint',
      legs: 'stand',
      handL: { x: CHAR_X - 95, y: 1180 },
      handR: { x: CHAR_X + 95, y: 1046 },
      bendL: -1,
      bendR: -1,
      fistL: false,
      fistR: false,
      beanieOn: true,
      anger: 0,
    };
  }

  private poseAt(t: number): Pose {
    const pose = this.defaultPose();
    const X = this.charX(t);

    if (t < 5) {
      // Shot 1: flips the pencil, it lands flat, he gets angry.
      pose.handR = { x: X + 95, y: this.hipY - 154 };
      pose.look = t < 2.2 ? 'up' : 'front';
      if (t < 1.3) {
        pose.mouth = 'flat';
        pose.brow = 'determined';
        pose.eye = 'open';
      } else if (t < 2.3) {
        pose.mouth = 'smirk';
        pose.brow = 'cocky';
        pose.eye = 'open';
      } else if (t < 3.1) {
        pose.mouth = 'o';
        pose.brow = 'raised';
        pose.eye = 'wide';
      } else {
        pose.mouth = 'grit';
        pose.brow = 'angry';
        pose.eye = 'squint';
        pose.headTurn = 4;
        pose.fistL = true;
        pose.fistR = true;
      }
      return pose;
    }

    if (t < 10) {
      // Shot 2: three quick failures, rage stomp.
      if (t < 6.0) {
        pose.handR = { x: X + 130, y: this.hipY - 230 };
        pose.lean = 0.06;
        pose.mouth = 'grin';
        pose.brow = 'cocky';
        pose.look = 'up';
      } else if (t < 7.0) {
        pose.handR = { x: X + 110, y: this.hipY - 150 };
        pose.headTilt = -0.14;
        pose.headDrop = -6;
        pose.mouth = 'o';
        pose.brow = 'raised';
        pose.eye = 'wide';
        pose.fistL = true;
        pose.fistR = true;
      } else if (t < 8.0) {
        pose.handR = { x: X + 96, y: this.hipY - 76 };
        pose.handL = { x: X - 96, y: this.hipY - 76 };
        pose.bendR = 1;
        pose.bendL = 1;
        pose.fistL = true;
        pose.fistR = true;
        pose.mouth = 'grit';
        pose.brow = 'angry';
        pose.eye = 'squint';
        pose.headTurn = Math.sin(t * 24) * 2;
      } else {
        pose.handR = { x: X + 96, y: this.hipY - 76 };
        pose.handL = { x: X - 96, y: this.hipY - 76 };
        pose.bendR = 1;
        pose.bendL = 1;
        pose.fistL = true;
        pose.fistR = true;
        pose.mouth = 'grit';
        pose.brow = 'angry';
        pose.eye = 'squint';
        pose.anger = clamp((t - 8.5) / 0.8, 0, 1);
      }
      return pose;
    }

    if (t < 15) {
      // Shot 3: practice montage, rapid flicks and spins.
      const flick = Math.sin((t - 10) * 14);
      pose.handR = { x: X + 95 + flick * 16, y: this.hipY - 154 - Math.abs(flick) * 16 };
      pose.lean = Math.sin((t - 10) * 10) * 0.05;
      pose.look = 'up';
      if (t < 12.0) {
        pose.mouth = 'grin';
        pose.brow = 'cocky';
        pose.eye = 'open';
      } else if (t < 13.8) {
        pose.mouth = 'grit';
        pose.brow = 'determined';
        pose.eye = 'squint';
      } else {
        pose.mouth = 'o';
        pose.brow = 'raised';
        pose.eye = 'wide';
        pose.fistR = true;
      }
      return pose;
    }

    if (t < 22) {
      // Shot 4: slow-motion rotation, lands sharpened-tip-first, victory dance.
      if (t < 15.1) {
        pose.handR = { x: X + 100, y: this.hipY - 160 };
        pose.legs = 'wide';
        pose.brow = 'determined';
        pose.eye = 'shut';
        pose.mouth = 'flat';
        pose.headDrop = clamp((t - 14.6) / 0.5, 0, 1) * 8;
      } else if (t < 20.0) {
        pose.handR = { x: X + 132, y: this.hipY - 236 };
        pose.lean = 0.07;
        pose.legs = 'wide';
        pose.look = 'up';
        pose.brow = 'raised';
        pose.eye = 'wide';
        pose.mouth = 'o';
      } else {
        pose.handR = { x: X + 120, y: this.hipY - 210 };
        pose.legs = 'wide';
        pose.look = 'up';
        pose.brow = 'raised';
        pose.eye = 'wide';
        pose.mouth = 'o';
      }
      return pose;
    }

    if (t < 26) {
      // Shot 5: victory dance.
      const dance = Math.sin((t - 22) * 7);
      pose.handR = { x: X + 110, y: this.hipY - 320 + dance * 46 };
      pose.handL = { x: X - 110, y: this.hipY - 320 - dance * 46 };
      pose.lean = dance * 0.06;
      pose.look = 'front';
      pose.mouth = 'grin';
      pose.brow = 'raised';
      pose.eye = 'happy';
      return pose;
    }

    // Shot 5 twist: the launched pencil hangs in the air, lands on his head,
    // cross-eyed freeze, then fury.
    if (t < 28.2) {
      pose.handR = { x: X + 108, y: this.hipY - 280 };
      pose.handL = { x: X - 108, y: this.hipY - 280 };
      pose.look = 'up';
      pose.headTilt = -0.1;
      pose.headDrop = -4;
      pose.mouth = 'o';
      pose.brow = 'raised';
      pose.eye = 'wide';
      return pose;
    }

    if (t < 29.0) {
      pose.handR = { x: X + 110, y: this.hipY - 50 };
      pose.handL = { x: X - 110, y: this.hipY - 50 };
      pose.look = 'up';
      pose.headTilt = -0.12;
      pose.headDrop = -4;
      pose.mouth = 'flat';
      pose.brow = 'raised';
      pose.eye = 'peek';
      return pose;
    }

    pose.handR = { x: X + 104, y: this.hipY - 30 };
    pose.handL = { x: X - 104, y: this.hipY - 30 };
    pose.bendR = 1;
    pose.bendL = 1;
    pose.fistL = true;
    pose.fistR = true;
    pose.mouth = 'grit';
    pose.brow = 'angry';
    pose.eye = 'squint';
    pose.headTurn = t > 29.5 ? 6 : 0;
    pose.anger = clamp((t - 29.0) / 0.35, 0, 1);
    return pose;
  }

  // ------------------------------------------------------------------
  // Arms (head-avoidance IK copied from magnet-trick / ring-shot)
  // ------------------------------------------------------------------

  private computeArms(pose: Pose, x: number, hipY: number): { l: Arm; r: Arm } {
    const lean = pose.lean;
    const shoulderY = hipY - 170;
    const bodyTopX = x + Math.sin(lean) * 170;
    const headCx = bodyTopX + Math.sin(pose.headTilt) * 10;
    const headCy = shoulderY - 78 + pose.headDrop;
    const handClear = this.headR + 22;
    const elbowClear = this.headR + 26;

    const solve = (side: -1 | 1, target: Pt, bend: 1 | -1): Arm => {
      const sx = bodyTopX + side * 34;
      const sy = shoulderY;

      let hx = target.x;
      let hy = target.y;
      const hdx = hx - headCx;
      const hdy = hy - headCy;
      const hd = Math.hypot(hdx, hdy);
      if (hd < handClear && hd > 0.001) {
        hx = headCx + (hdx / hd) * handClear;
        hy = headCy + (hdy / hd) * handClear;
      }

      const ux = (hx - sx) * side;
      const uy = hy - sy;
      let d = Math.hypot(ux, uy);
      if (d < 28) d = 28;
      const base = Math.atan2(ux, uy);
      const upper = 112;
      const lower = 112;
      const cosAlpha = clamp((upper * upper + d * d - lower * lower) / (2 * upper * d), -1, 1);
      const alpha = Math.acos(cosAlpha);

      const elbowAt = (b: 1 | -1) => {
        const a1 = base + b * alpha;
        return {
          x: sx + Math.sin(a1) * side * upper,
          y: sy + Math.cos(a1) * upper,
        };
      };

      const score = (e: Pt) => Math.hypot(e.x - headCx, e.y - headCy) + 0.35 * side * (e.x - sx);
      const preferred = elbowAt(bend);
      const other = elbowAt(bend === 1 ? -1 : 1);
      let elbow = score(preferred) + 8 >= score(other) ? preferred : other;

      const edx = elbow.x - headCx;
      const edy = elbow.y - headCy;
      const ed = Math.hypot(edx, edy);
      if (ed < elbowClear && ed > 0.001) {
        elbow = {
          x: headCx + (edx / ed) * elbowClear,
          y: headCy + (edy / ed) * elbowClear,
        };
      }

      return { sx, sy, ex: elbow.x, ey: elbow.y, hx, hy };
    };

    return { l: solve(-1, pose.handL, pose.bendL), r: solve(1, pose.handR, pose.bendR) };
  }

  // ------------------------------------------------------------------
  // Character
  // ------------------------------------------------------------------

  private drawStickman(
    ctx: CanvasRenderingContext2D,
    hipX: number,
    hipY: number,
    pose: Pose,
    arms: { l: Arm; r: Arm },
    t: number,
    pass: 'body' | 'front',
  ) {
    void t;
    const lean = pose.lean;
    const shoulderY = hipY - 170;
    const bodyTopX = hipX + Math.sin(lean) * 170;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (pass === 'body') {
      // Legs.
      ctx.strokeStyle = INK;
      ctx.lineWidth = 16;
      ctx.beginPath();
      if (pose.legs === 'wide') {
        ctx.moveTo(hipX, hipY);
        ctx.lineTo(hipX - 62, this.floorY);
        ctx.moveTo(hipX, hipY);
        ctx.lineTo(hipX + 62, this.floorY);
      } else {
        ctx.moveTo(hipX, hipY);
        ctx.lineTo(hipX - 44, this.floorY);
        ctx.moveTo(hipX, hipY);
        ctx.lineTo(hipX + 44, this.floorY);
      }
      ctx.stroke();

      // Yellow shirt.
      ctx.fillStyle = SHIRT;
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

      ctx.restore();
      return;
    }

    // Arms.
    const drawLimb = (a: Arm) => {
      ctx.strokeStyle = INK;
      ctx.lineWidth = 15;
      ctx.beginPath();
      ctx.moveTo(a.sx, a.sy);
      ctx.lineTo(a.ex, a.ey);
      ctx.lineTo(a.hx, a.hy);
      ctx.stroke();
    };
    drawLimb(arms.l);
    drawLimb(arms.r);

    // Hands.
    const drawHand = (a: Arm, fist: boolean) => {
      ctx.fillStyle = WHITE;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(a.hx, a.hy, fist ? 15 : 12, 0, TAU);
      ctx.fill();
      ctx.stroke();
      if (fist) {
        ctx.beginPath();
        ctx.arc(a.hx, a.hy, 6, 0, TAU);
        ctx.fillStyle = INK;
        ctx.fill();
      }
    };
    drawHand(arms.l, pose.fistL);
    drawHand(arms.r, pose.fistR);

    // Head last, so nothing ever sits on his face.
    const headX = bodyTopX + Math.sin(pose.headTilt) * 10;
    const headY = shoulderY - 78 + pose.headDrop;
    this.drawHead(ctx, headX, headY, pose);

    ctx.restore();
  }

  private drawHead(ctx: CanvasRenderingContext2D, cx: number, cy: number, pose: Pose) {
    const r = this.headR;
    const turn = pose.headTurn;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Neck.
    ctx.strokeStyle = INK;
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(0, r - 6);
    ctx.lineTo(0, r + 26);
    ctx.stroke();

    // Face.
    ctx.fillStyle = WHITE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Cartoon anger "steam" marks outside the face; the face stays white.
    if (pose.anger > 0.01) {
      ctx.save();
      ctx.globalAlpha = pose.anger;
      ctx.strokeStyle = BEANIE;
      ctx.lineWidth = 7;
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(side * (r - 6), -r + 4);
        ctx.lineTo(side * (r + 14), -r - 12);
        ctx.moveTo(side * (r - 10), -r - 8);
        ctx.lineTo(side * (r + 4), -r - 22);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Red beanie: soft dome, deep cuff, bright pom-pom.
    if (pose.beanieOn) {
      ctx.fillStyle = BEANIE;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(0, -24, r + 4, Math.PI * 1.02, Math.PI * 1.98);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = BEANIE_DEEP;
      ctx.fillRect(-r - 4, -40, (r + 4) * 2, 16);
      ctx.strokeRect(-r - 4, -40, (r + 4) * 2, 16);

      ctx.fillStyle = '#ff6b6b';
      ctx.beginPath();
      ctx.arc(0, -r - 32, 16, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }

    // Eyes.
    const eyeShift = pose.look === 'down' ? 7 : pose.look === 'up' ? -6 : 0;
    const eyeY = 8 + eyeShift;
    const eyeDX = 26;
    const fx = turn;
    ctx.fillStyle = INK;
    ctx.strokeStyle = INK;

    if (pose.eye === 'shut' || pose.eye === 'happy') {
      ctx.lineWidth = 7;
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(fx + side * eyeDX, eyeY + 6, 13, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();
      }
    } else if (pose.eye === 'peek') {
      // Cross-eyed: both pupils crowd the top of the nose, looking up at the
      // pencil balanced on the beanie.
      ctx.fillStyle = WHITE;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(fx + side * eyeDX, eyeY, 15, 0, TAU);
        ctx.fill();
        ctx.stroke();
      }
      ctx.fillStyle = INK;
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(fx + side * 11, eyeY - 6, 6.5, 0, TAU);
        ctx.fill();
      }
    } else {
      const eyeH = pose.eye === 'wide' ? 30 : pose.eye === 'squint' ? 9 : 20;
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(fx + side * eyeDX, eyeY, 11, eyeH / 2, 0, 0, TAU);
        ctx.fill();
      }
    }

    // Eyebrows.
    ctx.strokeStyle = INK;
    ctx.lineWidth = 9;
    const browY = -12;
    ctx.beginPath();
    if (pose.brow === 'angry' || pose.brow === 'determined') {
      ctx.moveTo(fx - 42, browY - 8);
      ctx.lineTo(fx - 12, browY + 8);
      ctx.moveTo(fx + 42, browY - 8);
      ctx.lineTo(fx + 12, browY + 8);
    } else if (pose.brow === 'raised') {
      ctx.moveTo(fx - 42, browY - 10);
      ctx.lineTo(fx - 12, browY - 10);
      ctx.moveTo(fx + 42, browY - 10);
      ctx.lineTo(fx + 12, browY - 10);
    } else if (pose.brow === 'sad') {
      ctx.moveTo(fx - 42, browY + 8);
      ctx.lineTo(fx - 12, browY - 8);
      ctx.moveTo(fx + 42, browY + 8);
      ctx.lineTo(fx + 12, browY - 8);
    } else if (pose.brow === 'cocky') {
      ctx.moveTo(fx - 42, browY - 8);
      ctx.lineTo(fx - 12, browY - 8);
      ctx.moveTo(fx + 42, browY - 2);
      ctx.lineTo(fx + 12, browY + 4);
    } else {
      ctx.moveTo(fx - 42, browY - 4);
      ctx.lineTo(fx - 12, browY - 8);
      ctx.moveTo(fx + 42, browY - 4);
      ctx.lineTo(fx + 12, browY - 8);
    }
    ctx.stroke();

    // Mouth.
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    const my = 40;
    ctx.beginPath();
    if (pose.mouth === 'grin') {
      ctx.arc(fx, my - 12, 26, 0.15 * Math.PI, 0.85 * Math.PI);
    } else if (pose.mouth === 'smile') {
      ctx.arc(fx, my - 14, 20, 0.2 * Math.PI, 0.8 * Math.PI);
    } else if (pose.mouth === 'smirk') {
      ctx.moveTo(fx - 22, my + 2);
      ctx.quadraticCurveTo(fx + 4, my + 10, fx + 24, my - 10);
    } else if (pose.mouth === 'frown') {
      ctx.arc(fx, my + 16, 24, 1.15 * Math.PI, 1.85 * Math.PI);
    } else if (pose.mouth === 'o') {
      ctx.ellipse(fx, my, 12, 15, 0, 0, TAU);
    } else if (pose.mouth === 'grit') {
      ctx.rect(fx - 24, my - 8, 48, 16);
      for (let i = -2; i <= 2; i++) {
        ctx.moveTo(fx + i * 9, my - 7);
        ctx.lineTo(fx + i * 9, my + 7);
      }
    } else {
      ctx.moveTo(fx - 18, my);
      ctx.lineTo(fx + 18, my);
    }
    ctx.stroke();

    ctx.restore();
  }

  // ------------------------------------------------------------------
  // Pencil
  // ------------------------------------------------------------------

  private readonly bookX = BOOK_X;

  private pencilAt(t: number): { x: number; y: number; rot: number; visible: boolean } {
    const HOLD_X = CHAR_X + 95;
    const HOLD_Y = this.hipY - 154;
    const DESK_REST = DESK_TOP - 60;
    const FLAT_Y = DESK_TOP - 11;
    const TIP_X = CHAR_X + 150;
    const HEAD_TOP = this.hipY - 170 - 78 - this.headR - 48;

    const stand = (tipX: number, tipY: number, ang: number) => ({
      x: tipX + Math.sin(ang) * 60,
      y: tipY - Math.cos(ang) * 60,
      rot: ang,
      visible: true,
    });

    // Shot 1 — confident hold, then a flip at the desk.
    if (t < 4.0) {
      const wind = smooth(clamp((t - 2.6) / 0.7, 0, 1));
      return {
        x: HOLD_X,
        y: HOLD_Y - Math.abs(Math.sin((t / 3.2) * Math.PI)) * 3,
        rot: 0.35 + wind * 0.55,
        visible: true,
      };
    }
    if (t < 4.85) {
      const u = smooth((t - 4.0) / 0.85);
      return {
        x: lerp(HOLD_X, TIP_X, u),
        y: lerp(HOLD_Y, FLAT_Y, u) - Math.sin(u * Math.PI) * 150,
        rot: lerp(0.9, Math.PI / 2 + Math.PI * 4, u),
        visible: true,
      };
    }
    if (t < 5.15) {
      return { x: TIP_X, y: FLAT_Y, rot: Math.PI / 2 + Math.PI * 4, visible: true };
    }

    // Shot 2 — three quick failures.
    if (t < 5.35) {
      const u = smooth((t - 5.15) / 0.2);
      return {
        x: lerp(TIP_X, HOLD_X, u),
        y: lerp(FLAT_Y, HOLD_Y, u) - Math.sin(u * Math.PI) * 40,
        rot: lerp(Math.PI / 2 + Math.PI * 4, 0.5, u),
        visible: true,
      };
    }
    if (t < 5.6) {
      // 1: thrown flat — it will roll off the right edge.
      const u = smooth((t - 5.35) / 0.25);
      return {
        x: lerp(HOLD_X, DESK_RIGHT - 60, u),
        y: lerp(HOLD_Y, FLAT_Y, u) - Math.sin(u * Math.PI) * 90,
        rot: 0.5 + u * Math.PI * 3,
        visible: true,
      };
    }
    if (t < 6.05) {
      // Rolls right, tips over the edge and drops.
      const u = clamp((t - 5.6) / 0.45, 0, 1);
      const fall = clamp((u - 0.55) / 0.45, 0, 1);
      return {
        x: lerp(DESK_RIGHT - 60, DESK_RIGHT + 70, u),
        y: lerp(FLAT_Y, this.floorY - 11, fall * fall),
        rot: Math.PI / 2 + fall * 0.8,
        visible: true,
      };
    }
    if (t < 6.45) {
      // 2: launched back up — it bonks his forehead.
      const u = smooth((t - 6.05) / 0.4);
      return {
        x: lerp(DESK_RIGHT + 70, CHAR_X + 14, u),
        y: lerp(this.floorY - 11, 898, u) - Math.sin(u * Math.PI) * 40,
        rot: lerp(Math.PI / 2 + 0.8, Math.PI * 2.1, u),
        visible: true,
      };
    }
    if (t < 6.75) {
      // Ricochet off the forehead.
      const u = smooth((t - 6.45) / 0.3);
      return {
        x: lerp(CHAR_X + 14, CHAR_X + 54, u),
        y: lerp(898, 838, u),
        rot: Math.PI * 2.1 + u * 2.6,
        visible: true,
      };
    }
    if (t < 7.15) {
      // 3: drops on the desk and slides under the book.
      const u = smooth((t - 6.75) / 0.4);
      return {
        x: lerp(CHAR_X + 54, BOOK_X - 66, u),
        y: lerp(838, FLAT_Y, u * u),
        rot: lerp(Math.PI * 2.1 + 2.6, Math.PI / 2 + Math.PI * 4, u),
        visible: true,
      };
    }
    if (t < 10.0) {
      return { x: BOOK_X - 66, y: FLAT_Y, rot: Math.PI / 2 + Math.PI * 4, visible: true };
    }

    // Shot 3 — practice montage.
    if (t < 10.5) {
      const u = smooth((t - 10.0) / 0.5);
      return {
        x: lerp(BOOK_X - 66, HOLD_X, u),
        y: lerp(FLAT_Y, HOLD_Y, u) - Math.sin(u * Math.PI) * 50,
        rot: lerp(Math.PI / 2 + Math.PI * 4, 0.5, u),
        visible: true,
      };
    }
    if (t < 11.4) {
      return { x: HOLD_X, y: HOLD_Y, rot: 0.5 + Math.sin((t - 10.5) * 6) * 0.08, visible: true };
    }
    if (t < 12.1) {
      const u = smooth((t - 11.4) / 0.7);
      return {
        x: lerp(HOLD_X, TIP_X, u),
        y: lerp(HOLD_Y, FLAT_Y, u) - Math.sin(u * Math.PI) * 130,
        rot: 0.5 + u * Math.PI * 4,
        visible: true,
      };
    }
    if (t < 12.6) {
      const u = smooth((t - 12.1) / 0.5);
      return {
        x: lerp(TIP_X, HOLD_X, u),
        y: lerp(FLAT_Y, HOLD_Y, u) - Math.sin(u * Math.PI) * 60,
        rot: 0.5 + Math.PI * 4 + u * Math.PI * 2,
        visible: true,
      };
    }
    if (t < 13.4) {
      const u = smooth((t - 12.6) / 0.8);
      return {
        x: lerp(HOLD_X, CHAR_X + 120, u),
        y: lerp(HOLD_Y, FLAT_Y, u) - Math.sin(u * Math.PI) * 150,
        rot: 0.5 + Math.PI * 6 + u * Math.PI * 4,
        visible: true,
      };
    }
    if (t < 13.9) {
      const u = smooth((t - 13.4) / 0.5);
      return {
        x: lerp(CHAR_X + 120, HOLD_X, u),
        y: lerp(FLAT_Y, HOLD_Y, u) - Math.sin(u * Math.PI) * 60,
        rot: 0.5 + Math.PI * 10 + u * Math.PI * 2,
        visible: true,
      };
    }
    if (t < 14.9) {
      // Final launch, out to the clear side of the desk.
      const u = smooth((t - 13.9) / 1.0);
      return {
        x: lerp(HOLD_X, CHAR_X + 150, u),
        y: lerp(HOLD_Y, 830, u) - Math.sin(u * Math.PI) * 60,
        rot: 0.5 + Math.PI * 12 + u * Math.PI * 3,
        visible: true,
      };
    }

    // Shot 4 — slow-motion descent, tip-first landing, wobble.
    if (t < 15.4) {
      const u = smooth((t - 14.9) / 0.5);
      return { x: CHAR_X + 150, y: 830 - Math.sin(u * Math.PI) * 10, rot: 0.5 + Math.PI * 15 + u * 0.8, visible: true };
    }
    if (t < 19.8) {
      const u = smooth((t - 15.4) / 4.4);
      return {
        x: CHAR_X + 150,
        y: lerp(830 - 10, DESK_REST, u),
        rot: lerp(0.5 + Math.PI * 15.8, 0, u),
        visible: true,
      };
    }
    if (t < 21.3) {
      const u = smooth((t - 19.8) / 1.5);
      const wobble = Math.sin((t - 19.8) * 15) * (1 - u) * 0.22;
      return stand(CHAR_X + 150, DESK_TOP, wobble);
    }
    if (t < 22.0) {
      return stand(CHAR_X + 150, DESK_TOP, 0);
    }

    // Shot 5 — victory dance, then the desk shake launches it onto his head.
    if (t < 26.0) {
      const jiggle = Math.sin((t - 22) * 7) * 3;
      return stand(CHAR_X + 150, DESK_TOP + jiggle, Math.sin((t - 22) * 7) * 0.02);
    }
    if (t < 26.4) {
      const u = smooth((t - 26.0) / 0.4);
      return {
        x: CHAR_X + 150,
        y: lerp(DESK_REST, 1000, u),
        rot: lerp(0, Math.PI * 2.4, u),
        visible: true,
      };
    }
    if (t < 27.0) {
      // Spins up past his face.
      const u = smooth((t - 26.4) / 0.6);
      return {
        x: lerp(CHAR_X + 150, CHAR_X, u),
        y: lerp(1000, 900, u) - Math.sin(u * Math.PI) * 60,
        rot: Math.PI * 2.4 + u * Math.PI * 5,
        visible: true,
      };
    }
    if (t < 27.8) {
      // Drops tip-first onto his head.
      const u = smooth((t - 27.0) / 0.8);
      return {
        x: CHAR_X,
        y: lerp(900, HEAD_TOP - 60, u),
        rot: lerp(Math.PI * 7.4, Math.PI * 8, u),
        visible: true,
      };
    }
    if (t < 28.5) {
      const u = smooth((t - 27.8) / 0.7);
      const wobble = Math.sin((t - 27.8) * 14) * (1 - u) * 0.18;
      return stand(CHAR_X, HEAD_TOP, wobble);
    }
    // Balanced on his head through the final freeze.
    return stand(CHAR_X, HEAD_TOP, 0);
  }

  private drawPencil(ctx: CanvasRenderingContext2D, t: number) {
    const p = this.pencilAt(t);
    if (!p.visible) return;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    const r = 9;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.lineJoin = 'round';

    // Pink eraser (top end).
    ctx.fillStyle = PENCIL_ERASER;
    ctx.beginPath();
    ctx.roundRect(-r, -60, r * 2, 14, 6);
    ctx.fill();
    ctx.stroke();

    // Metal ferrule.
    ctx.fillStyle = '#c9ced6';
    ctx.beginPath();
    ctx.rect(-r, -46, r * 2, 8);
    ctx.fill();
    ctx.stroke();

    // Yellow body.
    ctx.fillStyle = PENCIL_BODY;
    ctx.beginPath();
    ctx.rect(-r, -38, r * 2, 74);
    ctx.fill();
    ctx.stroke();

    // Sharpened wood cone.
    ctx.fillStyle = '#f1d4a8';
    ctx.beginPath();
    ctx.moveTo(-r, 36);
    ctx.lineTo(r, 36);
    ctx.lineTo(4, 52);
    ctx.lineTo(-4, 52);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Graphite point.
    ctx.fillStyle = PENCIL_GRAPHITE;
    ctx.beginPath();
    ctx.moveTo(-4, 51);
    ctx.lineTo(4, 51);
    ctx.lineTo(0, 60);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  // ------------------------------------------------------------------
  // Desk + book
  // ------------------------------------------------------------------

  private drawDesk(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;

    // Legs.
    ctx.fillStyle = DESK;
    for (const lx of [DESK_LEFT + 40, DESK_RIGHT - 92]) {
      ctx.beginPath();
      ctx.roundRect(lx, DESK_TOP + DESK_H - 6, 44, this.floorY - DESK_TOP - DESK_H + 6, 6);
      ctx.fill();
      ctx.stroke();
    }

    // Top slab.
    ctx.beginPath();
    ctx.roundRect(DESK_LEFT, DESK_TOP, DESK_RIGHT - DESK_LEFT, DESK_H, 8);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#cfccc9';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(DESK_LEFT + 16, DESK_TOP + 9);
    ctx.lineTo(DESK_RIGHT - 16, DESK_TOP + 9);
    ctx.stroke();
    ctx.restore();
  }

  private drawBook(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(BOOK_X, DESK_TOP);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.lineJoin = 'round';

    ctx.fillStyle = BOOK;
    ctx.beginPath();
    ctx.roundRect(-54, -40, 108, 40, 5);
    ctx.fill();
    ctx.stroke();

    // Page block.
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.rect(-46, -10, 92, 7);
    ctx.fill();
    ctx.stroke();

    // Spine.
    ctx.beginPath();
    ctx.moveTo(-44, -36);
    ctx.lineTo(-44, -4);
    ctx.stroke();
    ctx.restore();
  }

  // ------------------------------------------------------------------
  // Captions (burned-in, same style as magnet-trick / ring-shot)
  // ------------------------------------------------------------------

  private drawCaptions(ctx: CanvasRenderingContext2D, t: number) {
    const line = this.captions.find((c) => t >= c.from && t < c.to);
    if (!line) return;

    const u = clamp((t - line.from) / 0.1, 0, 1);
    const tailFade = Math.min(1, (line.to - t) / 0.2);
    const alpha = clamp(Math.min((t - line.from) / 0.05, tailFade), 0, 1);
    if (alpha <= 0) return;

    const scale = 1 - (1 - u) * 0.25 + Math.sin(u * Math.PI) * 0.18;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(WIDTH / 2, 470);
    ctx.scale(scale, scale);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';

    const family = '"Arial Black", "Helvetica Neue", Arial, sans-serif';
    let size = 78;
    ctx.font = `900 ${size}px ${family}`;
    const width = ctx.measureText(line.text).width;
    if (width > 950) {
      size = Math.max(46, Math.floor((size * 950) / width));
      ctx.font = `900 ${size}px ${family}`;
    }

    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 6;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 14;
    ctx.strokeText(line.text, 0, 0);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.strokeText(line.text, 0, 0);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(line.text, 0, 0);

    ctx.restore();
  }
}
