import type { StudioConfig } from '../types';

const TAU = Math.PI * 2;
const WIDTH = 1080;
const HEIGHT = 1920;

// Pure white background per the Modern Pop brief, with a faint floor band so
// the stickman and the ball are grounded.
const INK = '#141414';
const WHITE = '#ffffff';
const FLOOR = '#f2f2f4';
const FLOOR_LINE = '#d9d9e0';

// Character colors (locked across the whole film).
const BEANIE = '#e63946';
const BEANIE_DEEP = '#b3222e';
const SHIRT = '#ffd166';

// Ball.
const BALL = '#ef4444';
const BALL_DARK = '#b91c1c';

// Cup balanced on his head.
const CUP = '#e2e8f0';
const CUP_DARK = '#94a3b8';

// Five hoops, in the order the ball must pass through them.
const RING_COLS = ['#38bdf8', '#f472b6', '#a3e635', '#fbbf24', '#c084fc'];

const FLOOR_Y = 1500;
const HIP_Y = 1200;
const HEAD_R = 70;
const BALL_R = 26;

const CHAR_X = 380;
const WALL_X = 1020;

const RING_R = 76;
const RINGS: Array<{ x: number; y: number }> = [
  { x: 680, y: 1080 },
  { x: 900, y: 920 },
  { x: 660, y: 760 },
  { x: 900, y: 600 },
  { x: 380, y: 470 },
];

// The cup is balanced on the front of his beanie.
const CUP_X = 428;
const CUP_BASE_Y = 862;
const CUP_H = 48;
// Where the ball sits once it is in the cup.
const CUP_REST = { x: CUP_X, y: CUP_BASE_Y - CUP_H + 10 };

// The perfect throw: hand -> R1 -> R2 -> R3 -> R4 -> R5 -> cup.
const THROW_FROM = 14.5;
const THROW_TO = 19.4;
const THROW_PATH: Array<{ x: number; y: number }> = [
  { x: 480, y: 1040 },
  { x: RINGS[0].x, y: RINGS[0].y },
  { x: RINGS[1].x, y: RINGS[1].y },
  { x: RINGS[2].x, y: RINGS[2].y },
  { x: RINGS[3].x, y: RINGS[3].y },
  { x: RINGS[4].x, y: RINGS[4].y },
  { x: CUP_REST.x, y: CUP_REST.y },
];
// Time the ball reaches each ring on the perfect throw.
const RING_PASS_TIMES = [15.32, 16.13, 16.95, 17.77, 18.58];

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

type MouthShape = 'flat' | 'smile' | 'grin' | 'o' | 'frown' | 'grit' | 'smirk';
type BrowShape = 'normal' | 'angry' | 'raised' | 'sad' | 'cocky' | 'determined';
type EyeShape = 'open' | 'wide' | 'squint' | 'shut' | 'happy' | 'peek';
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
  { text: '5 RINGS. 1 SHOT. IMPOSSIBLE?', from: 0.15, to: 3.85 },
  { text: 'ATTEMPT #1', from: 4.14, to: 7.94 },
  { text: 'ATTEMPT #27', from: 8.14, to: 12.94 },
  { text: 'ONE. LAST. TRY.', from: 13.14, to: 19.94 },
  { text: 'HE ACTUALLY DID IT?!', from: 20.14, to: 25.94 },
  { text: 'NEVER CELEBRATE TOO EARLY 💀', from: 26.14, to: 29.72 },
];

const CAMERA_KEYS: CameraKey[] = [
  { t: 0.0, x: 380, y: 900, zoom: 2.05 },
  { t: 1.7, x: 380, y: 900, zoom: 2.1 },
  { t: 2.5, x: 540, y: 860, zoom: 0.85 },
  { t: 4.3, x: 540, y: 860, zoom: 0.85 },
  { t: 5.6, x: 420, y: 880, zoom: 1.45 },
  { t: 6.6, x: 430, y: 900, zoom: 1.25 },
  { t: 8.0, x: 540, y: 860, zoom: 0.85 },
  { t: 10.3, x: 520, y: 880, zoom: 0.95 },
  { t: 12.4, x: 400, y: 900, zoom: 1.5 },
  { t: 13.3, x: 400, y: 900, zoom: 1.55 },
  { t: 14.3, x: 540, y: 860, zoom: 0.85 },
  { t: 20.1, x: 540, y: 860, zoom: 0.9 },
  { t: 21.2, x: 420, y: 900, zoom: 1.6 },
  { t: 24.6, x: 420, y: 900, zoom: 1.6 },
  { t: 26.3, x: 420, y: 900, zoom: 1.7 },
  { t: 27.2, x: 420, y: 880, zoom: 1.85 },
  { t: 28.7, x: 400, y: 880, zoom: 2.05 },
  { t: 30.0, x: 400, y: 880, zoom: 2.2 },
];

export class RingShotRenderer {
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

    const hop = this.charHop(t);
    const hipY = this.hipY - hop;
    const x = this.charX(t);
    const pose = this.poseAt(t);
    if (this.beanieAirborne(t)) pose.beanieOn = false;
    const arms = this.computeArms(pose, x, hipY);

    const shoulderY = hipY - 170;
    const bodyTopX = x + Math.sin(pose.lean) * 170;
    const headX = bodyTopX + Math.sin(pose.headTilt) * 10;
    const headY = shoulderY - 78 + pose.headDrop;

    this.renderShadows(ctx, t, x, hipY);

    // The hoops hang in the air behind the character.
    this.drawRings(ctx, t);

    // Body first, then the ball, then arms / hands / head on top.
    this.drawStickman(ctx, x, hipY, pose, arms, t, 'body');
    this.drawBall(ctx, t, hop);
    this.drawStickman(ctx, x, hipY, pose, arms, t, 'front');

    // The cup rides on his head, and the beanie gag sits above everything.
    this.drawHeadCup(ctx, t, headX, headY, pose);
    this.drawBeanieFlight(ctx, t, headX, headY);

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

  // ------------------------------------------------------------------
  // Stage
  // ------------------------------------------------------------------

  private renderStage(ctx: CanvasRenderingContext2D) {
    // Back wall panel on the right, so the first throw has something to hit.
    ctx.fillStyle = FLOOR;
    ctx.fillRect(WALL_X, 150, 420, this.floorY - 150);
    ctx.strokeStyle = FLOOR_LINE;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(WALL_X, 150);
    ctx.lineTo(WALL_X, this.floorY);
    ctx.stroke();

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

    // Ball shadow, only once it is back near the floor.
    const ball = this.ballAt(t, 0);
    if (ball.visible && ball.y > this.floorY - 220) {
      const k = clamp((ball.y - (this.floorY - 220)) / 220, 0, 1);
      ctx.fillStyle = `rgba(20, 20, 20, ${0.08 * k})`;
      ctx.beginPath();
      ctx.ellipse(ball.x, this.floorY - 6, 26 * k + 6, 7 * k + 2, 0, 0, TAU);
      ctx.fill();
    }
  }

  private charX(t: number): number {
    // Knocked backwards by the rim bounce in the montage.
    return CHAR_X - bell(t, 9.7, 10.6, 34) - bell(t, 12.15, 12.45, 4);
  }

  private charHop(t: number): number {
    return (
      bell(t, 23.0, 23.4, 30) +
      bell(t, 24.4, 24.8, 34) +
      bell(t, 12.2, 12.44, 6) +
      bell(t, 26.1, 26.35, 12)
    );
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

    if (t < 4) {
      // Shot 1: studies the five hoops, smirks, points at the cup.
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
        // Points up at the cup on his head.
        pose.handL = { x: X - 52, y: this.hipY - 320 };
        pose.look = 'up';
        pose.mouth = 'smile';
        pose.brow = 'raised';
        pose.eye = 'open';
      } else {
        pose.mouth = 'grit';
        pose.brow = 'angry';
        pose.eye = 'squint';
        pose.headTurn = 4;
      }
      return pose;
    }

    if (t < 8) {
      // Shot 2: attempt #1 — wall ricochet, forehead bonk, rage.
      if (t < 4.5) {
        pose.handR = { x: X + 40, y: this.hipY - 60 };
        pose.bendR = 1;
        pose.lean = -0.05;
        pose.mouth = 'grit';
        pose.brow = 'determined';
      } else if (t < 5.7) {
        // Follow-through.
        pose.handR = { x: X + 130, y: this.hipY - 230 };
        pose.lean = 0.06;
        pose.mouth = 'grin';
        pose.brow = 'cocky';
        pose.look = 'up';
      } else if (t < 6.6) {
        // Bonked: head snaps back, eyes wide.
        pose.handR = { x: X + 110, y: this.hipY - 150 };
        pose.headTilt = -0.14;
        pose.headDrop = -6;
        pose.lean = -0.1;
        pose.mouth = 'o';
        pose.brow = 'raised';
        pose.eye = 'wide';
        pose.fistL = true;
        pose.fistR = true;
      } else {
        // Fists clenched, furious.
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
        pose.anger = 0.35;
      }
      return pose;
    }

    if (t < 13) {
      // Shot 3: attempt #27 — three misses, then a stomp.
      if (t < 9.1) {
        pose.handR = { x: X + 120, y: this.hipY - 214 };
        pose.lean = 0.05;
        pose.look = 'up';
        pose.mouth = 'grin';
        pose.brow = 'cocky';
      } else if (t < 10.6) {
        // Rim bounce knocks him backwards.
        const u = smooth(clamp((t - 9.7) / 0.5, 0, 1));
        pose.lean = lerp(0.05, -0.2, u);
        pose.handR = { x: X + 140, y: this.hipY - 260 };
        pose.handL = { x: X - 140, y: this.hipY - 250 };
        pose.mouth = 'o';
        pose.brow = 'raised';
        pose.eye = 'wide';
        pose.headTilt = -0.1;
      } else if (t < 12.05) {
        // Spinning throw flops at his feet.
        pose.lean = 0.08;
        pose.handR = { x: X + 60, y: this.hipY - 240 };
        pose.look = 'down';
        pose.mouth = 'flat';
        pose.brow = 'determined';
        pose.eye = 'open';
      } else {
        // Stomping, face going red, ball hand up ready for one last try.
        pose.handR = { x: X + 100, y: this.hipY - 160 };
        pose.handL = { x: X - 96, y: this.hipY - 76 };
        pose.bendL = 1;
        pose.fistL = true;
        pose.look = 'down';
        pose.mouth = 'grit';
        pose.brow = 'angry';
        pose.eye = 'squint';
        pose.anger = clamp((t - 12.2) / 0.5, 0, 1);
      }
      return pose;
    }

    if (t < 20) {
      // Shot 4: deep breath, aim, then the slow-motion perfect throw.
      if (t < 14.4) {
        pose.handR = { x: X + 100, y: this.hipY - 160 };
        pose.legs = 'wide';
        pose.brow = 'determined';
        if (t < 13.9) {
          pose.eye = 'shut';
          pose.mouth = 'flat';
          pose.headDrop = clamp((t - 13.2) / 0.7, 0, 1) * 8;
        } else {
          pose.eye = 'squint';
          pose.mouth = 'grit';
          pose.look = 'up';
        }
      } else if (t < 19.5) {
        pose.handR = { x: X + 132, y: this.hipY - 236 };
        pose.lean = 0.07;
        pose.legs = 'wide';
        pose.look = 'up';
        pose.brow = 'raised';
        pose.eye = t < 18 ? 'wide' : 'open';
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
      // Shot 5: disbelief, then the victory dance.
      if (t < 21.4) {
        pose.handR = { x: X + 110, y: this.hipY - 190 };
        pose.handL = { x: X - 100, y: this.hipY - 150 };
        pose.look = 'up';
        pose.mouth = 'o';
        pose.brow = 'raised';
        pose.eye = 'wide';
      } else {
        const dance = Math.sin((t - 21.4) * 7);
        pose.handR = { x: X + 110, y: this.hipY - 320 + dance * 46 };
        pose.handL = { x: X - 110, y: this.hipY - 320 - dance * 46 };
        pose.lean = dance * 0.06;
        pose.look = 'front';
        pose.mouth = 'grin';
        pose.brow = 'raised';
        pose.eye = 'happy';
      }
      return pose;
    }

    // Shot 6: the cup tips, the ball bonks him, the beanie flies.
    if (t < 27.3) {
      const dance = Math.sin((t - 21.4) * 7);
      pose.handR = { x: X + 110, y: this.hipY - 320 + dance * 40 };
      pose.handL = { x: X - 110, y: this.hipY - 320 - dance * 40 };
      if (t < 27.05) {
        pose.mouth = 'grin';
        pose.brow = 'raised';
        pose.eye = 'happy';
      } else {
        pose.headDrop = -5;
        pose.mouth = 'o';
        pose.brow = 'raised';
        pose.eye = 'wide';
      }
      return pose;
    }

    if (t < 28.95) {
      // Watching the beanie fly.
      pose.handR = { x: X + 96, y: this.hipY - 110 };
      pose.handL = { x: X - 96, y: this.hipY - 110 };
      pose.look = 'up';
      pose.headTilt = -0.12;
      pose.headDrop = -4;
      pose.mouth = 'flat';
      pose.brow = 'raised';
      pose.eye = 'open';
      return pose;
    }

    // Furious disbelief, straight down the lens.
    pose.handR = { x: X + 96, y: this.hipY - 76 };
    pose.handL = { x: X - 96, y: this.hipY - 76 };
    pose.bendR = 1;
    pose.bendL = 1;
    pose.fistL = true;
    pose.fistR = true;
    pose.mouth = 'grit';
    pose.brow = 'angry';
    pose.eye = 'squint';
    pose.headTurn = t > 29.5 ? 6 : 0;
    pose.anger = clamp((t - 28.95) / 0.4, 0, 1);
    return pose;
  }

  // ------------------------------------------------------------------
  // Arms
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

      // Prefer the requested bend, but never let an elbow kink through the
      // head and mildly prefer elbows on their own side of the body.
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

    // Cartoon anger flush.
    if (pose.anger > 0.01) {
      ctx.save();
      ctx.globalAlpha = 0.55 * pose.anger;
      ctx.fillStyle = BALL;
      ctx.beginPath();
      ctx.arc(0, 0, r - 3, 0, TAU);
      ctx.fill();
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

  // ------------------------------------------------------------------
  // Hoops
  // ------------------------------------------------------------------

  private drawRings(ctx: CanvasRenderingContext2D, t: number) {
    for (let i = 0; i < RINGS.length; i++) {
      const flash = this.ringFlash(t, i);
      const r = RING_R * (1 + flash * 0.08);
      const cx = RINGS[i].x;
      const cy = RINGS[i].y;

      ctx.save();
      ctx.lineCap = 'round';
      // Heavy black outline, then the colour band.
      ctx.strokeStyle = INK;
      ctx.lineWidth = 28;
      ctx.beginPath();
      ctx.ellipse(cx, cy, r, r * 0.94, 0, 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = RING_COLS[i];
      ctx.lineWidth = 18;
      ctx.beginPath();
      ctx.ellipse(cx, cy, r, r * 0.94, 0, 0, TAU);
      ctx.stroke();

      // Flash as the ball slips through.
      if (flash > 0.01) {
        ctx.globalAlpha = flash;
        ctx.strokeStyle = WHITE;
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.ellipse(cx, cy, r + 10, (r + 10) * 0.94, 0, 0, TAU);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  private ringFlash(t: number, index: number): number {
    let best = 0;
    // Montage: attempt A drops through the first two hoops.
    const early = [8.42, 8.82];
    const times = [early[index] ?? -99, RING_PASS_TIMES[index]].filter((v) => v > -90);
    for (const pass of times) {
      if (t >= pass && t < pass + 0.3) {
        best = Math.max(best, 1 - (t - pass) / 0.3);
      }
    }
    return best;
  }

  // ------------------------------------------------------------------
  // Ball
  // ------------------------------------------------------------------

  private ballAt(t: number, hop: number): { x: number; y: number; rot: number; visible: boolean } {
    const cupY = CUP_REST.y - hop;
    const cupX = CUP_REST.x;

    // Shot 1: held at his chest.
    if (t < 4.4) {
      return { x: 480, y: 1040, rot: 0, visible: true };
    }
    // Wind-up: pulled back with the hand.
    if (t < 4.75) {
      const u = smooth((t - 4.4) / 0.35);
      return { ...lerpPt({ x: 480, y: 1040 }, { x: 448, y: 1136 }, u), rot: 0, visible: true };
    }
    // Attempt #1: flies past hoop 1, into the wall.
    if (t < 5.15) {
      const u = smooth((t - 4.75) / 0.4);
      const p = lerpPt({ x: 448, y: 1136 }, { x: WALL_X - BALL_R, y: 620 }, u);
      return { ...p, rot: 0, visible: true };
    }
    // Ricochet back into his forehead.
    if (t < 5.62) {
      const u = smooth((t - 5.15) / 0.47);
      const p = lerpPt({ x: WALL_X - BALL_R, y: 620 }, { x: 402, y: 862 }, u);
      return { ...p, rot: 0, visible: true };
    }
    // Bounces up and away, then drops to the floor.
    if (t < 6.6) {
      const u = smooth(clamp((t - 5.62) / 0.98, 0, 1));
      const lift = Math.sin(u * Math.PI) * 210;
      const p = lerpPt({ x: 402, y: 862 }, { x: 214, y: 1464 }, u);
      return { x: p.x, y: p.y - lift, rot: 0, visible: true };
    }
    // Rests on the floor through the rage beat.
    if (t < 8.15) {
      return { x: 214, y: 1464, rot: 0, visible: true };
    }
    // Attempt #27A: through hoops 1 and 2, misses the third.
    if (t < 8.22) {
      return { x: 448, y: 1136, rot: 0, visible: true };
    }
    if (t < 9.06) {
      const u = (t - 8.22) / 0.84;
      const pts = [
        { x: 448, y: 1136 },
        { x: RINGS[0].x, y: RINGS[0].y },
        { x: RINGS[1].x, y: RINGS[1].y },
        { x: 1006, y: 690 },
      ];
      const p = this.samplePath(pts, clamp(u, 0, 1));
      return { ...p, rot: 0, visible: true };
    }
    if (t < 9.3) {
      // Drops out of frame behind the wall panel.
      const u = smooth((t - 9.06) / 0.24);
      const p = lerpPt({ x: 1006, y: 690 }, { x: 1050, y: 1180 }, u);
      return { ...p, rot: 0, visible: true };
    }
    // Attempt #27B: clangs off the rim of hoop 1 and knocks him back.
    if (t < 9.55) {
      return { x: 448, y: 1136, rot: 0, visible: true };
    }
    if (t < 9.78) {
      const u = (t - 9.55) / 0.23;
      const p = lerpPt({ x: 448, y: 1136 }, { x: RINGS[0].x - RING_R, y: RINGS[0].y }, u);
      return { ...p, rot: 0, visible: true };
    }
    if (t < 10.24) {
      const u = smooth((t - 9.78) / 0.46);
      const p = lerpPt({ x: RINGS[0].x - RING_R, y: RINGS[0].y }, { x: 404, y: 940 }, u);
      return { ...p, rot: 0, visible: true };
    }
    if (t < 10.75) {
      const u = smooth((t - 10.24) / 0.51);
      const p = lerpPt({ x: 404, y: 940 }, { x: 320, y: 1464 }, u);
      return { ...p, rot: 0, visible: true };
    }
    // Attempt #27C: weak spinning throw that rolls between his feet.
    if (t < 10.95) {
      return { x: 448, y: 1136, rot: 0, visible: true };
    }
    if (t < 11.35) {
      const u = (t - 10.95) / 0.4;
      const lift = Math.sin(u * Math.PI) * 90;
      const p = lerpPt({ x: 448, y: 1136 }, { x: 580, y: 1120 }, u);
      return { x: p.x, y: p.y - lift, rot: 0, visible: true };
    }
    if (t < 11.9) {
      const u = smooth((t - 11.35) / 0.55);
      const p = lerpPt({ x: 580, y: 1120 }, { x: 470, y: 1466 }, u);
      return { ...p, rot: 0, visible: true };
    }
    if (t < 12.5) {
      const u = smooth((t - 11.9) / 0.6);
      return { x: lerp(470, 430, u), y: 1466, rot: 14 + u * 4, visible: true };
    }
    // Shot 4: it pops back up into his hand for one last try.
    if (t < 13.1) {
      const u = smooth((t - 12.5) / 0.6);
      const p = lerpPt({ x: 430, y: 1466 }, { x: 480, y: 1040 }, u);
      return { x: p.x, y: p.y - Math.sin(u * Math.PI) * 70, rot: 18 + u * 5, visible: true };
    }
    if (t < 14.5) {
      return { x: 480, y: 1040, rot: 23, visible: true };
    }
    if (t < THROW_TO) {
      const u = clamp((t - THROW_FROM) / (THROW_TO - THROW_FROM), 0, 1);
      const p = this.samplePath(THROW_PATH, u);
      return { ...p, rot: 0, visible: true };
    }
    // Shot 5: sitting in the cup, riding his hops.
    if (t < 26.6) {
      const jiggle = t < 21.4 ? 0 : Math.sin((t - 21.4) * 7) * 4;
      return { x: cupX, y: cupY + jiggle, rot: 0, visible: true };
    }
    // Shot 6: the cup tips and the ball rolls out onto his forehead.
    if (t < 26.86) {
      const u = smooth(clamp((t - 26.6) / 0.26, 0, 1));
      return { x: lerp(cupX, cupX - 26, u), y: cupY + u * 16, rot: 0, visible: true };
    }
    if (t < 27.06) {
      const u = smooth((t - 26.86) / 0.2);
      return { x: lerp(cupX - 26, cupX - 34, u), y: cupY + 16 + u * 14, rot: 0, visible: true };
    }
    // Bonk on the forehead, then it flies up and away to the right.
    if (t < 27.4) {
      const u = smooth((t - 27.06) / 0.34);
      const p = lerpPt({ x: cupX - 34, y: cupY + 30 }, { x: cupX - 26, y: 872 - hop }, u);
      return { ...p, rot: 0, visible: true };
    }
    if (t < 28.1) {
      const u = (t - 27.4) / 0.7;
      const p = lerpPt({ x: cupX - 26, y: 872 - hop }, { x: 1020, y: 700 }, u);
      return { x: p.x, y: p.y - Math.sin(u * Math.PI) * 120, rot: 0, visible: true };
    }
    // Rolls off behind the wall panel and is gone.
    if (t < 28.8) {
      const u = smooth((t - 28.1) / 0.7);
      const p = lerpPt({ x: 1020, y: 700 }, { x: 1120, y: 1450 }, u);
      return { ...p, rot: 0, visible: true };
    }
    return { x: 1120, y: 1450, rot: 0, visible: false };
  }

  private drawBall(ctx: CanvasRenderingContext2D, t: number, hop: number) {
    const ball = this.ballAt(t, hop);
    if (!ball.visible) return;
    ctx.save();
    ctx.translate(ball.x, ball.y);
    ctx.rotate(ball.rot);
    ctx.fillStyle = BALL;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(0, 0, BALL_R, 0, TAU);
    ctx.fill();
    ctx.stroke();
    // Shading + shine.
    ctx.fillStyle = BALL_DARK;
    ctx.beginPath();
    ctx.arc(0, 0, BALL_R - 5, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.beginPath();
    ctx.arc(-9, -9, 7, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  /** Catmull-Rom through every waypoint, u spanning the whole path. */
  private samplePath(points: Pt[], u: number): Pt {
    const n = points.length - 1;
    const scaled = clamp(u, 0, 1) * n;
    const i = Math.min(Math.floor(scaled), n - 1);
    const f = scaled - i;
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(n, i + 2)];
    const f2 = f * f;
    const f3 = f2 * f;
    return {
      x:
        0.5 *
        (2 * p1.x +
          (-p0.x + p2.x) * f +
          (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * f2 +
          (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * f3),
      y:
        0.5 *
        (2 * p1.y +
          (-p0.y + p2.y) * f +
          (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * f2 +
          (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * f3),
    };
  }

  // ------------------------------------------------------------------
  // Cup + beanie gag
  // ------------------------------------------------------------------

  private drawHeadCup(ctx: CanvasRenderingContext2D, t: number, headX: number, headY: number, pose: Pose) {
    const cx = headX + (CUP_X - CHAR_X);
    const baseY = headY + (CUP_BASE_Y - 952);

    // The cup tips forward at the start of the twist, then springs back.
    let tilt = 0;
    if (t >= 26.45 && t < 27.25) {
      tilt = -0.7 * Math.sin(clamp((t - 26.45) / 0.8, 0, 1) * Math.PI);
    } else if (t >= 27.25 && t < 28.0) {
      const u = clamp((t - 27.25) / 0.75, 0, 1);
      tilt = -0.16 * Math.sin((1 - u) * Math.PI * 2) * (1 - u);
    }
    const wobble = t >= 19.4 && t < 21 ? Math.sin((t - 19.4) * 26) * 0.08 * (1 - (t - 19.4) / 1.6) : 0;

    ctx.save();
    ctx.translate(cx, baseY);
    ctx.rotate(tilt + wobble);
    ctx.fillStyle = CUP;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-22, 0);
    ctx.lineTo(22, 0);
    ctx.lineTo(30, -CUP_H);
    ctx.lineTo(-30, -CUP_H);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Rim.
    ctx.fillStyle = CUP_DARK;
    ctx.beginPath();
    ctx.ellipse(0, -CUP_H, 30, 7, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private drawBeanieFlight(ctx: CanvasRenderingContext2D, t: number, headX: number, headY: number) {
    // Shot 2: pops off at 5.62 and drops back at 6.35.
    // Shot 6: launched by the bonk at 27.35, lands at 29.05.
    const flights = [
      { from: 5.62, to: 6.35, rise: 130 },
      { from: 27.35, to: 29.05, rise: 150 },
    ];
    for (const f of flights) {
      if (t < f.from || t > f.to) continue;
      const u = (t - f.from) / (f.to - f.from);
      const y = headY - 24 - Math.sin(u * Math.PI) * f.rise;
      ctx.save();
      ctx.translate(headX, y);
      ctx.rotate(u * TAU * 1.6);
      ctx.fillStyle = BEANIE;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(0, 0, HEAD_R + 4, Math.PI * 1.02, Math.PI * 1.98);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = BEANIE_DEEP;
      ctx.fillRect(-HEAD_R - 4, -16, (HEAD_R + 4) * 2, 16);
      ctx.strokeRect(-HEAD_R - 4, -16, (HEAD_R + 4) * 2, 16);
      ctx.fillStyle = '#ff6b6b';
      ctx.beginPath();
      ctx.arc(0, -HEAD_R - 4, 16, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  private beanieAirborne(t: number): boolean {
    return (t >= 5.62 && t <= 6.35) || (t >= 27.35 && t <= 29.05);
  }

  // ------------------------------------------------------------------
  // Captions
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
