import type { StudioConfig } from '../types';

/**
 * THE BIGGEST BALLOON - 30s vertical (1080x1920) Modern Pop stickman comedy.
 *
 * Shot map:
 *  0.0-2.0   Shot 1  hook: limp balloon in front of his face, freeze-frame
 *  2.0-6.0   Shot 2  size: medium (head-size balloon + thumbs-up)
 *  6.0-10.0  Shot 3  size: large, the fake-out (bracing for a pop that never comes)
 * 10.0-14.0  Shot 4  size: giant (taller than him, knot, admire it)
 * 14.0-18.0  Shot 5  uh oh (breeze, feet leave the ground, in the sky)
 * 18.0-22.0  Shot 6  this is fine (waves, drifts toward the pine)
 * 22.0-27.0  Shot 7  the anti-pop (pine tip pokes it, wild zigzag deflation)
 * 27.0-30.0  Shot 8  end frame (hanging from a branch, limp balloon on his face)
 */

const TAU = Math.PI * 2;
const WIDTH = 1080;
const HEIGHT = 1920;

const INK = '#111111';
const WHITE = '#ffffff';
const SKY = '#7dc8ef';
const HILL_FAR = '#c3ecac';
const HILL_MID = '#9adb86';
const GRASS = '#74cb63';
const GRASS_DARK = '#57ab48';
const PINE = '#20793d';
const PINE_DEEP = '#175c2d';
const TRUNK = '#8b5a2b';
const BALLOON_RED = '#ef4444';
const BALLOON_DEEP = '#c9313d';
const BEANIE = '#e63946';
const BEANIE_DEEP = '#b3222e';
const SHIRT = '#ffd166';
const BLUSH = '#ffb3c1';

const FLOOR_Y = 1560;
const HIP_Y = 1260;
const HEAD_R = 70;
const PINE_X = 980;
const PINE_TOP = 420;
const PINE_BASE = 1560;

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

type MouthShape = 'flat' | 'smile' | 'grin' | 'o' | 'frown' | 'grit' | 'blow';
type BrowShape = 'normal' | 'angry' | 'raised' | 'sad';
type EyeShape = 'open' | 'wide' | 'squint' | 'shut';
type LegMode = 'stand' | 'kick' | 'sit' | 'kneel' | 'dangle' | 'paddle' | 'hang';

interface Pt {
  x: number;
  y: number;
}

interface Pose {
  lean: number;
  headTilt: number;
  mouth: MouthShape;
  brow: BrowShape;
  eye: EyeShape;
  cheekPuff: number;
  blush: boolean;
  legs: LegMode;
  handL: Pt;
  handR: Pt;
  bendL: 1 | -1;
  bendR: 1 | -1;
  fistL: boolean;
  fistR: boolean;
  thumb: boolean;
  hooked: boolean;
}

interface BalloonState {
  x: number;
  y: number;
  r: number;
  rot: number;
  limp: number;
  hole: boolean;
  visible: boolean;
  neck: Pt;
}

interface CharState {
  x: number;
  hipY: number;
  pose: Pose;
  spin: number;
}

interface CaptionLine {
  text: string;
  from: number;
  to: number;
  scale: number;
}

interface CameraKey {
  t: number;
  x: number;
  y: number;
  zoom: number;
}

export class BiggestBalloonRenderer {
  readonly width = WIDTH;
  readonly height = HEIGHT;

  private readonly floorY = FLOOR_Y;
  private readonly hipY = HIP_Y;
  private readonly headR = HEAD_R;

  private readonly captions: CaptionLine[] = [
    { text: 'WILL IT POP?', from: 0.15, to: 1.9, scale: 1.0 },
    { text: 'SIZE: MEDIUM', from: 2.2, to: 5.8, scale: 0.98 },
    { text: 'SIZE: LARGE', from: 6.2, to: 9.9, scale: 1.08 },
    { text: 'SIZE: GIANT', from: 10.2, to: 13.9, scale: 1.18 },
    { text: 'UH OH.', from: 14.2, to: 17.9, scale: 1.05 },
    { text: 'THIS IS FINE.', from: 18.2, to: 21.9, scale: 1.0 },
    { text: 'THE POP…', from: 22.2, to: 23.4, scale: 1.05 },
    { text: '…WASN\'T A POP 💀', from: 23.6, to: 26.9, scale: 1.0 },
  ];

  private readonly cameraKeys: CameraKey[] = [
    { t: 0.0, x: 545, y: 1010, zoom: 2.1 },
    { t: 0.9, x: 545, y: 1030, zoom: 3.15 },
    { t: 1.99, x: 545, y: 1030, zoom: 3.15 },
    { t: 2.0, x: 540, y: 1020, zoom: 1.0 },
    { t: 3.0, x: 540, y: 990, zoom: 1.05 },
    { t: 4.8, x: 540, y: 990, zoom: 1.05 },
    { t: 6.0, x: 540, y: 1000, zoom: 1.0 },
    { t: 7.5, x: 566, y: 760, zoom: 1.22 },
    { t: 8.0, x: 540, y: 1000, zoom: 1.0 },
    { t: 10.0, x: 540, y: 1000, zoom: 0.95 },
    { t: 12.6, x: 540, y: 900, zoom: 0.98 },
    { t: 14.0, x: 540, y: 950, zoom: 0.95 },
    { t: 15.8, x: 550, y: 800, zoom: 1.0 },
    { t: 16.39, x: 550, y: 760, zoom: 1.0 },
    { t: 16.4, x: 540, y: 700, zoom: 0.8 },
    { t: 18.0, x: 540, y: 700, zoom: 0.8 },
    { t: 20.6, x: 560, y: 700, zoom: 0.8 },
    { t: 21.8, x: 680, y: 690, zoom: 0.85 },
    { t: 22.0, x: 700, y: 680, zoom: 0.9 },
    { t: 23.2, x: 800, y: 620, zoom: 0.95 },
    { t: 23.45, x: 820, y: 470, zoom: 1.15 },
    { t: 23.6, x: 640, y: 760, zoom: 0.8 },
    { t: 26.8, x: 640, y: 760, zoom: 0.8 },
    { t: 26.99, x: 640, y: 760, zoom: 0.8 },
    { t: 27.0, x: 540, y: 820, zoom: 1.85 },
    { t: 29.0, x: 540, y: 810, zoom: 2.0 },
    { t: 30.0, x: 540, y: 800, zoom: 2.3 },
  ];

  render(ctx: CanvasRenderingContext2D, time: number, config: StudioConfig) {
    const t = Math.min(time, 30);

    // Shot 1 is a freeze-frame from 0.9s: hold the drawing at 0.9s.
    const visual = t >= 0.9 && t < 1.9 ? 0.9 : t;

    ctx.save();
    ctx.fillStyle = SKY;
    ctx.fillRect(0, 0, this.width, this.height);

    this.applyCamera(ctx, t);

    this.renderWorld(ctx, visual);
    const balloon = this.balloonState(visual);
    const char = this.charState(visual, balloon);

    // Draw order: before 4.6s and during the chaos the balloon sits in front of
    // him (he is blowing into it / it is on his face); otherwise it is behind.
    if (visual >= 27.0) {
      this.renderBranch(ctx);
      this.drawShirtHook(ctx, char);
      this.renderCharacter(ctx, char, visual);
      if (balloon.visible) this.drawBalloon(ctx, balloon, visual);
    } else {
      if (visual < 4.6 || visual >= 23.6) {
        // balloon in front of the character (blowing / chaos)
        this.renderCharacter(ctx, char, visual);
        this.drawString(ctx, balloon, char);
        this.drawBalloon(ctx, balloon, visual);
      } else {
        this.drawString(ctx, balloon, char);
        this.drawBalloon(ctx, balloon, visual);
        this.renderCharacter(ctx, char, visual);
      }
    }

    this.renderEffects(ctx, t, char, balloon);

    ctx.restore();

    this.renderScreenEffects(ctx, t);

    if (config.showCaptions) this.renderCaption(ctx, t);
    if (config.showSafeZones) this.renderSafeZones(ctx);
  }

  // ------------------------------------------------------------------
  // Camera
  // ------------------------------------------------------------------

  private cameraAt(t: number): CameraKey {
    const keys = this.cameraKeys;
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

  private applyCamera(ctx: CanvasRenderingContext2D, t: number) {
    const cam = this.cameraAt(t);
    ctx.translate(this.width / 2, this.height / 2);
    ctx.scale(cam.zoom, cam.zoom);
    ctx.translate(-cam.x, -cam.y);
  }

  // ------------------------------------------------------------------
  // World: sky, clouds, hills, grass, pine
  // ------------------------------------------------------------------

  private renderWorld(ctx: CanvasRenderingContext2D, t: number) {
    this.renderClouds(ctx, t);
    this.renderHills(ctx);
    this.renderGrass(ctx);
    this.renderPine(ctx);
  }

  private renderClouds(ctx: CanvasRenderingContext2D, t: number) {
    const clouds: Array<[number, number, number]> = [
      [-260, 300, 1.15],
      [180, 170, 0.9],
      [760, 260, 1.0],
      [430, 520, 0.72],
      [1120, 560, 0.95],
      [-140, 700, 0.85],
      [960, 120, 0.7],
      [620, 860, 0.6],
    ];
    for (let i = 0; i < clouds.length; i++) {
      const [x, y, s] = clouds[i];
      const drift = Math.sin(t * 0.25 + i * 1.7) * 14 + t * 2.5;
      this.drawCloud(ctx, x + drift, y, s);
    }
  }

  private drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.fillStyle = WHITE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-118, 46);
    ctx.lineTo(-118, 30);
    ctx.arc(-62, 30, 34, Math.PI, TAU);
    ctx.arc(-2, 16, 52, Math.PI, TAU);
    ctx.arc(70, 30, 36, Math.PI, TAU);
    ctx.lineTo(112, 46);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private renderHills(ctx: CanvasRenderingContext2D) {
    const drawHill = (cx: number, cy: number, rx: number, ry: number, fill: string) => {
      ctx.fillStyle = fill;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, Math.PI, TAU);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    };
    drawHill(-200, FLOOR_Y + 20, 760, 230, HILL_FAR);
    drawHill(420, FLOOR_Y + 20, 900, 290, HILL_FAR);
    drawHill(1240, FLOOR_Y + 20, 800, 250, HILL_FAR);
    drawHill(-40, FLOOR_Y + 30, 560, 150, HILL_MID);
    drawHill(760, FLOOR_Y + 30, 620, 175, HILL_MID);
    drawHill(1520, FLOOR_Y + 30, 560, 155, HILL_MID);
  }

  private renderGrass(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = GRASS;
    ctx.fillRect(-2400, FLOOR_Y, 6000, 3600);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-2400, FLOOR_Y);
    ctx.lineTo(3600, FLOOR_Y);
    ctx.stroke();

    ctx.strokeStyle = GRASS_DARK;
    ctx.lineWidth = 5;
    const tufts = [-320, -140, 60, 250, 420, 610, 800, 1010, 1230, 1420];
    for (let i = 0; i < tufts.length; i++) {
      const gx = tufts[i];
      ctx.beginPath();
      ctx.moveTo(gx - 14, FLOOR_Y + 40);
      ctx.quadraticCurveTo(gx - 6, FLOOR_Y + 12, gx - 2, FLOOR_Y + 6);
      ctx.moveTo(gx + 14, FLOOR_Y + 40);
      ctx.quadraticCurveTo(gx + 6, FLOOR_Y + 12, gx + 2, FLOOR_Y + 6);
      ctx.moveTo(gx, FLOOR_Y + 42);
      ctx.lineTo(gx, FLOOR_Y + 4);
      ctx.stroke();
    }
  }

  private renderPine(ctx: CanvasRenderingContext2D) {
    // Trunk
    ctx.fillStyle = TRUNK;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.fillRect(PINE_X - 30, PINE_BASE - 640, 60, 640);
    ctx.strokeRect(PINE_X - 30, PINE_BASE - 640, 60, 640);

    const tiers: Array<[number, number, number, number, string]> = [
      // halfWidth, baseY, apexY, unused, fill
      [220, PINE_BASE - 300, PINE_BASE - 760, 0, PINE_DEEP],
      [180, PINE_BASE - 480, PINE_BASE - 1000, 0, PINE],
      [130, PINE_BASE - 780, PINE_TOP, 0, PINE_DEEP],
    ];
    for (const [hw, baseY, apexY, , fill] of tiers) {
      ctx.fillStyle = fill;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(PINE_X - hw, baseY);
      ctx.lineTo(PINE_X + hw, baseY);
      ctx.lineTo(PINE_X, apexY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }

  private renderBranch(ctx: CanvasRenderingContext2D) {
    // A pine bough crossing the close-up frame, drawn behind the character.
    const yAt = (x: number) => 875 - 0.17 * (x - 540);

    ctx.save();
    ctx.lineCap = 'round';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 34;
    ctx.beginPath();
    ctx.moveTo(1240, yAt(1240));
    ctx.lineTo(60, yAt(60));
    ctx.stroke();
    ctx.strokeStyle = TRUNK;
    ctx.lineWidth = 22;
    ctx.beginPath();
    ctx.moveTo(1240, yAt(1240));
    ctx.lineTo(60, yAt(60));
    ctx.stroke();

    // Needle clusters along the branch
    for (let x = 120; x <= 1200; x += 90) {
      const y = yAt(x);
      ctx.fillStyle = x % 180 === 0 ? PINE_DEEP : PINE;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x - 46, y + 8);
      ctx.lineTo(x + 46, y + 8);
      ctx.lineTo(x, y - 58);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  /** Shirt fabric draped over the pine bough, drawn behind the character. */
  private drawShirtHook(ctx: CanvasRenderingContext2D, char: CharState) {
    const shoulderY = char.hipY - 170;
    const x = char.x;
    const by = 875 - 0.17 * (x - 540); // the bough line
    ctx.save();
    ctx.fillStyle = SHIRT;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x - 36, shoulderY + 24);
    ctx.lineTo(x - 86, by + 10);
    ctx.quadraticCurveTo(x, by - 44, x + 86, by + 10);
    ctx.lineTo(x + 36, shoulderY + 24);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Fold marks in the fabric
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x - 58, by + 2);
    ctx.quadraticCurveTo(x - 30, by - 20, x - 8, by - 12);
    ctx.moveTo(x + 58, by + 2);
    ctx.quadraticCurveTo(x + 30, by - 20, x + 8, by - 12);
    ctx.stroke();
    ctx.restore();
  }

  // ------------------------------------------------------------------
  // Balloon
  // ------------------------------------------------------------------

  private neckOf(x: number, y: number, r: number, rot: number): Pt {
    return { x: x - Math.sin(rot) * r, y: y + Math.cos(rot) * r };
  }

  private balloonState(t: number): BalloonState {
    let x = 540;
    let y = 1000;
    let r = 46;
    let rot = 0.45;
    let limp = 0.8;
    let hole = false;
    let visible = true;

    if (t < 2.0) {
      // Shot 1: limp balloon held just in front of his mouth
      x = 625;
      y = 1075;
      r = 42;
      rot = 0.85;
      limp = 0.75;
    } else if (t < 6.0) {
      // Shot 2: grow to head size, then hold it up
      if (t < 2.7) {
        x = 585;
        y = 1040;
        r = 46;
        rot = 0.9;
        limp = 0.55;
      } else if (t < 4.4) {
        const u = smooth((t - 2.7) / 1.7);
        x = 585 + 45 * u;
        y = 1040 - 80 * u;
        r = 46 + 49 * u;
        rot = 0.9 - 0.9 * u;
        limp = 0.55 * (1 - u);
      } else if (t < 5.0) {
        const u = smooth((t - 4.4) / 0.6);
        x = 630 + 70 * u;
        y = 960 - 225 * u;
        r = 95;
        rot = 0;
        limp = 0;
      } else {
        x = 700;
        y = 735 + Math.sin((t - 5.0) * 3) * 6;
        r = 95;
        rot = 0;
        limp = 0;
      }
    } else if (t < 10.0) {
      // Shot 3: swell to body size, then brace
      if (t < 8.0) {
        const u = smooth((t - 6.0) / 2.0);
        x = 700 - 102 * u;
        y = 735 - 105 * u;
        r = 95 + 135 * u;
        rot = 0;
        limp = 0;
      } else {
        x = 598;
        y = 630 + Math.sin(t * 18) * 2.5;
        r = 230;
        rot = 0;
        limp = 0;
      }
    } else if (t < 14.0) {
      // Shot 4: giant, taller than him
      if (t < 11.8) {
        const u = smooth((t - 10.0) / 1.8);
        x = 598 - 18 * u;
        y = 630 - 70 * u;
        r = 230 + 100 * u;
        rot = 0;
        limp = 0;
      } else {
        x = 580;
        y = 560 + Math.sin((t - 11.8) * 1.8) * 12;
        r = 330;
        rot = 0;
        limp = 0;
      }
    } else if (t < 18.0) {
      // Shot 5: breeze, rise, hard cut wide
      rot = 0;
      limp = 0;
      if (t < 14.8) {
        const u = smooth((t - 14.0) / 0.8);
        x = 580 + 14 * u;
        y = 560 - 70 * u;
        r = 330;
      } else if (t < 16.4) {
        const u = smooth((t - 14.8) / 1.6);
        x = 594 - 44 * u;
        y = 490 - 350 * u;
        r = 330;
      } else {
        x = 560;
        y = 60 + Math.sin(t * 1.8) * 10;
        r = 330;
      }
    } else if (t < 22.0) {
      // Shot 6: float calmly, drift toward the pine
      rot = 0;
      limp = 0;
      const u = smooth((t - 20.6) / 1.4);
      x = 560 + 190 * u;
      y = 60 + 30 * u + Math.sin(t * 1.6) * 10;
      r = 330;
    } else if (t < 27.0) {
      // Shot 7: spot the pine, poke, wild deflation
      rot = 0;
      limp = 0;
      if (t < 22.6) {
        x = 750;
        y = 160;
        r = 330;
      } else if (t < 23.3) {
        const u = smooth((t - 22.6) / 0.7);
        x = 750 - 10 * u;
        y = 160 + 100 * u;
        r = 330;
      } else if (t < 23.6) {
        x = 740;
        y = 260;
        r = 330;
        hole = true;
      } else {
        // Fly away from the tree: a zigzag that stays clear of the pine.
        const u = clamp((t - 23.6) / 3.0, 0, 1);
        x = 740 - 350 * u + 120 * Math.sin(u * TAU * 2.2);
        y = 260 + 140 * u + 200 * Math.sin(u * TAU * 1.7);
        r = 330 - 285 * u;
        hole = true;
        limp = u > 0.75 ? (u - 0.75) / 0.25 : 0;
      }
    } else {
      // Shot 8: limp mask on his face, pushed down
      rot = -0.15;
      limp = 1;
      if (t < 28.6) {
        x = 540;
        y = 832;
        r = 108;
      } else if (t < 29.3) {
        const u = smooth((t - 28.6) / 0.7);
        x = 540 + 22 * u;
        y = 832 + 190 * u;
        r = 108 - 34 * u;
      } else {
        x = 562;
        y = 1022 + Math.sin(t * 3) * 3;
        r = 74;
      }
    }

    if (t >= 23.6 && t < 27.0 && t < 26.8) {
      // airborne deflation keeps a hole
      hole = true;
    }

    if (t >= 27.0) {
      visible = true;
    }

    return {
      x,
      y,
      r,
      rot,
      limp,
      hole,
      visible,
      neck: this.neckOf(x, y, r, rot),
    };
  }

  private drawBalloon(ctx: CanvasRenderingContext2D, b: BalloonState, t: number) {
    if (!b.visible) return;
    const rx = b.r;
    const ry = b.r * (1 - 0.28 * b.limp);

    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.rot);

    // Body: a clean ellipse while taut, a wobbly bag once limp.
    const steps = 44;
    const wob = 0.14 * b.limp + 0.006 * Math.max(0, b.r - 200) / 130;
    ctx.fillStyle = BALLOON_RED;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * TAU;
      const k = 1 + wob * Math.sin(a * 3 + t * 2.2) + wob * 0.6 * Math.sin(a * 5 - t * 3.1);
      const px = Math.cos(a) * rx * k;
      const py = Math.sin(a) * ry * k;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Shiny highlight (only while taut)
    if (b.limp < 0.75 && b.r > 40) {
      ctx.save();
      ctx.globalAlpha = 0.55 * (1 - b.limp);
      ctx.fillStyle = WHITE;
      ctx.beginPath();
      ctx.ellipse(-rx * 0.35, -ry * 0.38, rx * 0.24, ry * 0.16, -0.5, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    // Neck + knot
    const neckLen = Math.max(12, 26 * (1 - b.limp * 0.5));
    ctx.fillStyle = b.limp > 0.7 ? BALLOON_DEEP : BALLOON_RED;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-9, ry - 2);
    ctx.lineTo(9, ry - 2);
    ctx.lineTo(6, ry + neckLen);
    ctx.lineTo(-6, ry + neckLen);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    if (b.limp < 0.5) {
      // knot
      ctx.beginPath();
      ctx.arc(0, ry + neckLen + 6, 9, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }

    // The tiny pine hole
    if (b.hole && b.r > 60) {
      ctx.fillStyle = '#5c1116';
      ctx.beginPath();
      ctx.ellipse(rx * 0.72, ry * 0.5, 9, 6, 0.4, 0, TAU);
      ctx.fill();
      // escaping air dashes
      ctx.strokeStyle = WHITE;
      ctx.lineWidth = 5;
      for (let i = 0; i < 3; i++) {
        const ang = 0.6 + i * 0.35;
        ctx.beginPath();
        ctx.moveTo(rx * 0.78 + Math.cos(ang) * 16, ry * 0.5 + Math.sin(ang) * 16);
        ctx.lineTo(rx * 0.78 + Math.cos(ang) * (34 + i * 12), ry * 0.5 + Math.sin(ang) * (34 + i * 12));
        ctx.stroke();
      }
    }

    ctx.restore();

    // Folds on the limp mask
    if (b.limp > 0.8) {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.rot);
      ctx.strokeStyle = BALLOON_DEEP;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(-rx * 0.5, -ry * 0.2);
      ctx.quadraticCurveTo(0, ry * 0.35, rx * 0.55, -ry * 0.1);
      ctx.moveTo(-rx * 0.2, -ry * 0.6);
      ctx.quadraticCurveTo(rx * 0.2, 0, rx * 0.1, ry * 0.5);
      ctx.stroke();
      ctx.restore();
    }
  }

  private drawString(ctx: CanvasRenderingContext2D, b: BalloonState, char: CharState) {
    if (b.limp > 0.75 || b.r < 40) return;
    const hands = this.computeArms(char.pose, char.x, char.hipY);
    let hx = (hands.l.hx + hands.r.hx) / 2;
    let hy = (hands.l.hy + hands.r.hy) / 2;
    if (Math.abs(char.spin) > 0.001) {
      // Follow the spinning body around the same pivot.
      const px = char.x;
      const py = char.hipY - 140;
      const dx = hx - px;
      const dy = hy - py;
      const c = Math.cos(char.spin);
      const s = Math.sin(char.spin);
      hx = px + dx * c - dy * s;
      hy = py + dx * s + dy * c;
    }
    if (Math.hypot(hx - b.neck.x, hy - b.neck.y) > 40) {
      ctx.save();
      ctx.strokeStyle = WHITE;
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(b.neck.x, b.neck.y);
      ctx.quadraticCurveTo((b.neck.x + hx) / 2 + 10, (b.neck.y + hy) / 2 + 20, hx, hy);
      ctx.stroke();
      ctx.restore();
    }
  }

  // ------------------------------------------------------------------
  // Character
  // ------------------------------------------------------------------

  private defaultPose(): Pose {
    return {
      lean: 0,
      headTilt: 0,
      mouth: 'flat',
      brow: 'normal',
      eye: 'open',
      cheekPuff: 0,
      blush: false,
      legs: 'stand',
      handL: { x: 0, y: 0 },
      handR: { x: 0, y: 0 },
      bendL: 1,
      bendR: 1,
      fistL: false,
      fistR: false,
      thumb: false,
      hooked: false,
    };
  }

  private charState(t: number, balloon: BalloonState): CharState {
    const pose = this.defaultPose();
    let x = 540;
    let hipY = this.hipY;
    let spin = 0;

    const hang = (dx: number, dy: number): Pt => ({ x: x + dx, y: hipY + dy });
    const neck = balloon.neck;

    if (t < 2.0) {
      // Shot 1: hook close-up
      pose.brow = 'angry';
      pose.eye = 'squint';
      pose.mouth = 'grit';
      pose.lean = 0.03;
      pose.handR = { x: neck.x - 4, y: neck.y + 6 };
      pose.handL = hang(-52, 90);
      pose.bendR = -1;
      pose.bendL = 1;
      pose.fistR = true;
    } else if (t < 6.0) {
      // Shot 2: size medium
      x = 500;
      if (t < 2.7) {
        pose.brow = 'raised';
        pose.eye = 'open';
        pose.mouth = 'blow';
        pose.cheekPuff = 0.35;
        pose.lean = -0.08;
        pose.handR = { x: neck.x - 4, y: neck.y - 2 };
        pose.handL = { x: x + 60, y: neck.y + 4 };
        pose.bendR = -1;
        pose.bendL = 1;
      } else if (t < 4.4) {
        pose.brow = 'angry';
        pose.eye = 'squint';
        pose.mouth = 'blow';
        pose.cheekPuff = 0.85;
        pose.lean = 0.1;
        pose.handR = { x: neck.x - 4, y: neck.y - 2 };
        pose.handL = hang(-66, -110);
        pose.bendR = -1;
      } else if (t < 5.2) {
        pose.brow = 'raised';
        pose.eye = 'open';
        pose.mouth = 'smile';
        pose.handR = { x: neck.x, y: neck.y - 6 };
        pose.handL = hang(-50, 100);
        pose.bendR = -1;
      } else {
        pose.brow = 'raised';
        pose.eye = 'open';
        pose.mouth = 'grin';
        pose.handR = { x: neck.x, y: neck.y - 6 };
        pose.handL = hang(-60, -140);
        pose.thumb = true;
        pose.bendR = -1;
      }
    } else if (t < 10.0) {
      // Shot 3: fake-out
      x = 520;
      if (t < 8.0) {
        pose.brow = 'angry';
        pose.eye = 'squint';
        pose.mouth = 'blow';
        pose.cheekPuff = 0.85;
        pose.lean = 0.08;
        pose.handR = { x: neck.x - 10, y: neck.y - 6 };
        pose.handL = hang(-70, -60);
        pose.bendR = -1;
      } else if (t < 9.2) {
        pose.brow = 'sad';
        pose.eye = 'shut';
        pose.mouth = 'grit';
        pose.lean = -0.22;
        pose.handR = hang(46, -232);
        pose.handL = hang(-46, -228);
        pose.bendR = -1;
        pose.bendL = 1;
        pose.fistR = true;
        pose.fistL = true;
      } else if (t < 9.6) {
        pose.brow = 'raised';
        pose.eye = 'open';
        pose.mouth = 'o';
        pose.lean = -0.08;
        pose.handR = hang(26, -150);
        pose.handL = hang(-26, -146);
        pose.bendR = 1;
        pose.bendL = 1;
      } else {
        pose.brow = 'raised';
        pose.eye = 'open';
        pose.mouth = 'smile';
        pose.lean = 0.12;
        pose.handR = hang(48, 70);
        pose.handL = hang(-48, 70);
      }
    } else if (t < 14.0) {
      // Shot 4: giant
      if (t < 11.8) {
        x = 520;
        pose.brow = 'angry';
        pose.eye = 'squint';
        pose.mouth = 'blow';
        pose.cheekPuff = 0.9;
        pose.blush = true;
        pose.lean = 0.06;
        pose.handR = { x: neck.x - 10, y: neck.y - 6 };
        pose.handL = hang(-70, -40);
        pose.bendR = -1;
      } else if (t < 12.4) {
        x = 520;
        pose.brow = 'angry';
        pose.eye = 'squint';
        pose.mouth = 'grit';
        pose.blush = true;
        pose.lean = 0.04;
        pose.handR = { x: neck.x - 18, y: neck.y - 4 };
        pose.handL = { x: neck.x + 18, y: neck.y - 4 };
        pose.bendR = -1;
        pose.bendL = 1;
        pose.fistR = true;
        pose.fistL = true;
      } else if (t < 13.2) {
        x = 520 - 150 * smooth((t - 12.4) / 0.8);
        pose.brow = 'raised';
        pose.eye = 'open';
        pose.mouth = 'smile';
        pose.handR = hang(40, 90);
        pose.handL = hang(-40, 90);
      } else {
        x = 370;
        pose.brow = 'raised';
        pose.eye = 'open';
        pose.mouth = 'grin';
        pose.headTilt = -0.06;
        pose.handR = hang(66, -40);
        pose.handL = hang(-66, -30);
      }
    } else if (t < 18.0) {
      // Shot 5: uh oh
      if (t < 15.6) {
        x = 500;
        pose.brow = 'raised';
        pose.eye = 'wide';
        pose.mouth = 'o';
        pose.handR = { x: neck.x - 6, y: neck.y + 30 };
        pose.handL = hang(-50, 80);
        pose.bendR = -1;
        if (t >= 14.8) {
          hipY = this.hipY - 100 * smooth((t - 14.8) / 0.8);
          pose.legs = 'dangle';
          pose.handR = { x: neck.x - 6, y: neck.y + 80 };
          pose.handL = { x: neck.x - 60, y: neck.y + 60 };
        }
      } else if (t < 16.4) {
        hipY = this.hipY - 100 - 200 * smooth((t - 15.6) / 0.8);
        x = 540;
        pose.legs = 'dangle';
        pose.brow = 'raised';
        pose.eye = 'wide';
        pose.mouth = 'o';
        pose.handR = { x: neck.x - 10, y: neck.y + 60 };
        pose.handL = { x: neck.x - 50, y: neck.y + 40 };
      } else {
        // hard cut: wide, floating
        x = 560;
        hipY = 860;
        pose.legs = 'dangle';
        pose.brow = 'raised';
        pose.eye = 'wide';
        pose.mouth = 'o';
        pose.handR = { x: neck.x - 8, y: neck.y + 50 };
        pose.handL = { x: neck.x - 48, y: neck.y + 30 };
      }
    } else if (t < 22.0) {
      // Shot 6: this is fine
      const bob = Math.sin(t * 1.6) * 14;
      hipY = 860 + bob;
      x = 560 + 190 * smooth((t - 20.6) / 1.4);
      pose.legs = 'dangle';
      pose.bendR = -1;
      if (t < 19.2) {
        pose.brow = 'normal';
        pose.eye = 'open';
        pose.mouth = 'smile';
        pose.handR = { x: neck.x - 8, y: neck.y + 40 };
        pose.handL = hang(-40, 60);
      } else if (t < 20.6) {
        pose.brow = 'raised';
        pose.eye = 'open';
        pose.mouth = 'smile';
        const wav = Math.sin((t - 19.2) * 9) * 42;
        pose.handR = { x: neck.x - 4, y: neck.y + 30 };
        pose.handL = { x: x + 150 + wav, y: hipY - 240 + Math.abs(wav) * 0.2 };
      } else {
        pose.brow = 'raised';
        pose.eye = 'open';
        pose.mouth = 'grin';
        pose.handR = { x: neck.x - 8, y: neck.y + 40 };
        pose.handL = hang(-40, 60);
      }
    } else if (t < 27.0) {
      // Shot 7: the anti-pop
      if (t < 22.6) {
        x = 720;
        hipY = 880;
        pose.legs = 'dangle';
        pose.brow = 'raised';
        pose.eye = 'wide';
        pose.mouth = 'o';
        pose.headTilt = 0.12;
        pose.handR = { x: neck.x - 8, y: neck.y + 60 };
        pose.handL = { x: neck.x - 50, y: neck.y + 40 };
      } else if (t < 23.3) {
        x = 780;
        hipY = 900;
        pose.legs = 'paddle';
        pose.brow = 'sad';
        pose.eye = 'wide';
        pose.mouth = 'o';
        pose.lean = -0.14;
        pose.handR = { x: neck.x - 8, y: neck.y + 60 };
        pose.handL = { x: neck.x - 50, y: neck.y + 40 };
      } else if (t < 23.6) {
        x = 800;
        hipY = 920;
        pose.legs = 'paddle';
        pose.brow = 'sad';
        pose.eye = 'wide';
        pose.mouth = 'o';
        pose.lean = -0.18;
        pose.handR = { x: neck.x + 16, y: neck.y + 30 };
        pose.handL = { x: neck.x - 66, y: neck.y + 44 };
        pose.bendR = -1;
        pose.bendL = -1;
      } else {
        // wild zigzag, spinning
        const u = clamp((t - 23.6) / 3.0, 0, 1);
        hipY = balloon.y + balloon.r + 330;
        x = balloon.x + 70 * Math.sin(u * TAU * 3);
        spin = u * TAU * 2.2;
        pose.legs = 'paddle';
        pose.brow = 'sad';
        pose.eye = 'wide';
        pose.mouth = 'o';
        pose.handR = { x: balloon.neck.x - 6, y: balloon.neck.y + 40 };
        pose.handL = { x: balloon.neck.x - 56, y: balloon.neck.y + 30 };
      }
    } else {
      // Shot 8: hanging from the branch
      x = 540;
      hipY = 1080;
      pose.legs = 'hang';
      pose.hooked = true;
      if (t < 28.0) {
        pose.brow = 'sad';
        pose.eye = 'shut';
        pose.mouth = 'frown';
        pose.handR = hang(36, -230);
        pose.handL = hang(-50, 60);
        pose.bendR = 1;
      } else if (t < 29.0) {
        const u = smooth((t - 28.0) / 1.0);
        pose.brow = 'sad';
        pose.eye = 'shut';
        pose.mouth = 'frown';
        pose.handR = { x: 540 + 30, y: lerp(880, 1010, u) };
        pose.handL = hang(-50, 60);
        pose.bendR = 1;
      } else {
        pose.brow = 'angry';
        pose.eye = 'squint';
        pose.mouth = 'grit';
        pose.handR = hang(60, -80);
        pose.handL = hang(-60, -40);
      }
    }

    return { x, hipY, pose, spin };
  }

  private renderCharacter(ctx: CanvasRenderingContext2D, char: CharState, t: number) {
    if (Math.abs(char.spin) > 0.001) {
      const px = char.x;
      const py = char.hipY - 140;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(char.spin);
      ctx.translate(-px, -py);
      this.drawStickman(ctx, char.x, char.hipY, char.pose, t);
      ctx.restore();
    } else {
      this.drawStickman(ctx, char.x, char.hipY, char.pose, t);
    }
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
    t: number
  ) {
    const lean = pose.lean;
    const shoulderY = hipY - 170;
    const bodyTopX = hipX + Math.sin(lean) * 170;

    ctx.save();
    ctx.lineCap = 'round';

    // Legs
    ctx.strokeStyle = INK;
    ctx.lineWidth = 16;
    if (pose.legs === 'kick') {
      ctx.beginPath();
      ctx.moveTo(hipX, hipY);
      ctx.lineTo(hipX - 50, hipY - 10);
      ctx.lineTo(hipX - 100, hipY - 110);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(hipX, hipY);
      ctx.lineTo(hipX + 60, hipY + 50);
      ctx.lineTo(hipX + 30, hipY + 130);
      ctx.stroke();
    } else if (pose.legs === 'sit') {
      ctx.beginPath();
      ctx.moveTo(hipX, hipY);
      ctx.lineTo(hipX + 90, hipY + 30);
      ctx.lineTo(hipX + 120, hipY + 130);
      ctx.moveTo(hipX, hipY);
      ctx.lineTo(hipX + 30, hipY + 60);
      ctx.lineTo(hipX + 70, hipY + 130);
      ctx.stroke();
    } else if (pose.legs === 'kneel') {
      ctx.beginPath();
      ctx.moveTo(hipX, hipY);
      ctx.lineTo(hipX - 58, hipY + 80);
      ctx.lineTo(hipX - 68, this.floorY);
      ctx.moveTo(hipX, hipY);
      ctx.lineTo(hipX + 58, hipY + 70);
      ctx.lineTo(hipX + 66, this.floorY);
      ctx.stroke();
    } else if (pose.legs === 'dangle') {
      const sway = Math.sin(t * 2.2) * 12;
      ctx.beginPath();
      ctx.moveTo(hipX, hipY);
      ctx.lineTo(hipX - 42 + sway, hipY + 96);
      ctx.lineTo(hipX - 30 + sway * 1.6, hipY + 196);
      ctx.moveTo(hipX, hipY);
      ctx.lineTo(hipX + 42 - sway, hipY + 86);
      ctx.lineTo(hipX + 36 - sway * 1.6, hipY + 190);
      ctx.stroke();
    } else if (pose.legs === 'paddle') {
      const a = t * 9;
      ctx.beginPath();
      ctx.moveTo(hipX, hipY);
      ctx.lineTo(hipX - 60 + Math.sin(a) * 34, hipY + 70);
      ctx.lineTo(hipX - 60 + Math.sin(a + 0.9) * 90, hipY + 40 + Math.cos(a + 0.9) * 40);
      ctx.moveTo(hipX, hipY);
      ctx.lineTo(hipX + 60 + Math.sin(a + Math.PI) * 34, hipY + 70);
      ctx.lineTo(
        hipX + 60 + Math.sin(a + Math.PI + 0.9) * 90,
        hipY + 40 + Math.cos(a + Math.PI + 0.9) * 40
      );
      ctx.stroke();
    } else if (pose.legs === 'hang') {
      const sway = Math.sin(t * 1.6) * 10;
      ctx.beginPath();
      ctx.moveTo(hipX, hipY);
      ctx.lineTo(hipX - 34 + sway, hipY + 100);
      ctx.lineTo(hipX - 24 + sway * 1.5, hipY + 200);
      ctx.moveTo(hipX, hipY);
      ctx.lineTo(hipX + 34 + sway, hipY + 92);
      ctx.lineTo(hipX + 30 + sway * 1.5, hipY + 194);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(hipX, hipY);
      ctx.lineTo(hipX - 44, this.floorY);
      ctx.moveTo(hipX, hipY);
      ctx.lineTo(hipX + 44, this.floorY);
      ctx.stroke();
    }

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

    // Arms (IK)
    const arms = this.computeArms(pose, hipX, hipY);
    const drawLimb = (a: { sx: number; sy: number; ex: number; ey: number; hx: number; hy: number }) => {
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

    // Hands
    const drawHand = (side: -1 | 1, a: { hx: number; hy: number }, fist: boolean, thumb: boolean) => {
      ctx.fillStyle = WHITE;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(a.hx, a.hy, fist ? 15 : 12, 0, TAU);
      ctx.fill();
      ctx.stroke();
      if (thumb) {
        ctx.beginPath();
        ctx.moveTo(a.hx + side * 4, a.hy - 10);
        ctx.lineTo(a.hx + side * 10, a.hy - 26);
        ctx.stroke();
      }
    };
    drawHand(-1, arms.l, pose.fistL, false);
    drawHand(1, arms.r, pose.fistR, pose.thumb);

    // Head
    const headX = bodyTopX + Math.sin(pose.headTilt) * 10;
    const headY = shoulderY - 78;
    this.drawHead(ctx, headX, headY, pose, t);

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

    // Cheek puffs while blowing
    if (pose.cheekPuff > 0.05) {
      const pr = 8 + 16 * pose.cheekPuff;
      ctx.fillStyle = WHITE;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(cx + side * 46, cy + 30, pr, 0, TAU);
        ctx.fill();
        ctx.stroke();
      }
    }

    if (pose.blush) {
      ctx.save();
      ctx.globalAlpha = 0.75;
      ctx.fillStyle = BLUSH;
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(cx + side * 40, cy + 32, 16, 11, 0, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }

    // Red beanie
    ctx.fillStyle = BEANIE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(cx, cy - 6, r + 4, Math.PI * 1.02, Math.PI * 1.98);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = BEANIE_DEEP;
    ctx.fillRect(cx - r - 4, cy - 22, (r + 4) * 2, 16);
    ctx.strokeRect(cx - r - 4, cy - 22, (r + 4) * 2, 16);
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.arc(cx, cy - r - 14, 16, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Eyes
    const eyeY = cy + 8;
    const eyeDX = 26;
    ctx.strokeStyle = INK;
    ctx.fillStyle = INK;
    if (pose.eye === 'shut') {
      ctx.lineWidth = 7;
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(cx + side * eyeDX, eyeY + 8, 14, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();
      }
    } else {
      const eyeH = pose.eye === 'wide' ? 30 : pose.eye === 'squint' ? 8 : 20;
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(cx + side * eyeDX, eyeY, 11, eyeH / 2, 0, 0, TAU);
        ctx.fill();
      }
    }

    // Eyebrows
    ctx.strokeStyle = INK;
    ctx.lineWidth = 9;
    const browY = cy - 20;
    const twitch = t < 2.0 ? Math.sin(t * 30) * 2 : 0;
    ctx.beginPath();
    if (pose.brow === 'angry') {
      ctx.moveTo(cx - 42, browY - 10);
      ctx.lineTo(cx - 12, browY + 8 + twitch);
      ctx.moveTo(cx + 42, browY - 10);
      ctx.lineTo(cx + 12, browY + 8 - twitch);
    } else if (pose.brow === 'raised') {
      ctx.moveTo(cx - 42, browY - 18);
      ctx.lineTo(cx - 12, browY - 18);
      ctx.moveTo(cx + 42, browY - 18);
      ctx.lineTo(cx + 12, browY - 18);
    } else if (pose.brow === 'sad') {
      ctx.moveTo(cx - 42, browY + 8);
      ctx.lineTo(cx - 12, browY - 8);
      ctx.moveTo(cx + 42, browY + 8);
      ctx.lineTo(cx + 12, browY - 8);
    } else {
      ctx.moveTo(cx - 42, browY - 4);
      ctx.lineTo(cx - 12, browY - 8);
      ctx.moveTo(cx + 42, browY - 4);
      ctx.lineTo(cx + 12, browY - 8);
    }
    ctx.stroke();

    // Mouth
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    const my = cy + 40;
    ctx.beginPath();
    if (pose.mouth === 'grin') {
      ctx.arc(cx, my - 12, 26, 0.15 * Math.PI, 0.85 * Math.PI);
    } else if (pose.mouth === 'smile') {
      ctx.arc(cx, my - 14, 20, 0.2 * Math.PI, 0.8 * Math.PI);
    } else if (pose.mouth === 'frown') {
      ctx.arc(cx, my + 16, 24, 1.15 * Math.PI, 1.85 * Math.PI);
    } else if (pose.mouth === 'o') {
      ctx.ellipse(cx, my, 14, 18, 0, 0, TAU);
    } else if (pose.mouth === 'blow') {
      ctx.ellipse(cx + 6, my, 11, 13, 0, 0, TAU);
    } else if (pose.mouth === 'grit') {
      ctx.moveTo(cx - 24, my);
      ctx.lineTo(cx + 24, my);
      for (let i = -2; i <= 2; i++) {
        ctx.moveTo(cx + i * 10, my - 8);
        ctx.lineTo(cx + i * 10, my + 8);
      }
    } else {
      ctx.moveTo(cx - 18, my);
      ctx.lineTo(cx + 18, my);
    }
    ctx.stroke();
  }

  // ------------------------------------------------------------------
  // Effects
  // ------------------------------------------------------------------

  private renderEffects(
    ctx: CanvasRenderingContext2D,
    t: number,
    char: CharState,
    balloon: BalloonState
  ) {
    // Stretch marks around the balloon while it grows
    if ((t >= 6.2 && t < 8.0) || (t >= 10.2 && t < 11.8)) {
      ctx.save();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.globalAlpha = 0.55;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU + t * 2;
        const x1 = balloon.x + Math.cos(a) * (balloon.r + 26);
        const y1 = balloon.y + Math.sin(a) * (balloon.r + 26);
        const x2 = balloon.x + Math.cos(a) * (balloon.r + 54);
        const y2 = balloon.y + Math.sin(a) * (balloon.r + 54);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Wind lines in shots 5-6
    if ((t >= 14.2 && t < 16.4) || (t >= 19.0 && t < 21.4)) {
      ctx.save();
      ctx.strokeStyle = WHITE;
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      for (let i = 0; i < 5; i++) {
        const phase = (t * 420 + i * 190) % 2400;
        const wy = char.hipY - 420 + i * 150;
        const wx = 700 - phase;
        ctx.globalAlpha = 0.75;
        ctx.beginPath();
        ctx.moveTo(wx, wy);
        ctx.quadraticCurveTo(wx + 70, wy - 14, wx + 140, wy);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Sparkles on the proud beat (shot 4)
    if (t >= 12.8 && t < 14.0) {
      ctx.save();
      ctx.strokeStyle = '#ffe066';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      const cx = char.x;
      const cy = char.hipY - 260;
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * TAU + t * 1.4;
        const px = cx + Math.cos(a) * 180;
        const py = cy + Math.sin(a) * 130;
        const pulse = 12 + Math.sin(t * 12 + i) * 4;
        ctx.beginPath();
        ctx.moveTo(px - pulse, py);
        ctx.lineTo(px + pulse, py);
        ctx.moveTo(px, py - pulse);
        ctx.lineTo(px, py + pulse);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Poke puff at the pine tip (shot 7)
    if (t >= 23.25 && t < 23.9) {
      const u = (t - 23.25) / 0.65;
      ctx.save();
      ctx.globalAlpha = clamp(1 - u, 0, 1) * 0.9;
      ctx.fillStyle = WHITE;
      ctx.strokeStyle = '#bcd9e8';
      ctx.lineWidth = 4;
      for (let i = 0; i < 5; i++) {
        const a = -0.6 - i * 0.35;
        const rad = 24 + u * 90 + i * 12;
        ctx.beginPath();
        ctx.arc(PINE_X + Math.cos(a) * rad, PINE_TOP + 60 + Math.sin(a) * rad, 14 + i * 3, 0, TAU);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }

    // Speed lines during the zigzag
    if (t >= 23.6 && t < 26.9) {
      const u = (t - 23.6) / 3.0;
      ctx.save();
      ctx.strokeStyle = WHITE;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.globalAlpha = 0.7;
      for (let i = 0; i < 4; i++) {
        const a = u * 14 + i * 1.7;
        const px = balloon.x - Math.cos(a) * (balloon.r + 80);
        const py = balloon.y - Math.sin(a) * (balloon.r + 80);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px - Math.cos(a) * 90, py - Math.sin(a) * 90);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Cheek flap lines while clinging in the deflation
    if (t >= 23.6 && t < 26.9 && Math.sin(t * 24) > 0) {
      ctx.save();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      const hx = char.x + 52;
      const hy = char.hipY - 230;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(hx, hy + i * 14);
        ctx.quadraticCurveTo(hx + 26, hy + i * 14 - 6, hx + 44, hy + i * 14);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  private renderScreenEffects(ctx: CanvasRenderingContext2D, t: number) {
    // White graphic flash on the shot 1 freeze
    if (t >= 0.9 && t < 1.15) {
      const u = (t - 0.9) / 0.25;
      ctx.save();
      ctx.globalAlpha = (1 - u) * 0.75;
      ctx.fillStyle = WHITE;
      ctx.fillRect(0, 0, this.width, this.height);
      ctx.restore();
    }
  }

  // ------------------------------------------------------------------
  // Captions and guides
  // ------------------------------------------------------------------

  private renderCaption(ctx: CanvasRenderingContext2D, t: number) {
    const line = this.captions.find((c) => t >= c.from && t < c.to);
    if (!line) return;

    const u = clamp((t - line.from) / 0.1, 0, 1);
    const fade = Math.min(1, (line.to - t) / 0.2);
    const alpha = clamp(Math.min((t - line.from) / 0.05, fade), 0, 1);
    if (alpha <= 0) return;

    const scale = (1 - (1 - u) * 0.25 + Math.sin(u * Math.PI) * 0.18) * line.scale;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(this.width / 2, 470);
    ctx.scale(scale, scale);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';

    const size = 78;
    ctx.font = `900 ${size}px "Arial Black", "Helvetica Neue", Arial, sans-serif`;

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 20;
    ctx.strokeText(line.text, 0, 0);
    ctx.fillStyle = WHITE;
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
