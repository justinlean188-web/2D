import { StudioConfig } from '../types';

/**
 * PopStageRenderer
 *
 * "Max, Rex & Beep" — a 58-second vertical pop-comedy short for the pop-star
 * episode: a colourful concert stage, two jealous pop-star stickmen, and a
 * tiny cleaning robot who steals the show.
 *
 * Same character language as the Paper Ball series (round white heads, thin
 * black limbs) but dressed for the stage: shiny jackets, vibrant concert
 * lighting, confetti and big readable captions.
 */

interface Vec {
  x: number;
  y: number;
}

interface Face {
  eye: 'normal' | 'wide' | 'happy' | 'closed' | 'angry' | 'deadpan' | 'star' | 'shock';
  brow: 'neutral' | 'raised' | 'angry' | 'sad' | 'smug' | 'oneRaised';
  mouth: 'flat' | 'smile' | 'grin' | 'smirk' | 'open' | 'o' | 'grit' | 'frown' | 'wobble';
  gazeX: number;
  gazeY: number;
  pupil: number;
  flush: boolean;
}

interface Arm {
  x: number;
  y: number;
  elbow: number;
  style: 'relaxed' | 'fist' | 'open' | 'point' | 'hold' | 'wave';
}

interface Leg {
  x: number;
  y: number;
  knee: number;
}

interface CameraKey {
  t: number;
  x: number;
  y: number;
  zoom: number;
}

interface Caption {
  text: string;
  from: number;
  to: number;
}

const TAU = Math.PI * 2;

const COLORS = {
  bgTop: '#1b0f38',
  bgBottom: '#3a1f63',
  stage: '#4b2f86',
  stageEdge: '#6a45b8',
  screen: '#120a26',
  purple: '#a855f7',
  purpleDark: '#6d28d9',
  blue: '#38bdf8',
  blueDark: '#1d4ed8',
  pink: '#f472b6',
  cyan: '#22d3ee',
  gold: '#fbbf24',
  ink: '#0b0618',
};

const CAPTIONS: Caption[] = [
  { text: 'MAX WANTS TO BE A SUPERSTAR!', from: 1.0, to: 6.6 },
  { text: 'REX WANTS ALL THE ATTENTION!', from: 7.6, to: 13.6 },
  { text: 'MAX WANTS TO IMPRESS EVERYONE!', from: 14.6, to: 22.6 },
  { text: 'BEEP JUST WANTS TO CLEAN!', from: 23.6, to: 31.6 },
  { text: 'NOBODY EXPECTED THIS!', from: 32.6, to: 42.6 },
  { text: 'BEEP BECOMES THE STAR!', from: 43.6, to: 51.6 },
  { text: 'FOLLOW YOUR DREAM… OR JUST CLEAN UP!', from: 52.6, to: 57.6 },
];

export class PopStageRenderer {
  public readonly width = 1080;
  public readonly height = 1920;

  private readonly floorY = 1450;

  private readonly maxX = 360;
  private readonly rexX = 700;

  private readonly cameraKeys: CameraKey[] = [
    { t: 0.0, x: 540, y: 1000, zoom: 1.0 },
    { t: 3.0, x: 500, y: 980, zoom: 1.08 },
    { t: 6.8, x: 470, y: 980, zoom: 1.12 },
    { t: 8.0, x: 560, y: 990, zoom: 1.02 },
    { t: 13.6, x: 600, y: 980, zoom: 1.05 },
    { t: 15.0, x: 540, y: 1000, zoom: 1.0 },
    { t: 18.6, x: 500, y: 990, zoom: 1.12 },
    { t: 20.0, x: 620, y: 990, zoom: 1.06 },
    { t: 23.0, x: 540, y: 1000, zoom: 1.0 },
    { t: 26.0, x: 460, y: 1000, zoom: 1.02 },
    { t: 30.0, x: 470, y: 1000, zoom: 1.05 },
    { t: 33.0, x: 500, y: 1000, zoom: 1.12 },
    { t: 40.0, x: 520, y: 990, zoom: 1.18 },
    { t: 44.0, x: 540, y: 1000, zoom: 1.02 },
    { t: 49.0, x: 560, y: 1000, zoom: 0.98 },
    { t: 53.0, x: 500, y: 1000, zoom: 1.04 },
    { t: 56.0, x: 460, y: 990, zoom: 1.12 },
    { t: 58.0, x: 440, y: 980, zoom: 1.18 },
  ];

  public render(ctx: CanvasRenderingContext2D, time: number, config: StudioConfig) {
    const t = Math.max(0, Math.min(58, time));

    const camera = this.getCamera(t);
    ctx.save();
    ctx.translate(this.width / 2 + camera.shakeX, this.height / 2 + camera.shakeY);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x, -camera.y);

    this.renderBackdrop(ctx, t);
    this.renderStageFloor(ctx);
    this.renderLights(ctx, t);
    this.renderScreen(ctx, t);

    this.renderCushions(ctx);
    this.renderTrash(ctx, t);
    this.renderSpeaker(ctx, t);
    this.renderMic(ctx, t);

    // Rex is behind Max, the robot in front.
    this.drawRex(ctx, t);
    this.drawMax(ctx, t);
    this.drawBeep(ctx, t);

    this.renderProps(ctx, t);
    this.renderConfetti(ctx, t);
    this.renderEffects(ctx, t);

    ctx.restore();

    this.renderCaption(ctx, t);

    if (config.showSafeZones) {
      this.renderSafeZones(ctx);
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
        const e = u * u * (3 - 2 * u);
        x = a.x + (b.x - a.x) * e;
        y = a.y + (b.y - a.y) * e;
        zoom = a.zoom + (b.zoom - a.zoom) * e;
        break;
      }
      if (t > b.t) {
        x = b.x;
        y = b.y;
        zoom = b.zoom;
      }
    }

    let shakeX = 0;
    let shakeY = 0;
    const hits = [
      { at: 5.1, amp: 7 },
      { at: 12.4, amp: 6 },
      { at: 18.6, amp: 12 },
      { at: 21.4, amp: 8 },
      { at: 29.0, amp: 5 },
      { at: 39.0, amp: 5 },
      { at: 44.4, amp: 6 },
      { at: 47.8, amp: 11 },
      { at: 49.8, amp: 9 },
      { at: 57.6, amp: 8 },
    ];
    for (const hit of hits) {
      const age = t - hit.at;
      if (age >= 0 && age < 0.3) {
        const decay = Math.exp(-age * 13);
        shakeX += Math.sin(age * 120 + hit.at) * hit.amp * decay;
        shakeY += Math.cos(age * 101 + hit.at) * hit.amp * decay;
      }
    }

    return { x, y, zoom, shakeX, shakeY };
  }

  // ==========================================================
  // STAGE
  // ==========================================================

  private renderBackdrop(ctx: CanvasRenderingContext2D, t: number) {
    const grad = ctx.createLinearGradient(0, 0, 0, this.floorY);
    grad.addColorStop(0, COLORS.bgTop);
    grad.addColorStop(1, COLORS.bgBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(-400, -400, 1800, this.floorY + 400);
  }

  private renderStageFloor(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = COLORS.stage;
    ctx.fillRect(-400, this.floorY, 1800, 900);
    ctx.fillStyle = COLORS.stageEdge;
    ctx.fillRect(-400, this.floorY, 1800, 16);
  }

  private renderLights(ctx: CanvasRenderingContext2D, t: number) {
    // The lighting rig across the top.
    ctx.fillStyle = '#160d2b';
    ctx.fillRect(-400, 120, 1800, 40);

    const lamps: { x: number; color: string; on: number }[] = [
      { x: 180, color: COLORS.purple, on: 0.5 },
      { x: 440, color: COLORS.blue, on: 0.4 },
      { x: 700, color: COLORS.pink, on: 0.35 },
      { x: 940, color: COLORS.cyan, on: 0.3 },
    ];

    lamps.forEach((lamp, i) => {
      const pulse = 0.75 + Math.sin(t * 3.1 + i * 1.7) * 0.25;
      ctx.save();
      ctx.globalAlpha = 0.16 * lamp.on * pulse * 2.2;
      ctx.fillStyle = lamp.color;
      ctx.beginPath();
      ctx.moveTo(lamp.x - 26, 150);
      ctx.lineTo(lamp.x + 26, 150);
      ctx.lineTo(lamp.x + 250, this.floorY);
      ctx.lineTo(lamp.x - 250, this.floorY);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // The lamp housing.
      ctx.fillStyle = '#241640';
      ctx.beginPath();
      ctx.ellipse(lamp.x, 150, 30, 18, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = lamp.color;
      ctx.globalAlpha = 0.35 + lamp.on * pulse * 0.5;
      ctx.beginPath();
      ctx.arc(lamp.x, 150, 12, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;
    });
  }

  /** The big concert screen with the cheering crowd. */
  private renderScreen(ctx: CanvasRenderingContext2D, t: number) {
    const x = 90;
    const y = 230;
    const w = 900;
    const h = 440;

    ctx.fillStyle = COLORS.screen;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#3a2566';
    ctx.lineWidth = 10;
    ctx.strokeRect(x, y, w, h);

    // Crowd figures: simple colourful stick people with raised arms.
    const rows = [
      { base: y + h - 40, scale: 0.72, count: 13, color: '#6d28d9', phase: 0.0 },
      { base: y + h - 120, scale: 0.9, count: 11, color: '#2563eb', phase: 0.6 },
      { base: y + h - 215, scale: 1.12, count: 9, color: '#db2777', phase: 1.2 },
    ];

    const wild = t >= 32 && t < 47 ? 1.7 : 1;
    rows.forEach((row, r) => {
      for (let i = 0; i < row.count; i++) {
        const cx = x + 40 + (i * (w - 80)) / (row.count - 1);
        const bounce = Math.abs(Math.sin(t * 3.4 * wild + row.phase + i * 0.7));
        const cy = row.base - bounce * 16 * wild;
        const s = row.scale;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(s, s);
        ctx.strokeStyle = row.color;
        ctx.lineWidth = 7;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -46);
        ctx.stroke();
        // Arms up, cheering.
        const raise = 16 + bounce * 10;
        ctx.beginPath();
        ctx.moveTo(0, -40);
        ctx.lineTo(-22, -40 - raise);
        ctx.moveTo(0, -40);
        ctx.lineTo(22, -40 - raise);
        ctx.stroke();
        ctx.fillStyle = row.color;
        ctx.beginPath();
        ctx.arc(0, -64, 12, 0, TAU);
        ctx.fill();
        ctx.restore();
      }
    });
  }

  // ==========================================================
  // PROPS
  // ==========================================================

  /** The stage monitor speaker the microphone plugs into. */
  private renderSpeaker(ctx: CanvasRenderingContext2D, t: number) {
    const x = 620;
    const y = this.floorY;

    // Cabinet
    ctx.fillStyle = '#241b38';
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(x - 52, y - 128, 104, 128, 10);
    ctx.fill();
    ctx.stroke();

    // Speakers
    ctx.fillStyle = '#3b2d5c';
    ctx.beginPath();
    ctx.arc(x, y - 84, 30, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = '#7b6ba8';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#4d3c76';
    ctx.beginPath();
    ctx.arc(x, y - 84, 12, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#3b2d5c';
    ctx.beginPath();
    ctx.arc(x, y - 32, 15, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = '#7b6ba8';
    ctx.stroke();

    // The cable: loose until the robot rolls the microphone into it.
    const plugged = t >= 28.6;
    ctx.strokeStyle = plugged ? '#2a2340' : '#3b2d5c';
    ctx.lineWidth = 5;
    ctx.beginPath();
    if (plugged) {
      ctx.moveTo(520, this.floorY - 8);
      ctx.quadraticCurveTo(570, this.floorY - 26, x - 50, y - 22);
    } else {
      ctx.moveTo(520, this.floorY - 8);
      ctx.quadraticCurveTo(556, this.floorY - 40, 500, this.floorY - 58);
    }
    ctx.stroke();

    if (plugged) {
      ctx.fillStyle = '#cbd5f5';
      ctx.beginPath();
      ctx.roundRect(x - 62, y - 34, 18, 12, 4);
      ctx.fill();
      ctx.strokeStyle = COLORS.ink;
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  }

  private renderCushions(ctx: CanvasRenderingContext2D) {
    const colors = [COLORS.pink, COLORS.cyan, COLORS.purple, COLORS.gold];
    const cushions = [
      { x: 905, y: 1420, w: 150, h: 70, c: colors[0] },
      { x: 990, y: 1395, w: 120, h: 60, c: colors[1] },
      { x: 880, y: 1360, w: 130, h: 60, c: colors[2] },
    ];
    cushions.forEach((cu) => {
      ctx.fillStyle = cu.c;
      ctx.strokeStyle = COLORS.ink;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.ellipse(cu.x, cu.y, cu.w / 2, cu.h / 2, 0, 0, TAU);
      ctx.fill();
      ctx.stroke();
    });
  }

  private renderTrash(ctx: CanvasRenderingContext2D, t: number) {
    const x = 120;
    const y = this.floorY;
    ctx.fillStyle = '#2b2140';
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(x - 46, y - 110);
    ctx.lineTo(x + 46, y - 110);
    ctx.lineTo(x + 34, y);
    ctx.lineTo(x - 34, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#6b5a8f';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x - 50, y - 116);
    ctx.lineTo(x + 50, y - 116);
    ctx.stroke();
  }

  /** The microphone on the stage floor. Drawn under the performers. */
  private renderMic(ctx: CanvasRenderingContext2D, t: number) {
    if (t < 21.2) return;
    if (t < 22.2) {
      const u = (t - 21.2) / 1.0;
      const x = 752 + u * 330;
      const y = 1284 - Math.sin(u * Math.PI) * 560;
      this.drawMic(ctx, x, y, 0.9, u, t);
      return;
    }
    this.drawMic(ctx, 520, this.floorY - 14, 1, 1, t);
  }

  /** The crown. */
  private renderProps(ctx: CanvasRenderingContext2D, t: number) {
    // The crown is tossed into the trash at 55.6s and stays there.
    if (t >= 55.35 && t < 55.95) {
      const u = Math.min(1, (t - 55.4) / 0.5);
      const cx = 200 - u * 80;
      const cy = 960 - 40 * Math.sin(u * Math.PI) + 390 * u * u;
      this.drawCrown(ctx, cx, cy, 1 - u * 0.12, 1 - u * 0.15);
    } else if (t >= 55.95) {
      this.drawCrown(ctx, 120, this.floorY - 92, 0.85, 1);
    }

    // The microphone: Rex's sparkling mic, then kicked into the audience.
  }

  private drawMic(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    scale: number,
    sparkle: number,
    time: number
  ) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.5);
    ctx.scale(scale, scale);

    ctx.fillStyle = '#2b2b3d';
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(-11, -70, 22, 70, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#d9d9e8';
    ctx.beginPath();
    ctx.arc(0, -80, 19, 0, TAU);
    ctx.fill();
    ctx.stroke();

    if (sparkle > 0) {
      ctx.strokeStyle = COLORS.cyan;
      ctx.lineWidth = 3;
      for (let i = 0; i < 4; i++) {
        const a = (i * TAU) / 4 + time * 2;
        const r = 26 + Math.sin(time * 8 + i) * 5;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * r, -80 + Math.sin(a) * r);
        ctx.lineTo(Math.cos(a) * (r + 12), -80 + Math.sin(a) * (r + 12));
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  private drawCrown(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    scale: number,
    alpha: number
  ) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = COLORS.gold;
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-26, 10);
    ctx.lineTo(-26, -10);
    ctx.lineTo(-13, 2);
    ctx.lineTo(0, -16);
    ctx.lineTo(13, 2);
    ctx.lineTo(26, -10);
    ctx.lineTo(26, 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // ==========================================================
  // MAX
  // ==========================================================

  private drawMax(ctx: CanvasRenderingContext2D, t: number) {
    let x = this.maxX;
    let y = this.floorY;
    let rotation = 0;
    let jump = 0;
    let squashX = 1;
    let squashY = 1;
    let headTilt = 0;

    const face: Face = {
      eye: 'normal',
      brow: 'neutral',
      mouth: 'flat',
      gazeX: 0.2,
      gazeY: 0,
      pupil: 1,
      flush: false,
    };

    let leftArm: Arm = { x: -62, y: -60, elbow: -20, style: 'relaxed' };
    let rightArm: Arm = { x: 62, y: -60, elbow: 20, style: 'relaxed' };
    let leftLeg: Leg = { x: -46, y: 300, knee: -12 };
    let rightLeg: Leg = { x: 50, y: 300, knee: 12 };
    let showBrush = false;
    let brokenBrush = false;
    let micKick = false;

    if (t < 7) {
      // Watching the screen, then dreaming of stardom.
      if (t < 1.2) {
        face.gazeX = -0.5;
        face.gazeY = -0.6;
        face.brow = 'neutral';
      } else if (t < 2.6) {
        face.gazeX = 0.1;
        face.gazeY = -0.7;
        face.brow = 'raised';
        face.eye = 'wide';
        leftArm = { x: -110, y: -170, elbow: -34, style: 'open' };
        rightArm = { x: 110, y: -170, elbow: 34, style: 'open' };
      } else if (t < 3.6) {
        face.brow = 'smug';
        face.mouth = 'smile';
        showBrush = true;
        rightArm = { x: 58, y: -180, elbow: 16, style: 'hold' };
      } else if (t < 5.0) {
        face.brow = 'smug';
        face.mouth = 'grin';
        showBrush = true;
        const sway = Math.sin(t * 5) * 10;
        rightArm = { x: 52 + sway, y: -196, elbow: 12, style: 'hold' };
        leftArm = { x: -120, y: -150 + sway, elbow: -40, style: 'open' };
        rotation = Math.sin(t * 2.6) * 0.05;
      } else if (t < 5.9) {
        face.brow = 'shock' as never;
        face.eye = 'shock';
        face.mouth = 'o';
        showBrush = true;
        brokenBrush = true;
        rightArm = { x: 62, y: -170, elbow: 12, style: 'hold' };
        squashX = 1.08;
        squashY = 0.94;
      } else {
        face.eye = 'closed';
        face.mouth = 'wobble';
        face.brow = 'sad';
        showBrush = true;
        brokenBrush = true;
        rightArm = { x: 60, y: -160, elbow: 14, style: 'hold' };
      }
    } else if (t < 14) {
      // Offended, then glaring at Rex.
      if (t < 9.0) {
        face.gazeX = 0.85;
        face.brow = 'oneRaised';
        face.mouth = 'frown';
      } else {
        face.gazeX = 0.9;
        face.brow = 'angry';
        face.mouth = 'grit';
        leftArm = { x: -70, y: -80, elbow: -34, style: 'fist' };
        rightArm = { x: 70, y: -80, elbow: 34, style: 'fist' };
      }
      if (t > 12.2) {
        const flinch = Math.sin(t * 24) * 6;
        x += flinch;
      }
    } else if (t < 23) {
      // The dance routine.
      if (t < 16.0) {
        // Spinning.
        rotation = (t - 14) * 7.2;
        face.eye = 'happy';
        face.mouth = 'grin';
        leftArm = { x: -120, y: -180, elbow: -40, style: 'open' };
        rightArm = { x: 120, y: -180, elbow: 40, style: 'open' };
        jump = Math.abs(Math.sin(t * 9)) * 22;
      } else if (t < 18.0) {
        // Moonwalking.
        const u = (t - 16) / 2;
        x = this.maxX - u * 120;
        rotation = -0.18;
        face.mouth = 'smile';
        face.brow = 'oneRaised';
        leftLeg = { x: -30 - u * 90, y: 300, knee: -6 };
        rightLeg = { x: 40 - u * 90, y: 300, knee: 6 };
        leftArm = { x: -90, y: -120, elbow: -34, style: 'fist' };
        rightArm = { x: 92, y: -120, elbow: 34, style: 'fist' };
      } else if (t < 19.6) {
        // The backflip, then a tangled heap.
        const u = (t - 18) / 1.2;
        if (u < 0.55) {
          jump = Math.sin(u * Math.PI) * 150;
          rotation = u * Math.PI * 2.6;
          face.eye = 'wide';
          face.mouth = 'o';
          leftArm = { x: -90, y: -150, elbow: -30, style: 'open' };
          rightArm = { x: 90, y: -150, elbow: 30, style: 'open' };
        } else {
          // Tangled heap.
          const v = (u - 0.55) / 0.45;
          y = this.floorY - 40 * (1 - v);
          squashY = 0.34 + v * 0.1;
          squashX = 1.9;
          face.eye = 'wide';
          face.mouth = 'wobble';
          leftArm = { x: -120, y: 10, elbow: -20, style: 'open' };
          rightArm = { x: 120, y: 0, elbow: 20, style: 'open' };
          leftLeg = { x: -150, y: 20, knee: -4 };
          rightLeg = { x: 150, y: 10, knee: 4 };
        }
      } else if (t < 21.0) {
        // Getting up, sulking.
        face.brow = 'angry';
        face.mouth = 'frown';
        rightArm = { x: 72, y: -84, elbow: 22, style: 'fist' };
      } else {
        // A bigger jump that kicks the microphone away.
        const u = (t - 21) / 2;
        jump = Math.sin(u * Math.PI) * 190;
        rotation = Math.sin(u * Math.PI) * 0.25;
        face.eye = 'wide';
        face.mouth = 'open';
        rightLeg = { x: 60, y: 300 - Math.sin(u * Math.PI) * 90, knee: 18 };
        leftArm = { x: -110, y: -170, elbow: -36, style: 'open' };
        rightArm = { x: 120, y: -200, elbow: 30, style: 'open' };
        micKick = true;
      }
    } else if (t < 32) {
      // Arguing with Rex in the background.
      face.gazeX = 0.9;
      face.brow = 'angry';
      face.mouth = t % 0.6 < 0.3 ? 'open' : 'grit';
      const gest = Math.sin(t * 7);
      leftArm = { x: -80 - gest * 30, y: -110, elbow: -30, style: 'open' };
      rightArm = { x: 80 + gest * 20, y: -100, elbow: 30, style: 'fist' };
    } else if (t < 43) {
      // Frozen in disbelief.
      face.eye = 'wide';
      face.brow = 'raised';
      face.mouth = 'o';
      leftArm = { x: -74, y: -70, elbow: -24, style: 'relaxed' };
      rightArm = { x: 74, y: -70, elbow: 24, style: 'relaxed' };
    } else if (t < 52) {
      if (t < 47.0) {
        face.eye = 'wide';
        face.brow = 'raised';
        face.mouth = 'o';
      } else if (t < 48.8) {
        // Copying the dance and falling flat.
        const u = (t - 47) / 1.8;
        if (u < 0.6) {
          rotation = Math.sin(u * Math.PI * 2) * 0.8;
          jump = Math.abs(Math.sin(u * Math.PI * 3)) * 60;
          face.mouth = 'open';
          leftArm = { x: -120, y: -170, elbow: -40, style: 'open' };
          rightArm = { x: 120, y: -170, elbow: 40, style: 'open' };
        } else {
          const v = (u - 0.6) / 0.4;
          y = this.floorY - 90 * (1 - v);
          rotation = -1.45;
          squashY = 0.3;
          squashX = 1.8;
          face.eye = 'wide';
          face.mouth = 'o';
          leftArm = { x: -110, y: 20, elbow: -16, style: 'open' };
          rightArm = { x: 110, y: 10, elbow: 16, style: 'open' };
        }
      } else {
        face.brow = 'sad';
        face.mouth = 'frown';
        rightArm = { x: 78, y: -86, elbow: 24, style: 'fist' };
      }
    } else {
      // Reluctantly cleaning the confetti.
      face.brow = 'sad';
      face.mouth = 'frown';
      const sweep = Math.sin(t * 5) * 22;
      rightArm = { x: 86 + sweep, y: -70, elbow: 26, style: 'hold' };
      leftArm = { x: -70, y: -60, elbow: -20, style: 'relaxed' };
      if (t >= 55.8) {
        face.gazeX = -0.6;
        face.eye = 'wide';
        face.mouth = 'o';
        face.brow = 'raised';
      }
    }

    this.drawSinger(ctx, {
      x,
      y,
      rotation,
      jump,
      squashX,
      squashY,
      headTilt,
      face,
      leftArm,
      rightArm,
      leftLeg,
      rightLeg,
      jacket: COLORS.purple,
      jacketDark: COLORS.purpleDark,
      name: 'MAX',
      showBrush,
      brokenBrush,
      broom: t >= 52 ? 'right' : undefined,
    });
  }

  // ==========================================================
  // REX
  // ==========================================================

  private drawRex(ctx: CanvasRenderingContext2D, t: number) {
    let x = this.rexX;
    let y = this.floorY;
    let rotation = 0;
    let jump = 0;
    let squashX = 1;
    let squashY = 1;

    const face: Face = {
      eye: 'normal',
      brow: 'smug',
      mouth: 'smirk',
      gazeX: 0.3,
      gazeY: 0,
      pupil: 1,
      flush: false,
    };

    let leftArm: Arm = { x: -62, y: -60, elbow: -20, style: 'relaxed' };
    let rightArm: Arm = { x: 62, y: -60, elbow: 20, style: 'relaxed' };
    let leftLeg: Leg = { x: -46, y: 300, knee: -12 };
    let rightLeg: Leg = { x: 50, y: 300, knee: 12 };
    let showMic = false;

    if (t < 7) {
      // Not on stage yet.
      return;
    }

    if (t < 14) {
      // Walking in, then taking the centre spotlight.
      if (t < 8.6) {
        const u = (t - 7) / 1.6;
        x = 1060 - u * 340;
        face.gazeX = -0.5;
        face.mouth = 'smile';
        leftLeg = { x: -46 - u * 40, y: 300, knee: -12 };
        rightLeg = { x: 50 - u * 40, y: 300, knee: 12 };
        showMic = true;
        rightArm = { x: 58, y: -150, elbow: 14, style: 'hold' };
      } else {
        const u = (t - 8.6) / 2;
        x = 720 - u * 60;
        face.gazeX = -0.7;
        face.mouth = 'grin';
        showMic = true;
        rightArm = { x: 56, y: -160, elbow: 12, style: 'hold' };
        if (t > 10.5) {
          face.brow = 'smug';
          face.eye = 'normal';
        }
      }
    } else if (t < 23) {
      showMic = true;
      if (t < 19.4) {
        face.gazeX = -0.6;
        face.mouth = 'frown';
        face.brow = 'angry';
        leftArm = { x: -72, y: -80, elbow: -30, style: 'fist' };
        rightArm = { x: 58, y: -158, elbow: 14, style: 'hold' };
      } else if (t < 21.2) {
        // Laughing, then a perfect spin.
        const u = (t - 19.4) / 1.8;
        if (u < 0.25) {
          face.eye = 'happy';
          face.mouth = 'grin';
          rotation = Math.sin(t * 18) * 0.08;
        } else {
          rotation = (t - 19.85) * 11;
          face.mouth = 'open';
          jump = Math.abs(Math.sin(t * 11)) * 26;
          leftArm = { x: -118, y: -180, elbow: -40, style: 'open' };
          rightArm = { x: 118, y: -180, elbow: 40, style: 'open' };
        }
      } else {
        face.gazeX = -0.6;
        face.brow = 'smug';
        face.mouth = 'smirk';
        rightArm = { x: 56, y: -160, elbow: 12, style: 'hold' };
        showMic = false;
      }
    } else if (t < 32) {
      face.gazeX = -0.9;
      face.brow = 'angry';
      face.mouth = t % 0.6 < 0.3 ? 'open' : 'grit';
      const gest = Math.sin(t * 7 + 1.4);
      leftArm = { x: -84 + gest * 24, y: -116, elbow: -30, style: 'open' };
      rightArm = { x: 84, y: -100, elbow: 30, style: 'fist' };
    } else if (t < 43) {
      face.eye = 'wide';
      face.brow = 'raised';
      face.mouth = 'o';
    } else if (t < 52) {
      if (t < 48.6) {
        face.eye = 'wide';
        face.brow = 'raised';
        face.mouth = 'o';
      } else if (t < 50.8) {
        // Trying the spin and sliding into the cushions.
        const u = (t - 48.6) / 2.2;
        if (u < 0.45) {
          rotation = (t - 48.6) * 9;
          face.mouth = 'open';
          jump = Math.abs(Math.sin(t * 10)) * 30;
          leftArm = { x: -118, y: -180, elbow: -40, style: 'open' };
          rightArm = { x: 118, y: -180, elbow: 40, style: 'open' };
        } else {
          const v = (u - 0.45) / 0.55;
          x = this.rexX + v * 210;
          rotation = v * 0.5;
          squashY = 1 - v * 0.35;
          squashX = 1 + v * 0.4;
          face.eye = 'wide';
          face.mouth = 'o';
          leftArm = { x: -120, y: -120, elbow: -30, style: 'open' };
          rightArm = { x: 120, y: -120, elbow: 30, style: 'open' };
        }
      } else {
        face.brow = 'sad';
        face.mouth = 'frown';
      }
    } else {
      face.brow = 'sad';
      face.mouth = 'frown';
      const sweep = Math.sin(t * 5 + 1.1) * 22;
      leftArm = { x: -86 + sweep, y: -70, elbow: -26, style: 'hold' };
      rightArm = { x: 70, y: -60, elbow: 20, style: 'relaxed' };
      if (t >= 55.8) {
        face.gazeX = 0.6;
        face.eye = 'wide';
        face.mouth = 'o';
        face.brow = 'raised';
      }
    }

    this.drawSinger(ctx, {
      x,
      y,
      rotation,
      jump,
      squashX,
      squashY,
      headTilt: 0,
      face,
      leftArm,
      rightArm,
      leftLeg,
      rightLeg,
      jacket: COLORS.blue,
      jacketDark: COLORS.blueDark,
      name: 'REX',
      showMic,
      micTime: t,
      broom: t >= 52 ? 'left' : undefined,
    });
  }

  // ==========================================================
  // BEEP THE ROBOT
  // ==========================================================

  private drawBeep(ctx: CanvasRenderingContext2D, t: number) {
    if (t < 22.6) return;

    let x = 300;
    let y = this.floorY;
    let bounce = 0;
    let spin = 0;
    let brush = 0;
    let bow = 0;
    let crown = false;

    if (t < 26.0) {
      // Rolling on, sweeping up confetti.
      const u = (t - 22.6) / 3.4;
      x = 20 + u * 300;
      brush = Math.sin(t * 7) * 0.6;
      spin = t * 9;
    } else if (t < 28.6) {
      x = 330 + (t - 26) * 57.7;
      brush = Math.sin(t * 5) * 0.5;
      spin = t * 9;
    } else if (t < 32) {
      // Rolling over the microphone and bouncing to the beat.
      const u = (t - 28.6) / 3.4;
      x = 480 + u * 65;
      bounce = Math.abs(Math.sin(t * Math.PI * 2 * 124 / 60)) * 22;
      brush = Math.sin(t * 8) * 0.5;
      spin = t * 14;
    } else if (t < 43) {
      // Dance mode.
      const u = (t - 32) / 11;
      x = 410 + Math.sin(t * 1.3) * 60;
      bounce = Math.abs(Math.sin(t * Math.PI * 2 * 124 / 60)) * 34;
      brush = Math.sin(t * 9) * 0.9;
      spin = t * 26;
    } else if (t < 46.0) {
      // A flawless spin and a bow.
      const u = (t - 43) / 3;
      if (u < 0.6) {
        x = 470;
        spin = (t - 43) * 22;
        bounce = Math.abs(Math.sin(t * 18)) * 16;
      } else {
        const v = (u - 0.6) / 0.4;
        x = 470;
        bow = v * 0.5;
        bounce = 0;
      }
    } else if (t < 50.4) {
      // Standing by, then cleaning again.
      x = 470;
      brush = Math.sin(t * 6) * 0.5;
    } else if (t < 52.0) {
      x = 470;
      brush = Math.sin(t * 6) * 0.55;
      spin = t * 9;
    } else if (t < 54.4) {
      // Cleaning the confetti at the side of the stage.
      x = 250;
      brush = Math.sin(t * 6) * 0.55;
      spin = t * 9;
    } else if (t < 56.4) {
      // Rolling past with the crown, then pausing to drop it in the trash.
      if (t < 55.2) {
        x = 250 - (t - 54.4) * 62;
      } else {
        x = 200;
      }
      spin = t * 9;
      brush = Math.sin(t * 6) * 0.4;
      crown = t >= 54.4 && t < 55.4;
    } else {
      // Rolling away, dancing.
      const u = (t - 56.4) / 1.6;
      x = 200 - u * 280;
      bounce = Math.abs(Math.sin(t * Math.PI * 2 * 124 / 60)) * 26;
      brush = Math.sin(t * 9) * 0.8;
      spin = t * 22;
    }

    ctx.save();
    ctx.translate(x, y - bounce);
    ctx.rotate(bow);

    // Wheels
    ctx.fillStyle = '#2a2540';
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 4;
    [-26, 26].forEach((wx) => {
      ctx.save();
      ctx.translate(wx, -14);
      ctx.rotate(spin);
      ctx.beginPath();
      ctx.arc(0, 0, 15, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#8f86b5';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-9, 0);
      ctx.lineTo(9, 0);
      ctx.moveTo(0, -9);
      ctx.lineTo(0, 9);
      ctx.stroke();
      ctx.strokeStyle = COLORS.ink;
      ctx.lineWidth = 4;
      ctx.restore();
    });

    // Body
    ctx.fillStyle = '#f4f2ff';
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(-34, -92, 68, 62, 14);
    ctx.fill();
    ctx.stroke();

    // Head with a glowing blue screen face
    ctx.save();
    ctx.translate(0, -124);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(-42, -34, 84, 52, 14);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#101a33';
    ctx.beginPath();
    ctx.roundRect(-33, -24, 66, 30, 9);
    ctx.fill();
    ctx.fillStyle = COLORS.cyan;
    ctx.shadowColor = COLORS.cyan;
    ctx.shadowBlur = 16;
    [-14, 14].forEach((ex) => {
      ctx.beginPath();
      ctx.arc(ex, -9, 7.5, 0, TAU);
      ctx.fill();
    });
    ctx.shadowBlur = 0;
    ctx.restore();

    // Antenna
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, -158);
    ctx.lineTo(0, -182);
    ctx.stroke();
    ctx.fillStyle = COLORS.pink;
    ctx.beginPath();
    ctx.arc(0, -188, 7, 0, TAU);
    ctx.fill();

    // Cleaning brush arm
    ctx.save();
    ctx.translate(-34, -74);
    ctx.rotate(brush);
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-46, 26);
    ctx.stroke();
    ctx.strokeStyle = '#e8b23a';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(-46, 26);
    ctx.lineTo(-64, 44);
    ctx.stroke();
    ctx.strokeStyle = COLORS.gold;
    ctx.lineWidth = 3;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(-64 + i * 5, 44);
      ctx.lineTo(-70 + i * 5, 58);
      ctx.stroke();
    }
    ctx.restore();

    if (crown) {
      this.drawCrown(ctx, 0, -196, 0.9, 1);
    }

    ctx.restore();
  }

  // ==========================================================
  // SINGER DRAWING
  // ==========================================================

  private drawSinger(ctx: CanvasRenderingContext2D, opts: {
    x: number;
    y: number;
    rotation: number;
    jump: number;
    squashX: number;
    squashY: number;
    headTilt: number;
    face: Face;
    leftArm: Arm;
    rightArm: Arm;
    leftLeg: Leg;
    rightLeg: Leg;
    jacket: string;
    jacketDark: string;
    name: string;
    showBrush?: boolean;
    brokenBrush?: boolean;
    showMic?: boolean;
    micTime?: number;
    broom?: 'left' | 'right';
  }) {
    const {
      x,
      y,
      rotation,
      jump,
      squashX,
      squashY,
      headTilt,
      face,
      leftArm,
      rightArm,
      leftLeg,
      rightLeg,
      jacket,
      jacketDark,
      showBrush,
      brokenBrush,
      showMic,
      micTime = 0,
      broom,
    } = opts;

    ctx.save();
    ctx.translate(x, y - jump);
    ctx.rotate(rotation);
    ctx.scale(squashX, squashY);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Shadow
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(0, 6, 74, 14, 0, 0, TAU);
    ctx.fill();
    ctx.restore();

    // Legs
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 13;
    const drawLeg = (leg: Leg, side: number) => {
      const knee = {
        x: (leg.x + 0) * 0.5 + leg.x * 0.5 + leg.knee * 0.5,
        y: leg.y * 0.5,
      };
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(knee.x, knee.y);
      ctx.lineTo(leg.x, leg.y);
      ctx.stroke();
      // Shoe
      ctx.beginPath();
      ctx.moveTo(leg.x, leg.y);
      ctx.lineTo(leg.x + side * 26, leg.y + 2);
      ctx.stroke();
    };
    drawLeg(leftLeg, -1);
    drawLeg(rightLeg, 1);

    // Torso
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -220);
    ctx.stroke();

    // Arms
    const drawArm = (arm: Arm) => {
      const midX = arm.x * 0.5;
      const midY = arm.y * 0.5 - 110;
      const ex = midX + Math.cos(arm.elbow) * 26;
      const ey = midY + Math.sin(arm.elbow) * 26;
      ctx.strokeStyle = COLORS.ink;
      ctx.lineWidth = 11;
      ctx.beginPath();
      ctx.moveTo(0, -220);
      ctx.lineTo(ex, ey);
      ctx.lineTo(arm.x, arm.y);
      ctx.stroke();
      // Hand
      ctx.fillStyle = COLORS.ink;
      ctx.beginPath();
      ctx.arc(arm.x, arm.y, 8, 0, TAU);
      ctx.fill();
      if (arm.style === 'open') {
        ctx.strokeStyle = COLORS.ink;
        ctx.lineWidth = 4;
        for (let i = -1; i <= 1; i++) {
          ctx.beginPath();
          ctx.moveTo(arm.x, arm.y);
          ctx.lineTo(arm.x + i * 9, arm.y - 16);
          ctx.stroke();
        }
      }
    };
    drawArm(leftArm);
    drawArm(rightArm);

    // Shiny jacket
    ctx.save();
    ctx.translate(0, 0);
    ctx.fillStyle = jacket;
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-48, -252);
    ctx.lineTo(-34, -118);
    ctx.lineTo(34, -118);
    ctx.lineTo(48, -252);
    ctx.quadraticCurveTo(0, -238, -48, -252);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Shirt
    ctx.fillStyle = '#f6f4ff';
    ctx.beginPath();
    ctx.moveTo(-20, -250);
    ctx.lineTo(0, -196);
    ctx.lineTo(20, -250);
    ctx.closePath();
    ctx.fill();
    // Shiny highlight
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.beginPath();
    ctx.moveTo(-36, -244);
    ctx.lineTo(-26, -140);
    ctx.lineTo(-14, -142);
    ctx.lineTo(-24, -246);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Neck + head
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 11;
    ctx.beginPath();
    ctx.moveTo(0, -220);
    ctx.lineTo(0, -268);
    ctx.stroke();

    ctx.save();
    ctx.translate(0, -334);
    ctx.rotate(headTilt);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.ellipse(0, 0, 70, 70, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();

    if (face.flush) {
      ctx.fillStyle = 'rgba(244,114,182,0.45)';
      ctx.beginPath();
      ctx.ellipse(-38, 12, 16, 11, 0, 0, TAU);
      ctx.ellipse(38, 12, 16, 11, 0, 0, TAU);
      ctx.fill();
    }

    this.drawFaceFeatures(ctx, face);
    ctx.restore();

    // A hand broom for the clean-up beat.
    if (broom) {
      const arm = broom === 'left' ? leftArm : rightArm;
      const bx = arm.x;
      const by = arm.y;
      ctx.save();
      ctx.strokeStyle = COLORS.ink;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + 44, by + 78);
      ctx.stroke();
      ctx.fillStyle = '#e8b23a';
      ctx.strokeStyle = COLORS.ink;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(bx + 30, by + 62);
      ctx.lineTo(bx + 58, by + 58);
      ctx.lineTo(bx + 70, by + 92);
      ctx.lineTo(bx + 42, by + 96);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // The sparkling microphone in his hand.
    if (showMic) {
      this.drawMic(ctx, rightArm.x + 8, rightArm.y - 34, 0.85, 1, micTime);
    }

    // The hairbrush used as a microphone.
    if (showBrush) {
      const hx = rightArm.x;
      const hy = rightArm.y - 26;
      ctx.save();
      ctx.translate(hx, hy);
      ctx.rotate(-0.35);
      ctx.fillStyle = '#b06a3a';
      ctx.strokeStyle = COLORS.ink;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(-9, -46, 18, 46, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f4c07a';
      if (brokenBrush) {
        // The bristles have snapped off and are flying.
        ctx.beginPath();
        ctx.roundRect(-11, -52, 22, 12, 4);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.roundRect(-15, -66, 30, 18, 6);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = '#f7d08a';
        ctx.lineWidth = 2.5;
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.moveTo(-12 + i * 6, -64);
          ctx.lineTo(-12 + i * 6, -50);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    ctx.restore();
  }

  private drawFaceFeatures(ctx: CanvasRenderingContext2D, face: Face) {
    const eyeY = -8;
    const leftX = -26;
    const rightX = 24;
    const px = face.gazeX * 4;
    const py = face.gazeY * 4;

    ctx.strokeStyle = COLORS.ink;
    ctx.fillStyle = COLORS.ink;
    ctx.lineCap = 'round';

    // Eyes
    if (face.eye === 'closed' || face.eye === 'happy') {
      ctx.lineWidth = 5;
      ctx.beginPath();
      if (face.eye === 'happy') {
        ctx.arc(leftX, eyeY + 3, 10, Math.PI, TAU);
        ctx.moveTo(rightX + 10, eyeY + 3);
        ctx.arc(rightX, eyeY + 3, 10, Math.PI, TAU);
      } else {
        ctx.moveTo(leftX - 9, eyeY);
        ctx.lineTo(leftX + 9, eyeY);
        ctx.moveTo(rightX - 9, eyeY);
        ctx.lineTo(rightX + 9, eyeY);
      }
      ctx.stroke();
    } else if (face.eye === 'star') {
      ctx.lineWidth = 3.5;
      [-1, 1].forEach((s) => {
        const ex = s < 0 ? leftX : rightX;
        for (let i = 0; i < 5; i++) {
          const a = (i * TAU) / 5;
          ctx.beginPath();
          ctx.moveTo(ex, eyeY);
          ctx.lineTo(ex + Math.cos(a) * 11, eyeY + Math.sin(a) * 11);
          ctx.stroke();
        }
      });
    } else {
      const wide = face.eye === 'wide' || face.eye === 'shock';
      const r = wide ? 13 : 10;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(leftX, eyeY, r, 0, TAU);
      ctx.arc(rightX, eyeY, r, 0, TAU);
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.fillStyle = COLORS.ink;
      const pr = wide ? 5.6 : 4.4;
      ctx.beginPath();
      ctx.arc(leftX + px, eyeY + py, pr * face.pupil, 0, TAU);
      ctx.arc(rightX + px, eyeY + py, pr * face.pupil, 0, TAU);
      ctx.fill();
    }

    // Brows
    const browY = eyeY - 24;
    ctx.lineWidth = 5.5;
    const brow = (x: number, inner: number, outer: number) => {
      const isLeft = x < 0;
      const innerX = isLeft ? x + 11 : x - 11;
      const outerX = isLeft ? x - 11 : x + 11;
      ctx.beginPath();
      ctx.moveTo(outerX, browY + outer);
      ctx.lineTo(innerX, browY + inner);
      ctx.stroke();
    };
    if (face.brow === 'angry') {
      brow(leftX, 6, -5);
      brow(rightX, 6, -5);
    } else if (face.brow === 'raised') {
      brow(leftX, -8, -10);
      brow(rightX, -8, -10);
    } else if (face.brow === 'sad') {
      brow(leftX, -5, 5);
      brow(rightX, -5, 5);
    } else if (face.brow === 'smug') {
      brow(leftX, -6, -8);
      brow(rightX, 0, 0);
    } else if (face.brow === 'oneRaised') {
      brow(leftX, -8, -10);
      brow(rightX, 0, 0);
    } else {
      brow(leftX, 0, 0);
      brow(rightX, 0, 0);
    }

    // Mouth
    const mx = -1;
    const my = 30;
    ctx.lineWidth = 4.5;
    if (face.mouth === 'smile') {
      ctx.beginPath();
      ctx.arc(mx, my - 3, 11, 0.1, Math.PI - 0.1);
      ctx.stroke();
    } else if (face.mouth === 'grin') {
      ctx.fillStyle = COLORS.ink;
      ctx.beginPath();
      ctx.arc(mx, my - 3, 13, 0, Math.PI);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.rect(mx - 7, my + 5, 14, 3);
      ctx.fill();
    } else if (face.mouth === 'open') {
      ctx.fillStyle = COLORS.ink;
      ctx.beginPath();
      ctx.ellipse(mx, my + 1, 9, 12, 0, 0, TAU);
      ctx.fill();
    } else if (face.mouth === 'o') {
      ctx.beginPath();
      ctx.arc(mx, my, 7, 0, TAU);
      ctx.stroke();
    } else if (face.mouth === 'grit') {
      ctx.beginPath();
      ctx.rect(mx - 12, my - 4, 24, 10);
      ctx.stroke();
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(mx - 5, my - 4);
      ctx.lineTo(mx - 5, my + 6);
      ctx.moveTo(mx + 5, my - 4);
      ctx.lineTo(mx + 5, my + 6);
      ctx.stroke();
    } else if (face.mouth === 'frown') {
      ctx.beginPath();
      ctx.arc(mx, my + 11, 11, Math.PI, TAU);
      ctx.stroke();
    } else if (face.mouth === 'wobble') {
      ctx.beginPath();
      ctx.moveTo(mx - 13, my);
      ctx.quadraticCurveTo(mx - 6, my - 6, mx, my);
      ctx.quadraticCurveTo(mx + 6, my + 6, mx + 13, my);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(mx - 10, my);
      ctx.lineTo(mx + 10, my);
      ctx.stroke();
    }
  }

  // ==========================================================
  // CONFETTI + CAPTIONS
  // ==========================================================

  private renderConfetti(ctx: CanvasRenderingContext2D, t: number) {
    const palette = [COLORS.purple, COLORS.blue, COLORS.pink, COLORS.cyan, COLORS.gold];
    const bursts = [
      { from: 5.2, to: 12.0, count: 26, x: 380, spread: 420 },
      { from: 22.0, to: 30.0, count: 22, x: 470, spread: 400 },
      { from: 44.6, to: 52.0, count: 44, x: 520, spread: 900 },
    ];

    for (const burst of bursts) {
      if (t < burst.from || t > burst.to) continue;
      for (let i = 0; i < burst.count; i++) {
        const seed = (i * 9301 + 49297) % 233280;
        const rnd = seed / 233280;
        const speed = 0.35 + rnd * 0.5;
        const phase = ((t - burst.from) * speed + rnd) % 1;
        const x = burst.x + (rnd - 0.5) * burst.spread + Math.sin(phase * 8 + i) * 22;
        const y = 120 + phase * 1330;
        const rot = phase * 9 + i;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);
        ctx.fillStyle = palette[i % palette.length];
        ctx.globalAlpha = 1 - phase * 0.55;
        ctx.fillRect(-7, -4, 14, 8);
        ctx.restore();
      }
    }
  }

  private renderCaption(ctx: CanvasRenderingContext2D, t: number) {
    for (const caption of CAPTIONS) {
      if (t < caption.from || t > caption.to) continue;
      const fadeIn = Math.min(1, (t - caption.from) / 0.35);
      const fadeOut = Math.min(1, (caption.to - t) / 0.35);
      const alpha = Math.max(0, Math.min(fadeIn, fadeOut));

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      let size = 58;
      ctx.font = `900 ${size}px "Arial Black", "Segoe UI", Arial, sans-serif`;
      // Shrink long captions so they always fit inside the safe width.
      const maxWidth = this.width - 120;
      const measured = ctx.measureText(caption.text).width;
      if (measured > maxWidth) {
        size = Math.max(30, Math.floor((size * maxWidth) / measured));
        ctx.font = `900 ${size}px "Arial Black", "Segoe UI", Arial, sans-serif`;
      }
      ctx.lineJoin = 'round';
      ctx.lineWidth = Math.max(8, Math.round(size * 0.24));
      ctx.strokeStyle = 'rgba(11, 6, 24, 0.92)';
      ctx.strokeText(caption.text, this.width / 2, 1665);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(caption.text, this.width / 2, 1665);
      ctx.restore();
    }
  }

  // ==========================================================
  // EFFECTS
  // ==========================================================

  private renderEffects(ctx: CanvasRenderingContext2D, t: number) {
    // The hairbrush snapping apart.
    if (t >= 5.0 && t < 5.9) {
      const u = (t - 5.0) / 0.9;
      ctx.save();
      ctx.strokeStyle = '#f7d08a';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      for (let i = 0; i < 6; i++) {
        const a = -1.9 + i * 0.42;
        const d = 30 + u * 120;
        const bx = 470 + Math.cos(a) * d;
        const by = 1080 + Math.sin(a) * d;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + Math.cos(a) * 26, by + Math.sin(a) * 26);
        ctx.stroke();
      }
      ctx.restore();
    }

    // The microphone flying into the audience.
    if (t >= 21.2 && t < 22.2) {
      const u = (t - 21.2) / 1.0;
      ctx.save();
      ctx.globalAlpha = 1 - u * 0.4;
      ctx.strokeStyle = COLORS.cyan;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(752, 1284);
      ctx.quadraticCurveTo(900, 700, 1080, 520);
      ctx.stroke();
      ctx.restore();
    }

    // The spotlight that finds Beep.
    if (t >= 32 && t < 47) {
      const x = 470 + Math.sin(t * 1.3) * 60;
      ctx.save();
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = COLORS.cyan;
      ctx.beginPath();
      ctx.moveTo(505, 140);
      ctx.lineTo(535, 140);
      ctx.lineTo(x + 190, this.floorY);
      ctx.lineTo(x - 190, this.floorY);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Pop star sparkles around the performers.
    if (t >= 1.4 && t < 5.0) {
      ctx.save();
      ctx.strokeStyle = COLORS.gold;
      ctx.lineWidth = 4;
      for (let i = 0; i < 5; i++) {
        const a = t * 2 + i * 1.25;
        const r = 110 + Math.sin(t * 3 + i) * 22;
        const x = 360 + Math.cos(a) * r;
        const y = 1180 + Math.sin(a * 0.8) * r * 0.7;
        const s = 7 + Math.sin(t * 6 + i) * 3;
        ctx.beginPath();
        ctx.moveTo(x - s, y);
        ctx.lineTo(x + s, y);
        ctx.moveTo(x, y - s);
        ctx.lineTo(x, y + s);
        ctx.stroke();
      }
      ctx.restore();
    }
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
