import { StudioConfig } from '../types';

/**
 * DiamondHeistRenderer
 *
 * "THE ANGRY STICKMAN: THE IMPOSSIBLE DIAMOND HEIST" — a 30-second vertical
 * comedy set in a grand museum gallery. Monochrome with red accent for
 * security lasers and alarm lights.
 *
 * Scene 1 0-5     THE HEIST BEGINS      (sneaks in, spots diamond, pulls spoon, points)
 * Scene 2 5-9     THE ALARM             (crawls under lasers, stands early, ZAP, freeze, innocent smile)
 * Scene 3 9-15    THE SETUP             (rage, grabs bucket/tray/mop, props tray, picks ball, idea, aims)
 * Scene 4 15-22   THE IMPOSSIBLE SHOT   (spoon flicks ball → tray → wall → button → case opens)
 * Scene 5 22-26   THE VICTORY           (walks to case, scoops diamond, lifts it, alarms stop, celebrates inside vitrine)
 * Scene 6 26-30   THE TRAP              (case closes around him, visitors photograph, fake smile + angry eyebrow twitch, freeze-frame)
 *
 * Layout (world space): floor y=1460, ceiling y=150, walls x=42 / x=1400.
 * Vitrine: glass front x 450-630 y 700-1460, diamond at (540, 1180).
 * Lasers at y=1060 / 960 / 860 spanning x 60-430 and x 650-1390 (split around the vitrine).
 * Tray at (320, 1185) leaning against bucket at (280, 1460).
 * Demo button panel at (940, 720).
 * Stickman hip: enters at 100, stands at 300, crawls to 390, aims/flicks at 150,
 * walks to case at 500, trapped at 540 inside the vitrine.
 *
 * Six captions burn in NEAR THE TOP of the vertical frame, white fill over a heavy
 * black stroke with a red neon halo (matching the laser accent).
 * The film ends on a freeze-frame at 29.5s.
 */

const TAU = Math.PI * 2;

const INK = '#000000';
const WHITE = '#ffffff';
const RED = '#ef4444'; // vivid accent for lasers/alarm
const RED_GLOW = 'rgba(239, 68, 68, 0.35)';
const RED_SOFT = 'rgba(239, 68, 68, 0.12)';
const SILVER = '#c0c0c0';
const GREY_DARK = '#444444';

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const smooth = (u: number) => { const c = clamp(u, 0, 1); return c * c * (3 - 2 * c); };

type EyeStyle = 'normal' | 'wide' | 'happy' | 'closed' | 'cross' | 'stunned' | 'squint';
type BrowStyle = 'neutral' | 'angry' | 'raised' | 'determined' | 'sad' | 'oneRaised';
type MouthStyle = 'flat' | 'smirk' | 'grin' | 'open' | 'grit' | 'o' | 'wobble' | 'scream';
type HandStyle = 'relaxed' | 'fist' | 'open' | 'point' | 'hold';
type Vec = { x: number; y: number };

interface Pose {
  hipX: number;
  hipY: number;
  lean: number;
  jump: number;
  squashY: number;
  headTilt: number;
  gazeX: number;
  gazeY: number;
  brow: BrowStyle;
  eye: EyeStyle;
  mouth: MouthStyle;
  pupilScale: number;
  leftHand: Vec;
  rightHand: Vec;
  leftHandStyle: HandStyle;
  rightHandStyle: HandStyle;
  leftElbow: number;
  rightElbow: number;
  leftFoot: Vec;
  rightFoot: Vec;
  anger: boolean;
  silhouette: boolean;
}

interface CameraKey {
  t: number;
  x: number;
  y: number;
  zoom: number;
}

/** Burned-in captions, near the top of the vertical frame. */
const CAPTIONS: { text: string; from: number; to: number }[] = [
  { text: 'He wants to steal a diamond using ONLY a spoon!', from: 0.7, to: 4.7 },
  { text: 'ONE WRONG MOVE… ALARM!', from: 5.8, to: 8.9 },
  { text: 'FINE. HE\'LL USE PHYSICS!', from: 9.6, to: 14.8 },
  { text: 'THE MOST RIDICULOUS PLAN EVER!', from: 15.4, to: 21.8 },
  { text: 'HE ACTUALLY GOT IT!', from: 23.2, to: 25.9 },
  { text: 'HE FORGOT THE EXIT! 💀', from: 26.6, to: 30 },
];

export class DiamondHeistRenderer {
  readonly width = 1080;
  readonly height = 1920;

  private readonly floorY = 1460;
  private readonly ceilingY = 150;
  private readonly leftWallX = 42;
  private readonly rightWallX = 1400;

  // --- Vitrine (glass display case) ---
  // Glass front panel spans full height on floor; diamond sits on an internal plinth.
  private readonly vitrineL = 450;
  private readonly vitrineR = 630;
  private readonly vitrineTopBarY = 690; // frame header bar y (glass retracts upward into it)
  private readonly diamondX = 540;
  private readonly diamondY = 1180;
  private readonly plinthL = 480;
  private readonly plinthR = 600;
  private readonly plinthY = 1250;

  // Laser grid (3 beams at chest/shoulder/head height when standing).
  private readonly laserY = [1060, 960, 860];
  private readonly laserSegments = [
    [this.leftWallX + 20, 430],
    [650, this.rightWallX - 20],
  ];

  // Trickshot props
  private readonly trayX = 320;
  private readonly trayY = 1185;   // tray face leaning against bucket
  private readonly trayW = 170;
  private readonly trayH = 14;
  private readonly trayRot = 0.30; // rises to the right -> deflects ball up-right
  private readonly bucketX = 280;
  private readonly bucketY = 1460;
  private readonly mopBaseX = 720;
  private readonly mopBaseY = 1460;
  private readonly mopTopX = 700;
  private readonly mopTopY = 1050;
  private readonly buttonX = 940;
  private readonly buttonY = 720;
  private readonly buttonPanelL = 885;
  private readonly buttonPanelR = 995;
  private readonly buttonPanelTop = 690;
  private readonly buttonPanelBottom = 750;
  private readonly ballR = 10;

  // Stickman hipX timeline (charXAt)
  // 0-0.9 enter 100->300 ; 0.9-5.0 at 300 ; 5.0-6.5 crawl to 390 ; 6.5-9.0 at 390
  // 9.0-10.4 march to bucket ; 10.4-11.6 at bucket/tray 200->300 ; 11.6-12.9 at 280
  // 12.9-14.9 aim/flick at 150 ; 15.0-19.5 at 150 ; 19.5-21.0 watch at 150
  // 21.0-22.6 walk to case 150->500 ; 22.6-26.0 at case 500->540 (inside vitrine)
  // 26.0+ trapped at 540

  private readonly cameraKeys: CameraKey[] = [
    { t: 0.0,   x: 300, y: 1050, zoom: 1.0 },
    { t: 1.0,   x: 540, y: 900,  zoom: 1.15 },
    { t: 2.0,   x: 540, y: 830,  zoom: 1.35 },
    { t: 3.0,   x: 540, y: 830,  zoom: 1.35 },
    { t: 5.0,   x: 300, y: 1100, zoom: 1.05 },
    { t: 6.5,   x: 390, y: 1120, zoom: 1.25 },
    { t: 7.0,   x: 390, y: 1050, zoom: 1.4 },
    { t: 8.5,   x: 390, y: 1000, zoom: 1.4 },
    { t: 9.5,   x: 390, y: 1000, zoom: 1.0 },
    { t: 11.0,  x: 260, y: 1220, zoom: 1.2 },
    { t: 13.0,  x: 150, y: 1180, zoom: 1.2 },
    { t: 15.0,  x: 150, y: 1150, zoom: 1.2 },
    { t: 16.0,  x: 800, y: 900,  zoom: 1.3 },
    { t: 18.5,  x: 940, y: 720,  zoom: 1.5 },
    { t: 19.5,  x: 940, y: 780,  zoom: 1.35 },
    { t: 20.5,  x: 540, y: 820,  zoom: 1.3 },
    { t: 21.0,  x: 340, y: 900,  zoom: 1.2 },
    { t: 22.0,  x: 500, y: 900,  zoom: 1.2 },
    { t: 24.0,  x: 540, y: 800,  zoom: 1.2 },
    { t: 26.0,  x: 540, y: 800,  zoom: 1.2 },
    { t: 26.5,  x: 540, y: 800,  zoom: 1.2 },
    { t: 28.0,  x: 540, y: 950,  zoom: 1.05 },
    { t: 29.5,  x: 540, y: 800,  zoom: 1.4 },
    { t: 30.0,  x: 540, y: 800,  zoom: 1.4 },
  ];

  private kick(t: number): { x: number; y: number } {
    const keys: { t: number; amp: number; decay: number }[] = [
      { t: 6.7, amp: 14, decay: 5 },   // ZAP when standing into laser
      { t: 15.3, amp: 10, decay: 6 },
      { t: 16.2, amp: 10, decay: 6 },
      { t: 19.5, amp: 16, decay: 5 },
      { t: 27.0, amp: 14, decay: 5 },  // case clunk
    ];
    let x = 0, y = 0;
    for (const k of keys) {
      const dt = t - k.t;
      if (dt < 0 || dt > k.amp / 40 + 0.35) continue;
      const env = Math.exp(-dt * k.decay);
      x += Math.sin(dt * 70) * k.amp * env;
      y += Math.cos(dt * 58) * k.amp * 0.6 * env;
    }
    return { x, y };
  }

  private cameraAt(t: number): { x: number; y: number; zoom: number } {
    const keys = this.cameraKeys;
    let i = 0;
    while (i < keys.length - 1 && keys[i + 1].t <= t) i++;
    const a = keys[i];
    const b = keys[Math.min(i + 1, keys.length - 1)];
    const u = b.t > a.t ? smooth((t - a.t) / (b.t - a.t)) : 0;
    let x = lerp(a.x, b.x, u);
    let y = lerp(a.y, b.y, u);
    let zoom = lerp(a.zoom, b.zoom, u);

    // Ball tracking during flight (15.3–19.5)
    if (t >= 15.3 && t <= 19.5) {
      const ball = this.ballFlight(t);
      if (ball) {
        const w = Math.min(1, (t - 15.3) / 0.4) * Math.min(1, (19.5 - t) / 0.4);
        x = lerp(x, ball.x, w);
        y = lerp(y, ball.y - 30, w);
      }
    }

    const minY = this.floorY - (1592 - this.height / 2) / zoom;
    y = Math.max(y, minY);
    return { x, y, zoom };
  }

  private applyCamera(ctx: CanvasRenderingContext2D, t: number) {
    const cam = this.cameraAt(t);
    const shake = this.kick(t);
    ctx.translate(this.width / 2, this.height / 2);
    ctx.scale(cam.zoom, cam.zoom);
    ctx.translate(-cam.x + shake.x, -cam.y + shake.y);
  }

  render(ctx: CanvasRenderingContext2D, time: number, config: StudioConfig, vitrineOpenOverride?: boolean) {
    const t = Math.min(time, 29.5);
    const vitrineOpen = vitrineOpenOverride !== undefined ? (vitrineOpenOverride ? 1 : 0) : this.vitrineOpenAt(t);

    ctx.save();
    // Background: monochrome based on theme
    const isDark = config.canvasTheme === 'white-on-black';
    ctx.fillStyle = isDark ? '#111111' : '#fafafa';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.save();
    this.applyCamera(ctx, t);

    // Soft spotlight cone down onto the vitrine (monochrome flat fill)
    this.renderSpotlight(ctx, t, isDark);

    this.renderGallery(ctx, t, isDark);

    // Vitrine BACK: internal plinth + diamond (draw behind the stickman when he's inside)
    this.renderVitrineBack(ctx, t, isDark);

    this.renderLasers(ctx, t, isDark);
    this.renderProps(ctx, t);
    this.renderBall(ctx, t);

    // Visitors (scene 6) — gathered OUTSIDE the vitrine, behind the glass when closed
    if (t >= 27.0) this.renderVisitors(ctx, t);

    if (t < 29.5) {
      const pose = this.getPose(t);
      this.renderStickman(ctx, pose, t);
    }

    // Vitrine FRONT glass panel: drawn AFTER stickman so he's trapped behind glass when closed.
    this.renderVitrineFront(ctx, t, vitrineOpen, isDark);

    this.renderEffects(ctx, t);
    ctx.restore();

    // Alarm strobe: strong flash 6.7–9.0, subtle security blink until alarms stop at 24.0.
    const strobeOn =
      (time >= 6.7 && time < 9.0 && Math.floor(time * 12) % 2 === 0) ||
      (time >= 9.0 && time < 24.0 && Math.floor(time * 2.5) % 2 === 0);
    if (strobeOn) {
      ctx.fillStyle = RED_SOFT;
      ctx.fillRect(0, 0, this.width, this.height);
    }
    ctx.restore();

    if (config.showCaptions) this.renderCaption(ctx, time);
    if (config.showSafeZones) this.renderSafeZones(ctx);
  }

  private vitrineOpenAt(t: number): number {
    // 0 = closed, 1 = fully open (glass retracted up into header)
    if (t < 19.5) return 0;
    if (t >= 20.5) return 1;
    return smooth((t - 19.5) / 1.0);
  }

  private vitrineCloseAt(t: number): number {
    // 0 = open, 1 = closed (glass slides down around him)
    if (t < 26.0) return 0;
    if (t >= 27.5) return 1;
    return smooth((t - 26.0) / 1.5);
  }

  private renderCaption(ctx: CanvasRenderingContext2D, t: number) {
    const line = CAPTIONS.find((c) => t >= c.from && t < c.to);
    if (!line) return;

    const pop = Math.min(1, (t - line.from) / 0.28);
    const fade = Math.min(1, (line.to - t) / 0.35);
    const alpha = clamp(Math.min(pop, fade), 0, 1);
    if (alpha <= 0) return;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';

    let size = 66;
    const font = (s: number) => `900 ${s}px "Arial Black", "Helvetica Neue", Arial, sans-serif`;
    ctx.font = font(size);

    let lines = [line.text];
    if (ctx.measureText(line.text).width > 950) {
      const words = line.text.split(' ');
      const total = ctx.measureText(line.text).width;
      const spaceW = ctx.measureText(' ').width;
      let best = 1, bestDiff = Infinity, acc = '';
      for (let i = 0; i < words.length - 1; i++) {
        acc = acc ? `${acc} ${words[i]}` : words[i];
        const w = ctx.measureText(acc).width;
        const diff = Math.abs(w - (total - w - spaceW));
        if (diff < bestDiff) { bestDiff = diff; best = i + 1; }
      }
      lines = [words.slice(0, best).join(' '), words.slice(best).join(' ')];
      const widest = () => Math.max(ctx.measureText(lines[0]).width, ctx.measureText(lines[1]).width);
      while (widest() > 950 && size > 36) { size -= 2; ctx.font = font(size); }
    }

    const y0 = 252 + (1 - pop) * 34;
    const step = size * 1.22;
    for (let i = 0; i < lines.length; i++) {
      const text = lines[i];
      const y = lines.length === 1 ? y0 : y0 - step / 2 + i * step;
      ctx.strokeStyle = RED;
      ctx.globalAlpha = alpha * 0.4;
      ctx.lineWidth = 30;
      ctx.strokeText(text, this.width / 2, y);
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 15;
      ctx.strokeText(text, this.width / 2, y);
      ctx.fillStyle = WHITE;
      ctx.fillText(text, this.width / 2, y);
    }
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
    ctx.font = '600 26px Inter, Arial, sans-serif';
    ctx.fillStyle = 'rgba(255, 100, 100, 0.8)';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('Title Safe', 60, 132);
    ctx.restore();
  }

  // ---------------------------------------------------------------------
  // Gallery: walls, floor, pedestals, paintings
  // ---------------------------------------------------------------------

  private renderGallery(ctx: CanvasRenderingContext2D, t: number, isDark: boolean) {
    const wallColor = isDark ? '#1a1a1a' : '#f0f0f0';
    const panelColor = isDark ? '#242424' : '#e8e8e8';
    const lineColor = isDark ? '#333333' : '#cccccc';
    const textColor = isDark ? '#ffffff' : '#000000';

    // Floor
    // 3D perspective floor: converging grid lines to vanishing point above the frame
    const vpX = this.diamondX;
    const vpY = this.ceilingY - 200; // vanishing point above ceiling
    const floorStart = this.floorY;
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
    ctx.lineWidth = 1;
    // Floor depth lines converging to vanishing point
    for (let i = -6; i <= 10; i++) {
      const x = i * 150 + 40;
      const y0 = floorStart;
      const y1 = 1920; // bottom edge
      ctx.beginPath();
      ctx.moveTo(x, y0);
      ctx.lineTo(vpX + (x - vpX) * 0.15, vpY + (y0 - vpY) * 0.15); // near vanishing
      ctx.stroke();
    }
    // Floor horizontal bands converging
    ctx.lineWidth = 2;
    for (const frac of [0.2, 0.35, 0.5, 0.65, 0.8, 1.0]) {
      const y = floorStart - (floorStart - vpY) * (1 - frac);
      ctx.beginPath();
      ctx.moveTo(this.leftWallX, y);
      ctx.lineTo(this.rightWallX, y);
      ctx.stroke();
    }
    // Floor edge line
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-2000, floorStart);
    ctx.lineTo(4000, floorStart);
    ctx.stroke();

    // Ceiling with perspective lines
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-600, this.ceilingY);
    ctx.lineTo(2200, this.ceilingY);
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
    for (const x of [-200, 100, 400, 700, 1000, 1300]) {
      ctx.beginPath();
      ctx.moveTo(x, this.ceilingY);
      ctx.lineTo(vpX + (x - vpX) * 0.2, vpY);
      ctx.stroke();
    }

    // Wall panels
    ctx.fillStyle = panelColor;
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 3;
    for (const p of [
      { x: 60, y: 180, w: 400, h: 280 },
      { x: 1080, y: 180, w: 280, h: 320 },
    ]) {
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.strokeRect(p.x, p.y, p.w, p.h);
      // Frame inner
      ctx.strokeStyle = isDark ? '#444' : '#aaa';
      ctx.lineWidth = 2;
      ctx.strokeRect(p.x + 20, p.y + 20, p.w - 40, p.h - 40);
    }

    // Pedestals on sides
    const pedestals = [
      { x: 80,  y: 1200, w: 120, h: 260 },
      { x: 1340, y: 1200, w: 120, h: 260 },
      { x: 200, y: 1150, w: 80,  h: 310 },
      { x: 1220, y: 1150, w: 80,  h: 310 },
    ];
    ctx.fillStyle = isDark ? '#1a1a1a' : '#f5f5f5';
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 3;
    for (const p of pedestals) {
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.strokeRect(p.x, p.y, p.w, p.h);
      // Top slab
      ctx.fillRect(p.x - 10, p.y - 10, p.w + 20, 20);
      ctx.strokeRect(p.x - 10, p.y - 10, p.w + 20, 20);
    }

    // Emergency exit sign
    ctx.fillStyle = RED;
    ctx.fillRect(1200, 180, 80, 30);
    ctx.fillStyle = WHITE;
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('EXIT', 1240, 202);
  }

  // ---------------------------------------------------------------------
  // Spotlight cone down onto the vitrine (monochrome flat fill)
  // ---------------------------------------------------------------------

  private renderSpotlight(ctx: CanvasRenderingContext2D, t: number, isDark: boolean) {
    const alpha = 0.06;
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
    ctx.beginPath();
    ctx.moveTo(this.diamondX - 60, this.ceilingY);
    ctx.lineTo(this.diamondX + 60, this.ceilingY);
    ctx.lineTo(this.diamondX + 100, this.floorY);
    ctx.lineTo(this.diamondX - 100, this.floorY);
    ctx.fill();
  }

  // ---------------------------------------------------------------------
  // Vitrine BACK: internal plinth + diamond (drawn behind stickman when he's inside)
  // ---------------------------------------------------------------------

  // ---------------------------------------------------------------------
  // Vitrine BACK: internal plinth + diamond + 3D side depth panels
  // ---------------------------------------------------------------------

  private renderVitrineBack(ctx: CanvasRenderingContext2D, t: number, isDark: boolean) {
    const sideDepth = 46; // how far the vitrine recedes (3D depth)
    const sideColor = isDark ? '#0a0a0a' : '#d0d0d0';
    const sideLine = isDark ? '#333333' : '#999999';

    // Left side panel receding into depth
    ctx.fillStyle = sideColor;
    ctx.strokeStyle = sideLine;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(this.plinthL, this.plinthY);
    ctx.lineTo(this.plinthL - sideDepth, this.plinthY - sideDepth * 0.55);
    ctx.lineTo(this.plinthL - sideDepth, this.floorY - sideDepth * 0.55);
    ctx.lineTo(this.plinthL, this.floorY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Right side panel receding into depth
    ctx.beginPath();
    ctx.moveTo(this.plinthR, this.plinthY);
    ctx.lineTo(this.plinthR + sideDepth, this.plinthY - sideDepth * 0.55);
    ctx.lineTo(this.plinthR + sideDepth, this.floorY - sideDepth * 0.55);
    ctx.lineTo(this.plinthR, this.floorY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Top depth strip (behind header bar)
    ctx.beginPath();
    ctx.moveTo(this.plinthL - sideDepth, this.plinthY - sideDepth * 0.55);
    ctx.lineTo(this.plinthR + sideDepth, this.plinthY - sideDepth * 0.55);
    ctx.lineTo(this.plinthR, this.plinthY);
    ctx.lineTo(this.plinthL, this.plinthY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Internal plinth at the bottom of the vitrine
    ctx.fillStyle = isDark ? '#111111' : '#e0e0e0';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.fillRect(this.plinthL, this.plinthY, this.plinthR - this.plinthL, this.floorY - this.plinthY);
    ctx.strokeRect(this.plinthL, this.plinthY, this.plinthR - this.plinthL, this.floorY - this.plinthY);

    // Diamond on plinth (until scooped ~23.0)
    if (t < 23.0) {
      const s = 44 + Math.sin(t * 5) * 3;
      this.renderDiamond(ctx, this.diamondX, this.diamondY, s, t);
    }

    // Label above vitrine
    ctx.fillStyle = isDark ? '#888' : '#444';
    ctx.font = '500 18px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DIAMOND EXHIBIT', this.diamondX, this.vitrineTopBarY - 30);
  }

  // ---------------------------------------------------------------------
  // Vitrine FRONT glass panel: drawn AFTER stickman so he's trapped behind glass when closed.
  // openAt: 0 = closed, 1 = fully open (glass retracted up into header)
  // ---------------------------------------------------------------------

  private renderVitrineFront(ctx: CanvasRenderingContext2D, t: number, openAt: number, isDark: boolean) {
    const closeAt = this.vitrineCloseAt(t);
    // Glass panel bottom edge: covers floor->topBar when closed (closeAt=1), fully retracted (openAt=1).
    // When neither is animating fully, show a panel whose visible height interpolates.
    // Simplest robust model: panel covers y from [topBar + (1-panelFrac)*(floorY-topBar)] down to floorY.
    // panelFrac = 1 when closed, 0 when fully open.
    const panelFrac = 1 - openAt;
    // during closing animation (26-27.5) override with closeAt (glass descends)
    const effectiveFrac = t >= 26.0 ? closeAt : panelFrac;
    const panelBottom = this.floorY - effectiveFrac * (this.floorY - this.vitrineTopBarY);
    const panelHeight = Math.max(0, this.floorY - panelBottom);

    if (panelHeight > 6) {
      const glassAlpha = t < 23.0 ? 0.10 : 0.08;
      ctx.fillStyle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
      ctx.fillRect(this.vitrineL - 6, panelBottom - 6, this.vitrineR - this.vitrineL + 12, panelHeight + 6);
      ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.16)';
      ctx.lineWidth = 6;
      ctx.strokeRect(this.vitrineL, panelBottom, this.vitrineR - this.vitrineL, panelHeight);
      // Diagonal glint
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(this.vitrineL - 40, this.floorY + 20);
      ctx.lineTo(this.vitrineL + 70, panelBottom - 20);
      ctx.stroke();
    }

    // Top frame header bar (always visible)
    ctx.fillStyle = GREY_DARK;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.fillRect(this.vitrineL - 12, this.vitrineTopBarY - 22, this.vitrineR - this.vitrineL + 24, 22);
    ctx.strokeRect(this.vitrineL - 12, this.vitrineTopBarY - 22, this.vitrineR - this.vitrineL + 24, 22);

    // Frame posts (always visible, full height)
    ctx.lineWidth = 8;
    for (const px of [this.vitrineL - 8, this.vitrineR - 4]) {
      ctx.beginPath();
      ctx.moveTo(px, this.vitrineTopBarY);
      ctx.lineTo(px, this.floorY);
      ctx.stroke();
    }

    // "Closed" clamp marks when vitrine is shut
    if (effectiveFrac > 0.8) {
      ctx.fillStyle = RED;
      for (const py of [this.vitrineTopBarY + 120, this.vitrineTopBarY + 340, this.vitrineTopBarY + 560]) {
        ctx.fillRect(this.vitrineL - 14, py - 10, 8, 18);
        ctx.fillRect(this.vitrineR + 6, py - 10, 8, 18);
      }
    }
  }

  // ---------------------------------------------------------------------
  // Visitors (scene 6): simple silhouettes gathering outside the vitrine with cameras
  // ---------------------------------------------------------------------

  private renderVisitors(ctx: CanvasRenderingContext2D, t: number) {
    const visitors = [
      { x: 300, base: 27.4, camX: 300, camY: 980 },
      { x: 780, base: 27.7, camX: 780, camY: 1040 },
      { x: 430, base: 28.0, camX: 430, camY: 1010 },
    ];
    for (const v of visitors) {
      const arrived = t >= v.base;
      if (!arrived) continue;
      const u = Math.min(1, (t - v.base) / 0.4);
      const sx = v.x - 60 + u * 60; // slide in from left
      const sy = this.floorY - 180;
      ctx.fillStyle = '#222222';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      // Body
      ctx.fillRect(sx - 18, sy - 40, 36, 40);
      ctx.strokeRect(sx - 18, sy - 40, 36, 40);
      // Head
      ctx.beginPath();
      ctx.arc(sx, sy - 56, 14, 0, TAU);
      ctx.fill();
      ctx.stroke();
      // Camera (small rectangle held up)
      ctx.save();
      ctx.translate(v.camX, v.camY);
      ctx.fillStyle = '#333333';
      ctx.fillRect(-14, -10, 28, 10);
      ctx.strokeRect(-14, -10, 28, 10);
      ctx.beginPath();
      ctx.arc(-8, -5, 5, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }
  }

  // ---------------------------------------------------------------------
  // Laser grid: 3 beams spanning wall-to-wall but split around the vitrine.
  // Always on (security active through the film).
  // ---------------------------------------------------------------------

  private renderLasers(ctx: CanvasRenderingContext2D, t: number, isDark: boolean) {
    for (const y of this.laserY) {
      const flicker = 0.75 + 0.25 * Math.sin(t * 12 + y * 0.01);
      const alpha = 0.85 * flicker;

      // Emitter glow — bright outer ring + inner core
      ctx.fillStyle = `rgba(255, 220, 80, ${0.5 * flicker})`;
      for (const xa of [this.leftWallX + 20, this.rightWallX - 36]) {
        ctx.beginPath();
        ctx.arc(xa + 10, y, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(xa + 10, y, 10, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 180, 40, ${0.8 * flicker})`;
        ctx.fill();
      }

      // Laser beams — strong distinct 2D lines that split around vitrine
      // Bottom thick accent line
      ctx.strokeStyle = `rgba(255, 150, 0, ${alpha})`;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(this.leftWallX + 20, y);
      ctx.lineTo(this.rightWallX - 36, y);
      ctx.stroke();

      // Core bright line on top
      ctx.strokeStyle = `rgba(255, 220, 100, ${alpha})`;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(this.leftWallX + 20, y);
      ctx.lineTo(this.rightWallX - 36, y);
      ctx.stroke();

      // Inner highlight line
      ctx.strokeStyle = `rgba(255, 255, 200, ${0.6 * flicker})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(this.leftWallX + 20, y);
      ctx.lineTo(this.rightWallX - 36, y);
      ctx.stroke();

      // Emitter glow — bright outer ring + inner core
      ctx.fillStyle = GREY_DARK;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      for (const xa of [this.leftWallX + 20, this.rightWallX - 36]) {
        // Emitter face
        ctx.fillRect(xa, y - 10, 20, 20);
        ctx.strokeRect(xa, y - 10, 20, 20);
        // Emitter depth panel receding into wall
        const dir = xa < 600 ? -1 : 1;
        ctx.fillStyle = isDark ? '#2a2a2a' : '#888888';
        ctx.beginPath();
        ctx.moveTo(xa, y - 10);
        ctx.lineTo(xa + dir * 14, y - 14);
        ctx.lineTo(xa + dir * 14, y + 6);
        ctx.lineTo(xa, y + 10);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = INK;
        ctx.stroke();
        ctx.fillStyle = GREY_DARK;
        // Lens glow
        ctx.fillStyle = `rgba(239, 68, 68, ${0.5 * flicker})`;
        ctx.beginPath();
        ctx.arc(xa + 10, y, 6, 0, TAU);
        ctx.fill();
      }
    }
  }

  // ---------------------------------------------------------------------
  // Props: tray leaning against bucket, bucket rolls into place, mop leans on wall
  // ---------------------------------------------------------------------

  private bucketPos(t: number): { x: number; y: number } {
    // Bucket starts at left wall (110), rolls to final (280) during 10.4-11.0
    if (t < 10.4) return { x: 110, y: this.floorY };
    if (t < 11.0) return { x: lerp(110, 280, smooth((t - 10.4) / 0.6)), y: this.floorY };
    return { x: 280, y: this.floorY };
  }

  private renderBucket(ctx: CanvasRenderingContext2D, x: number, y: number, progress: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(progress, progress);
    ctx.fillStyle = '#444';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    // Bucket body
    ctx.beginPath();
    ctx.moveTo(-24, 0);
    ctx.lineTo(-30, -70);
    ctx.lineTo(30, -70);
    ctx.lineTo(24, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Handle
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(24, -10);
    ctx.quadraticCurveTo(50, -50, 30, -70);
    ctx.stroke();
    ctx.restore();
  }

  private renderMop(ctx: CanvasRenderingContext2D, x: number, y: number, progress: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(progress, progress);
    // Handle
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -180);
    ctx.stroke();
    // Mop head
    ctx.fillStyle = '#ddd';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, -180, 28, 14, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    // Strands
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 2;
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 8, -170);
      ctx.lineTo(i * 8, -140);
      ctx.stroke();
    }
    ctx.restore();
  }

  private renderProps(ctx: CanvasRenderingContext2D, t: number) {
    const b = this.bucketPos(t);
    const bucketShown = t >= 10.0;

    // Mop leaning on wall (scene 3+)
    if (t >= 10.5) {
      const p = t < 11.5 ? smooth((t - 10.5) / 1.0) : 1;
      this.renderMop(ctx, this.mopBaseX, this.mopBaseY, p);
    }

    // Bucket (scene 3+)
    if (bucketShown) {
      const p = t < 10.5 ? smooth((t - 10.0) / 0.5) : 1;
      this.renderBucket(ctx, b.x, b.y, p);
    }

    // Serving tray leaning against bucket (scene 3+), carried into place 11.0-11.6
    if (t >= 11.0) {
      const tx = t < 11.6 ? lerp(110, this.trayX, smooth((t - 11.0) / 0.6)) : this.trayX;
      const ty = t < 11.6 ? lerp(this.floorY - 120, this.trayY, smooth((t - 11.0) / 0.6)) : this.trayY;
      const rot = t < 11.6 ? 0 : this.trayRot;
      const p = t < 11.6 ? smooth((t - 11.0) / 0.6) : 1;
      ctx.save();
      ctx.translate(tx, ty);
      ctx.scale(p, p);
      ctx.rotate(rot);
      ctx.fillStyle = SILVER;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      ctx.fillRect(-this.trayW / 2, -this.trayH / 2, this.trayW, this.trayH);
      ctx.strokeRect(-this.trayW / 2, -this.trayH / 2, this.trayW, this.trayH);
      ctx.strokeStyle = '#a0a0a0';
      ctx.lineWidth = 2;
      ctx.strokeRect(-this.trayW / 2 + 8, -this.trayH / 2 + 4, this.trayW - 16, this.trayH - 8);
      ctx.restore();
    }

    // Demo button panel and button - always visible
    {
      ctx.fillStyle = '#e8e8e8';
      ctx.fillRect(this.buttonPanelL, this.buttonPanelTop, this.buttonPanelR - this.buttonPanelL, this.buttonPanelBottom - this.buttonPanelTop);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      ctx.strokeRect(this.buttonPanelL, this.buttonPanelTop, this.buttonPanelR - this.buttonPanelL, this.buttonPanelBottom - this.buttonPanelTop);
      // Button
      ctx.fillStyle = RED;
      ctx.beginPath();
      ctx.arc(this.buttonX, this.buttonY, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      ctx.stroke();
    }
  }

  // ---------------------------------------------------------------------
  // Trickshot ball: spoon (150,1080) → tray (320,1185) → wall (1340,1000) → button (940,720)
  // ---------------------------------------------------------------------

  private ballFlight(t: number): { x: number; y: number; rot: number; trail: number } | null {
    // Ball on spoon during aim (14.6-15.0)
    if (t >= 14.6 && t < 15.05) {
      const u = (t - 14.6) / 0.45;
      return { x: lerp(170, 200, u), y: lerp(1100, 1080, u), rot: u * 8, trail: 0 };
    }
    // Spoon flick → hits tray at 15.5
    if (t >= 15.05 && t < 15.5) {
      const u = (t - 15.05) / 0.45;
      return { x: lerp(200, 320, u), y: lerp(1080, 1185, u), rot: 8 + u * 12, trail: 0.9 };
    }
    // Tray → wall bounce at 16.2
    if (t >= 15.5 && t < 16.2) {
      const u = smooth((t - 15.5) / 0.7);
      return { x: lerp(320, 1340, u), y: lerp(1185, 1000, u), rot: 20 + u * 16, trail: 0.9 };
    }
    // Wall → button, arcing up to apex then down onto button at 19.5
    if (t >= 16.2 && t < 19.5) {
      const u = (t - 16.2) / 3.3;
      const arc = -Math.sin(u * Math.PI) * 420; // arc upward
      return { x: lerp(1340, 940, u), y: lerp(1000, 720, u) + arc, rot: 36 + u * 24, trail: 0.9 };
    }
    // Resting on the pressed button
    if (t >= 19.5) {
      return { x: 940, y: 724, rot: 50, trail: 0 };
    }
    return null;
  }

  private drawBallShape(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rot: number, alpha: number) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.fillStyle = SILVER;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private renderBall(ctx: CanvasRenderingContext2D, t: number) {
    const b = this.ballFlight(t);
    if (!b) return;
    if (b.trail > 0.45) {
      for (let i = 1; i <= 3; i++) {
        const g = this.ballFlight(t - i * 0.035);
        if (g) this.drawBallShape(ctx, g.x, g.y, this.ballR * (1 - i * 0.14), g.rot, b.trail * (0.55 - i * 0.12));
      }
    }
    this.drawBallShape(ctx, b.x, b.y, this.ballR, b.rot, 1);
  }

  // ---------------------------------------------------------------------
  // Stickman rig
  // ---------------------------------------------------------------------

  private charXAt(t: number): number {
    if (t < 0.9) return lerp(100, 300, smooth(t / 0.9)); // sneaks in from left
    if (t < 5.0) return 300; // at case, spots diamond
    if (t < 6.5) return lerp(300, 390, smooth((t - 5.0) / 1.5)); // crawls under lasers
    if (t < 7.0) return 390; // stands up too early -> ZAP
    if (t < 9.0) return 390; // frozen, then innocent smile
    if (t < 10.4) return lerp(390, 200, smooth((t - 9.0) / 1.4)); // marches to bucket
    if (t < 11.6) return lerp(200, 300, smooth((t - 10.4) / 1.2)); // carries tray to rig
    if (t < 12.9) return 280; // at bucket picking ball
    if (t < 14.6) return lerp(280, 150, smooth((t - 12.9) / 1.7)); // steps back to aim
    if (t < 15.3) return 150; // aim + flick
    if (t < 19.5) return 150; // tracks ball
    if (t < 21.0) return lerp(150, 400, smooth((t - 19.5) / 1.5)); // case opens, walks toward case
    if (t < 22.6) return lerp(400, 500, smooth((t - 21.0) / 1.6)); // arrives at case
    if (t < 26.0) return lerp(500, 540, smooth((t - 22.6) / 0.8)); // into vitrine footprint
    return 540; // trapped inside
  }

  private renderDiamond(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, t: number) {
    ctx.save();
    ctx.translate(x, y);
    // Facets
    const facets = [
      { pts: [[0, -size], [size*0.5, 0], [0, size*0.3], [-size*0.5, 0]], c: '#ffffff' },
      { pts: [[0, -size*0.3], [size*0.5, 0], [0, size], [-size*0.5, 0]], c: '#e8e8ff' },
      { pts: [[-size*0.5, 0], [0, size*0.3], [0, -size*0.3]], c: '#d0d0ff' },
      { pts: [[size*0.5, 0], [0, size*0.3], [0, -size*0.3]], c: '#e0e0ff' },
    ];
    for (const f of facets) {
      ctx.fillStyle = f.c;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(f.pts[0][0], f.pts[0][1]);
      for (let i = 1; i < f.pts.length; i++) ctx.lineTo(f.pts[i][0], f.pts[i][1]);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    // Sparkle
    const sparkleA = (t * 5) % TAU;
    for (let i = 0; i < 4; i++) {
      const a = sparkleA + i * TAU / 4;
      const r = size * 1.3;
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      ctx.lineTo(Math.cos(a) * (r + 20), Math.sin(a) * (r + 20));
      ctx.stroke();
    }
    ctx.restore();
  }


  private basePose(t: number): Pose {
    return {
      hipX: this.charXAt(t),
      hipY: this.floorY - 300,
      lean: 0, jump: 0, squashY: 1, headTilt: 0,
      gazeX: 0.6, gazeY: -0.1,
      brow: 'neutral', eye: 'normal', mouth: 'flat', pupilScale: 1,
      leftHand: { x: -70, y: -40 }, rightHand: { x: 70, y: -40 },
      leftHandStyle: 'relaxed', rightHandStyle: 'relaxed',
      leftElbow: 12, rightElbow: -12,
      leftFoot: { x: -50, y: 300 }, rightFoot: { x: 50, y: 300 },
      anger: false, silhouette: false,
    };
  }

  private walkFeet(p: Pose, t: number, speed = 8) {
    const a = t * speed;
    p.leftFoot = { x: -50 + Math.sin(a) * 26, y: 300 - Math.abs(Math.sin(a)) * 30 };
    p.rightFoot = { x: 50 + Math.sin(a + Math.PI) * 26, y: 300 - Math.abs(Math.sin(a + Math.PI)) * 30 };
  }

  private look(p: Pose, tx: number, ty: number, hipX: number, hipY: number) {
    const dx = tx - hipX;
    const dy = ty - (hipY - 288);
    p.gazeX = clamp(dx / 300, -0.95, 0.95);
    p.gazeY = clamp(dy / 300, -0.95, 0.95);
  }

  private renderStickman(ctx: CanvasRenderingContext2D, p: Pose, t: number) {
    // Shadow
    const sc = clamp(1 - p.jump / 240, 0.35, 1);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(p.hipX + 10, this.floorY + 4, 76 * sc, 17 * sc, 0, 0, TAU);
    ctx.fill();

    const pose = (dx: number) => {
      ctx.save();
      ctx.translate(p.hipX + dx, p.hipY - p.jump);
      ctx.rotate(p.lean);
      ctx.scale(1, p.squashY);
    };

    if (p.anger && t > 9.0 && t < 9.8) {
      for (const off of [-10, 10]) {
        pose(off);
        ctx.globalAlpha = 0.22;
        this.drawRig(ctx, p, t, true);
        ctx.globalAlpha = 1;
        ctx.restore();
      }
    }

    pose(0);
    this.drawRig(ctx, p, t, false);
    ctx.restore();
  }

  private limbPath(ctx: CanvasRenderingContext2D, from: Vec, to: Vec, width: number, bend: number) {
    const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
    const dx = to.x - from.x, dy = to.y - from.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len; // normal
    const cx = mid.x + nx * bend;
    const cy = mid.y + ny * bend;
    const trace = () => { ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.quadraticCurveTo(cx, cy, to.x, to.y); ctx.stroke(); };
    // 3D shading: dark shadow side of the limb (offset toward the normal)
    ctx.strokeStyle = '#222222'; ctx.lineWidth = width + 10;
    ctx.beginPath(); ctx.moveTo(from.x + nx * 4, from.y + ny * 4);
    ctx.quadraticCurveTo(cx + nx * 4, cy + ny * 4, to.x + nx * 4, to.y + ny * 4); ctx.stroke();
    ctx.strokeStyle = WHITE; ctx.lineWidth = width + 8; trace();
    ctx.strokeStyle = INK;  ctx.lineWidth = width; trace();
    // Highlight ridge on top edge
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = width + 2;
    ctx.beginPath(); ctx.moveTo(from.x - nx * 3, from.y - ny * 3);
    ctx.quadraticCurveTo(cx - nx * 3, cy - ny * 3, to.x - nx * 3, to.y - ny * 3); ctx.stroke();
  }

  private drawHand(ctx: CanvasRenderingContext2D, pos: Vec, style: HandStyle) {
    ctx.fillStyle = WHITE; ctx.beginPath(); ctx.arc(pos.x, pos.y, 21, 0, TAU); ctx.fill();
    ctx.fillStyle = INK;   ctx.beginPath(); ctx.arc(pos.x, pos.y, 16, 0, TAU); ctx.fill();
    if (style === 'fist') {
      ctx.strokeStyle = WHITE; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(pos.x - 8, pos.y - 5); ctx.lineTo(pos.x + 8, pos.y - 5); ctx.stroke();
    }
    if (style === 'point') {
      ctx.lineCap = 'round'; ctx.strokeStyle = WHITE; ctx.lineWidth = 7;
      ctx.beginPath(); ctx.moveTo(pos.x + 6, pos.y); ctx.lineTo(pos.x + 24, pos.y - 6); ctx.stroke();
    }
  }

  private drawFoot(ctx: CanvasRenderingContext2D, pos: Vec, facing: number) {
    const path = () => { ctx.beginPath(); ctx.moveTo(pos.x, pos.y - 4); ctx.lineTo(pos.x + facing * 26, pos.y - 2); ctx.stroke(); };
    ctx.lineCap = 'round'; ctx.strokeStyle = WHITE; ctx.lineWidth = 22; path();
    ctx.strokeStyle = INK; ctx.lineWidth = 14; path();
  }

  private drawFace(ctx: CanvasRenderingContext2D, p: Pose) {
    // drawRig already translates to head center (0, -288), so features are
    // relative to head center here; the head circle is radius 64 around (0,0).
    const HX = 0, HY = 0;
    const eyeL = { x: HX - 24, y: HY - 6 }, eyeR = { x: HX + 24, y: HY - 6 };
    const pupil = { x: p.gazeX * 7, y: p.gazeY * 5 };

    // Brows
    ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.lineCap = 'round';
    for (const side of [-1, 1]) {
      ctx.beginPath();
      if (p.brow === 'raised' || (p.brow === 'oneRaised' && side === 1)) {
        ctx.arc(HX + side * 25, HY - 34, 20, Math.PI + 0.35, TAU - 0.35);
      } else if (p.brow === 'angry' || p.brow === 'determined') {
        ctx.moveTo(HX + side * 12, HY - 22); ctx.lineTo(HX + side * 44, HY - 36);
      } else if (p.brow === 'sad') {
        ctx.moveTo(HX + side * 12, HY - 38); ctx.lineTo(HX + side * 44, HY - 24);
      } else {
        ctx.moveTo(HX + side * 12, HY - 30); ctx.lineTo(HX + side * 42, HY - 30);
      }
      ctx.stroke();
    }

    // Eyes
    const drawEye = (c: { x: number; y: number }) => {
      ctx.lineWidth = 5;
      if (p.eye === 'stunned' || p.silhouette) {
        ctx.fillStyle = WHITE; ctx.beginPath(); ctx.arc(c.x, c.y, 11, 0, TAU); ctx.fill(); ctx.stroke();
        ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(c.x, c.y, 4, 0, TAU); ctx.fill(); return;
      }
      if (p.eye === 'closed' || p.eye === 'happy') {
        ctx.strokeStyle = INK; ctx.beginPath();
        if (p.eye === 'happy') ctx.arc(c.x, c.y + 4, 13, Math.PI + 0.2, TAU - 0.2);
        else { ctx.moveTo(c.x - 13, c.y); ctx.lineTo(c.x + 13, c.y); }
        ctx.stroke(); return;
      }
      if (p.eye === 'cross') {
        ctx.strokeStyle = INK; ctx.beginPath();
        ctx.moveTo(c.x - 11, c.y - 11); ctx.lineTo(c.x + 11, c.y + 11);
        ctx.moveTo(c.x + 11, c.y - 11); ctx.lineTo(c.x - 11, c.y + 11); ctx.stroke(); return;
      }
      const rx = p.eye === 'wide' ? 15 : p.eye === 'squint' ? 14 : 13;
      const ry = p.eye === 'wide' ? 18 : p.eye === 'squint' ? 8 : 15;
      ctx.fillStyle = WHITE; ctx.strokeStyle = INK;
      ctx.beginPath(); ctx.ellipse(c.x, c.y, rx, ry, 0, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = INK;
      ctx.beginPath(); ctx.arc(c.x + pupil.x, c.y + pupil.y, p.eye === 'wide' ? 6.5 * p.pupilScale : 6 * p.pupilScale, 0, TAU); ctx.fill();
    };
    drawEye(eyeL); drawEye(eyeR);

    // Mouth
    const mx = HX + 8, my = HY + 28;
    ctx.strokeStyle = INK; ctx.fillStyle = INK; ctx.lineWidth = 7; ctx.lineCap = 'round';
    if (p.mouth === 'flat') { ctx.beginPath(); ctx.moveTo(mx - 15, my); ctx.lineTo(mx + 15, my); ctx.stroke(); }
    else if (p.mouth === 'smirk') { ctx.beginPath(); ctx.arc(mx, my - 6, 22, 0.18, 0.85); ctx.stroke(); }
    else if (p.mouth === 'grin') { ctx.beginPath(); ctx.arc(mx, my - 8, 24, 0.12, 0.88); ctx.stroke(); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(mx - 20, my - 2); ctx.lineTo(mx + 20, my - 2); ctx.stroke(); }
    else if (p.mouth === 'open') { ctx.beginPath(); ctx.ellipse(mx, my + 4, 15, 19, 0, 0, TAU); ctx.fill(); }
    else if (p.mouth === 'o') { ctx.beginPath(); ctx.arc(mx + 2, my + 4, 12, 0, TAU); ctx.fill(); }
    else if (p.mouth === 'scream') { ctx.beginPath(); ctx.ellipse(mx + 2, my + 6, 17, 25, 0, 0, TAU); ctx.fill(); ctx.fillStyle = WHITE; ctx.beginPath(); ctx.ellipse(mx + 2, my - 10, 12, 5, 0, 0, TAU); ctx.fill(); }
    else if (p.mouth === 'grit') { ctx.fillStyle = WHITE; ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.fillRect(mx - 18, my - 9, 36, 18); ctx.strokeRect(mx - 18, my - 9, 36, 18); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(mx - 6, my - 9); ctx.lineTo(mx - 6, my + 9); ctx.moveTo(mx + 6, my - 9); ctx.lineTo(mx + 6, my + 9); ctx.stroke(); }
    else if (p.mouth === 'wobble') { ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(mx - 18, my); ctx.quadraticCurveTo(mx - 9, my - 9, mx, my); ctx.quadraticCurveTo(mx + 9, my + 9, mx + 18, my); ctx.stroke(); }
  }

  private drawRig(ctx: CanvasRenderingContext2D, p: Pose, t: number, ghost: boolean) {
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';

    this.drawFoot(ctx, p.leftFoot, -1);
    this.limbPath(ctx, { x: -6, y: -10 }, p.leftFoot, 16, -16);
    this.drawFoot(ctx, p.rightFoot, 1);
    this.limbPath(ctx, { x: 6, y: -10 }, p.rightFoot, 16, 16);

    this.limbPath(ctx, { x: -14, y: -200 }, p.leftHand, 15, p.leftElbow);
    this.drawHand(ctx, p.leftHand, p.leftHandStyle);

    this.limbPath(ctx, { x: 0, y: -8 }, { x: 0, y: -232 }, 20, 0);

    ctx.save();
    ctx.translate(0, -288);
    ctx.rotate(p.headTilt);
    ctx.fillStyle = WHITE; ctx.strokeStyle = INK; ctx.lineWidth = 9;
    ctx.beginPath(); ctx.arc(0, 0, 68, 0, TAU); ctx.fill(); ctx.stroke();
    // 3D spherical head shading: highlight top-left, shadow bottom-right
    ctx.save();
    ctx.globalAlpha = 0.4;
    // Highlight — top-left radial gradient
    const gradHighlight = ctx.createRadialGradient(-25, -35, 5, 0, 0, 75);
    gradHighlight.addColorStop(0, 'rgba(255,255,255,0.6)');
    gradHighlight.addColorStop(0.5, 'rgba(255,255,255,0.3)');
    gradHighlight.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradHighlight;
    ctx.fillRect(-100, -100, 200, 200);
    // Shadow — bottom-right radial gradient
    const gradShadow = ctx.createRadialGradient(30, 40, 5, 0, 0, 75);
    gradShadow.addColorStop(0, 'rgba(0,0,0,0.35)');
    gradShadow.addColorStop(0.5, 'rgba(0,0,0,0.15)');
    gradShadow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradShadow;
    ctx.fillRect(-100, -100, 200, 200);
    ctx.restore();
    if (!ghost) this.drawFace(ctx, p);
    ctx.restore();

    this.limbPath(ctx, { x: 14, y: -200 }, p.rightHand, 15, p.rightElbow);
    this.drawHand(ctx, p.rightHand, p.rightHandStyle);

    if (!ghost) {
      // Spoon in right hand (scenes 1, 4, 5)
      if ((t >= 2.0 && t < 5.0) || (t >= 14.5 && t < 15.3) || (t >= 22.0 && t < 26.5)) {
        this.drawSpoon(ctx, p.rightHand);
      }
      // Diamond on spoon (scene 5)
      if (t >= 22.5 && t < 26.5) {
        this.renderDiamond(ctx, p.rightHand.x + 8, p.rightHand.y - 50, 24, t);
      }
    }
  }

  private drawSpoon(ctx: CanvasRenderingContext2D, hand: Vec) {
    ctx.save();
    ctx.translate(hand.x + 10, hand.y - 20);
    ctx.rotate(-0.5);
    ctx.fillStyle = '#c0c0c0';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    // Bowl
    ctx.beginPath(); ctx.ellipse(0, 0, 8, 14, 0, 0, TAU); ctx.fill(); ctx.stroke();
    // Handle
    ctx.lineCap = 'round'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(0, 14); ctx.lineTo(0, 50); ctx.stroke();
    ctx.restore();
  }

  // ---------------------------------------------------------------------
  // Poses
  // ---------------------------------------------------------------------

  private getPose(t: number): Pose {
    const p = this.basePose(t);
    if (t < 5) this.poseHeist(p, t);
    else if (t < 9) this.poseAlarm(p, t);
    else if (t < 15) this.poseSetup(p, t);
    else if (t < 22) this.poseShot(p, t);
    else if (t < 26.5) this.poseVictory(p, t);
    else this.poseTrap(p, t);
    return p;
  }

  private poseHeist(p: Pose, t: number) {
    this.look(p, this.diamondX, this.diamondY, p.hipX, p.hipY);
    if (t < 0.9) {
      this.walkFeet(p, t, 6);
      p.lean = 0.06; p.brow = 'determined'; p.mouth = 'flat'; p.eye = 'squint';
      return;
    }
    if (t < 1.5) {
      p.brow = 'raised'; p.mouth = 'smirk'; p.eye = 'wide'; p.gazeY = -0.7;
      return;
    }
    if (t < 2.5) {
      const u = smooth((t - 1.5) / 1.0);
      p.rightHand = { x: lerp(70, 60, u), y: lerp(-40, -290, u) };
      p.rightHandStyle = 'hold'; p.leftHand = { x: -60, y: -60 };
      p.brow = 'oneRaised'; p.mouth = 'smirk'; p.headTilt = 0.1;
      return;
    }
    if (t < 3.5) {
      p.rightHand = { x: 90, y: -310 }; p.rightHandStyle = 'point';
      p.brow = 'determined'; p.mouth = 'flat'; p.lean = 0.12;
      return;
    }
    p.lean = 0.16; p.brow = 'raised'; p.mouth = 'smirk';
  }

  private poseAlarm(p: Pose, t: number) {
    if (t < 6.5) {
      // Crawling low under lasers
      p.squashY = 0.44; p.hipY = this.floorY - 120; // lower body
      p.lean = 0.25;
      p.leftHand = { x: -60, y: 40 }; p.rightHand = { x: 60, y: 40 };
      p.brow = 'determined'; p.eye = 'squint'; p.mouth = 'grit';
      this.walkFeet(p, t, 9);
      return;
    }
    if (t < 7.0) {
      // Stands up too early -> ZAP into chest laser
      const u = smooth((t - 6.5) / 0.5);
      p.squashY = lerp(0.44, 1.0, u);
      p.hipY = lerp(this.floorY - 120, this.floorY - 300, u);
      p.lean = lerp(0.25, 0.05, u);
      p.brow = 'raised'; p.eye = 'wide'; p.pupilScale = 1.35; p.mouth = 'open';
      return;
    }
    if (t < 8.0) {
      // Frozen mid-reaction
      p.lean = 0; p.brow = 'raised'; p.eye = 'wide'; p.mouth = 'flat'; p.squashY = 1.0;
      p.leftHand = { x: -70, y: -40 }; p.rightHand = { x: 70, y: -40 };
      return;
    }
    // Innocent smile at camera
    p.brow = 'oneRaised'; p.eye = 'happy'; p.mouth = 'smirk'; p.headTilt = -0.12;
    p.gazeX = 0; p.gazeY = 0.12;
  }

  private poseSetup(p: Pose, t: number) {
    p.anger = t < 9.8;
    if (t < 9.8) {
      p.hipY = this.floorY - 300; p.squashY = 1.0;
      this.walkFeet(p, t, 10);
      p.rightHand = { x: 130 + Math.sin(t * 34) * 6, y: -340 };
      p.rightHandStyle = 'open'; p.leftHand = { x: -130, y: -340 }; p.leftHandStyle = 'open';
      p.eye = 'wide'; p.pupilScale = 1.25; p.mouth = 'scream'; p.lean = -0.05;
      return;
    }
    if (t < 10.4) {
      this.walkFeet(p, t, 8);
      p.lean = 0.1; p.brow = 'determined';
      const b = this.bucketPos(t);
      this.look(p, b.x, b.y - 40, p.hipX, p.hipY);
      return;
    }
    if (t < 11.0) {
      // Shoves bucket into position, walks backward
      p.lean = 0.25; p.squashY = 1.03;
      p.rightHand = { x: -110, y: 130 }; p.rightHandStyle = 'hold';
      p.leftHand = { x: -150, y: 90 }; p.leftHandStyle = 'hold';
      this.look(p, this.trayX, this.trayY, p.hipX, p.hipY);
      return;
    }
    if (t < 11.6) {
      // Places tray leaning against bucket
      p.lean = 0.35; p.squashY = 1.05;
      p.rightHand = { x: -130, y: 150 }; p.rightHandStyle = 'open';
      p.leftHand = { x: -40, y: 110 }; p.leftHandStyle = 'open';
      this.look(p, this.trayX, this.trayY, p.hipX, p.hipY);
      return;
    }
    if (t < 12.0) {
      // Plucks ball from bucket, holds it up
      p.rightHand = { x: 20, y: -60 }; p.rightHandStyle = 'hold';
      p.leftHand = { x: -120, y: -60 }; p.leftHandStyle = 'fist';
      p.brow = 'determined'; p.eye = 'wide'; p.mouth = 'o';
      this.look(p, this.bucketX, this.bucketY - 60, p.hipX, p.hipY);
      return;
    }
    if (t < 12.9) {
      // Idea moment: record scratch, lightbulb sparkle above head
      p.rightHand = { x: 40, y: -40 }; p.rightHandStyle = 'open';
      p.leftHand = { x: -60, y: -40 }; p.leftHandStyle = 'open';
      p.brow = 'raised'; p.eye = 'happy'; p.mouth = 'smirk'; p.headTilt = -0.15;
      return;
    }
    // Aims at tray, ball on spoon
    p.eye = 'squint'; p.brow = 'determined'; p.mouth = 'grin';
    p.rightHand = { x: 60, y: -250 }; p.rightHandStyle = 'hold'; p.rightElbow = -4;
    p.leftHand = { x: -70, y: -60 }; p.leftHandStyle = 'fist';
    p.lean = 0.05;
    this.look(p, this.trayX, this.trayY - 20, p.hipX, p.hipY);
  }

  private poseShot(p: Pose, t: number) {
    if (t < 15.05) {
      // Anticipation: spoon draws back
      const u = smooth((t - 14.6) / 0.45);
      p.rightHand = { x: lerp(60, -80, u), y: lerp(-250, 170, u) };
      p.rightHandStyle = 'hold'; p.leftHand = { x: -90, y: -60 }; p.leftHandStyle = 'fist';
      p.lean = lerp(0.05, -0.28, u); p.eye = 'wide'; p.mouth = 'o'; p.brow = 'raised';
      this.look(p, this.trayX, this.trayY - 20, p.hipX, p.hipY);
      return;
    }
    if (t < 15.5) {
      // Flick release -> follow-through
      const u = smooth((t - 15.05) / 0.45);
      p.rightHand = { x: lerp(-80, 150, u), y: lerp(170, -260, u) };
      p.lean = lerp(-0.28, 0.12, u);
      const ball = this.ballFlight(t);
      if (ball) this.look(p, ball.x, ball.y, p.hipX, p.hipY);
      return;
    }
    if (t < 16.2) {
      // Recoil at tray PING
      p.lean = lerp(0.12, -0.15, smooth((t - 15.5) / 0.7));
      p.eye = 'wide'; p.pupilScale = 1.3; p.brow = 'raised'; p.mouth = 'o';
      const ball = this.ballFlight(t);
      if (ball) this.look(p, ball.x, ball.y, p.hipX, p.hipY);
      return;
    }
    if (t < 19.5) {
      // Track ball across room -> BOING wall -> button
      const ball = this.ballFlight(t);
      if (ball) { this.look(p, ball.x, ball.y, p.hipX, p.hipY); p.headTilt = clamp((ball.x - p.hipX) / 5000, -0.14, 0.14); }
      p.eye = 'wide'; p.pupilScale = 1.15; p.brow = 'raised'; p.mouth = t < 17.5 ? 'o' : 'wobble';
      p.rightHand = { x: 130, y: -140 }; p.leftHand = { x: -50, y: -110 }; p.lean = 0.05;
      return;
    }
    // Button hit: case opens
    p.lean = 0.05; p.eye = 'wide'; p.pupilScale = 1.4; p.brow = 'raised';
    if (t < 20.5) { p.mouth = 'o'; this.look(p, this.buttonX, this.buttonY, p.hipX, p.hipY); }
    else { p.mouth = 'grin'; p.rightHand = { x: 70, y: -150 }; p.rightHandStyle = 'fist'; p.leftHand = { x: -70, y: -150 }; p.leftHandStyle = 'fist'; this.look(p, this.diamondX, this.diamondY, p.hipX, p.hipY); }
  }

  private poseVictory(p: Pose, t: number) {
    if (t < 23.0) {
      // Walks into vitrine, reaches in with spoon
      const u = smooth((t - 22.0) / 1.0);
      p.rightHand = { x: lerp(70, 60, u), y: lerp(-140, -300, u) }; p.rightHandStyle = 'hold';
      p.leftHand = { x: -70, y: -80 }; p.brow = 'determined'; p.eye = 'squint'; p.mouth = 'grit';
      this.look(p, this.diamondX, this.diamondY, p.hipX, p.hipY);
      return;
    }
    if (t < 23.4) {
      // Scoops the diamond (diamond transfers to spoon)
      p.rightHand = { x: 60, y: -300 }; p.rightHandStyle = 'hold';
      p.lean = -0.12; p.brow = 'determined'; p.eye = 'squint'; p.mouth = 'grit';
      this.look(p, this.diamondX, this.diamondY, p.hipX, p.hipY);
      return;
    }
    if (t < 24.0) {
      // Lifts diamond high on spoon
      p.rightHand = { x: 70, y: -340 }; p.rightHandStyle = 'hold';
      p.lean = -0.1; p.brow = 'raised'; p.eye = 'happy'; p.mouth = 'scream'; p.gazeX = 0; p.gazeY = -0.9;
      return;
    }
    if (t < 25.0) {
      // Alarms stop -> sudden silence
      p.rightHand = { x: 70, y: -340 }; p.rightHandStyle = 'hold';
      p.lean = -0.05; p.brow = 'raised'; p.eye = 'wide'; p.mouth = 'o'; p.gazeX = 0; p.gazeY = -0.55;
      return;
    }
    // Celebration dance inside the vitrine footprint
    const ph = (t - 25.0) * 6.5;
    p.jump = Math.abs(Math.sin(ph * 1.5)) * 30;
    p.lean = Math.sin(ph) * 0.09;
    p.headTilt = Math.sin(ph * 0.7) * 0.12;
    p.rightHand = { x: 110 + Math.sin(ph * 2) * 12, y: -350 }; p.rightHandStyle = 'fist';
    p.leftHand = { x: -110, y: -350 }; p.leftHandStyle = 'fist';
    p.eye = 'happy'; p.brow = 'raised'; p.mouth = 'scream'; p.gazeX = 0.1; p.gazeY = -0.5;
    if (p.jump > 7) { p.leftFoot = { x: -48, y: 268 }; p.rightFoot = { x: 48, y: 262 }; }
  }

  private poseTrap(p: Pose, t: number) {
    if (t < 27.5) {
      // Glass closes around him; he doesn't notice yet
      const u = smooth((t - 26.0) / 1.5);
      p.squashY = lerp(1, 0.96, u);
      p.lean = 0; p.brow = 'raised'; p.eye = 'wide'; p.mouth = 'open'; p.pupilScale = 1.25;
      p.rightHand = { x: 70, y: -300 }; p.rightHandStyle = 'hold';
      p.leftHand = { x: -70, y: -60 }; p.leftHandStyle = 'fist';
      return;
    }
    if (t < 29.0) {
      // Trapped like an exhibit; visitors photographing
      p.squashY = 0.96;
      p.brow = 'oneRaised'; p.eye = 'happy'; p.mouth = 'smirk'; p.headTilt = Math.sin((t - 26.5) * 10) * 0.05;
      p.rightHand = { x: 70, y: -290 }; p.rightHandStyle = 'hold';
      p.leftHand = { x: -70, y: -60 }; p.leftHandStyle = 'fist';
      p.gazeX = 0.35; p.gazeY = 0.1;
      return;
    }
    if (t < 29.5) {
      // Fake smile + angry eyebrow twitch
      p.squashY = 0.96;
      p.brow = t < 29.25 ? 'oneRaised' : 'angry';
      p.eye = 'happy'; p.mouth = 'smirk'; p.headTilt = Math.sin((t - 29.0) * 45) * 0.07;
      p.rightHand = { x: 70, y: -290 }; p.rightHandStyle = 'hold';
      p.leftHand = { x: -70, y: -60 }; p.leftHandStyle = 'fist';
      p.gazeX = 0.35; p.gazeY = 0.1;
      return;
    }
    // Freeze frame
    p.squashY = 0.96; p.brow = 'angry'; p.eye = 'happy'; p.mouth = 'smirk'; p.headTilt = 0.08;
  }

  // ---------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------

  private renderEffects(ctx: CanvasRenderingContext2D, t: number) {
    // Sparkle on diamond (scene 1)
    if (t >= 1.0 && t < 5.0) {
      this.sparkle(ctx, this.diamondX, this.diamondY, (t - 1.0) / 4.0, WHITE);
    }
    // Laser trigger flash (ZAP when he stands into chest laser at 6.7)
    if (t >= 6.7 && t < 7.0) this.impactBurst(ctx, 390, this.laserY[1], (t - 6.7) / 0.3, RED);
    // Tray ping (ball hits tray at 15.5)
    if (t >= 15.5 && t < 16.0) this.impactBurst(ctx, this.trayX, this.trayY, (t - 15.5) / 0.5, WHITE);
    // Wall boing (ball hits wall at 16.2)
    if (t >= 16.2 && t < 16.7) this.impactBurst(ctx, 1340, 1000, (t - 16.2) / 0.5, WHITE);
    // Button press (ball hits button at 19.5)
    if (t >= 19.5 && t < 20.0) this.impactBurst(ctx, this.buttonX, this.buttonY, (t - 19.5) / 0.5, RED);
    // Case open puff
    if (t >= 19.5 && t < 20.0) this.puff(ctx, this.diamondX, this.diamondY, (t - 19.5) / 0.5);
    // Scoop diamond
    if (t >= 23.0 && t < 23.5) this.sparkle(ctx, this.diamondX, this.diamondY, (t - 23.0) / 0.5, WHITE);
    // Camera flashes (scene 6) at visitor positions
    if (t >= 27.5 && t < 29.5) {
      const flashes = [
        { x: 300, y: 980, at: 27.6 }, { x: 780, y: 1040, at: 27.9 },
        { x: 430, y: 1010, at: 28.2 }, { x: 300, y: 980, at: 28.5 },
        { x: 780, y: 1040, at: 28.8 }, { x: 430, y: 1010, at: 29.1 },
      ];
      for (const fl of flashes) {
        if (t >= fl.at && t < fl.at + 0.15) {
          this.sparkle(ctx, fl.x, fl.y, (t - fl.at) / 0.15, WHITE);
        }
      }
    }
    // Glass clunk dust (case slams shut at 27.0)
    if (t >= 26.5 && t < 27.0) this.puff(ctx, 540, 1180, (t - 26.5) / 0.5);
  }

  private impactBurst(ctx: CanvasRenderingContext2D, x: number, y: number, u: number, color: string) {
    if (u < 0 || u > 1) return;
    ctx.save(); ctx.translate(x, y);
    ctx.strokeStyle = color; ctx.lineCap = 'round'; ctx.lineWidth = 9 * (1 - u * 0.6); ctx.globalAlpha = 1 - u;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU + 0.3;
      const r0 = 18 + u * 66, r1 = 44 + u * 110;
      ctx.beginPath(); ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1); ctx.stroke();
    }
    ctx.restore();
  }

  private puff(ctx: CanvasRenderingContext2D, x: number, y: number, u: number) {
    if (u < 0 || u > 1) return;
    ctx.save();
    ctx.fillStyle = 'rgba(180, 180, 180, 0.7)'; ctx.globalAlpha = (1 - u) * 0.8;
    for (const d of [{ dx: -34, dy: -8, r: 0.8 }, { dx: 0, dy: -26, r: 1.05 }, { dx: 36, dy: -6, r: 0.75 }]) {
      ctx.beginPath(); ctx.arc(x + d.dx * (0.5 + u), y + d.dy - u * 34, (12 + u * 16) * d.r, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }

  private sparkle(ctx: CanvasRenderingContext2D, x: number, y: number, u: number, color: string) {
    if (u < 0 || u > 1) return;
    const s = 22 * (1 - u * 0.4);
    ctx.save(); ctx.translate(x, y); ctx.rotate(u * 0.8); ctx.globalAlpha = 1 - u * u;
    ctx.strokeStyle = color; ctx.lineCap = 'round'; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(-s, 0); ctx.lineTo(s, 0); ctx.moveTo(0, -s); ctx.lineTo(0, s); ctx.stroke();
    ctx.restore();
  }
}