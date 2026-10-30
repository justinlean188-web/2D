import type { StudioConfig } from '../types';

const TAU = Math.PI * 2;
const WIDTH = 1080;
const HEIGHT = 1920;

// Pure white background per the Modern Pop brief, with the faintest floor
// band so the stickman is still grounded.
const INK = '#141414';
const WHITE = '#ffffff';

const FLOOR = '#f2f2f4';
const FLOOR_LINE = '#d9d9e0';

const BEANIE = '#e63946';
const BEANIE_DEEP = '#b3222e';
const BEANIE_BRIGHT = '#ff6b6b';
const SHIRT = '#ffd166';

// Needle + thread. The thread stays one single deep red for the whole film —
// it must stay visibly the same rope from the first thrust to the beanie gag.
const NEEDLE_COL = '#c9ced8';
const NEEDLE_LIGHT = '#eef1f5';
const NEEDLE_DARK = '#8d94a3';
const THREAD = '#dc2626';
const THREAD_DARK = '#8f1310';

const LENS_GLASS = '#cfe9fb';
const LENS_RIM = '#2b2d34';
const HANDLE = '#f59e0b';
const HANDLE_DARK = '#c2410c';

const BOOK_TEAL = '#2fb3a8';
const BOOK_TEAL_DARK = '#1e7f74';
const BOOK_ORANGE = '#f08a2e';
const BOOK_ORANGE_DARK = '#c96a17';
const PAGES = '#fbfbfb';

const RULER_COL = '#fcd34d';
const RULER_DARK = '#d9a520';
const STAND_COL = '#8d94a3';
const STAND_DARK = '#5c6270';
const KNOB_COL = '#dc2626';

const SWEAT = '#7dd3fc';
const SPARKLE = '#fcd34d';

const FLOOR_Y = 1500;
const HIP_Y = 1200;
const HEAD_R = 70;

// The ridiculous machine (visible 12s - 18s only), built at his right.
const BOOK_B = { x: 690, w: 230, h: 42, top: 1458 };
const BOOK_T = { x: 710, w: 190, h: 38, top: 1420 };
const RULER_T = 1388;
const RULER_H = 32;
const STAND_X = 870;
const NEEDLE_STAND_GRIP = { x: STAND_X, y: 1215 };
const LEVER_PIVOT = { x: 720, y: 1290 };

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
function lerpPt(a: Pt, b: Pt, u: number): Pt {
  return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u) };
}

type MouthShape = 'flat' | 'smile' | 'grin' | 'o' | 'frown' | 'grit' | 'smirk';
type BrowShape = 'normal' | 'angry' | 'raised' | 'sad' | 'cocky' | 'determined';
type EyeShape = 'open' | 'wide' | 'squint' | 'shut' | 'sly' | 'happy' | 'peek';
type LookDir = 'front' | 'down' | 'up';
type NeedleMode = 'handR' | 'bite' | 'stand';

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

interface CharState {
  x: number;
  hipY: number;
  pose: Pose;
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

interface NeedleState {
  mode: NeedleMode;
  grip: Pt;
  u: Pt; // unit vector from grip toward the eye end
  eye: Pt;
  tip: Pt;
  visible: boolean;
}

interface Arm {
  sx: number;
  sy: number;
  ex: number;
  ey: number;
  hx: number;
  hy: number;
}

interface MagState {
  present: boolean;
  center: Pt;
  r: number;
  grip: Pt;
  rise: number;
}

const CAPTIONS: CaptionLine[] = [
  { text: 'CAN HE THREAD IT?!', from: 0.15, to: 2.93 },
  { text: 'TOO SMALL!', from: 3.14, to: 6.94 },
  { text: 'MAKE IT EASIER.', from: 7.16, to: 11.94 },
  { text: 'PLAN B.', from: 12.16, to: 17.94 },
  { text: 'ONE LAST TRY…', from: 18.16, to: 23.92 },
  { text: 'WAIT… 💀', from: 24.16, to: 29.65 },
];

const CAMERA_KEYS: CameraKey[] = [
  // Shot 1 — hook (0-3)
  { t: 0.0, x: 548, y: 940, zoom: 2.42 },
  { t: 0.55, x: 552, y: 950, zoom: 1.55 },
  { t: 1.4, x: 560, y: 965, zoom: 1.18 },
  { t: 2.35, x: 560, y: 950, zoom: 1.55 },
  { t: 2.99, x: 560, y: 950, zoom: 1.6 },

  // Shot 2 — first failures (3-7)
  { t: 3.0, x: 560, y: 985, zoom: 1.06 },
  { t: 3.9, x: 580, y: 960, zoom: 1.35 },
  { t: 5.0, x: 590, y: 950, zoom: 1.6 },
  { t: 5.95, x: 570, y: 950, zoom: 1.3 },
  { t: 6.5, x: 560, y: 940, zoom: 1.25 },
  { t: 6.99, x: 560, y: 940, zoom: 1.28 },

  // Shot 3 — magnifying glass (7-12)
  { t: 7.0, x: 540, y: 955, zoom: 1.05 },
  { t: 7.4, x: 540, y: 940, zoom: 1.15 },
  { t: 8.35, x: 585, y: 920, zoom: 1.45 },
  { t: 9.4, x: 590, y: 970, zoom: 1.95 },
  { t: 10.2, x: 600, y: 950, zoom: 1.6 },
  { t: 11.0, x: 600, y: 945, zoom: 1.55 },
  { t: 11.3, x: 540, y: 950, zoom: 1.3 },
  { t: 11.99, x: 540, y: 950, zoom: 1.35 },

  // Shot 4 — the machine (12-18)
  { t: 12.0, x: 540, y: 1010, zoom: 0.94 },
  { t: 13.3, x: 700, y: 1180, zoom: 1.2 },
  { t: 14.4, x: 690, y: 1030, zoom: 1.0 },
  { t: 15.6, x: 830, y: 1180, zoom: 1.42 },
  { t: 16.35, x: 800, y: 1150, zoom: 1.28 },
  { t: 17.05, x: 480, y: 930, zoom: 1.42 },
  { t: 17.99, x: 470, y: 930, zoom: 1.48 },

  // Shot 5 — one last try (18-24)
  { t: 18.0, x: 540, y: 985, zoom: 0.98 },
  { t: 18.8, x: 545, y: 960, zoom: 1.15 },
  { t: 19.7, x: 552, y: 960, zoom: 1.75 },
  { t: 21.0, x: 560, y: 968, zoom: 2.3 },
  { t: 22.3, x: 565, y: 972, zoom: 2.5 },
  { t: 22.6, x: 572, y: 975, zoom: 2.55 },
  { t: 23.3, x: 565, y: 975, zoom: 2.2 },
  { t: 23.6, x: 540, y: 950, zoom: 1.15 },
  { t: 23.99, x: 540, y: 950, zoom: 1.18 },

  // Shot 6 — the final twist (24-30)
  { t: 25.2, x: 540, y: 940, zoom: 1.35 },
  { t: 26.4, x: 540, y: 900, zoom: 1.62 },
  { t: 27.3, x: 540, y: 920, zoom: 1.52 },
  { t: 27.9, x: 540, y: 928, zoom: 1.58 },
  { t: 28.85, x: 540, y: 918, zoom: 2.2 },
  { t: 29.6, x: 540, y: 915, zoom: 2.42 },
  { t: 30.0, x: 542, y: 912, zoom: 2.5 },
];

export class NeedleThreadRenderer {
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

    // Floor contact shadows (minimal, per the white-background brief).
    this.renderShadows(ctx, t, x);

    // The machine is behind him (he builds together with it from the left).
    if (t >= 12 && t < 18) this.drawMachine(ctx, t);

    this.drawStickman(ctx, x, this.hipY, pose, arms, t, false);

    const needle = this.needleAt(t, arms, pose, x);
    const mag = this.magAt(t, arms, needle);
    if (needle.visible) this.drawNeedle(ctx, needle);

    if (mag.present) {
      this.drawMagnifier(ctx, mag, needle);
      // The guided rope passes in front of the glass so it stays visible.
      this.drawThread(ctx, t, arms, pose, x, needle);
      // The real needle passes in front of the glass; redraw it so the
      // bite needle is never swallowed by the lens.
      if (needle.visible) this.drawNeedle(ctx, needle);
    } else {
      this.drawThread(ctx, t, arms, pose, x, needle);
    }

    this.drawStickman(ctx, x, this.hipY, pose, arms, t, true);

    this.drawBeanieProp(ctx, t, pose, x, needle);

    this.renderEffects(ctx, t, x, pose, arms, needle);

    ctx.restore();

    if (config.showCaptions) this.renderCaption(ctx, t);
    if (config.showSafeZones) this.renderSafeZones(ctx);
  }

  // ------------------------------------------------------------------
  // Camera
  // ------------------------------------------------------------------

  private cameraAt(t: number): CameraKey {
    const keys = CAMERA_KEYS;
    if (t <= keys[0].t) return keys[0];
    for (let i = 0; i < keys.length - 1; i++) {
      const a = keys[i];
      const b = keys[i + 1];
      if (t >= a.t && t <= b.t) {
        const span = b.t - a.t;
        const u = span <= 0.001 ? 1 : smooth((t - a.t) / span);
        return {
          t,
          x: lerp(a.x, b.x, u),
          y: lerp(a.y, b.y, u),
          zoom: lerp(a.zoom, b.zoom, u),
        };
      }
    }
    return keys[keys.length - 1];
  }

  private shakeAt(t: number): Pt {
    let x = 0;
    let y = 0;
    const punch = (from: number, len: number, amp: number) => {
      if (t < from || t >= from + len) return;
      const u = (t - from) / len;
      const k = (1 - u) * amp;
      x += Math.sin(t * 140) * k;
      y += Math.cos(t * 118) * k * 0.6;
    };
    punch(1.72, 0.24, 6);
    punch(2.4, 0.2, 5);
    punch(3.95, 0.2, 4);
    punch(5.75, 0.2, 5);
    punch(7.35, 0.2, 5);
    punch(9.7, 0.2, 5);
    punch(10.95, 0.2, 5);
    punch(13.35, 0.22, 6);
    punch(15.95, 0.22, 6);
    punch(16.6, 0.22, 6);
    punch(17.05, 0.24, 7);
    punch(22.58, 0.24, 7);
    punch(25.2, 0.2, 5);
    punch(27.25, 0.22, 6);
    punch(28.8, 0.36, 8);
    return { x, y };
  }

  private applyCamera(ctx: CanvasRenderingContext2D, t: number) {
    const cam = this.cameraAt(t);
    const shake = this.shakeAt(t);
    ctx.translate(this.width / 2 + shake.x, this.height / 2 + shake.y);
    ctx.scale(cam.zoom, cam.zoom);
    ctx.translate(-cam.x, -cam.y);
  }

  // ------------------------------------------------------------------
  // Stage: a pure white void with the faintest floor line
  // ------------------------------------------------------------------

  private renderStage(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = WHITE;
    ctx.fillRect(-1400, -1000, WIDTH + 2800, this.floorY + 1000);
    ctx.fillStyle = FLOOR;
    ctx.fillRect(-1400, this.floorY, WIDTH + 2800, 900);
    ctx.strokeStyle = FLOOR_LINE;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-1400, this.floorY);
    ctx.lineTo(WIDTH + 1400, this.floorY);
    ctx.stroke();
  }

  private renderShadows(ctx: CanvasRenderingContext2D, t: number, x: number) {
    ctx.save();
    ctx.fillStyle = 'rgba(20, 20, 20, 0.08)';
    if (t >= 12 && t < 18) {
      ctx.beginPath();
      ctx.ellipse(820, this.floorY + 14, 190, 15, 0, 0, TAU);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.ellipse(x, this.floorY + 14, 118, 13, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  private readonly charXKeys: Array<[number, number]> = [
    [0, 540],
    [2.99, 540],
    [3, 560],
    [6.99, 560],
    [7, 540],
    [11.99, 540],
    [12, 460],
    [15.4, 460],
    [16.0, 620],
    [17.99, 620],
    [18, 540],
    [30, 540],
  ];

  private charX(t: number): number {
    return keyAt(this.charXKeys, t);
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
      eye: 'open',
      legs: 'stand',
      walkPhase: 0,
      handL: { x: 455, y: 1015 },
      handR: { x: 640, y: 990 },
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
    const h = (dx: number, dy: number): Pt => ({ x: X + dx, y: this.hipY + dy });
    pose.handR = h(100, -210); // needle hand for shots 1, 2, 5, 6
    pose.handL = h(-85, -185); // thread hand for shots 1, 2, 5

    if (t < 3) {
      // Shot 1 — the hook. Needle up right of the face, thread coiled left.
      pose.brow = 'angry';
      pose.mouth = 'grit';
      pose.headTurn = 2;
      if (t >= 1.52 && t < 1.78) {
        // The confident thrust toward the eye.
        const u = smooth((t - 1.52) / 0.26);
        pose.handL = { x: lerp(455, 505, u), y: lerp(1015, 1078, u) };
        pose.bendL = 1;
        pose.brow = 'determined';
      } else if (t >= 1.78 && t < 2.3) {
        // It bends away. The hand retreats with the coil.
        const u = smooth((t - 1.78) / 0.52);
        pose.handL = { x: lerp(505, 470, u), y: lerp(1078, 1060, u) };
        pose.bendL = 1;
        pose.brow = 'angry';
      } else if (t >= 2.3) {
        // Slow disbelief squint at the needle, then the fist clench.
        pose.handR = h(68, -232);
        pose.headTilt = 0.06;
        pose.eye = 'squint';
        if (t >= 2.72) {
          pose.fistL = true;
          pose.handL = { x: X - 75, y: this.hipY - 145 };
          pose.mouth = 'frown';
        }
      }
      return pose;
    }

    if (t < 7) {
      // Shot 2 — two distinct failures, then the angry point.
      const rel = t - 3;
      pose.handR = h(88, -215);
      if (rel < 0.95) {
        // The careful lined-up attempt.
        pose.handL = { x: X + 18 + rel * 4, y: this.hipY - 118 + rel * 8 };
        pose.bendL = 1;
        pose.brow = 'determined';
        pose.mouth = 'flat';
        pose.eye = 'squint';
      } else if (rel < 1.5) {
        // It bends away at the last moment.
        const u = smooth((rel - 0.95) / 0.55);
        pose.handL = { x: lerp(562, 478, u), y: lerp(1090, 1082, u) };
        pose.bendL = 1;
        pose.brow = 'angry';
      } else if (rel < 2.0) {
        pose.handL = { x: X - 80, y: this.hipY - 140 };
        pose.headTurn = -3;
      } else if (rel < 2.95) {
        // The fast attempt with the loop.
        const u = smooth((rel - 2.0) / 0.95);
        pose.lean = 0.08 * u;
        pose.handL = {
          x: lerp(486, 560, u) + Math.sin(t * 30) * 7 * u,
          y: lerp(1078, 1046, u),
        };
        pose.bendL = 1;
        pose.brow = 'angry';
        pose.mouth = 'grit';
      } else if (rel < 3.5) {
        // A frozen stare at the looped thread.
        pose.handL = { x: X + 15, y: this.hipY - 170 };
        pose.bendL = 1;
        pose.lean = -0.05;
        pose.brow = 'raised';
        pose.eye = 'wide';
        pose.mouth = 'o';
      } else {
        // The furious point at the tiny needle.
        pose.pointL = true;
        pose.fistL = false;
        pose.handL = { x: X - 45, y: this.hipY - 160 };
        pose.lean = 0.02 * Math.sin(t * 40);
        pose.brow = 'angry';
        pose.mouth = 'grit';
      }
      return pose;
    }

    if (t < 12) {
      // Shot 3 — the magnifying glass. Needle held in his teeth, thread
      // guided by the right hand, glass carried by the left.
      const rel = t - 7;
      pose.bendL = 1;
      pose.handL = h(-15, -110); // magnifier grip
      pose.handR = h(80, -136);
      if (rel < 0.35) {
        pose.brow = 'normal';
        pose.mouth = 'flat';
      } else if (rel < 0.75) {
        // The lightbulb pops on.
        pose.brow = 'raised';
        pose.eye = 'wide';
        pose.mouth = 'o';
      } else if (rel < 1.35) {
        pose.brow = 'cocky';
        pose.mouth = 'grin';
      } else if (rel < 2.5) {
        // The confident guided attempt through the lens.
        const u = smooth((rel - 1.35) / 1.0);
        pose.handR = { x: X + 80 + u * 30, y: this.hipY - 136 + u * 22 };
        pose.brow = 'cocky';
        pose.mouth = 'grin';
        pose.eye = 'squint';
      } else if (rel < 2.9) {
        // The thread catches on the outside of the needle.
        pose.handR = { x: X + 88, y: this.hipY - 140 };
        pose.mouth = 'frown';
        pose.brow = 'angry';
      } else if (rel < 3.2) {
        pose.handR = { x: X + 76, y: this.hipY - 156 };
        pose.brow = 'angry';
      } else if (rel < 4.05) {
        // One last guided try.
        const u = smooth((rel - 3.2) / 0.85);
        pose.handR = { x: X + 78 + u * 38, y: this.hipY - 140 };
        pose.eye = 'squint';
        pose.mouth = 'grit';
      } else if (rel < 4.4) {
        // It bends away again.
        pose.handR = { x: X + 74, y: this.hipY - 136 };
        pose.brow = 'angry';
      } else {
        // Glass lowered, slow furious side-eye at the camera.
        pose.handL = { x: X - 25, y: this.hipY - 50 };
        pose.handR = { x: X + 64, y: this.hipY - 175 };
        pose.headTurn = 8;
        pose.headTilt = 0.05;
        pose.brow = 'angry';
        pose.eye = 'sly';
        pose.mouth = 'flat';
      }
      return pose;
    }

    if (t < 18) {
      // Shot 4 — the ridiculous machine.
      const rel = t - 12;
      if (rel < 1.99) {
        // The assembly blur: both hands pump as parts snap into place.
        const pump = Math.sin(t * 17);
        pose.handR = { x: X + 120, y: this.hipY - 60 + pump * 26 };
        pose.handL = { x: X - 40, y: this.hipY + 30 - pump * 26 };
        pose.bendL = 1;
        pose.bendR = 1;
        pose.brow = 'determined';
        pose.mouth = 'grit';
        pose.eye = 'squint';
      } else if (rel < 2.4) {
        // The needle clamps into the stand — a proud flourish.
        pose.handR = { x: X + 150, y: this.hipY - 150 };
        pose.handL = { x: X - 50, y: this.hipY - 100 };
        pose.brow = 'raised';
        pose.mouth = 'grin';
      } else if (rel < 3.4) {
        // Hands on hips, maximum smug.
        pose.handL = { x: X - 52, y: this.hipY - 55 };
        pose.handR = { x: X + 58, y: this.hipY - 55 };
        pose.bendL = 1;
        pose.bendR = 1;
        pose.brow = 'cocky';
        pose.mouth = 'grin';
        pose.headDrop = -6;
        pose.lean = -0.03;
      } else if (rel < 4.05) {
        // Walk to the lever and grab its knob.
        pose.legs = 'walk';
        pose.walkPhase = (t - 15.4) * 14;
        pose.bendL = 1;
        const u = smooth((rel - 3.4) / 0.55);
        pose.handR = { x: lerp(X + 58, 720, u), y: lerp(this.hipY - 55, 1200, u) };
        pose.handL = { x: X - 52, y: this.hipY - 55 };
        pose.brow = 'cocky';
        pose.mouth = 'grin';
      } else if (rel < 4.45) {
        // The dramatic yank, timed with the lever rotation and the launch.
        const u = smooth((rel - 4.05) / 0.35);
        pose.bendL = 1;
        pose.handR = { x: lerp(720, 742, u), y: lerp(1200, 1226, u) };
        pose.lean = -0.1 * u;
        pose.eye = 'wide';
        pose.mouth = 'grit';
        pose.brow = 'cocky';
      } else if (rel < 5.05) {
        // Recoil as the thread launches.
        pose.handR = { x: X + 20, y: this.hipY - 180 };
        pose.lean = 0.08;
        pose.headTurn = 6;
        pose.eye = 'wide';
        pose.mouth = 'grin';
      } else if (rel < 5.25) {
        pose.headTurn = 6;
        pose.eye = 'wide';
        pose.mouth = 'grin';
      } else {
        // The smile dies; his eyes drift up to the tangled beanie.
        pose.headTurn = 0;
        pose.look = 'up';
        pose.headTilt = -0.12;
        pose.eye = 'wide';
        if (rel < 5.75) {
          pose.mouth = 'flat';
        } else {
          pose.brow = 'angry';
          pose.mouth = 'frown';
        }
      }
      return pose;
    }

    if (t < 24) {
      // Shot 5 — one last try.
      const rel = t - 18;
      if (rel < 0.45) {
        // Untangle: peel the thread off the beanie.
        pose.handR = { x: X + 80, y: this.hipY - 240 };
        pose.handL = { x: X - 96, y: this.hipY - 130 };
        pose.brow = 'angry';
        pose.mouth = 'grit';
        pose.eye = 'squint';
      } else if (rel < 1.3) {
        // The deep, dramatic breath.
        pose.handL = { x: X - 150, y: this.hipY - 155 };
        pose.handR = { x: X + 95, y: this.hipY - 170 };
        if (rel < 0.85) {
          pose.eye = 'shut';
          pose.mouth = 'o';
        } else {
          pose.eye = 'open';
          pose.mouth = 'flat';
        }
        pose.headDrop = rel < 0.85 ? -6 : 2;
      } else if (rel < 2.4) {
        // Total concentration; the needle up in front of his face.
        pose.handR = { x: X + 86, y: this.hipY - 198 };
        pose.handL = { x: X - 80, y: this.hipY - 135 };
        pose.headTurn = 2;
        pose.brow = 'determined';
        pose.eye = 'squint';
        pose.mouth = 'flat';
      } else if (rel < 3.2) {
        // Slow approach, part one.
        pose.handR = { x: X + 86, y: this.hipY - 198 };
        pose.handL = { x: X - 118, y: this.hipY - 150 };
        pose.headTurn = 2;
        pose.brow = 'determined';
        pose.eye = 'squint';
      } else if (rel < 3.9) {
        // Slow approach, part two.
        pose.handR = { x: X + 86, y: this.hipY - 198 };
        pose.handL = { x: X - 112, y: this.hipY - 142 };
        pose.headTurn = -2;
        pose.brow = 'determined';
        pose.eye = 'squint';
      } else if (rel < 4.15) {
        // The fake-out bend.
        pose.handR = { x: X + 86, y: this.hipY - 198 };
        pose.handL = { x: X - 108, y: this.hipY - 136 };
        pose.brow = 'angry';
        pose.mouth = 'grit';
      } else if (rel < 4.58) {
        // Realign and strike.
        pose.handR = { x: X + 86, y: this.hipY - 198 };
        pose.handL = { x: X - 4, y: this.hipY - 160 };
        pose.brow = 'determined';
        pose.headDrop = -4;
      } else if (rel < 5.05) {
        // THROUGH. The eye widens.
        pose.handR = { x: X + 86, y: this.hipY - 198 };
        pose.handL = { x: X + 20, y: this.hipY - 166 };
        pose.eye = 'wide';
        pose.brow = 'raised';
        pose.mouth = 'o';
        if (rel > 4.7) pose.mouth = 'flat';
      } else if (rel < 5.4) {
        // Pull the visible length through.
        pose.handR = { x: X + 86, y: this.hipY - 198 };
        pose.handL = { x: X + 28, y: this.hipY - 128 };
        pose.eye = 'wide';
        pose.brow = 'raised';
        pose.mouth = rel > 5.25 ? 'grin' : 'flat';
      } else {
        // Both arms up, threaded needle held overhead.
        pose.handR = { x: X + 142, y: this.hipY - 362 };
        pose.handL = { x: X - 142, y: this.hipY - 388 };
        pose.bendL = 1;
        pose.bendR = 1;
        pose.fistL = true;
        pose.fistR = true;
        pose.brow = 'cocky';
        pose.mouth = 'grin';
        pose.headDrop = -8;
      }
      return pose;
    }

    // Shot 6 — the final twist.
    const rel = t - 24;
    // From the lift on he is bare-headed; the beanie becomes the prop.
    if (t >= 26.45) pose.beanieOn = false;
    if (rel < 1.0) {
      // Victory hold with a small proud bounce.
      pose.handR = { x: X + 142, y: this.hipY - 362 + Math.sin(t * 9) * 4 };
      pose.handL = { x: X - 142, y: this.hipY - 388 - Math.sin(t * 9) * 4 };
      pose.bendL = 1;
      pose.bendR = 1;
      pose.fistL = true;
      pose.fistR = true;
      pose.brow = 'cocky';
      pose.mouth = 'grin';
      pose.headDrop = -8;
    } else if (rel < 1.6) {
      // The tug on the beanie; he lifts the needle.
      pose.handR = { x: X + 120, y: this.hipY - 190 };
      pose.handL = { x: X - 130, y: this.hipY - 300 };
      pose.headDrop = 4;
      pose.brow = 'raised';
      pose.eye = 'wide';
      pose.mouth = 'flat';
      pose.fistL = true;
      pose.fistR = true;
    } else if (rel < 2.45) {
      // Looking up; pulling harder.
      pose.handR = { x: X + 120, y: this.hipY - 190 };
      pose.handL = { x: X - 110, y: this.hipY - 250 };
      pose.look = 'up';
      pose.headTilt = -0.1;
      pose.brow = 'raised';
      pose.eye = 'wide';
      pose.fistL = true;
      pose.fistR = true;
    } else if (rel < 3.28) {
      // The beanie lifts off. Everything holds...
      pose.handR = { x: X + 126, y: this.hipY - 196 };
      pose.handL = { x: X - 110, y: this.hipY - 250 };
      pose.look = 'up';
      pose.headTilt = -0.1;
      pose.brow = 'raised';
      pose.eye = 'wide';
      pose.fistL = true;
      pose.fistR = true;
    } else if (rel < 3.9) {
      // Blank stare under a bare head.
      pose.handR = { x: X + 115, y: this.hipY - 275 };
      pose.handL = { x: X - 88, y: this.hipY - 198 };
      pose.brow = 'normal';
      pose.eye = 'open';
      pose.mouth = 'flat';
      pose.headDrop = -2;
      pose.fistL = true;
      pose.fistR = true;
    } else if (rel < 4.75) {
      // Needle… beanie… camera.
      pose.handR = { x: X + 115, y: this.hipY - 275 };
      pose.handL = { x: X - 88, y: this.hipY - 198 };
      pose.fistL = true;
      pose.fistR = true;
      if (rel < 4.15) {
        pose.headTurn = 8;
        pose.look = 'down';
      } else if (rel < 4.45) {
        pose.headTurn = -8;
        pose.look = 'down';
      } else {
        pose.headTurn = 0;
        pose.look = 'front';
        if (rel > 4.5) {
          pose.brow = 'angry';
          pose.eye = 'wide';
          pose.mouth = 'grit';
        }
      }
    } else if (rel < 5.6) {
      // Full-body cartoon rage.
      const j = Math.sin(t * 46);
      pose.handR = { x: X + 115 - j * 5, y: this.hipY - 275 };
      pose.handL = { x: X - 88 + j * 5, y: this.hipY - 198 };
      pose.lean = j * 0.035;
      pose.headTilt = Math.sin(t * 52) * 0.03;
      pose.brow = 'angry';
      pose.eye = 'wide';
      pose.mouth = 'grit';
      pose.fistL = true;
      pose.fistR = true;
    } else {
      // The final furious hold, shaking out.
      const fade = clamp((30 - t) / 0.4, 0.15, 1);
      const j = Math.sin(t * 46) * 3 * fade;
      pose.handR = { x: X + 115 - j, y: this.hipY - 275 };
      pose.handL = { x: X - 88 + j, y: this.hipY - 198 };
      pose.lean = Math.sin(t * 46) * 0.02 * fade;
      pose.headTilt = Math.sin(t * 52) * 0.02 * fade;
      pose.brow = 'angry';
      pose.eye = 'open';
      pose.mouth = 'grit';
      pose.fistL = true;
      pose.fistR = true;
    }
    return pose;
  }

  private computeArms(pose: Pose, hipX: number, hipY: number) {
    const shoulderY = hipY - 170;
    const bodyTopX = hipX + Math.sin(pose.lean) * 170;
    const upper = 112;
    const fore = 106;

    const solve = (side: -1 | 1, target: Pt, bend: number) => {
      const sx = bodyTopX + side * 34;
      const sy = shoulderY + 12;
      const ux = (target.x - sx) * side;
      const uy = target.y - sy;
      const raw = Math.hypot(ux, uy);
      const d = clamp(raw, 10, upper + fore - 4);
      const base = Math.atan2(ux, uy);
      const cosA = clamp((upper * upper + d * d - fore * fore) / (2 * upper * d), -1, 1);
      const alpha = Math.acos(cosA);
      const a1 = base + bend * alpha;
      const ex = sx + Math.sin(a1) * side * upper;
      const ey = sy + Math.cos(a1) * upper;
      const hx = sx + Math.sin(base) * side * d;
      const hy = sy + Math.cos(base) * d;
      return { sx, sy, ex, ey, hx, hy };
    };

    return {
      l: solve(-1, pose.handL, pose.bendL),
      r: solve(1, pose.handR, pose.bendR),
    };
  }

  private drawStickman(
    ctx: CanvasRenderingContext2D,
    hipX: number,
    hipY: number,
    pose: Pose,
    arms: { l: Arm; r: Arm },
    t: number,
    armsOnly: boolean
  ) {
    const lean = pose.lean;
    const shoulderY = hipY - 170;
    const bodyTopX = hipX + Math.sin(lean) * 170;

    ctx.save();
    ctx.lineCap = 'round';

    if (!armsOnly) {
      // Legs
      ctx.strokeStyle = INK;
      ctx.lineWidth = 16;
      ctx.beginPath();
      if (pose.legs === 'walk') {
        const stride = Math.sin(pose.walkPhase) * 48;
        const liftL = Math.max(0, Math.sin(pose.walkPhase)) * 22;
        const liftR = Math.max(0, -Math.sin(pose.walkPhase)) * 22;
        ctx.moveTo(hipX, hipY);
        ctx.lineTo(hipX - 36 + stride, this.floorY - liftL);
        ctx.moveTo(hipX, hipY);
        ctx.lineTo(hipX + 36 - stride, this.floorY - liftR);
      } else {
        ctx.moveTo(hipX, hipY);
        ctx.lineTo(hipX - 44, this.floorY);
        ctx.moveTo(hipX, hipY);
        ctx.lineTo(hipX + 44, this.floorY);
      }
      ctx.stroke();

      // Body: yellow shirt
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
    }

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

    const drawHand = (
      a: Arm,
      fist: boolean,
      fingers: number,
      point: boolean,
      pdx: number,
      pdy: number
    ) => {
      ctx.fillStyle = WHITE;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(a.hx, a.hy, point ? 16 : fist ? 15 : 12, 0, TAU);
      ctx.fill();
      ctx.stroke();
      if (point) {
        ctx.strokeStyle = INK;
        ctx.lineWidth = 15;
        ctx.beginPath();
        ctx.moveTo(a.hx, a.hy);
        ctx.lineTo(a.hx + pdx, a.hy + pdy);
        ctx.stroke();
        ctx.strokeStyle = WHITE;
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(a.hx, a.hy);
        ctx.lineTo(a.hx + pdx, a.hy + pdy);
        ctx.stroke();
      }
      if (fingers > 0) {
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(a.hx - 12, a.hy + 10);
        ctx.lineTo(a.hx - 14, a.hy + 30);
        ctx.moveTo(a.hx + 12, a.hy + 10);
        ctx.lineTo(a.hx + 14, a.hy + 30);
        ctx.stroke();
      }
    };
    drawHand(arms.l, pose.fistL, 0, pose.pointL, 24, -38);
    drawHand(arms.r, pose.fistR, pose.fingersR, pose.pointR, -24, 38);

    if (!armsOnly) {
      const headX = bodyTopX + Math.sin(pose.headTilt) * 10;
      const headY = shoulderY - 78 + pose.headDrop;
      this.drawHead(ctx, headX, headY, pose, t);
    }

    ctx.restore();
  }

  private drawHead(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    pose: Pose,
    t: number
  ) {
    const r = this.headR;
    const turn = pose.headTurn;

    // Neck
    ctx.strokeStyle = INK;
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(cx, cy + r);
    ctx.lineTo(cx, cy + r + 26);
    ctx.stroke();

    // Face
    ctx.fillStyle = WHITE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Red beanie (removed for the final gag)
    if (pose.beanieOn) {
      ctx.fillStyle = BEANIE;
      ctx.beginPath();
      ctx.arc(cx, cy - 24, r + 4, Math.PI * 1.02, Math.PI * 1.98);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = BEANIE_DEEP;
      ctx.fillRect(cx - r - 4, cy - 40, (r + 4) * 2, 16);
      ctx.strokeRect(cx - r - 4, cy - 40, (r + 4) * 2, 16);
      ctx.fillStyle = BEANIE_BRIGHT;
      ctx.beginPath();
      ctx.arc(cx, cy - r - 32, 16, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }

    // Eyes
    const eyeShift = pose.look === 'down' ? 7 : pose.look === 'up' ? -6 : 0;
    const eyeY = cy + 8 + eyeShift;
    const eyeDX = 26;
    const fx = cx + turn;

    ctx.strokeStyle = INK;
    ctx.fillStyle = INK;

    if (pose.eye === 'shut') {
      ctx.lineWidth = 7;
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(fx + side * eyeDX, eyeY + 8, 14, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();
      }
    } else if (pose.eye === 'sly') {
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(fx + side * eyeDX, eyeY, 12, 8, 0, 0, TAU);
        ctx.fill();
      }
      ctx.lineWidth = 7;
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(fx + side * (eyeDX - 12), eyeY - 12);
        ctx.lineTo(fx + side * (eyeDX + 12), eyeY - 12);
        ctx.stroke();
      }
    } else {
      const eyeH = pose.eye === 'wide' ? 30 : pose.eye === 'squint' ? 8 : 20;
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(fx + side * eyeDX, eyeY, 11, eyeH / 2, 0, 0, TAU);
        ctx.fill();
      }
    }

    // Eyebrows
    ctx.strokeStyle = INK;
    ctx.lineWidth = 9;
    const browY = cy - 12;
    const twitch = t < 2.0 ? Math.sin(t * 31) * 2 : 0;
    ctx.beginPath();
    if (pose.brow === 'angry' || pose.brow === 'determined') {
      ctx.moveTo(fx - 42, browY - 8);
      ctx.lineTo(fx - 12, browY + 8 + twitch);
      ctx.moveTo(fx + 42, browY - 8);
      ctx.lineTo(fx + 12, browY + 8 - twitch);
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

    // Mouth
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    const my = cy + 40;
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
  }

  // ------------------------------------------------------------------
  // Needle
  // ------------------------------------------------------------------

  private needleAt(t: number, arms: { l: Arm; r: Arm }, pose: Pose, _x: number): NeedleState {
    let mode: NeedleMode = 'handR';
    let grip: Pt = { x: arms.r.hx, y: arms.r.hy };
    let u: Pt = { x: 0, y: -1 };

    if (t < 3) {
      u = t >= 2.3 ? { x: 0.02, y: -1 } : { x: 0.14, y: -0.99 };
    } else if (t < 7) {
      u = { x: 0, y: -1 };
    } else if (t < 12) {
      // Held in his teeth for the magnifier scene.
      mode = 'bite';
      const shoulderY = this.hipY - 170;
      const bodyTopX = _x + Math.sin(pose.lean) * 170;
      const headX = bodyTopX + Math.sin(pose.headTilt) * 10;
      const headY = shoulderY - 78 + pose.headDrop;
      grip = { x: headX + 12, y: headY + 46 };
      u = { x: 0.45, y: -0.89 };
    } else if (t >= 13.55 && t < 18) {
      // Clamped upright in the machine's stand; it glides in as the clamp
      // part pops (13.35) and locks at 14.0.
      mode = 'stand';
      const lock = smooth(clamp((t - 13.55) / 0.45, 0, 1));
      grip = {
        x: lerp(arms.r.hx, NEEDLE_STAND_GRIP.x, lock),
        y: lerp(arms.r.hy, NEEDLE_STAND_GRIP.y, lock),
      };
      u = { x: 0, y: -1 };
    } else if (t < 23.48) {
      u = { x: 0, y: -1 };
    } else {
      // Raised overhead for the victory: the eye now points down so the
      // thread can dangle through it.
      u = { x: 0, y: 1 };
    }

    const eye = { x: grip.x + u.x * 26, y: grip.y + u.y * 26 };
    const tip = { x: grip.x - u.x * 58, y: grip.y - u.y * 58 };
    return { mode, grip, u, eye, tip, visible: true };
  }

  private drawNeedle(ctx: CanvasRenderingContext2D, n: NeedleState) {
    ctx.save();
    ctx.translate(n.grip.x, n.grip.y);
    ctx.rotate(Math.atan2(n.u.y, n.u.x));

    // Eye end + shaft + taper point (local +x = toward the eye end).
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3.5;
    ctx.fillStyle = NEEDLE_COL;
    ctx.beginPath();
    ctx.arc(24, 0, 5, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(-54, 5);
    ctx.arc(-54, 0, 5, Math.PI / 2, Math.PI * 1.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = NEEDLE_DARK;
    ctx.beginPath();
    ctx.moveTo(-52, -4.6);
    ctx.lineTo(-70, 0);
    ctx.lineTo(-52, 4.6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Highlight
    ctx.strokeStyle = NEEDLE_LIGHT;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-48, -2);
    ctx.lineTo(16, -2);
    ctx.stroke();

    // The eye: a small but clearly visible silver ring with a white hole
    ctx.fillStyle = NEEDLE_COL;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(26, 0, 9, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = NEEDLE_DARK;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(26, 0, 6.4, 0, TAU);
    ctx.stroke();
    ctx.fillStyle = WHITE;
    ctx.strokeStyle = NEEDLE_DARK;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(26, 0, 4.5, 0, TAU);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  // ------------------------------------------------------------------
  // Thread
  // ------------------------------------------------------------------

  private strokeRope(ctx: CanvasRenderingContext2D, pts: Pt[], main = 10, under = 15) {
    if (pts.length < 2) return;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const walk = (w: number, color: string) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = w;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length - 1; i++) {
        const mx = (pts[i].x + pts[i + 1].x) / 2;
        const my = (pts[i].y + pts[i + 1].y) / 2;
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
      }
      const last = pts[pts.length - 1];
      ctx.lineTo(last.x, last.y);
      ctx.stroke();
    };
    walk(under, THREAD_DARK);
    walk(main, THREAD);
  }

  /** The tangled coil that hangs from the hand holding the rope. */
  private coilAt(grip: Pt, t: number): Pt[] {
    const sw = Math.sin(t * 7) * 5;
    return [
      { x: grip.x + 2, y: grip.y + 24 },
      { x: grip.x - 16 + sw * 0.4, y: grip.y + 48 },
      { x: grip.x + 6 + sw * 0.4, y: grip.y + 66 },
      { x: grip.x - 12, y: grip.y + 86 },
      { x: grip.x + 2 + sw, y: grip.y + 102 },
    ];
  }

  private threadAt(t: number, grips: { l: Arm; r: Arm }, pose: Pose, x: number, needle: NeedleState): Pt[] {
    const eye = needle.eye;

    if (t < 3) {
      const grip = { x: grips.l.hx, y: grips.l.hy };
      const coil = this.coilAt(grip, t);
      if (t >= 1.52 && t < 2.05) {
        // The confident thrust: the tip darts at the eye, then bends away.
        if (t < 1.78) {
          const u = smooth((t - 1.52) / 0.26);
          return [
            grip,
            coil[1],
            coil[2],
            { x: grip.x + 34, y: grip.y - 44 },
            { x: grip.x + 74, y: grip.y - 90 },
            { x: lerp(grip.x + 15, eye.x - 2, u), y: lerp(grip.y - 191, eye.y, u) },
          ];
        }
        const v = smooth((t - 1.78) / 0.27);
        return [
          grip,
          coil[1],
          coil[2],
          { x: grip.x + 34, y: grip.y - 44 },
          {
            x: lerp(eye.x - 2, grip.x - 30, v),
            y: lerp(eye.y, grip.y + 10, v) + Math.sin(v * Math.PI) * -26,
          },
          { x: lerp(eye.x - 2, grip.x - 10, v), y: lerp(eye.y, grip.y + 52, v) },
        ];
      }
      if (t >= 2.05) {
        const sw = Math.sin(t * 9) * 6;
        return [
          grip,
          coil[1],
          coil[2],
          { x: grip.x + 10, y: grip.y - 20 },
          { x: grip.x + 34 + sw * 0.6, y: grip.y - 44 },
          { x: grip.x + 6 + sw, y: grip.y + 66 },
        ];
      }
      const sw = Math.sin(t * 7) * 8;
      return [
        grip,
        coil[1],
        coil[2],
        { x: grip.x + 52, y: grip.y - 60 + sw * 0.5 },
        { x: grip.x + 78, y: grip.y + 20 },
        { x: grip.x + 46 + sw, y: grip.y - 24 },
      ];
    }

    if (t < 7) {
      const grip = { x: grips.l.hx, y: grips.l.hy };
      const rel = t - 3;
      const coil = this.coilAt(grip, t);
      if (rel < 0.95) {
        // Careful lined-up approach, tip just below the eye.
        const u = smooth(rel / 0.95);
        const tip = {
          x: lerp(grip.x + 96, eye.x - 18, u),
          y: lerp(grip.y - 20, eye.y + 12, u),
        };
        return [grip, coil[2], { x: grip.x + 60, y: grip.y - 50 }, { x: eye.x - 42, y: eye.y + 30 }, tip];
      }
      if (rel < 1.5) {
        // It bends away at the last moment.
        const u = smooth((rel - 0.95) / 0.55);
        const tip = { x: lerp(eye.x - 16, eye.x - 56, u), y: lerp(eye.y + 18, eye.y + 62, u) };
        return [grip, coil[2], { x: grip.x + 48, y: grip.y - 30 }, { x: eye.x - 34, y: eye.y + 44 }, tip];
      }
      if (rel < 2.0) {
        const sw = Math.sin(t * 8) * 5;
        return [grip, coil[1], coil[2], { x: grip.x + 44, y: grip.y - 22 }, { x: grip.x + 60 + sw * 0.6, y: grip.y + 28 }, { x: grip.x + 34 + sw, y: grip.y + 74 }];
      }
      if (rel < 2.95) {
        // The fast attempt whirls a tight loop around the shaft.
        const u = smooth((rel - 2.0) / 0.95);
        const cx0 = eye.x;
        const cy0 = (eye.y + needle.tip.y) / 2;
        const a0 = -1.2 + u * Math.PI * 2.35;
        const ring: Pt[] = [];
        for (let i = 0; i <= 6; i++) {
          const a = a0 - (i / 6) * Math.PI * 1.35;
          ring.push({ x: cx0 + Math.cos(a) * 34, y: cy0 + Math.sin(a) * 34 });
        }
        return [grip, coil[2], { x: grip.x + 56, y: grip.y - 40 }, { x: eye.x - 26, y: cy0 + 46 }, ...ring.slice(2, 5), { x: eye.x + 36, y: cy0 - 14 }];
      }
      if (rel < 3.5) {
        const sw = Math.sin(t * 9) * 5;
        return [grip, coil[1], coil[2], { x: grip.x + 48, y: grip.y - 26 }, { x: eye.x + 30, y: eye.y + 74 }, { x: eye.x - 8 + sw * 0.5, y: eye.y + 108 }];
      }
      // The furious point: the rope just dangles off the pointing hand.
      const sw = Math.sin(t * 10) * 7;
      return [
        grip,
        coil[1],
        coil[2],
        { x: grip.x - 12, y: grip.y + 60 },
        { x: grip.x + 26 + sw * 0.5, y: grip.y + 58 },
        { x: grip.x + 10 + sw, y: grip.y + 112 },
      ];
    }

    if (t < 12) {
      // Shot 3: the rope is guided by the right hand (glass in the left).
      const grip = { x: grips.r.hx, y: grips.r.hy };
      const rel = t - 7;
      const coil = [
        { x: grip.x - 16, y: grip.y + 34 },
        { x: grip.x + 4, y: grip.y + 56 },
        { x: grip.x - 14, y: grip.y + 78 },
      ];
      if (rel < 1.35) {
        const sw = Math.sin(t * 8) * 6;
        return [grip, coil[1], { x: grip.x + 30 + sw * 0.5, y: grip.y + 10 }, { x: grip.x + 44, y: grip.y - 26 }, { x: grip.x + 24 + sw, y: grip.y - 70 }];
      }
      if (rel < 2.6) {
        const u = smooth((rel - 1.35) / 1.0);
        const tip = { x: lerp(grip.x + 30, eye.x + 4, u), y: lerp(grip.y - 60, eye.y - 6, u) };
        return [grip, coil[1], { x: grip.x + 26, y: grip.y - 20 }, { x: lerp(grip.x + 20, eye.x - 30, u), y: lerp(grip.y - 70, eye.y + 30, u) }, tip];
      }
      if (rel < 2.9) {
        // It catches on the outside of the shaft.
        const u = smooth((rel - 2.6) / 0.3);
        const hook = { x: eye.x + Math.cos(0.5) * 20, y: eye.y - Math.sin(0.5) * 20 + u * 26 };
        return [grip, coil[1], { x: grip.x + 22, y: grip.y - 16 }, { x: eye.x - 26, y: eye.y + 34 }, { x: eye.x + 8, y: eye.y + 40 }, hook];
      }
      if (rel < 4.05) {
        const u = smooth((rel - 3.2) / 0.85);
        const tip = { x: lerp(grip.x + 10, eye.x + 2, u), y: lerp(grip.y + 60, eye.y + 8, u) };
        return [grip, coil[1], { x: grip.x + 22, y: grip.y - 12 }, { x: eye.x - 40, y: eye.y + 40 }, tip];
      }
      if (rel < 4.4) {
        // Bends away one last time.
        const u = smooth((rel - 4.05) / 0.35);
        const tip = { x: lerp(eye.x, eye.x - 52, u), y: lerp(eye.y + 10, eye.y + 66, u) };
        return [grip, coil[1], { x: grip.x + 18, y: grip.y - 16 }, { x: eye.x - 36, y: eye.y + 46 }, tip];
      }
      const sw = Math.sin(t * 9) * 7;
      return [grip, coil[1], coil[2], { x: grip.x - 24, y: grip.y + 58 }, { x: grip.x + 8 + sw * 0.5, y: grip.y + 66 }, { x: grip.x - 10 + sw, y: grip.y + 116 }];
    }

    if (t < 18) {
      // Shot 4: the rope is anchored to the machine's lever arm.
      const a = this.machineLeverAngle(t);
      const clip = {
        x: LEVER_PIVOT.x + Math.sin(a) * 96 - 6,
        y: LEVER_PIVOT.y - Math.cos(a) * 96,
      };
      if (t < 16.02) {
        // Slack rope draped over the ruler's top.
        return [
          clip,
          { x: 684, y: 1300 },
          { x: 654, y: 1380 },
          { x: 700, y: 1392 },
          { x: 760, y: 1390 },
          { x: 792, y: 1372 },
        ];
      }
      if (t < 16.33) {
        // Tension builds as he yanks.
        const u = smooth((t - 16.02) / 0.31);
        return [
          clip,
          { x: lerp(684, 790, u), y: lerp(1300, 1224, u) },
          { x: lerp(654, 836, u), y: lerp(1380, 1196, u) },
          { x: lerp(700, 872, u), y: lerp(1392, 1170, u) },
          { x: lerp(792, 878, u), y: lerp(1372, 1180, u) },
        ];
      }
      if (t < 17.0) {
        // The launch: skims past the eye and whips over his head.
        const u = smooth((t - 16.33) / 0.67);
        return [
          clip,
          { x: lerp(clip.x, 872, Math.min(1, u * 3)), y: lerp(clip.y, 1172, Math.min(1, u * 3)) },
          { x: lerp(872, 1018, Math.max(0, (u - 0.25) / 0.4)), y: 1172 - Math.max(0, (u - 0.25) / 0.4) * 96 },
          { x: lerp(1018, 1012, Math.max(0, (u - 0.42) / 0.3)), y: lerp(1076, 806, Math.max(0, (u - 0.42) / 0.3)) },
          { x: lerp(1012, 836, Math.max(0, (u - 0.58) / 0.3)), y: lerp(806, 742, Math.max(0, (u - 0.58) / 0.3)) },
          { x: lerp(836, 700, Math.max(0, (u - 0.72) / 0.24)), y: lerp(742, 748, Math.max(0, (u - 0.72) / 0.24)) },
          { x: lerp(700, 620, Math.max(0, (u - 0.86) / 0.14)), y: lerp(748, 846, Math.max(0, (u - 0.86) / 0.14)) },
        ];
      }
      // Wrapped snug around the beanie, one full turn, then the tail
      // hangs down his left side with a sway.
      const sw = Math.sin(t * 8) * 8;
      return [
        { x: 620, y: 846 }, // continues the launch arc end
        { x: 556, y: 852 }, // over the crown, leftward
        { x: 546, y: 914 }, // down the left side to the cuff
        { x: 618, y: 940 }, // across the front at the cuff
        { x: 700, y: 910 }, // around the right side
        { x: 690, y: 854 }, // closing the loop at the top right
        { x: 632, y: 838 }, // off the crest behind
        { x: 560, y: 896 }, // exit turning down-left
        { x: 520, y: 972 }, // tail
        { x: 492, y: 1048 },
        { x: 468 + sw, y: 1104 },
      ];
    }

    if (t < 24) {
      const grip = { x: grips.l.hx, y: grips.l.hy };
      const rel = t - 18;
      if (rel < 0.55) {
        // Peel the loose rope off the beanie, hugging the face's right side.
        const u = smooth(rel / 0.55);
        return [
          grip,
          { x: lerp(568, grip.x + 34, u), y: 1074 },
          { x: 618, y: lerp(1012, 1042, u) },
          { x: 622, y: lerp(876, 934, u) },
        ];
      }
      if (rel < 1.3) {
        return [...this.coilAt(grip, t).slice(2, 5), { x: grip.x + 30, y: grip.y + 60 }];
      }
      if (rel < 4.58) {
        // The slow, careful approach toward the eye.
        const wave = Math.sin(t * 5) * 4;
        let tip: Pt;
        if (rel < 2.4) {
          tip = { x: grip.x + 78, y: grip.y - 30 - Math.min(1, rel / 2.0) * 40 };
        } else if (rel < 3.2) {
          const u = smooth((rel - 2.4) / 0.8);
          tip = { x: lerp(grip.x + 78, eye.x - 56, u), y: lerp(grip.y - 70, eye.y + 30, u) };
        } else if (rel < 3.9) {
          const u = smooth((rel - 3.2) / 0.7);
          tip = { x: lerp(eye.x - 56, eye.x - 58, u), y: lerp(eye.y + 30, eye.y + 17, u) };
        } else if (rel < 4.15) {
          // Fake-out: it bends just before the eye.
          const u = smooth((rel - 3.9) / 0.25);
          tip = { x: lerp(eye.x - 58, eye.x - 64, u), y: lerp(eye.y + 17, eye.y + 36, u * 0.8) };
        } else {
          const u = smooth((rel - 4.15) / 0.43);
          tip = { x: lerp(eye.x - 64, eye.x - 2, u), y: lerp(eye.y + 36, eye.y + 2, u) };
        }
        return [
          grip,
          ...(this.coilAt(grip, t).slice(1, 3)),
          { x: grip.x + 42, y: grip.y - 62 + wave * 0.5 },
          { x: lerp(grip.x + 60, eye.x - 60, Math.min(1, rel / 4.2)), y: lerp(grip.y - 40, eye.y + 38, Math.min(1, rel / 4.2)) },
          tip,
        ];
      }
      if (rel < 5.05) {
        // THROUGH, then the visible length is pulled below the eye.
        const u = smooth((rel - 4.58) / 0.47);
        return [
          grip,
          { x: grip.x + 12, y: grip.y + 30 },
          { x: lerp(eye.x - 60, eye.x - 8, u), y: lerp(eye.y + 38, eye.y + 26, u) },
          { x: eye.x, y: eye.y + 10 },
          eye,
          { x: eye.x + 3, y: eye.y - 18 },
        ];
      }
      if (rel < 5.4) {
        const u = smooth((rel - 5.05) / 0.35);
        return [
          grip,
          { x: grip.x + 6, y: grip.y + 20 },
          { x: eye.x - 6, y: lerp(eye.y + 34, eye.y + 62, u) },
          { x: eye.x - 1, y: eye.y + 10 },
          eye,
          { x: eye.x + 3, y: eye.y - 18 },
        ];
      }
      // Victory: released through the raised needle, tail resting on the
      // crown of the beanie it will soon betray.
      const sw = Math.sin(t * 6) * 10;
      return [
        { x: eye.x, y: eye.y - 18 },
        eye,
        { x: eye.x + 20, y: eye.y + 84 },
        { x: eye.x - 24 + sw * 0.4, y: eye.y + 142 },
        { x: eye.x - 66 + sw * 0.7, y: eye.y + 74 },
        { x: eye.x - 92, y: eye.y - 6 },
        { x: eye.x - 96 + sw * 0.3, y: eye.y - 14 },
      ];
    }

    // Shot 6: needle in his right hand (eye down), tail latched to the beanie.
    const grip = { x: grips.r.hx, y: grips.r.hy };
    const eye2 = needle.eye;
    const rel = t - 24;
    if (rel < 0.2) {
      const sw = Math.sin(t * 6) * 10;
      return [
        { x: eye2.x, y: eye2.y - 18 },
        eye2,
        { x: eye2.x + 20, y: eye2.y + 84 },
        { x: eye2.x - 24 + sw * 0.4, y: eye2.y + 142 },
        { x: eye2.x - 40 + sw * 0.7, y: eye2.y + 128 },
        { x: eye2.x - 52, y: eye2.y - 66 },
        { x: eye2.x - 50 + sw * 0.3, y: eye2.y - 70 },
      ];
    }
    const prop = this.beaniePropState(t);
    const jig = rel >= 4.75 ? Math.sin(t * 46) * 3 * clamp((30 - t) / 0.4, 0.15, 1) : 0;
    // While the beanie is still on his head the rope ends at its crown.
    const shoulderY6 = this.hipY - 170;
    const bodyTopX6 = x + Math.sin(pose.lean) * 170;
    const headX6 = bodyTopX6 + Math.sin(pose.headTilt) * 10;
    const headY6 = shoulderY6 - 78 + pose.headDrop;
    const crown = prop.mode === 'none' ? { x: headX6, y: headY6 - 102 } : prop.crown;
    return [
      { x: eye2.x, y: eye2.y - 18 + jig * 0.4 },
      eye2,
      { x: lerp(eye2.x, crown.x + 60, 0.6) + jig * 0.3, y: lerp(eye2.y, crown.y, 0.55) + 24 },
      { x: crown.x + 44 + jig * 0.4, y: crown.y + 2 + jig * 0.4 },
      { x: crown.x + jig, y: crown.y + jig },
    ];
  }

  private drawThread(
    ctx: CanvasRenderingContext2D,
    t: number,
    arms: { l: Arm; r: Arm },
    pose: Pose,
    x: number,
    needle: NeedleState
  ) {
    const pts = this.threadAt(t, arms, pose, x, needle);
    this.strokeRope(ctx, pts);
  }

  // ------------------------------------------------------------------
  // The ridiculous machine
  // ------------------------------------------------------------------

  private machineLeverAngle(t: number): number {
    // 0.34 rad at rest; yanked toward him around 16.0.
    const base = 0.34;
    if (t < 16.02) return base;
    if (t < 16.35) return lerp(base, 0.92, smooth((t - 16.02) / 0.33));
    if (t < 16.75) {
      const u = (t - 16.35) / 0.4;
      return lerp(0.92, base + Math.sin(u * Math.PI * 2.2) * 0.5, smooth(u));
    }
    return base + Math.max(0, Math.cos((t - 16.75) * 9)) * Math.max(0, 1 - (t - 16.75) / 0.6) * 0.3;
  }

  private drawMachine(ctx: CanvasRenderingContext2D, t: number) {
    ctx.save();

    // Wobble after the launch.
    let wob = 0;
    if (t >= 16.9 && t < 17.9) {
      const u = (t - 16.9) / 1.0;
      wob = Math.sin((t - 16.9) * 26) * 0.05 * (1 - smooth(u));
    }
    ctx.translate(810, 1500);
    ctx.rotate(wob);
    ctx.translate(-810, -1500);

    ctx.strokeStyle = INK;
    ctx.lineJoin = 'round';

    const pop = (start: number) => clamp(backOut((t - start) / 0.28), 0, 1.12);

    const part = (start: number, draw: (s: number) => void) => {
      if (t < start) return;
      const s = pop(start);
      if (s <= 0.02) return;
      ctx.save();
      if (s < 1) {
        const bx = 805;
        const by = 1430;
        ctx.translate(bx, by);
        ctx.scale(s, s);
        ctx.translate(-bx, -by);
        ctx.globalAlpha = clamp(s * 1.4, 0, 1);
      }
      draw(s);
      ctx.restore();
    };

    const drawBook = (
      x: number,
      top: number,
      w: number,
      h: number,
      fill: string,
      darkCol: string,
      pagesLeft: boolean
    ) => {
      ctx.fillStyle = fill;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.roundRect(x, top, w, h, 5);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = PAGES;
      const px = pagesLeft ? x + 7 : x + w - 27;
      ctx.beginPath();
      ctx.roundRect(px, top + 6, 20, h - 12, 3);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = darkCol;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(x + 10, top + h - 5);
      ctx.lineTo(x + w - 12, top + h - 5);
      ctx.stroke();
      ctx.strokeStyle = INK;
    };

    part(12.25, () => drawBook(BOOK_B.x, BOOK_B.top, BOOK_B.w, BOOK_B.h, BOOK_TEAL, BOOK_TEAL_DARK, false));
    part(12.6, () => drawBook(BOOK_T.x, BOOK_T.top, BOOK_T.w, BOOK_T.h, BOOK_ORANGE, BOOK_ORANGE_DARK, true));

    part(13.0, () => {
      // Ruler platform with tick marks.
      ctx.fillStyle = RULER_COL;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.roundRect(680, RULER_T, 270, RULER_H, 4);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = RULER_DARK;
      ctx.lineWidth = 3;
      for (let gx = 700; gx < 940; gx += 24) {
        const tall = Math.round((gx - 700) / 24) % 4 === 0;
        ctx.beginPath();
        ctx.moveTo(gx, RULER_T + 5);
        ctx.lineTo(gx, RULER_T + (tall ? 22 : 13));
        ctx.stroke();
      }
      ctx.strokeStyle = INK;
    });

    part(13.35, () => {
      // Needle stand.
      ctx.fillStyle = STAND_COL;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(844, RULER_T + RULER_H, 52, 10, 3);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.roundRect(862, NEEDLE_STAND_GRIP.y, 16, RULER_T + RULER_H - NEEDLE_STAND_GRIP.y, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = STAND_DARK;
      ctx.beginPath();
      ctx.ellipse(STAND_X, NEEDLE_STAND_GRIP.y, 18, 8, 0, 0, TAU);
      ctx.fill();
      ctx.stroke();
    });

    part(13.7, () => {
      // Lever mount + arm + knob.
      const a = this.machineLeverAngle(t);
      ctx.fillStyle = STAND_COL;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(712, LEVER_PIVOT.y, 16, RULER_T + RULER_H - LEVER_PIVOT.y, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = STAND_DARK;
      ctx.beginPath();
      ctx.arc(LEVER_PIVOT.x, LEVER_PIVOT.y, 9, 0, TAU);
      ctx.fill();
      ctx.stroke();
      // Arm from the pivot up to the knob.
      const kx = LEVER_PIVOT.x + Math.sin(a) * 96;
      const ky = LEVER_PIVOT.y - Math.cos(a) * 96;
      ctx.strokeStyle = STAND_DARK;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(LEVER_PIVOT.x, LEVER_PIVOT.y);
      ctx.lineTo(kx, ky);
      ctx.stroke();
      ctx.strokeStyle = INK;
      // Thread clip on the arm.
      const cxp = LEVER_PIVOT.x + Math.sin(a) * 96 * 0.05;
      ctx.fillStyle = STAND_DARK;
      ctx.beginPath();
      ctx.arc(cxp, LEVER_PIVOT.y - 96, 5, 0, TAU);
      ctx.fill();
      ctx.fillStyle = KNOB_COL;
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.arc(kx, ky, 17, 0, TAU);
      ctx.fill();
      ctx.stroke();
    });

    ctx.restore();
  }

  // ------------------------------------------------------------------
  // Magnifying glass
  // ------------------------------------------------------------------

  private magAt(t: number, arms: { l: Arm; r: Arm }, needle: NeedleState): MagState {
    if (t < 7.35 || t >= 11.78) {
      return { present: false, center: { x: 0, y: 0 }, r: 132, grip: { x: arms.l.hx, y: arms.l.hy }, rise: 0 };
    }
    const grip = { x: arms.l.hx, y: arms.l.hy };
    const down = { x: grip.x - 8, y: grip.y - 230 };
    if (t < 7.85) {
      const ut = smooth((t - 7.35) / 0.5);
      return { present: true, center: lerpPt(down, needle.eye, ut), r: 132, grip, rise: ut };
    }
    if (t >= 11.35) {
      const ut = smooth((t - 11.35) / 0.4);
      return { present: true, center: lerpPt(needle.eye, down, ut), r: 132, grip, rise: ut };
    }
    return { present: true, center: needle.eye, r: 132, grip, rise: 1 };
  }

  private drawMagnifier(ctx: CanvasRenderingContext2D, mag: MagState, needle: NeedleState) {
    const c = mag.center;
    ctx.save();

    // Handle from the rim toward the gripping hand.
    const dx = mag.grip.x - c.x;
    const dy = mag.grip.y - c.y;
    const dl = Math.max(1, Math.hypot(dx, dy));
    const ux = dx / dl;
    const uy = dy / dl;
    const rimOffset = 46;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 15;
    ctx.beginPath();
    ctx.moveTo(c.x + ux * rimOffset, c.y + uy * rimOffset);
    ctx.lineTo(mag.grip.x, mag.grip.y);
    ctx.stroke();
    ctx.strokeStyle = HANDLE;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(c.x + ux * rimOffset, c.y + uy * rimOffset);
    ctx.lineTo(mag.grip.x, mag.grip.y);
    ctx.stroke();
    ctx.fillStyle = HANDLE_DARK;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(mag.grip.x, mag.grip.y, 13, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Glass + thick dark rim.
    ctx.fillStyle = LENS_GLASS;
    ctx.beginPath();
    ctx.arc(c.x, c.y, 120, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = LENS_RIM;
    ctx.lineWidth = 22;
    ctx.beginPath();
    ctx.arc(c.x, c.y, 132, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(c.x, c.y, 104, Math.PI * 1.1, Math.PI * 1.42);
    ctx.stroke();

    // The lens shows one thing only: a big clean needle eye. The real
    // needle outside the lens stays untouched.
    ctx.save();
    ctx.beginPath();
    ctx.arc(c.x, c.y, 118, 0, TAU);
    ctx.clip();

    const a = Math.atan2(needle.u.y, needle.u.x);
    ctx.translate(c.x, c.y);
    ctx.rotate(a);
    ctx.fillStyle = NEEDLE_COL;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, 30, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(-170, 30);
    ctx.lineTo(-170, -30);
    ctx.lineTo(0, -30);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = NEEDLE_LIGHT;
    ctx.fillRect(-150, -12, 130, 9);
    // The big white eye hole.
    ctx.fillStyle = WHITE;
    ctx.strokeStyle = NEEDLE_DARK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(4, 0, 14, 0, TAU);
    ctx.fill();
    ctx.stroke();

    ctx.restore();

    // A small spark while the glass settles.
    if (mag.rise > 0.55 && mag.rise < 0.95) {
      this.drawSparkleDots(ctx, c.x + 86, c.y - 86, 0.5);
    }

    ctx.restore();
  }

  // ------------------------------------------------------------------
  // The lifted beanie (the punchline prop)
  // ------------------------------------------------------------------

  private beaniePropState(t: number): {
    mode: 'none' | 'rising' | 'swing' | 'held';
    center: Pt;
    crown: Pt;
    sy: number;
    rot: number;
  } {
    if (t < 26.45) {
      return { mode: 'none', center: { x: 0, y: 0 }, crown: { x: 0, y: 0 }, sy: 1, rot: 0 };
    }
    if (t < 27.28) {
      const u = smooth((t - 26.45) / 0.83);
      const cy = 952 - 150 * u;
      const sy = lerp(1.26, 1.0, u);
      return {
        mode: 'rising',
        center: { x: 540, y: cy },
        crown: { x: 540, y: cy - 102 * sy },
        sy,
        rot: 0,
      };
    }
    if (t < 27.7) {
      const v = smooth((t - 27.28) / 0.42);
      const cy = lerp(802, 1108, v);
      const cx = lerp(540, 444, v) + Math.sin(v * Math.PI * 1.4) * 30;
      return {
        mode: 'swing',
        center: { x: cx, y: cy },
        crown: { x: cx, y: cy - 102 },
        sy: 1,
        rot: Math.sin((t - 27.28) * 7) * 0.3 * v,
      };
    }
    const fade = clamp((30 - t) / 0.4, 0.15, 1);
    const jig = t >= 28.75 ? Math.sin(t * 46) * 3 * fade : 0;
    const cy = 1108 + jig * 0.5;
    const cx = 444 - jig * 0.4;
    return {
      mode: 'held',
      center: { x: cx, y: cy },
      crown: { x: cx, y: cy - 102 + jig * 0.6 },
      sy: 1,
      rot: 0,
    };
  }

  private drawBeanieProp(
    ctx: CanvasRenderingContext2D,
    t: number,
    _pose: Pose,
    _x: number,
    _needle: NeedleState
  ) {
    const prop = this.beaniePropState(t);
    if (prop.mode === 'none') return;
    ctx.save();
    ctx.translate(prop.center.x, prop.center.y);
    ctx.rotate(prop.rot);
    if (Math.abs(prop.sy - 1) > 0.01) ctx.scale(1, prop.sy);
    ctx.lineWidth = 5;
    ctx.lineJoin = 'round';
    ctx.fillStyle = BEANIE;
    ctx.beginPath();
    ctx.arc(0, -24, this.headR + 4, Math.PI * 1.02, Math.PI * 1.98);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = BEANIE_DEEP;
    ctx.fillRect(-this.headR - 4, -40, (this.headR + 4) * 2, 16);
    ctx.strokeRect(-this.headR - 4, -40, (this.headR + 4) * 2, 16);
    ctx.fillStyle = BEANIE_BRIGHT;
    ctx.beginPath();
    ctx.arc(0, -this.headR - 32, 16, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // ------------------------------------------------------------------
  // Effects
  // ------------------------------------------------------------------

  private drawBurst(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    r: number,
    points: number,
    color: string,
    rot = 0
  ) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.fillStyle = color;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const a = (i / (points * 2)) * TAU;
      const rr = i % 2 === 0 ? r : r * 0.45;
      const px = Math.cos(a) * rr;
      const py = Math.sin(a) * rr;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private drawPuff(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
    ctx.save();
    ctx.fillStyle = 'rgba(190, 196, 208, 0.85)';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3.5;
    const blobs: Array<[number, number, number]> = [
      [-s * 0.7, s * 0.3, s * 0.55],
      [s * 0.65, s * 0.35, s * 0.65],
      [0, -s * 0.3, s * 0.8],
    ];
    for (const [bx, by, br] of blobs) {
      ctx.beginPath();
      ctx.arc(x + bx, y + by, br, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawSweat(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = SWEAT;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.bezierCurveTo(s * 0.9, s * 0.25, s * 0.55, s, 0, s);
    ctx.bezierCurveTo(-s * 0.55, s, -s * 0.9, s * 0.25, 0, -s);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private drawLightbulb(ctx: CanvasRenderingContext2D, x: number, y: number, pop: number) {
    if (pop <= 0) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(pop, pop);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4.5;
    // Rotation rays
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU + 0.3;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 34, Math.sin(a) * 34);
      ctx.lineTo(Math.cos(a) * 52, Math.sin(a) * 52);
      ctx.stroke();
    }
    ctx.fillStyle = SPARKLE;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, -6, 24, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = STAND_COL;
    ctx.beginPath();
    ctx.roundRect(-11, 16, 22, 14, 3);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private drawSparkleDots(ctx: CanvasRenderingContext2D, x: number, y: number, k: number) {
    ctx.save();
    ctx.fillStyle = SPARKLE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3.5;
    const n = 4;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU - Math.PI / 3;
      const r = 30 + 22 * k;
      this.drawBurst(ctx, x + Math.cos(a) * r, y + Math.sin(a) * r, 7 + 3 * k, 4, SPARKLE, a);
    }
    ctx.restore();
  }

  private renderEffects(
    ctx: CanvasRenderingContext2D,
    t: number,
    x: number,
    pose: Pose,
    arms: { l: Arm; r: Arm },
    needle: NeedleState
  ) {
    const eye = needle.eye;

    // Shot 1: burst where the thrust bends away.
    if (t >= 1.78 && t < 2.08) {
      const u = (t - 1.78) / 0.3;
      ctx.save();
      ctx.globalAlpha = clamp(1 - u, 0, 1);
      this.drawBurst(ctx, eye.x, eye.y + 6, 20 + u * 22, 8, THREAD);
      ctx.restore();
    }

    // Shot 2: swirl marks around the shaft while the loop slips out.
    if (t >= 5.4 && t < 5.98) {
      const u = (t - 5.4) / 0.58;
      ctx.save();
      ctx.globalAlpha = Math.sin(u * Math.PI) * 0.6;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      const cyy = (eye.y + needle.tip.y) / 2;
      for (let i = 0; i < 2; i++) {
        const a0 = -u * 2.4 + i * Math.PI;
        ctx.beginPath();
        ctx.arc(eye.x, cyy, 44 + i * 8, a0, a0 + 1.25);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Shot 2: frustrated stomp dust.
    if (t >= 6.55 && t < 6.95) {
      const u = (t - 6.55) / 0.4;
      ctx.save();
      ctx.globalAlpha = 1 - u;
      this.drawPuff(ctx, x - 50, 1494, 16 + u * 12);
      this.drawPuff(ctx, x + 50, 1494, 16 + u * 12);
      ctx.restore();
    }

    // The idea bulb.
    if (t >= 7.35 && t < 9.1) {
      const pop = backOut((t - 7.35) / 0.32);
      const fade = t > 8.55 ? clamp((9.1 - t) / 0.55, 0, 1) : 1;
      ctx.save();
      ctx.globalAlpha = fade;
      this.drawLightbulb(ctx, x + 6, 762, pop);
      ctx.restore();
    }

    // Shot 3: catch on the outside + the second bend-away burst.
    if (t >= 9.62 && t < 9.92) {
      const u = (t - 9.62) / 0.3;
      ctx.save();
      ctx.globalAlpha = 1 - u;
      this.drawBurst(ctx, eye.x + 20, eye.y + 30, 18, 7, THREAD);
      ctx.restore();
    }
    if (t >= 11.08 && t < 11.36) {
      const u = (t - 11.08) / 0.28;
      ctx.save();
      ctx.globalAlpha = 1 - u;
      this.drawBurst(ctx, eye.x - 8, eye.y + 40, 18, 7, THREAD);
      ctx.restore();
    }

    // Shot 4: assembly puffs.
    const puffHits: Array<[number, number, number]> = [
      [12.5, 805, 1488],
      [12.85, 805, 1448],
      [13.25, 815, 1408],
      [14.05, 870, 1236],
    ];
    for (const [at, px, py] of puffHits) {
      if (t >= at && t < at + 0.4) {
        ctx.save();
        ctx.globalAlpha = 1 - (t - at) / 0.4;
        this.drawPuff(ctx, px, py, 18 + (t - at) * 26);
        ctx.restore();
      }
    }

    // Lever clunk burst.
    if (t >= 15.95 && t < 16.25) {
      const u = (t - 15.95) / 0.3;
      ctx.save();
      ctx.globalAlpha = 1 - u;
      this.drawBurst(ctx, 762, 1212, 16 + u * 14, 6, STAND_DARK);
      ctx.restore();
    }

    // Whip streaks along the launch arc.
    if (t >= 16.42 && t < 16.85) {
      const k = Math.sin(((t - 16.42) / 0.43) * Math.PI);
      ctx.save();
      ctx.globalAlpha = k * 0.75;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      const streaks: Array<[number, number, number, number]> = [
        [958, 1092, 1004, 1014],
        [1014, 942, 972, 866],
        [916, 772, 852, 750],
      ];
      for (const [ax, ay, bx, by] of streaks) {
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Stand wobble marks.
    if (t >= 17.0 && t < 17.55) {
      const u = (t - 17.0) / 0.55;
      ctx.save();
      ctx.globalAlpha = Math.sin(u * Math.PI) * 0.55;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(840, 1392, 22, Math.PI * 0.9, Math.PI * 1.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(912, 1374, 20, Math.PI * 1.4, Math.PI * 1.7);
      ctx.stroke();
      ctx.restore();
    }

    // Shot 5: focus dashes and sweat.
    if (t >= 20.6 && t < 22.58) {
      const k = Math.min(1, (t - 20.6) / 0.5) * Math.min(1, (22.58 - t) / 0.35);
      ctx.save();
      ctx.globalAlpha = k * 0.4;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      for (const side of [-1, 1]) {
        for (let i = 0; i < 3; i++) {
          const d = 74 + i * 26;
          const a = side > 0 ? -0.62 : Math.PI + 0.62;
          const ax = eye.x + Math.cos(a) * d;
          const ay = eye.y + Math.sin(a) * d;
          const bl = 15;
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(eye.x + Math.cos(a) * (d + bl), eye.y + Math.sin(a) * (d + bl));
          ctx.stroke();
        }
      }
      ctx.restore();
    }
    if (t >= 19.4 && t < 22.62) {
      const fadeA = Math.min(1, (t - 19.4) / 0.4) * Math.min(1, (22.62 - t) / 0.3);
      const fadeB = Math.min(1, (t - 20.6) / 0.4) * Math.min(1, (22.62 - t) / 0.3);
      const bob = Math.sin(t * 3.1) * 3;
      if (fadeA > 0) {
        ctx.save();
        ctx.globalAlpha = fadeA;
        this.drawSweat(ctx, eye.x + 50, eye.y - 82 + bob, 11);
        ctx.restore();
      }
      if (fadeB > 0) {
        ctx.save();
        ctx.globalAlpha = fadeB;
        this.drawSweat(ctx, eye.x + 66, eye.y - 54 - bob, 9);
        ctx.restore();
      }
    }

    // The satisfying through-pass: golden spark at the eye.
    if (t >= 22.58 && t < 23.2) {
      const u = (t - 22.58) / 0.62;
      ctx.save();
      ctx.globalAlpha = Math.sin(Math.min(1, u) * Math.PI);
      this.drawBurst(ctx, eye.x, eye.y, 18 + u * 30, 6, SPARKLE, 0.4);
      this.drawSparkleDots(ctx, eye.x, eye.y, Math.min(1, u * 1.6));
      ctx.restore();
    }

    // Shot 6: tug arrows at the beanie crown.
    if (t >= 25.2 && t < 25.72) {
      const k = Math.sin(((t - 25.2) / 0.52) * Math.PI);
      ctx.save();
      ctx.globalAlpha = k;
      ctx.strokeStyle = THREAD;
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      for (const [ax, ay] of [
        [528, 862],
        [552, 856],
      ] as Array<[number, number]>) {
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax, ay - 30 - k * 8);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Stretch marks while the beanie is pulled off.
    if (t >= 26.5 && t < 27.26) {
      const k = Math.min(1, (t - 26.5) / 0.25);
      const crown = this.beaniePropState(t).crown;
      ctx.save();
      ctx.globalAlpha = k * 0.7;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      const marks: Array<[number, number, number]> = [
        [crown.x - 34, crown.y + 6, 22],
        [crown.x, crown.y - 6, 34],
        [crown.x + 34, crown.y + 6, 22],
      ];
      for (const [mx, my, len] of marks) {
        ctx.beginPath();
        ctx.moveTo(mx, my);
        ctx.lineTo(mx, my - len);
        ctx.stroke();
      }
      ctx.restore();
    }

    // The pop-off burst.
    if (t >= 27.28 && t < 27.66) {
      const u = (t - 27.28) / 0.38;
      ctx.save();
      ctx.globalAlpha = clamp(1 - u, 0, 1);
      this.drawBurst(ctx, 540, 800, 26 + u * 34, 9, BEANIE);
      ctx.restore();
    }

    // Rage sparks at the fists.
    if (t >= 28.85 && t < 29.65) {
      const k = Math.sin(((t - 28.85) / 0.8) * Math.PI);
      ctx.save();
      ctx.globalAlpha = k * 0.85;
      this.drawBurst(ctx, arms.r.hx + 26, arms.r.hy - 18, 13, 5, THREAD, 0.3);
      this.drawBurst(ctx, arms.l.hx - 26, arms.l.hy - 18, 13, 5, THREAD, -0.3);
      ctx.restore();
    }
  }

  // ------------------------------------------------------------------
  // Captions + safe zones
  // ------------------------------------------------------------------

  private renderCaption(ctx: CanvasRenderingContext2D, t: number) {
    const line = this.captions.find((c) => t >= c.from && t < c.to);
    if (!line) return;

    const u = clamp((t - line.from) / 0.1, 0, 1);
    const tailFade = Math.min(1, (line.to - t) / 0.2);
    const alpha = clamp(Math.min((t - line.from) / 0.05, tailFade), 0, 1);
    if (alpha <= 0) return;

    const scale = 1 - (1 - u) * 0.25 + Math.sin(u * Math.PI) * 0.18;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(this.width / 2, 470);
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

  private renderSafeZones(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 100, 100, 0.55)';
    ctx.lineWidth = 3;
    ctx.setLineDash([14, 10]);
    ctx.strokeRect(48, 120, this.width - 96, this.height - 240);
    ctx.strokeRect(this.width - 152, 340, 100, 1100);
    ctx.strokeRect(60, 1590, this.width - 120, 210);
    ctx.setLineDash([]);
    ctx.restore();
  }
}
