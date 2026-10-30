import type { StudioConfig } from '../types';

const TAU = Math.PI * 2;
const WIDTH = 1080;
const HEIGHT = 1920;

// Pure white background per the Modern Pop brief, with a faint floor band so
// the stickman is grounded.
const INK = '#141414';
const WHITE = '#ffffff';
const FLOOR = '#f2f2f4';
const FLOOR_LINE = '#d9d9e0';

// Character colors (locked across the whole film).
const BEANIE = '#e63946';
const BEANIE_DEEP = '#b3222e';
const SHIRT = '#ffd166';

// Magnet prop: red-and-blue horseshoe.
const MAG_RED = '#dc2626';
const MAG_BLUE = '#2563eb';
const MAG_DARK = '#141414';
const MAG_GLOW = '#60a5fa';

// Steel objects: screw, spoons, forks, chair, saucepan, cup.
const STEEL = '#c9ced8';
const STEEL_DARK = '#8d94a3';
const STEEL_LIGHT = '#eef1f5';

// Cup.
const CUP_COL = '#9ca3af';
const CUP_DARK = '#6b7280';

// Red thread / tiny magnet accents (thin red line for the tiny magnet's pull).
const RED = '#dc2626';
const MAG_TINY = '#fbcfe8';

// Sound-spotlight sparkles.
const SPARKLE = '#fcd34d';

const FLOOR_Y = 1500;
const HIP_Y = 1200;
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
function keyAt(keys: Array<[number, number]>, t: number): number {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [ta, va] = keys[i];
    const [tb, vb] = keys[i + 1];
    if (t >= ta && t <= tb) {
      if (tb - ta < 0.0001) return vb;
      return lerp(va, vb, smooth((t - ta) / (tb - ta)));
    }
  }
  return keys[keys.length - 1][1];
}
function backOut(t: number) {
  const x = clamp(t, 0, 1);
  const s = 1.9;
  return 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
}
function lerpPt(a: { x: number; y: number }, b: { x: number; y: number }, u: number) {
  return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u) };
}

type MouthShape = 'flat' | 'smile' | 'grin' | 'o' | 'frown' | 'grit' | 'smirk';
type BrowShape = 'normal' | 'angry' | 'raised' | 'sad' | 'cocky' | 'determined';
type EyeShape = 'open' | 'wide' | 'squint' | 'shut' | 'sly' | 'happy' | 'peek';
type LookDir = 'front' | 'down' | 'up';

interface Pt {
  x: number;
  y: number;
}

interface Pose {
  lean: number;
  headTilt: number;
  headDrop: number;
  headTurn: number;
  look: LookDir;
  mouth: MouthShape;
  brow: BrowShape;
  eye: EyeShape;
  legs: 'stand' | 'walk' | 'crouch';
  walkPhase: number;
  handL: Pt;
  handR: Pt;
  bendL: 1 | -1;
  bendR: 1 | -1;
  fistL: boolean;
  fistR: boolean;
  fingersR: number;
  pointL: boolean;
  pointR: boolean;
  beanieOn: boolean;
}

interface CaptionLine {
  text: string;
  from: number;
  to: number;
}

interface CameraKey {
  t: number;
  x: number;
  y: number;
  zoom: number;
}

interface Arm {
  sx: number;
  sy: number;
  ex: number;
  ey: number;
  hx: number;
  hy: number;
}

const CAPTIONS: CaptionLine[] = [
  { text: 'ONE SCREW. THAT\'S IT.', from: 0.15, to: 3.85 },
  { text: 'WHY THE SPOONS?!', from: 4.14, to: 8.94 },
  { text: 'STOP ATTRACTING EVERYTHING!', from: 9.14, to: 13.94 },
  { text: 'I REGRET EVERYTHING.', from: 14.14, to: 19.94 },
  { text: 'SMALL MAGNET. SMALL TARGET.', from: 20.14, to: 25.94 },
  { text: 'MISSION COMPLETE… BONK 💀', from: 26.14, to: 29.65 },
];

const CAMERA_KEYS: CameraKey[] = [
  { t: 0.0, x: 540, y: 1000, zoom: 1.9 },
  { t: 4.0, x: 540, y: 1000, zoom: 1.25 },
  { t: 9.0, x: 540, y: 1000, zoom: 1.2 },
  { t: 10.6, x: 660, y: 1060, zoom: 1.35 },
  { t: 14.0, x: 540, y: 1000, zoom: 1.1 },
  { t: 18.5, x: 540, y: 1000, zoom: 1.2 },
  { t: 20.0, x: 540, y: 1000, zoom: 1.3 },
  { t: 24.5, x: 540, y: 900, zoom: 1.4 },
  { t: 26.0, x: 540, y: 880, zoom: 1.6 },
  { t: 28.2, x: 540, y: 880, zoom: 2.05 },
  { t: 30.0, x: 540, y: 880, zoom: 2.2 },
];

export class MagnetTrickRenderer {
  readonly width = WIDTH;
  readonly height = HEIGHT;

  private readonly floorY = FLOOR_Y;
  private readonly hipY = HIP_Y;
  private readonly headR = HEAD_R;

  private readonly captions = CAPTIONS;

  render(ctx: CanvasRenderingContext2D, time: number, config: StudioConfig) {
    const t = clamp(time, 0, 30);

    ctx.save();
    ctx.fillStyle = WHITE;
    ctx.fillRect(-200, -200, WIDTH + 400, HEIGHT + 400);

    this.applyCamera(ctx, t);
    this.renderStage(ctx);

    const x = this.charX(t);
    const pose = this.poseAt(t);
    const arms = this.computeArms(pose, x, this.hipY);

    this.renderShadows(ctx, t, x);

    // Body first: the low table then covers his legs, as if he stands behind it.
    this.drawStickman(ctx, x, this.hipY, pose, arms, t, 'body');

    this.drawTable(ctx, t);
    this.drawChairProp(ctx, t);
    this.drawScrew(ctx, t);
    this.drawCup(ctx, t);

    // Magnet and attracted objects (magnet in his right hand).
    this.drawMagnetAndObjects(ctx, t, arms.r);

    // Arms, hands and head sit in front of the magnet.
    this.drawStickman(ctx, x, this.hipY, pose, arms, t, 'front');

    // Tiny magnet (shot 5-6) after the hand so it reads as held.
    this.drawTinyMagnetAndScrew(ctx, t, arms.r);

    // Beanie gag prop (shot 6) — drawn here so it sits above everything.
    this.drawBeanieGag(ctx, t, arms.r);

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
    } else {
      cx = prev.x;
      cy = prev.y;
      zoom = prev.zoom;
    }
    ctx.translate(WIDTH / 2, HEIGHT / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-cx, -cy);
  }

  private restoreCamera(ctx: CanvasRenderingContext2D) {
    ctx.restore();
  }

  private charX(t: number): number {
    // Walk sideways in shot 3 (chair chase), otherwise stays at the table.
    if (t >= 9.6 && t < 11.8) {
      const u = smooth(clamp((t - 9.6) / 1.1, 0, 1));
      return lerp(540, 410, u);
    }
    if (t >= 11.8 && t < 12.6) {
      const u = smooth(clamp((t - 11.8) / 0.8, 0, 1));
      return lerp(410, 540, u);
    }
    return 540;
  }

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
      walkPhase: 0,
      handL: { x: 445, y: 1210 },
      handR: { x: 660, y: 1180 },
      bendL: -1,
      bendR: -1,
      fistL: false,
      fistR: false,
      fingersR: 0,
      pointL: false,
      pointR: false,
      beanieOn: true,
    };
  }

  private poseAt(t: number): Pose {
    const pose = this.defaultPose();
    const X = this.charX(t);

    if (t < 4) {
      // Shot 1: confident hold over the screw, then an annoyed stare.
      pose.handR = { x: X + 80, y: this.hipY - 20 };
      pose.look = 'down';
      if (t < 1.6) {
        pose.mouth = 'smirk';
        pose.brow = 'cocky';
      } else if (t < 2.6) {
        pose.mouth = 'flat';
        pose.brow = 'angry';
        pose.headTilt = 0.05;
      } else {
        pose.mouth = 'frown';
        pose.brow = 'angry';
        pose.headTurn = 4;
      }
      return pose;
    }

    if (t < 9) {
      // Shot 2: waving the magnet hard, then furious at the screw.
      pose.handR = {
        x: X + 185 + Math.sin(t * 12) * 12,
        y: this.hipY - 215 + Math.cos(t * 9) * 8,
      };
      if (t < 6) {
        pose.mouth = 'grin';
        pose.brow = 'cocky';
      } else {
        pose.mouth = 'frown';
        pose.brow = 'angry';
        pose.headTurn = -5;
        pose.look = 'down';
      }
      return pose;
    }

    if (t < 14) {
      // Shot 3: runs sideways while the chair follows.
      pose.legs = 'walk';
      pose.walkPhase = (t - 9.6) * 16;
      pose.handR = { x: X + 120, y: this.hipY - 150 };
      pose.handL = { x: X - 105, y: this.hipY - 70 };
      if (t < 11.0) {
        pose.mouth = 'grin';
        pose.brow = 'cocky';
      } else if (t < 12.0) {
        pose.mouth = 'o';
        pose.brow = 'raised';
        pose.look = 'down';
      } else {
        pose.mouth = 'frown';
        pose.brow = 'angry';
        pose.look = 'down';
      }
      return pose;
    }

    if (t < 20) {
      // Shot 4: buried under the swarm, only the angry face reads.
      pose.legs = 'crouch';
      pose.handR = { x: X + 120, y: this.hipY - 160 };
      pose.handL = { x: X - 120, y: this.hipY - 160 };
      pose.fistL = true;
      pose.fistR = true;
      pose.mouth = 'frown';
      pose.brow = 'angry';
      pose.eye = 'wide';
      return pose;
    }

    if (t < 26) {
      // Shot 5: tiny magnet picks the screw out of the cup.
      let handX = 620;
      if (t >= 23.4) {
        handX = lerp(620, 700, smooth(clamp((t - 23.4) / 1.0, 0, 1)));
      }
      pose.handR = { x: handX, y: this.hipY - 80 };
      pose.look = 'down';
      if (t < 22.6) {
        pose.mouth = 'flat';
        pose.brow = 'determined';
        pose.eye = 'squint';
      } else {
        pose.mouth = 'grin';
        pose.brow = 'raised';
        pose.eye = 'happy';
        pose.look = 'front';
      }
      return pose;
    }

    // Shot 6: victory, the beanie yanked over his eyes, then rage.
    const rel = t - 26;
    if (rel < 1.2) {
      pose.handR = { x: X + 95, y: this.hipY - 355 };
      pose.mouth = 'grin';
      pose.brow = 'raised';
      pose.eye = 'happy';
    } else if (rel < 2.2) {
      const u = smooth(clamp((rel - 1.2) / 0.7, 0, 1));
      pose.handR = {
        x: lerp(X + 95, X + 55, u),
        y: lerp(this.hipY - 355, this.hipY - 165, u),
      };
      pose.mouth = 'flat';
      pose.brow = 'normal';
      pose.eye = 'open';
    } else {
      pose.handR = { x: X + 55, y: this.hipY - 165 };
      pose.mouth = 'frown';
      pose.brow = 'angry';
      pose.eye = 'squint';
      if (t > 29.4) pose.headTurn = 8;
    }
    // The worn beanie leaves the head while the gag prop covers his eyes.
    if (t >= 27.2 && t < 29.3) pose.beanieOn = false;
    return pose;
  }

  private computeArms(pose: Pose, x: number, hipY: number): { l: Arm; r: Arm } {
    const lean = pose.lean;
    const shoulderY = hipY - 170;
    const bodyTopX = x + Math.sin(lean) * 170;
    const headCx = bodyTopX + Math.sin(pose.headTilt) * 10;
    const headCy = shoulderY - 78 + pose.headDrop;
    const handClear = this.headR + 22;
    const elbowClear = this.headR + 26;

    const solve = (side: -1 | 1, target: { x: number; y: number }, bend: 1 | -1): Arm => {
      const sx = bodyTopX + side * 34;
      const sy = shoulderY;

      // Keep the hand off the face: push it radially out of the head circle.
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

      // Prefer the requested bend, but never let an elbow kink through the head
      // and mildly prefer elbows that sit on their own side of the body.
      const score = (e: { x: number; y: number }) =>
        Math.hypot(e.x - headCx, e.y - headCy) + 0.35 * side * (e.x - sx);
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

  private renderStage(ctx: CanvasRenderingContext2D) {
    // Floor band.
    ctx.fillStyle = FLOOR;
    ctx.fillRect(0, this.floorY, WIDTH, HEIGHT - this.floorY);
    ctx.strokeStyle = FLOOR_LINE;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(0, this.floorY);
    ctx.lineTo(WIDTH, this.floorY);
    ctx.stroke();
  }

  private renderShadows(ctx: CanvasRenderingContext2D, t: number, x: number) {
    ctx.fillStyle = 'rgba(20, 20, 20, 0.08)';
    const walking = t >= 9.6 && t < 12.6;
    const cx = walking ? x : 540;
    ctx.beginPath();
    ctx.ellipse(cx, this.floorY - 8, walking ? 60 : 90, 14, 0, 0, TAU);
    ctx.fill();
  }

  private drawStickman(
    ctx: CanvasRenderingContext2D,
    hipX: number,
    hipY: number,
    pose: Pose,
    arms: { l: Arm; r: Arm },
    t: number,
    pass: 'body' | 'front',
  ) {
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
      if (pose.legs === 'walk') {
        const stride = Math.sin(pose.walkPhase) * 30;
        const liftL = Math.max(0, Math.sin(pose.walkPhase)) * 22;
        const liftR = Math.max(0, -Math.sin(pose.walkPhase)) * 22;
        ctx.moveTo(hipX, hipY);
        ctx.lineTo(hipX - 40 + stride, this.floorY - liftL);
        ctx.moveTo(hipX, hipY);
        ctx.lineTo(hipX + 40 - stride, this.floorY - liftR);
      } else if (pose.legs === 'crouch') {
        ctx.moveTo(hipX, hipY);
        ctx.lineTo(hipX - 34, this.floorY);
        ctx.moveTo(hipX, hipY);
        ctx.lineTo(hipX + 34, this.floorY);
      } else {
        ctx.moveTo(hipX, hipY);
        ctx.lineTo(hipX - 44, this.floorY);
        ctx.moveTo(hipX, hipY);
        ctx.lineTo(hipX + 44, this.floorY);
      }
      ctx.stroke();

      // Yellow shirt: a simple trapezoid, as in the other shorts.
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

    // Head last, so the magnet hand and the magnet never sit on his face.
    const headX = bodyTopX + Math.sin(pose.headTilt) * 10;
    const headY = shoulderY - 78 + pose.headDrop;
    this.drawHead(ctx, headX, headY, pose);

    ctx.restore();
  }

  private drawHead(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    pose: Pose,
  ) {
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
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(fx + side * eyeDX, eyeY, 6, 0, TAU);
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
      ctx.moveTo(fx - 24, my);
      ctx.lineTo(fx + 24, my);
      for (let i = -2; i <= 2; i++) {
        ctx.moveTo(fx + i * 10, my - 8);
        ctx.lineTo(fx + i * 10, my + 8);
      }
    } else {
      ctx.moveTo(fx - 18, my);
      ctx.lineTo(fx + 18, my);
    }
    ctx.stroke();

    ctx.restore();
  }

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

    // Subtle drop shadow, then the thick black outline, then the fill.
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

  // ---- World props -------------------------------------------------------

  private drawTable(ctx: CanvasRenderingContext2D, _t: number) {
    ctx.save();
    // Thin top slab.
    ctx.fillStyle = '#e7e5e4';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.roundRect(250, 1296, 580, 46, 12);
    ctx.fill();
    ctx.stroke();
    // Legs, behind the slab edge.
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.moveTo(310, 1342);
    ctx.lineTo(310, 1494);
    ctx.moveTo(770, 1342);
    ctx.lineTo(770, 1494);
    ctx.stroke();
    ctx.restore();
  }

  private drawCup(ctx: CanvasRenderingContext2D, _t: number) {
    // Empty cup sitting on the table, to the right of the screw.
    const cx = 700;
    const top = 1226;
    ctx.save();
    ctx.fillStyle = CUP_COL;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(cx - 30, top);
    ctx.lineTo(cx - 22, top + 70);
    ctx.lineTo(cx + 22, top + 70);
    ctx.lineTo(cx + 30, top);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Interior line.
    ctx.beginPath();
    ctx.moveTo(cx - 20, top);
    ctx.lineTo(cx + 20, top);
    ctx.stroke();
    ctx.restore();
  }

  private drawScrew(ctx: CanvasRenderingContext2D, t: number) {
    // Tiny steel screw beside the cup. Lifted and carried in Shot 5.
    let sx = 620;
    let sy = 1286;
    let carried = false;
    if (t >= 22.4 && t < 23.4) {
      const u = smooth(clamp((t - 22.4) / 1.0, 0, 1));
      sy = lerp(1286, 1160, u);
      carried = true;
    } else if (t >= 23.4 && t < 24.6) {
      const u = smooth(clamp((t - 23.4) / 1.2, 0, 1));
      sx = lerp(620, 700, u);
      sy = 1160;
      carried = true;
    } else if (t >= 24.6 && t < 25.2) {
      const u = smooth(clamp((t - 24.6) / 0.6, 0, 1));
      sx = 700;
      sy = lerp(1160, 1218, u);
      carried = true;
    } else if (t >= 25.2) {
      sx = 700;
      sy = 1218; // sitting in the cup, head above the rim
    }
    ctx.save();
    ctx.translate(sx, sy);
    if (carried && t < 25.2) {
      ctx.rotate(Math.sin(t * 30) * 0.15);
    }
    ctx.fillStyle = STEEL;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    // Shaft.
    ctx.beginPath();
    ctx.moveTo(-4, -10);
    ctx.lineTo(-4, 10);
    ctx.lineTo(4, 10);
    ctx.lineTo(4, -10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Head.
    ctx.beginPath();
    ctx.arc(0, -14, 7, 0, TAU);
    ctx.fill();
    ctx.stroke();
    // Slit.
    ctx.beginPath();
    ctx.moveTo(-3, -14);
    ctx.lineTo(3, -14);
    ctx.stroke();
    ctx.restore();
  }

  // ---- Magnet + attracted objects ----------------------------------------

  private drawCutleryMound(ctx: CanvasRenderingContext2D, grow: number) {
    const topY = lerp(1296, 1030, grow);
    const halfW = lerp(50, 150, grow);
    ctx.save();
    ctx.fillStyle = STEEL;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 7;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(540 - halfW, 1300);
    ctx.bezierCurveTo(540 - halfW * 0.9, topY + 150, 540 - 70, topY, 540, topY);
    ctx.bezierCurveTo(540 + 70, topY, 540 + halfW * 0.9, topY + 150, 540 + halfW, 1300);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Handles and tines sticking out of the pile.
    ctx.lineWidth = 11;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(540 - halfW * 0.55, 1150);
    ctx.lineTo(540 - halfW * 1.0, 1084);
    ctx.moveTo(540 + halfW * 0.5, 1186);
    ctx.lineTo(540 + halfW * 1.0, 1124);
    ctx.moveTo(540 + halfW * 0.2, 1064);
    ctx.lineTo(540 + halfW * 0.6, 1006);
    ctx.stroke();
    ctx.restore();
  }

  private drawMagnetAndObjects(ctx: CanvasRenderingContext2D, t: number, rightHand: { hx: number; hy: number }) {
    const mx = rightHand.hx;
    const my = rightHand.hy;

    if (t >= 21.2) return;

    // Attracted objects are drawn first so the magnet always stays readable.
    if (t < 20.4) {
      // Shot 4: a mound of cutlery rises out of the table and buries him.
      if (t >= 14) {
        this.drawCutleryMound(ctx, smooth(clamp((t - 14) / 0.9, 0, 1)));
      }

      // Four utensils: lined up on the table, then hanging under the magnet,
      // then streaming behind him as he runs, then piled over his body.
      const hang = [
        { dx: -76, dy: 104 },
        { dx: -25, dy: 120 },
        { dx: 25, dy: 120 },
        { dx: 76, dy: 104 },
      ];
      const pile = [
        { x: 506, y: 1018 },
        { x: 574, y: 1014 },
        { x: 512, y: 1082 },
        { x: 572, y: 1080 },
        { x: 506, y: 1150 },
        { x: 576, y: 1148 },
      ];
      for (let i = 0; i < 6; i++) {
        let ox: number;
        let oy: number;
        let rot: number;
        if (i >= 4) {
          // Two extra pieces rise out of the pile only in shot 4.
          if (t < 14) continue;
          const rise = smooth(clamp((t - 14) / 0.6, 0, 1));
          ox = pile[i].x;
          oy = pile[i].y + (1 - rise) * 44;
          rot = i === 4 ? 0.9 : -0.9;
        } else if (t < 4) {
          ox = 330 + i * 62;
          oy = 1280;
          rot = 1.45;
        } else if (t < 9) {
          const u = smooth(clamp((t - 4) / 1.6 + i * 0.05, 0, 1));
          ox = lerp(330 + i * 62, mx + hang[i].dx, u);
          oy = lerp(1280, my + hang[i].dy, u) - Math.sin(u * Math.PI) * 50;
          rot = lerp(1.45, Math.sin(t * 6 + i) * 0.08, u);
        } else if (t < 14) {
          const u = smooth(clamp((t - 9) / 0.8, 0, 1));
          ox = lerp(mx + hang[i].dx, mx + 96 + i * 38, u);
          oy = lerp(my + hang[i].dy, my + 52 + i * 10, u);
          rot = lerp(0, 1.15, u) + Math.sin(t * 8 + i) * 0.08;
        } else {
          const u = smooth(clamp((t - 13.8) / 1.0, 0, 1));
          ox = lerp(mx + 96 + i * 38, pile[i].x, u);
          oy = lerp(my + 52 + i * 10, pile[i].y, u);
          rot = lerp(1.15, [0.35, -0.4, 0.5, -0.25][i], u);
        }
        this.drawSteelObject(ctx, i, ox, oy, rot);
      }

      // Saucepan: not used in the final cut.
    }

    if (t < 20.4) {
      // The horseshoe hangs from his fist: bridge in the hand, prongs down.
      const angle = t < 9 ? Math.sin(t * 12) * 0.35 : 0;
      ctx.save();
      ctx.translate(mx, my);
      ctx.rotate(angle);
      this.drawBigMagnet(ctx);
      ctx.restore();
    } else {
      // Shot 5: he tosses the big magnet away.
      const u = smooth(clamp((t - 20.4) / 0.8, 0, 1));
      ctx.save();
      ctx.translate(lerp(mx, 1180, u), lerp(my, 360, u));
      ctx.rotate(u * 7);
      this.drawBigMagnet(ctx);
      ctx.restore();
    }
  }

  private drawBigMagnet(ctx: CanvasRenderingContext2D) {
    const prongW = 22;
    const prongH = 70;
    const bridgeH = 16;
    const gap = 12;
    const half = prongW + gap / 2;

    ctx.strokeStyle = INK;
    ctx.lineWidth = 7;

    // Bridge, held in the fist.
    ctx.fillStyle = MAG_DARK;
    ctx.beginPath();
    ctx.roundRect(-half, 0, half * 2, bridgeH, 7);
    ctx.fill();
    ctx.stroke();

    // Red prong (left).
    ctx.fillStyle = MAG_RED;
    ctx.beginPath();
    ctx.roundRect(-(prongW + gap), bridgeH, prongW, prongH, 8);
    ctx.fill();
    ctx.stroke();

    // Blue prong (right).
    ctx.fillStyle = MAG_BLUE;
    ctx.beginPath();
    ctx.roundRect(gap, bridgeH, prongW, prongH, 8);
    ctx.fill();
    ctx.stroke();

    // Bright tips.
    ctx.fillStyle = MAG_GLOW;
    ctx.beginPath();
    ctx.arc(-(prongW + gap) + prongW / 2, bridgeH + prongH - 4, 7, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(gap + prongW / 2, bridgeH + prongH - 4, 7, 0, TAU);
    ctx.fill();
  }

  private drawSteelObject(ctx: CanvasRenderingContext2D, index: number, x: number, y: number, rot: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.fillStyle = STEEL;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    if (index % 3 === 0) {
      // Spoon: oval bowl + handle.
      ctx.beginPath();
      ctx.ellipse(0, -8, 12, 17, 0, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, 8);
      ctx.lineTo(0, 34);
      ctx.stroke();
    } else if (index % 3 === 1) {
      // Fork: three tines on a handle.
      ctx.beginPath();
      ctx.moveTo(-9, -20);
      ctx.lineTo(-9, -2);
      ctx.moveTo(0, -20);
      ctx.lineTo(0, -2);
      ctx.moveTo(9, -20);
      ctx.lineTo(9, -2);
      ctx.moveTo(-9, -2);
      ctx.quadraticCurveTo(0, 9, 9, -2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, 4);
      ctx.lineTo(0, 30);
      ctx.stroke();
    } else {
      // Washer.
      ctx.beginPath();
      ctx.arc(0, 0, 13, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = WHITE;
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawChairProp(ctx: CanvasRenderingContext2D, t: number) {
    if (t < 9) return;
    const x = lerp(1060, 880, smooth(clamp((t - 9) / 1.0, 0, 1)));
    this.drawChair(ctx, x, 1448, t);
  }

  private drawChair(ctx: CanvasRenderingContext2D, x: number, y: number, t: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.sin(t * 20) * 0.015);
    ctx.lineCap = 'round';
    ctx.strokeStyle = INK;

    // Legs.
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(-34, -6);
    ctx.lineTo(-42, 52);
    ctx.moveTo(34, -6);
    ctx.lineTo(42, 52);
    ctx.stroke();

    // Back posts.
    ctx.beginPath();
    ctx.moveTo(-30, -8);
    ctx.lineTo(-30, -66);
    ctx.moveTo(30, -8);
    ctx.lineTo(30, -66);
    ctx.stroke();

    // Seat slab.
    ctx.fillStyle = '#e7e5e4';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(-44, -16, 88, 18, 5);
    ctx.fill();
    ctx.stroke();

    // Top rail.
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(-34, -66);
    ctx.lineTo(34, -66);
    ctx.stroke();
    ctx.restore();
  }

  // ---- Shot 5: tiny magnet ------------------------------------------------

  private drawTinyMagnetAndScrew(
    ctx: CanvasRenderingContext2D,
    t: number,
    rightHand: { hx: number; hy: number },
  ) {
    if (t < 20.8) return;
    // Tiny bar magnet pinched between his fingers. The screw itself is drawn
    // with the other table props so the cup can hide its shaft.
    ctx.save();
    ctx.translate(rightHand.hx, rightHand.hy - 16);
    ctx.rotate(-0.35);
    ctx.fillStyle = MAG_TINY;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(-8, -14, 16, 28, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = RED;
    ctx.beginPath();
    ctx.roundRect(-8, -14, 16, 9, 4);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // ---- Shot 6: beanie gag prop ------------------------------------------

  private drawBeanieGag(ctx: CanvasRenderingContext2D, t: number, rightHand: { hx: number; hy: number }) {
    if (t < 27.2) return;

    const headCx = 540;
    const headCy = 952;
    const pull = smooth(clamp((t - 27.2) / 0.9, 0, 1));
    const rise = smooth(clamp((t - 29.0) / 0.3, 0, 1));
    const cy = headCy - 24 + pull * 44 * (1 - rise);

    const drawSpoon = () => {
      ctx.save();
      ctx.translate(52, -40);
      ctx.rotate(-0.45);
      ctx.fillStyle = STEEL;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(0, 0, 13, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = STEEL;
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(0, -36);
      ctx.stroke();
      ctx.restore();
    };

    ctx.save();
    ctx.translate(headCx, cy);

    if (t < 29.3) {
      // Beanie pulled down over his eyes by the clip the spoon is stuck to.
      // It bulges as it stretches so no bare scalp shows above the cuff.
      const rr = 74 + 16 * pull;
      ctx.save();
      ctx.rotate(Math.sin(t * 9) * 0.05 * (1 - pull));
      ctx.fillStyle = BEANIE;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(0, 0, rr, Math.PI * 1.02, Math.PI * 1.98);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = BEANIE_DEEP;
      ctx.fillRect(-rr, -16, rr * 2, 16);
      ctx.strokeRect(-rr, -16, rr * 2, 16);
      ctx.fillStyle = '#ff6b6b';
      ctx.beginPath();
      ctx.arc(0, -(rr + 4), 16, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // The spoon rides on the beanie, so it stays clipped in both states.
    drawSpoon();
    ctx.restore();

    // Short red tug line from the tiny magnet in his hand to the spoon.
    if (t < 28.6) {
      ctx.save();
      ctx.strokeStyle = RED;
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      const handX = rightHand.hx;
      const handY = rightHand.hy - 16;
      const sx = headCx + 52;
      const sy = cy - 40;
      ctx.beginPath();
      ctx.moveTo(handX, handY);
      ctx.quadraticCurveTo(handX + 16, (handY + sy) / 2, sx, sy);
      ctx.stroke();
      ctx.restore();
    }
  }
}

