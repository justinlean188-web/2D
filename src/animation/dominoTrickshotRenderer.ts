import type { StudioConfig } from '../types';

const TAU = Math.PI * 2;
const WIDTH = 1080;
const HEIGHT = 1920;

const INK = '#141414';
const WHITE = '#ffffff';
const FLOOR = '#f8f8f8';
const FLOOR_LINE = '#e0e0e0';

const BEANIE = '#e63946';
const BEANIE_DEEP = '#b3222e';
const SHIRT = '#ffd166';

// Domino colors - 6 colors repeating for 20 dominoes
const DOMINO_COLORS = [
  '#e63946', // red
  '#f77f00', // orange
  '#fcbf49', // yellow
  '#2a9d8f', // green
  '#4361ee', // blue
  '#7209b7', // purple
];

const RAMP_COLOR = '#c9b896';
const RAMP_DARK = '#a68f6e';
const BALL_BLUE = '#3a86ff';
const BALL_RED = '#e63946';
const CUP_RED = '#e63946';
const CUP_DARK = '#b3222e';
const PLATFORM_COLOR = '#d9d9d9';

const FLOOR_Y = 1500;
const HIP_Y = 1200;
const HEAD_R = 70;

const TABLE_Y = 1100;
const TABLE_LEFT = 140;
const TABLE_RIGHT = 940;
const DOMINO_START_X = 180;
const DOMINO_SPACING = 38;
const DOMINO_W = 28;
const DOMINO_H = 120;

const RAMP_X = 820;
const RAMP_Y = 1000;
const RAMP_W = 80;
const RAMP_H = 100;
const PLATFORM_X = 920;
const PLATFORM_Y = 900;
const PLATFORM_W = 100;
const PLATFORM_H = 40;

const CUP_X = 970;
const CUP_Y = 800;
const CUP_R = 32;
const CUP_H = 80;

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
  legs: 'stand' | 'walk';
  walkPhase: number;
  handL: Pt;
  handR: Pt;
  bendL: 1 | -1;
  bendR: 1 | -1;
  fistL: boolean;
  fistR: boolean;
  fingersR: number;
  pointR: boolean;
  beanieOn: boolean;
  anger: number;
}

interface CaptionLine { text: string; from: number; to: number; }
interface CameraKey { t: number; x: number; y: number; zoom: number; }
interface Arm { sx: number; sy: number; ex: number; ey: number; hx: number; hy: number; }
interface DominoState { x: number; angle: number; fallen: boolean; color: string; }
interface BallState { x: number; y: number; r: number; visible: boolean; inCup: boolean; }

const CAPTIONS: CaptionLine[] = [
  { text: 'ONE BALL. 20 DOMINOES. ONE SHOT.', from: 0.5, to: 3.8 },
  { text: 'ATTEMPT #1', from: 4.5, to: 7.5 },
  { text: 'WHY IS EVERYTHING FALLING?!', from: 8.5, to: 13.5 },
  { text: "DON'T BLINK…", from: 14.5, to: 19.5 },
  { text: 'PERFECT CHAIN REACTION!!', from: 20.5, to: 24.5 },
  { text: 'THE FINAL DOMINO GOT REVENGE 💀', from: 25.5, to: 29.5 },
];

const CAMERA_KEYS: CameraKey[] = [
  { t: 0.0, x: 540, y: 1000, zoom: 1.5 },
  { t: 4.0, x: 540, y: 1000, zoom: 1.35 },
  { t: 8.0, x: 540, y: 1000, zoom: 1.35 },
  { t: 14.0, x: 540, y: 900, zoom: 1.25 },
  { t: 20.0, x: 540, y: 880, zoom: 1.8 },
  { t: 25.0, x: 540, y: 900, zoom: 1.5 },
  { t: 26.0, x: 540, y: 900, zoom: 2.2 },
  { t: 30.0, x: 540, y: 880, zoom: 2.3 },
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
function lerpPt(a: Pt, b: Pt, u: number): Pt {
  return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u) };
}

export class DominoTrickshotRenderer {
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

    // Draw order: floor, table, dominoes, ramp/ball/cup, stickman
    this.drawTable(ctx);
    this.drawDominoes(ctx, t);
    this.drawRamp(ctx);
    this.drawRedBall(ctx, t);
    this.drawCup(ctx, t);
    this.drawStickman(ctx, x, hipY, pose, arms, t, 'body');
    this.drawStickman(ctx, x, hipY, pose, arms, t, 'front');
    this.drawBlueBall(ctx, t, x, hipY, pose, arms);

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
    // Floor band
    ctx.fillStyle = FLOOR;
    ctx.fillRect(-200, this.floorY, WIDTH + 400, HEIGHT - this.floorY + 200);
    ctx.strokeStyle = FLOOR_LINE;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-200, this.floorY);
    ctx.lineTo(WIDTH + 200, this.floorY);
    ctx.stroke();

    // Subtle floor pattern
    ctx.strokeStyle = FLOOR_LINE;
    ctx.lineWidth = 2;
    for (let y = this.floorY + 60; y < HEIGHT + 200; y += 120) {
      ctx.beginPath();
      ctx.moveTo(-200, y);
      ctx.lineTo(WIDTH + 200, y);
      ctx.stroke();
    }
  }

  private renderShadows(ctx: CanvasRenderingContext2D, t: number, x: number, hipY: number) {
    ctx.fillStyle = 'rgba(20, 20, 20, 0.08)';
    const lifted = clamp((this.hipY - hipY) / 30, 0, 1);
    ctx.beginPath();
    ctx.ellipse(x, this.floorY - 8, lerp(84, 62, lifted), 14, 0, 0, TAU);
    ctx.fill();

    // Domino shadows
    if (t < 14) {
      for (let i = 0; i < 20; i++) {
        const dx = DOMINO_START_X + i * DOMINO_SPACING;
        if (dx > TABLE_RIGHT) continue;
        ctx.beginPath();
        ctx.ellipse(dx, this.floorY - 8, 10, 4, 0, 0, TAU);
        ctx.fill();
      }
    }
  }

  private drawTable(ctx: CanvasRenderingContext2D) {
    // Table top
    ctx.fillStyle = '#fafafa';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(TABLE_LEFT - 20, TABLE_Y - 30, TABLE_RIGHT - TABLE_LEFT + 40, 60, 12);
    ctx.fill();
    ctx.stroke();

    // Table legs
    ctx.fillStyle = '#e8e8e8';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    const legXs = [TABLE_LEFT + 20, TABLE_RIGHT - 20];
    for (const lx of legXs) {
      ctx.beginPath();
      ctx.fillRect(lx - 12, TABLE_Y + 30, 24, this.floorY - TABLE_Y - 30);
      ctx.strokeRect(lx - 12, TABLE_Y + 30, 24, this.floorY - TABLE_Y - 30);
    }
  }

  private drawDominoes(ctx: CanvasRenderingContext2D, t: number) {
    const dominoes = this.getDominoStates(t);

    for (let i = 0; i < dominoes.length; i++) {
      const d = dominoes[i];
      if (d.x < TABLE_LEFT - 50 || d.x > TABLE_RIGHT + 50) continue;

      ctx.save();
      ctx.translate(d.x, TABLE_Y);
      ctx.rotate(d.angle);

      // Domino body
      ctx.fillStyle = d.color;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-DOMINO_W / 2, -DOMINO_H, DOMINO_W, DOMINO_H, 4);
      ctx.fill();
      ctx.stroke();

      // White dots indicator (optional, for visual interest)
      if (!d.fallen) {
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.beginPath();
        ctx.arc(-6, -DOMINO_H + 20, 3, 0, TAU);
        ctx.arc(6, -DOMINO_H + 20, 3, 0, TAU);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, -DOMINO_H / 2, 3, 0, TAU);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(-6, -30, 3, 0, TAU);
        ctx.arc(6, -30, 3, 0, TAU);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  private getDominoStates(t: number): DominoState[] {
    const states: DominoState[] = [];

    for (let i = 0; i < 20; i++) {
      const baseX = DOMINO_START_X + i * DOMINO_SPACING;
      const color = DOMINO_COLORS[i % DOMINO_COLORS.length];

      let angle = 0;
      let fallen = false;
      let x = baseX;

      if (t < 4.0) {
        // Shot 1: All standing
        angle = 0;
        fallen = false;
      } else if (t < 8.0) {
        // Shot 2: Blue ball rolls past, dominoes untouched
        angle = 0;
        fallen = false;
      } else if (t < 14.0) {
        // Shot 3: Chaos - dominoes fall sideways/chaotically
        const chaosProgress = clamp((t - 8.5) / 4.0, 0, 1);
        if (i < 5) {
          // First few fall sideways
          angle = -Math.PI / 2.5 * smooth(clamp((t - 8.5 - i * 0.15) / 0.8, 0, 1));
          fallen = true;
        } else if (i < 12) {
          // Middle ones fall in wrong directions
          const dir = (i % 2 === 0) ? 1 : -1;
          angle = dir * Math.PI / 3 * smooth(clamp((t - 9.5 - (i-5) * 0.2) / 0.8, 0, 1));
          fallen = true;
        } else if (t > 12.0) {
          // His arm sweeps the rest
          angle = -Math.PI / 2 * smooth(clamp((t - 12.0) / 1.0, 0, 1));
          fallen = true;
        }
        // Add some horizontal displacement for fallen ones
        if (fallen) {
          x = baseX + Math.sin(angle) * DOMINO_H * 0.4;
        }
      } else if (t < 20.0) {
        // Shot 4: Perfect chain reaction
        const chainStart = 15.3;
        const dominoTime = (t - chainStart) / (18.5 - chainStart); // 0 to 1 over the sequence
        const dominoProgress = i / 20;
        
        if (dominoProgress <= dominoTime) {
          // This domino has fallen
          const fallU = smooth(clamp((dominoTime - dominoProgress) * 20, 0, 1));
          angle = -Math.PI / 2 * fallU;
          fallen = true;
          x = baseX + Math.sin(angle) * DOMINO_H * 0.5;
        } else {
          angle = 0;
          fallen = false;
        }
      } else {
        // Shot 5-6: All fallen flat
        angle = -Math.PI / 2;
        fallen = true;
        x = baseX + DOMINO_H * 0.5;
      }

      states.push({ x, angle, fallen, color });
    }

    return states;
  }

  private drawRamp(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = RAMP_COLOR;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    
    // Ramp body (trapezoid)
    ctx.beginPath();
    ctx.moveTo(RAMP_X - RAMP_W / 2, TABLE_Y);
    ctx.lineTo(RAMP_X + RAMP_W / 2, TABLE_Y);
    ctx.lineTo(RAMP_X + RAMP_W / 2 - 15, TABLE_Y - RAMP_H);
    ctx.lineTo(RAMP_X - RAMP_W / 2 + 15, TABLE_Y - RAMP_H);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Ramp shading
    ctx.fillStyle = RAMP_DARK;
    ctx.beginPath();
    ctx.moveTo(RAMP_X - RAMP_W / 2 + 10, TABLE_Y);
    ctx.lineTo(RAMP_X + RAMP_W / 2 - 10, TABLE_Y);
    ctx.lineTo(RAMP_X + RAMP_W / 2 - 20, TABLE_Y - RAMP_H);
    ctx.lineTo(RAMP_X - RAMP_W / 2 + 20, TABLE_Y - RAMP_H);
    ctx.closePath();
    ctx.fill();

    // Ramp surface lines
    ctx.strokeStyle = RAMP_DARK;
    ctx.lineWidth = 2;
    for (let i = 1; i < 5; i++) {
      const y = TABLE_Y - (RAMP_H * i / 5);
      const w = RAMP_W * (1 - i / 5 * 0.3);
      ctx.beginPath();
      ctx.moveTo(RAMP_X - w / 2, y);
      ctx.lineTo(RAMP_X + w / 2, y);
      ctx.stroke();
    }
  }

  private drawRedBall(ctx: CanvasRenderingContext2D, t: number) {
    if (t < 18.5) return; // Ball doesn't move until domino 20 hits it

    const ball = this.getRedBallState(t);
    if (!ball.visible) return;

    ctx.save();
    ctx.translate(ball.x, ball.y);

    // Ball shadow
    ctx.fillStyle = 'rgba(20, 20, 20, 0.15)';
    ctx.beginPath();
    ctx.ellipse(0, 10, ball.r, ball.r * 0.3, 0, 0, TAU);
    ctx.fill();

    // Ball
    ctx.fillStyle = BALL_RED;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, ball.r, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.arc(-ball.r * 0.3, -ball.r * 0.3, ball.r * 0.4, 0, TAU);
    ctx.fill();

    ctx.restore();
  }

  private getRedBallState(t: number): BallState {
    const R = 24;
    const rampTopY = TABLE_Y - RAMP_H;
    const rampTopX = RAMP_X;
    const platformTopY = PLATFORM_Y;
    
    if (t < 18.5) {
      // Sitting on ramp
      return { x: rampTopX, y: rampTopY - R, r: R, visible: true, inCup: false };
    } else if (t < 19.5) {
      // Rolling down ramp
      const u = smooth(clamp((t - 18.5) / 1.0, 0, 1));
      const x = lerp(rampTopX, PLATFORM_X + 10, u);
      const y = lerp(rampTopY - R, platformTopY - R, u);
      return { x, y, r: R, visible: true, inCup: false };
    } else if (t < 20.7) {
      // Approaching cup
      const u = smooth(clamp((t - 19.5) / 1.2, 0, 1));
      const x = lerp(PLATFORM_X + 10, CUP_X, u);
      const y = lerp(platformTopY - R, CUP_Y - CUP_H + R, u);
      return { x, y, r: R, visible: true, inCup: false };
    } else if (t < 25.5) {
      // In cup
      return { x: CUP_X, y: CUP_Y - CUP_H + R, r: R, visible: true, inCup: true };
    } else if (t < 26.0) {
      // Cup tipping - ball stays in cup briefly
      return { x: CUP_X, y: CUP_Y - CUP_H + R, r: R, visible: true, inCup: true };
    } else {
      // Cup falls on head - ball is inside cup on head
      return { x: 540, y: 900, r: R, visible: false, inCup: true };
    }
  }

  private drawCup(ctx: CanvasRenderingContext2D, t: number) {
    const cup = this.getCupState(t);
    if (!cup.visible) return;

    ctx.save();
    ctx.translate(cup.x, cup.y);
    ctx.rotate(cup.rotation);

    // Cup shadow
    ctx.fillStyle = 'rgba(20, 20, 20, 0.15)';
    ctx.beginPath();
    ctx.ellipse(0, CUP_H * 0.8, CUP_R, CUP_R * 0.3, 0, 0, TAU);
    ctx.fill();

    // Cup body
    ctx.fillStyle = CUP_RED;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-CUP_R, 0);
    ctx.quadraticCurveTo(-CUP_R * 1.2, CUP_H * 0.3, -CUP_R * 1.1, CUP_H);
    ctx.lineTo(CUP_R * 1.1, CUP_H);
    ctx.quadraticCurveTo(CUP_R * 1.2, CUP_H * 0.3, CUP_R, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cup rim
    ctx.strokeStyle = CUP_DARK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.ellipse(0, 0, CUP_R * 1.1, 8, 0, 0, TAU);
    ctx.stroke();

    // Cup highlight
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.moveTo(-CUP_R * 0.5, 0);
    ctx.quadraticCurveTo(-CUP_R * 0.3, CUP_H * 0.4, -CUP_R * 0.4, CUP_H * 0.8);
    ctx.quadraticCurveTo(-CUP_R * 0.5, CUP_H * 0.7, -CUP_R * 0.6, 0);
    ctx.closePath();
    ctx.fill();

    // Platform (if not on head)
    if (t < 25.5) {
      ctx.fillStyle = PLATFORM_COLOR;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-PLATFORM_W / 2, CUP_H - 5, PLATFORM_W, PLATFORM_H, 4);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  private getCupState(t: number): { x: number; y: number; rotation: number; visible: boolean } {
    if (t < 25.5) {
      // On platform
      return { x: CUP_X, y: PLATFORM_Y - CUP_H, rotation: 0, visible: true };
    } else if (t < 26.0) {
      // Tipping off platform
      const u = smooth(clamp((t - 25.5) / 0.5, 0, 1));
      return { 
        x: lerp(CUP_X, 540, u), 
        y: lerp(PLATFORM_Y - CUP_H, 900 - CUP_H, u), 
        rotation: u * 0.3, 
        visible: true 
      };
    } else if (t < 27.0) {
      // Falling onto head
      const u = smooth(clamp((t - 26.0) / 1.0, 0, 1));
      return { 
        x: 540, 
        y: lerp(900 - CUP_H, 850 - CUP_H, u), 
        rotation: 0.3, 
        visible: true 
      };
    } else {
      // On head
      return { x: 540, y: 850 - CUP_H, rotation: 0.3, visible: true };
    }
  }

  private charX(t: number): number {
    // Character stays near the domino line (left side)
    return keyAt([
      [0, 300],
      [4.0, 300],
      [8.0, 300],
      [14.0, 300],
      [20.0, 300],
      [25.0, 300],
      [26.0, 540], // Moves to center when cup falls on head
      [30, 540],
    ], t);
  }

  private charHop(t: number): number {
    // Victory hops in shot 5
    if (t >= 21.5 && t < 22.5) return 30 * Math.sin((t - 21.5) * Math.PI);
    if (t >= 23.0 && t < 24.0) return 25 * Math.sin((t - 23.0) * Math.PI);
    return 0;
  }

  private poseAt(t: number): Pose {
    const pose = this.defaultPose();

    if (t < 4.0) {
      // Shot 1: Confident, pointing at cup
      pose.brow = 'cocky';
      pose.eye = 'squint';
      pose.mouth = 'grin';
      pose.handR = { x: 970, y: 850 }; // Pointing at cup
      pose.bendR = -1;
      pose.fingersR = 1;
      pose.pointR = true;
      pose.handL = { x: 220, y: 1050 }; // Holding blue ball
      pose.bendL = -1;
      pose.fistL = false;
      pose.fingersR = 1;
    } else if (t < 8.0) {
      // Shot 2: Flick, watch, disappointed
      if (t < 4.5) {
        pose.brow = 'cocky';
        pose.eye = 'squint';
        pose.mouth = 'smirk';
        pose.handR = { x: 200, y: 1100 }; // Flicking
        pose.bendR = -1;
      } else if (t < 6.0) {
        pose.brow = 'raised';
        pose.eye = 'wide';
        pose.mouth = 'o';
        pose.handR = { x: 300, y: 900 }; // Arm extended after flick
        pose.bendR = -1;
      } else {
        pose.brow = 'sad';
        pose.eye = 'wide';
        pose.mouth = 'frown';
        pose.handL = { x: 220, y: 1100 };
        pose.handR = { x: 380, y: 1100 };
        pose.fistL = true;
        pose.fistR = true;
      }
    } else if (t < 14.0) {
      // Shot 3: Hard flick, chaos, frantic, stomp
      if (t < 8.5) {
        pose.brow = 'determined';
        pose.eye = 'squint';
        pose.mouth = 'grit';
        pose.lean = 0.15;
        pose.handR = { x: 200, y: 1100 };
        pose.bendR = -1;
      } else if (t < 10.5) {
        pose.brow = 'raised';
        pose.eye = 'wide';
        pose.mouth = 'o';
        pose.handR = { x: 350, y: 900 };
        pose.bendR = -1;
      } else if (t < 12.5) {
        pose.brow = 'angry';
        pose.eye = 'squint';
        pose.mouth = 'grit';
        pose.handL = { x: 250, y: 1000 };
        pose.handR = { x: 400, y: 1000 };
        pose.bendL = -1;
        pose.bendR = -1;
      } else {
        pose.brow = 'angry';
        pose.eye = 'squint';
        pose.mouth = 'grit';
        pose.lean = -0.1;
        pose.handL = { x: 200, y: 1150 };
        pose.handR = { x: 400, y: 1150 };
        pose.fistL = true;
        pose.fistR = true;
      }
    } else if (t < 20.0) {
      // Shot 4: Breath, precise flick, intense focus
      if (t < 15.0) {
        pose.brow = 'determined';
        pose.eye = 'squint';
        pose.mouth = 'flat';
        pose.handR = { x: 220, y: 1050 };
        pose.bendR = -1;
      } else if (t < 15.5) {
        pose.brow = 'determined';
        pose.eye = 'squint';
        pose.mouth = 'grit';
        pose.lean = 0.2;
        pose.handR = { x: 200, y: 1100 };
        pose.bendR = -1;
      } else {
        pose.brow = 'determined';
        pose.eye = 'squint';
        pose.mouth = 'flat';
        pose.lean = 0.1;
        pose.handL = { x: 200, y: 1000 };
        pose.handR = { x: 350, y: 950 };
        pose.bendL = -1;
        pose.bendR = -1;
      }
    } else if (t < 25.0) {
      // Shot 5: Victory!
      if (t < 21.0) {
        pose.brow = 'raised';
        pose.eye = 'wide';
        pose.mouth = 'o';
        pose.look = 'up';
        pose.headDrop = -10;
      } else if (t < 22.5) {
        pose.brow = 'raised';
        pose.eye = 'happy';
        pose.mouth = 'grin';
        pose.handL = { x: 200, y: 800 };
        pose.handR = { x: 880, y: 800 };
        pose.bendL = -1;
        pose.bendR = -1;
      } else if (t < 24.0) {
        pose.brow = 'raised';
        pose.eye = 'happy';
        pose.mouth = 'grin';
        pose.handL = { x: 150, y: 750 };
        pose.handR = { x: 930, y: 750 };
        pose.bendL = -1;
        pose.bendR = -1;
      } else {
        pose.brow = 'raised';
        pose.eye = 'wide';
        pose.mouth = 'o';
        pose.look = 'up';
        pose.headDrop = -5;
        pose.handL = { x: 200, y: 900 };
        pose.handR = { x: 880, y: 900 };
        pose.bendL = -1;
        pose.bendR = -1;
      }
    } else if (t < 26.0) {
      // Shot 6 start: Freeze with arms up as cup falls
      pose.brow = 'raised';
      pose.eye = 'wide';
      pose.mouth = 'o';
      pose.look = 'up';
      pose.headDrop = -5;
      pose.handL = { x: 200, y: 800 };
      pose.handR = { x: 880, y: 800 };
      pose.bendL = -1;
      pose.bendR = -1;
    } else if (t < 28.0) {
      // Slowly lowering arms
      const u = smooth((t - 26.0) / 2.0);
      pose.brow = lerpBrow('raised', 'angry', u);
      pose.eye = u < 0.5 ? 'wide' : 'squint';
      pose.mouth = u < 0.5 ? 'o' : 'grit';
      pose.handL = lerpPt({ x: 200, y: 800 }, { x: 280, y: 1150 }, u);
      pose.handR = lerpPt({ x: 880, y: 800 }, { x: 800, y: 1150 }, u);
      pose.bendL = -1;
      pose.bendR = -1;
      pose.fistL = u > 0.7;
      pose.fistR = u > 0.7;
    } else {
      // Final furious stare
      pose.brow = 'angry';
      pose.eye = 'squint';
      pose.mouth = 'grit';
      pose.lean = 0.05;
      pose.handL = { x: 280, y: 1150 };
      pose.handR = { x: 800, y: 1150 };
      pose.fistL = true;
      pose.fistR = true;
    }

    return pose;
  }

  private defaultPose(): Pose {
    return {
      lean: 0,
      headTilt: 0,
      headDrop: 0,
      headTurn: 0,
      look: 'front',
      mouth: 'flat',
      brow: 'normal',
      eye: 'open',
      legs: 'stand',
      walkPhase: 0,
      handL: { x: 200, y: 1100 },
      handR: { x: 380, y: 1100 },
      bendL: 1,
      bendR: 1,
      fistL: false,
      fistR: false,
      fingersR: 0,
      pointR: false,
      beanieOn: true,
      anger: 0,
    };
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
    layer: 'body' | 'front'
  ) {
    const lean = pose.lean;
    const shoulderY = hipY - 170;
    const bodyTopX = hipX + Math.sin(lean) * 170;

    ctx.save();
    ctx.lineCap = 'round';

    if (layer === 'body') {
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

    // Arms (IK)
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

    const drawHand = (a: Arm, fist: boolean, fingers: number, point: boolean) => {
      ctx.fillStyle = WHITE;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(a.hx, a.hy, point ? 16 : fist ? 15 : 12, 0, TAU);
      ctx.fill();
      ctx.stroke();
      if (point) {
        ctx.strokeStyle = INK;
        ctx.lineWidth = 17;
        ctx.beginPath();
        ctx.moveTo(a.hx - 2, a.hy - 4);
        ctx.lineTo(a.hx - 22, a.hy + 32);
        ctx.stroke();
        ctx.strokeStyle = WHITE;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(a.hx - 2, a.hy - 4);
        ctx.lineTo(a.hx - 22, a.hy + 32);
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
    drawHand(arms.l, pose.fistL, 0, false);
    drawHand(arms.r, pose.fistR, pose.fingersR, pose.pointR);

    if (layer === 'front') {
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

    // Red beanie (if on)
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
      ctx.fillStyle = '#ff6b6b';
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
    } else if (pose.eye === 'peek') {
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(fx - eyeDX, eyeY + 8, 14, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(fx + eyeDX, eyeY, 11, 9, 0, 0, TAU);
      ctx.fill();
    } else if (pose.eye === 'happy') {
      ctx.lineWidth = 7;
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(fx + side * eyeDX, eyeY + 6, 14, Math.PI * 1.12, Math.PI * 1.88);
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
    const twitch = t < 4.0 ? Math.sin(t * 15) * 2 : 0;
    ctx.beginPath();
    if (pose.brow === 'angry' || pose.brow === 'determined') {
      ctx.moveTo(fx - 42, browY - 8);
      ctx.lineTo(fx - 12, browY + 8 + twitch);
      ctx.moveTo(fx + 42, browY - 8);
      ctx.lineTo(fx + 12, browY + 8 - twitch);
    } else if (pose.brow === 'raised') {
      ctx.moveTo(fx - 42, browY - 8);
      ctx.lineTo(fx - 12, browY - 8);
      ctx.moveTo(fx + 42, browY - 8);
      ctx.lineTo(fx + 12, browY - 8);
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
      ctx.ellipse(fx, my, 14, 18, 0, 0, TAU);
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

  private drawBlueBall(ctx: CanvasRenderingContext2D, t: number, charX: number, hipY: number, pose: Pose, arms: { l: Arm; r: Arm }) {
    // Blue ball in hand during shot 1, then flicked
    if (t >= 4.5) return; // Ball is flicked away

    const R = 18;
    // In left hand initially
    const handL = arms.l;
    
    ctx.save();
    ctx.translate(handL.hx, handL.hy + 26);

    // Shadow
    ctx.fillStyle = 'rgba(20, 20, 20, 0.15)';
    ctx.beginPath();
    ctx.ellipse(0, 8, R, R * 0.3, 0, 0, TAU);
    ctx.fill();

    // Ball
    ctx.fillStyle = BALL_BLUE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.arc(-R * 0.3, -R * 0.3, R * 0.4, 0, TAU);
    ctx.fill();

    ctx.restore();
  }

  private drawCaptions(ctx: CanvasRenderingContext2D, t: number) {
    const line = this.captions.find((c) => t >= c.from && t < c.to);
    if (!line) return;

    const u = clamp((t - line.from) / 0.1, 0, 1);
    const fade = Math.min(1, (line.to - t) / 0.2);
    const alpha = clamp(Math.min((t - line.from) / 0.05, fade), 0, 1);
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

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = Math.max(14, size * 0.26);
    ctx.strokeText(line.text, 0, 0);
    ctx.fillStyle = WHITE;
    ctx.fillText(line.text, 0, 0);
    ctx.restore();
  }
}

function keyAt(keys: [number, number][], t: number): number {
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, v0] = keys[i];
    const [t1, v1] = keys[i + 1];
    if (t >= t0 && t <= t1) {
      const u = smooth((t - t0) / (t1 - t0));
      return lerp(v0, v1, u);
    }
  }
  return keys[keys.length - 1][1];
}

function lerpBrow(a: BrowShape, b: BrowShape, u: number): BrowShape {
  if (u < 0.5) return a;
  return b;
}