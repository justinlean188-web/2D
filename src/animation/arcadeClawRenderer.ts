import { StudioConfig } from '../types';

/**
 * ArcadeClawRenderer
 *
 * "THE ANGRY STICKMAN: THE IMPOSSIBLE CLAW MACHINE" — a 30-second vertical
 * comedy set in a neon arcade. This is the one deliberate palette exception
 * to the monochrome house style: the master prompt explicitly asks for
 * "bright neon arcade colors", so the room is deep indigo with cyan,
 * magenta, violet and yellow neon props — still flat fills, thick black
 * outlines, white round stickman head and a black stickman body (drawn with
 * a white sticker halo so he reads on every dark surface).
 *
 * Scene 1 0-5     ONE COIN!               (coin in, button pressed, claw drops)
 * Scene 2 5-9     THE DROP                (claw lifts the bear, opens at the
 *                                          last second, eye twitch)
 * Scene 3 9-15    THE TRICKSHOT RIG       (rages, drags the whole arcade into
 *                                          a Rube Goldberg machine, aims)
 * Scene 4 15-22   THE IMPOSSIBLE SHOT     (bumper boing, cabinet ricochet,
 *                                          lands on the giant button)
 * Scene 5 22-26   HE WON IT               (bear into the chute, celebration,
 *                                          reaches into the prize door)
 * Scene 6 26-30   THE AVALANCHE           (machine malfunctions, a plush
 *                                          avalanche buries him, one tiny arm
 *                                          holds up the original coin, freeze)
 *
 * Six captions burn in NEAR THE TOP of the frame (the prompt asks for it),
 * white fill over a heavy black stroke with a cyan neon halo. The film ends
 * on a freeze-frame at 29.55s — not a cut to black.
 */

const TAU = Math.PI * 2;

/** Core ink + the neon arcade palette. */
const INK = '#000000';
const WHITE = '#ffffff';
const WALL = '#191436'; // deep indigo back wall
const WALL_PANEL = '#241d4d'; // wall panel accents
const FLOOR = '#2b2457'; // mid indigo floor
const SKIRT = '#4c3f96'; // floor/wall skirting line
const CASE_DARK = '#0c0a1e'; // inside the claw machine glass
const BODY = '#5a52a6'; // claw machine / console body
const BODY_DARK = '#3d3780';
const MARQUEE = '#38316f';
const CAB = '#7e22ce'; // racing cabinet body
const DIM_CAB = '#2f2a5e'; // background machines
const CYAN = '#2ee6ff';
const MAGENTA = '#ff4fd8';
const VIOLET = '#8b5cf6';
const YELLOW = '#ffd23f';
const RED = '#ff3b30';
const ORANGE = '#f97316'; // basketball
const PLUSH_CREAM = '#ffe3b3';
const PLUSH_PINK = '#ff9fd0';
const PLUSH_MINT = '#9ff0d0';

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const smooth = (u: number) => {
  const c = clamp(u, 0, 1);
  return c * c * (3 - 2 * c);
};
const bump = (u: number) => Math.sin(clamp(u, 0, 1) * Math.PI);

type EyeStyle = 'normal' | 'wide' | 'happy' | 'closed' | 'cross' | 'stunned' | 'squint';
type BrowStyle = 'neutral' | 'angry' | 'raised' | 'determined' | 'sad' | 'oneRaised';
type MouthStyle =
  | 'flat'
  | 'smirk'
  | 'grin'
  | 'open'
  | 'grit'
  | 'o'
  | 'wobble'
  | 'scream';
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

interface ClawState {
  x: number;
  y: number;
  open: number;
}

/** Burned-in captions, near the top of the vertical frame. */
const CAPTIONS: { text: string; from: number; to: number }[] = [
  { text: 'He wants to win this giant teddy bear with ONE coin!', from: 0.7, to: 4.7 },
  { text: 'THE CLAW DROPS IT AT THE LAST SECOND!', from: 5.6, to: 8.9 },
  { text: 'SO HE TURNS THE ENTIRE ARCADE INTO A TRICKSHOT!', from: 9.7, to: 14.8 },
  { text: 'THAT SHOT SHOULD BE IMPOSSIBLE!', from: 15.7, to: 21.8 },
  { text: 'HE ACTUALLY WON IT!', from: 23.3, to: 25.9 },
  { text: 'HE WON… THE ENTIRE INVENTORY! 💀', from: 26.7, to: 30 },
];

export class ArcadeClawRenderer {
  readonly width = 1080;
  readonly height = 1920;

  private readonly floorY = 1460;
  private readonly ceilingY = 150;
  private readonly leftWallX = 42;
  private readonly rightWallX = 1400;

  // Claw machine (hero prop).
  private readonly ml = 660; // left edge
  private readonly mr = 1030; // right edge
  private readonly mt = 640; // cabinet top
  private readonly gl = 680; // glass inner left
  private readonly gr = 1010; // glass inner right
  private readonly gt = 700; // glass inner top
  private readonly gb = 1180; // glass inner bottom
  private readonly railY = 750;
  // Prize chute slot (inside the glass, upper right).
  private readonly chuteL = 900;
  private readonly chuteR = 1005;
  private readonly chuteT = 1050;
  // Retrieval door on the front panel.
  private readonly doorL = 700;
  private readonly doorR = 840;
  private readonly doorT = 1250;
  private readonly doorB = 1370;
  // Control console with the coin slot and the giant red button.
  private readonly conL = 1050;
  private readonly conR = 1190;
  private readonly conT = 1040;
  private readonly btnX = 1125;
  private readonly btnY = 1150;
  private readonly btnBaseR = 56;
  private readonly btnCapR = 44;
  // Props.
  private readonly bumperX = 360;
  private readonly bumperY = 1370;
  private readonly bumperR = 58;
  private readonly cabL = 450; // racing cabinet
  private readonly cabR = 590;
  private readonly cabT = 980;
  private readonly rampLip = { x: 212, y: 1332 };
  private readonly ballR = 40;

  private readonly cameraKeys: CameraKey[] = [
    { t: 0.0, x: 760, y: 980, zoom: 0.98 },
    { t: 1.3, x: 900, y: 980, zoom: 1.05 },
    { t: 1.9, x: 1010, y: 900, zoom: 1.32 },
    { t: 2.6, x: 1075, y: 1030, zoom: 1.5 },
    { t: 3.15, x: 1090, y: 1075, zoom: 1.5 },
    { t: 3.7, x: 900, y: 930, zoom: 1.12 },
    { t: 5.0, x: 860, y: 950, zoom: 1.16 },
    { t: 5.4, x: 850, y: 940, zoom: 1.45 },
    { t: 7.45, x: 890, y: 920, zoom: 1.5 },
    { t: 7.9, x: 880, y: 990, zoom: 1.35 },
    { t: 8.4, x: 840, y: 1030, zoom: 1.3 },
    { t: 8.7, x: 1010, y: 850, zoom: 1.5 },
    { t: 9.7, x: 1010, y: 850, zoom: 1.5 },
    { t: 10.0, x: 700, y: 1000, zoom: 1.02 },
    { t: 10.9, x: 640, y: 1040, zoom: 1.05 },
    { t: 11.35, x: 400, y: 1150, zoom: 1.3 },
    { t: 12.1, x: 400, y: 1160, zoom: 1.3 },
    { t: 12.4, x: 330, y: 1240, zoom: 1.35 },
    { t: 13.1, x: 340, y: 1230, zoom: 1.32 },
    { t: 13.45, x: 560, y: 1150, zoom: 1.22 },
    { t: 14.1, x: 540, y: 1160, zoom: 1.22 },
    { t: 14.4, x: 330, y: 1150, zoom: 1.35 },
    { t: 15.0, x: 330, y: 1150, zoom: 1.35 },
    { t: 15.3, x: 300, y: 1200, zoom: 1.28 },
    { t: 18.7, x: 700, y: 950, zoom: 1.15 },
    { t: 18.95, x: 1105, y: 1090, zoom: 1.55 },
    { t: 19.55, x: 1105, y: 1090, zoom: 1.55 },
    { t: 19.95, x: 860, y: 900, zoom: 1.14 },
    { t: 21.0, x: 860, y: 910, zoom: 1.2 },
    { t: 21.4, x: 840, y: 950, zoom: 1.45 },
    { t: 22.3, x: 930, y: 950, zoom: 1.45 },
    { t: 23.3, x: 935, y: 1010, zoom: 1.32 },
    { t: 23.7, x: 560, y: 980, zoom: 1.18 },
    { t: 25.0, x: 560, y: 1000, zoom: 1.18 },
    { t: 25.4, x: 720, y: 1140, zoom: 1.35 },
    { t: 26.4, x: 750, y: 1120, zoom: 1.3 },
    { t: 27.6, x: 690, y: 1080, zoom: 1.08 },
    { t: 28.6, x: 680, y: 1120, zoom: 1.25 },
    { t: 29.55, x: 672, y: 1145, zoom: 1.5 },
    { t: 30.0, x: 672, y: 1145, zoom: 1.5 },
  ];

  /** Camera shake kicks keyed to impacts. */
  private kick(t: number): { x: number; y: number } {
    const keys: { t: number; amp: number; decay: number }[] = [
      { t: 8.28, amp: 10, decay: 6 },
      { t: 10.05, amp: 11, decay: 7 },
      { t: 11.5, amp: 9, decay: 7 },
      { t: 12.95, amp: 11, decay: 7 },
      { t: 15.57, amp: 12, decay: 6 },
      { t: 16.07, amp: 11, decay: 6 },
      { t: 18.62, amp: 13, decay: 5.5 },
      { t: 23.18, amp: 10, decay: 6 },
      { t: 26.55, amp: 13, decay: 5 },
      { t: 27.1, amp: 10, decay: 5 },
    ];
    let x = 0;
    let y = 0;
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

    // Smooth ball tracking across the trickshot flight.
    if (t >= 15.3 && t <= 18.7) {
      const ball = this.ballFlight(t);
      if (ball) {
        const w = Math.min(1, (t - 15.3) / 0.4) * Math.min(1, (18.7 - t) / 0.4);
        x = lerp(x, ball.x, w);
        y = lerp(y, ball.y - 40, w);
      }
    }

    // Keep the floor from dropping into the caption band.
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

  render(ctx: CanvasRenderingContext2D, time: number, config: StudioConfig) {
    // Everything freezes on the final gag at 29.55s; captions keep holding.
    const t = Math.min(time, 29.55);

    ctx.save();
    ctx.fillStyle = WALL;
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.save();
    this.applyCamera(ctx, t);

    this.renderRoom(ctx, t);
    this.renderClawMachine(ctx, t);
    this.renderProps(ctx, t);
    this.renderBall(ctx, t);

    if (t < 27.75) {
      const pose = this.getPose(t);
      this.renderStickman(ctx, pose, t);
    }

    this.renderAvalanche(ctx, t);
    this.renderEffects(ctx, t);
    ctx.restore();

    // Alarm strobe over the whole frame while the machine malfunctions.
    if (time >= 26.0 && time < 27.6 && Math.floor(time * 7) % 2 === 0) {
      ctx.fillStyle = 'rgba(255, 42, 42, 0.09)';
      ctx.fillRect(0, 0, this.width, this.height);
    }
    ctx.restore();

    this.renderCaption(ctx, time);
    if (config.showSafeZones) this.renderSafeZones(ctx);
  }

  /** Burned-in caption near the top: cyan halo, heavy black stroke, white fill. */
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

    // Long captions split into two balanced lines and shrink to fit the frame.
    let lines = [line.text];
    if (ctx.measureText(line.text).width > 950) {
      const words = line.text.split(' ');
      const total = ctx.measureText(line.text).width;
      const spaceW = ctx.measureText(' ').width;
      let best = 1;
      let bestDiff = Infinity;
      let acc = '';
      for (let i = 0; i < words.length - 1; i++) {
        acc = acc ? `${acc} ${words[i]}` : words[i];
        const w = ctx.measureText(acc).width;
        const diff = Math.abs(w - (total - w - spaceW));
        if (diff < bestDiff) {
          bestDiff = diff;
          best = i + 1;
        }
      }
      lines = [words.slice(0, best).join(' '), words.slice(best).join(' ')];
      const widest = () => Math.max(ctx.measureText(lines[0]).width, ctx.measureText(lines[1]).width);
      while (widest() > 950 && size > 36) {
        size -= 2;
        ctx.font = font(size);
      }
    }

    const y0 = 252 + (1 - pop) * 34;
    const step = size * 1.22;
    for (let i = 0; i < lines.length; i++) {
      const text = lines[i];
      const y = lines.length === 1 ? y0 : y0 - step / 2 + i * step;
      // Cyan neon halo.
      ctx.strokeStyle = 'rgba(46, 230, 255, 0.4)';
      ctx.lineWidth = 30;
      ctx.strokeText(text, this.width / 2, y);
      // Heavy black outline.
      ctx.strokeStyle = INK;
      ctx.lineWidth = 15;
      ctx.strokeText(text, this.width / 2, y);
      // White fill.
      ctx.fillStyle = WHITE;
      ctx.fillText(text, this.width / 2, y);
    }
    ctx.restore();
  }

  private renderSafeZones(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 255, 170, 0.55)';
    ctx.lineWidth = 3;
    ctx.setLineDash([14, 10]);
    ctx.strokeRect(48, 120, this.width - 96, this.height - 240);
    ctx.strokeRect(this.width - 152, 340, 100, 1100);
    ctx.strokeRect(60, 1590, this.width - 120, 210);
    ctx.setLineDash([]);
    ctx.font = '600 26px Inter, Arial, sans-serif';
    ctx.fillStyle = 'rgba(0, 255, 170, 0.8)';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('Title Safe', 60, 132);
    ctx.restore();
  }

  // ---------------------------------------------------------------------
  // The room: dark neon arcade, background cabinets, floor.
  // ---------------------------------------------------------------------

  /** Flat two-pass neon stroke: translucent halo, then the crisp line. */
  private neonPath(ctx: CanvasRenderingContext2D, draw: () => void, color: string, width: number) {
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = width * 2.6;
    draw();
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.lineWidth = width;
    draw();
    ctx.stroke();
    ctx.restore();
  }

  private renderRoom(ctx: CanvasRenderingContext2D, t: number) {
    // Wall panels.
    ctx.fillStyle = WALL_PANEL;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    for (const p of [
      { x: 60, y: 210, w: 400, h: 300 },
      { x: 520, y: 170, w: 360, h: 250 },
      { x: 1100, y: 200, w: 260, h: 320 },
    ]) {
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.strokeRect(p.x, p.y, p.w, p.h);
    }

    // Neon shapes on the wall (no text anywhere — the prompt forbids words).
    // Lightning bolt, left.
    this.neonPath(
      ctx,
      () => {
        ctx.beginPath();
        ctx.moveTo(150, 262);
        ctx.lineTo(252, 262);
        ctx.lineTo(198, 344);
        ctx.lineTo(300, 344);
        ctx.lineTo(172, 478);
        ctx.lineTo(226, 372);
        ctx.lineTo(150, 372);
        ctx.closePath();
      },
      YELLOW,
      9
    );
    // Rings, center.
    this.neonPath(ctx, () => ctx.arc(700, 300, 74, 0, TAU), MAGENTA, 10);
    this.neonPath(ctx, () => ctx.arc(700, 300, 34, 0, TAU), CYAN, 8);
    // Chevrons pointing right.
    for (let i = 0; i < 3; i++) {
      const x = 850 + i * 64;
      this.neonPath(
        ctx,
        () => {
          ctx.beginPath();
          ctx.moveTo(x, 300);
          ctx.lineTo(x + 46, 372);
          ctx.lineTo(x, 444);
        },
        CYAN,
        11
      );
    }
    // Starburst, right.
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU;
      const x0 = 1250 + Math.cos(a) * 34;
      const y0 = 330 + Math.sin(a) * 34;
      const x1 = 1250 + Math.cos(a) * 84;
      const y1 = 330 + Math.sin(a) * 84;
      this.neonPath(
        ctx,
        () => {
          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.lineTo(x1, y1);
        },
        VIOLET,
        10
      );
    }

    // Marquee bulb strip along the ceiling, slowly pulsing.
    const bulbColors = [CYAN, MAGENTA, YELLOW, VIOLET];
    for (let i = 0; i < 23; i++) {
      const x = 70 + i * 58;
      const c = bulbColors[(i + Math.floor(t * 2)) % 4];
      ctx.globalAlpha = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 4 + i * 0.7));
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(x, 176, 11, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Ceiling line and floor.
    ctx.strokeStyle = SKIRT;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(-600, this.ceilingY);
    ctx.lineTo(2200, this.ceilingY);
    ctx.stroke();

    ctx.fillStyle = FLOOR;
    ctx.fillRect(-2000, this.floorY, 6000, 900);
    ctx.strokeStyle = SKIRT;
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(-2000, this.floorY);
    ctx.lineTo(4000, this.floorY);
    ctx.stroke();

    // Floor tile seams for depth.
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 4;
    for (let i = -3; i < 9; i++) {
      const x = i * 190 + 40;
      ctx.beginPath();
      ctx.moveTo(x, this.floorY);
      ctx.lineTo(x + 120, 1920);
      ctx.stroke();
    }

    this.renderBackgroundMachines(ctx, t);
    // The stickman's ground shadow lives with the character; props get theirs
    // as they are drawn.
  }

  /** Dim cabinets standing against the back wall, behind every prop. */
  private renderBackgroundMachines(ctx: CanvasRenderingContext2D, t: number) {
    const dims = [
      { x: 100, top: 800, w: 190 },
      { x: 300, top: 866, w: 150 },
      { x: 592, top: 850, w: 78 },
      { x: 1180, top: 820, w: 220 },
    ];
    for (let i = 0; i < dims.length; i++) {
      const d = dims[i];
      const h = this.floorY - d.top;
      ctx.fillStyle = DIM_CAB;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 7;
      ctx.fillRect(d.x, d.top, d.w, h);
      ctx.strokeRect(d.x, d.top, d.w, h);
      // Screen.
      ctx.fillStyle = '#3f4f7a';
      ctx.fillRect(d.x + 16, d.top + 60, d.w - 32, Math.min(150, h * 0.34));
      ctx.strokeRect(d.x + 16, d.top + 60, d.w - 32, Math.min(150, h * 0.34));
      // Faint screen flicker.
      ctx.fillStyle = `rgba(46, 230, 255, ${0.1 + 0.06 * Math.sin(t * 5 + i * 2)})`;
      ctx.fillRect(d.x + 16, d.top + 60, d.w - 32, Math.min(150, h * 0.34));
      // Marquee stripe (shape only).
      ctx.fillStyle = i % 2 === 0 ? '#4a3f8a' : '#443a80';
      ctx.fillRect(d.x + 10, d.top + 14, d.w - 20, 32);
      ctx.strokeRect(d.x + 10, d.top + 14, d.w - 20, 32);
      // Ground shadow.
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.ellipse(d.x + d.w / 2, this.floorY + 6, d.w * 0.55, 16, 0, 0, TAU);
      ctx.fill();
    }
  }

  // ---------------------------------------------------------------------
  // Foreground props: racing cabinet, ramp, pinball bumper, backstops.
  // ---------------------------------------------------------------------

  private renderProps(ctx: CanvasRenderingContext2D, t: number) {
    this.renderRacingCabinet(ctx, t);
    this.renderRamp(ctx, t);
    this.renderBumper(ctx, t);
    this.renderBackstops(ctx, t);
  }

  private renderRacingCabinet(ctx: CanvasRenderingContext2D, t: number) {
    // It starts shoved out of place; he wrestles it back twice.
    let dx = 74;
    let rot = 0.09;
    if (t >= 10.1 && t < 10.5) {
      dx = lerp(74, 36, smooth((t - 9.95) / 0.15));
      rot = lerp(0.09, 0.05, smooth((t - 9.95) / 0.15));
    } else if (t >= 10.5 && t < 10.65) {
      dx = lerp(36, 0, smooth((t - 10.5) / 0.15));
      rot = lerp(0.05, 0, smooth((t - 10.5) / 0.15));
    } else if (t >= 10.65) {
      dx = 0;
      rot = 0;
    }
    if (t < 9.95) {
      dx = 74;
      rot = 0.09;
    } else if (t < 10.1 && t >= 9.95) {
      dx = lerp(74, 36, smooth((t - 9.95) / 0.15));
      rot = lerp(0.09, 0.05, smooth((t - 9.95) / 0.15));
    }

    const cx = (this.cabL + this.cabR) / 2;
    const baseY = this.floorY;

    // Ground shadow.
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(cx + dx, baseY + 6, 84, 17, 0, 0, TAU);
    ctx.fill();

    ctx.save();
    ctx.translate(cx + dx, baseY);
    ctx.rotate(rot);
    ctx.translate(-cx, -baseY);

    const w = this.cabR - this.cabL;
    const h = baseY - this.cabT;
    ctx.fillStyle = CAB;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 8;
    ctx.fillRect(this.cabL, this.cabT, w, h);
    ctx.strokeRect(this.cabL, this.cabT, w, h);

    // Top marquee band with a chevron shape.
    ctx.fillStyle = MAGENTA;
    ctx.fillRect(this.cabL + 8, this.cabT + 8, w - 16, 44);
    ctx.strokeRect(this.cabL + 8, this.cabT + 8, w - 16, 44);
    ctx.fillStyle = YELLOW;
    ctx.beginPath();
    ctx.moveTo(this.cabL + 34, this.cabT + 18);
    ctx.lineTo(this.cabL + 58, this.cabT + 30);
    ctx.lineTo(this.cabL + 34, this.cabT + 42);
    ctx.closePath();
    ctx.fill();

    // Screen with a cyan racing grid.
    const sx = this.cabL + 16;
    const sy = this.cabT + 66;
    const sw = w - 32;
    const sh = 132;
    ctx.fillStyle = '#101a33';
    ctx.fillRect(sx, sy, sw, sh);
    ctx.strokeRect(sx, sy, sw, sh);
    ctx.save();
    ctx.beginPath();
    ctx.rect(sx, sy, sw, sh);
    ctx.clip();
    ctx.strokeStyle = CYAN;
    ctx.lineWidth = 5;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    for (let i = 0; i <= 6; i++) {
      const gx = sx + (i / 6) * sw;
      ctx.moveTo(gx, sy);
      ctx.lineTo(gx, sy + sh);
    }
    for (let i = 0; i <= 4; i++) {
      const gy = sy + (i / 4) * sh;
      ctx.moveTo(sx, gy);
      ctx.lineTo(sx + sw, gy);
    }
    ctx.stroke();
    // Horizon dash moving to suggest the game is idling.
    ctx.globalAlpha = 1;
    ctx.strokeStyle = MAGENTA;
    ctx.lineWidth = 8;
    const dash = sx + ((t * 60) % (sw + 40)) - 20;
    ctx.beginPath();
    ctx.moveTo(dash, sy + sh - 26);
    ctx.lineTo(dash + 34, sy + sh - 26);
    ctx.stroke();
    ctx.restore();

    // Control deck with wheel and buttons.
    ctx.fillStyle = BODY_DARK;
    ctx.fillRect(this.cabL + 8, sy + sh + 10, w - 16, 96);
    ctx.strokeRect(this.cabL + 8, sy + sh + 10, w - 16, 96);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 13;
    ctx.beginPath();
    ctx.arc(cx, sy + sh + 74, 34, Math.PI, TAU);
    ctx.stroke();
    ctx.fillStyle = RED;
    ctx.beginPath();
    ctx.arc(this.cabL + 34, sy + sh + 84, 13, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = CYAN;
    ctx.beginPath();
    ctx.arc(this.cabR - 34, sy + sh + 84, 13, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Kick plate.
    ctx.fillStyle = '#3a2b60';
    ctx.fillRect(this.cabL + 8, baseY - 96, w - 16, 88);
    ctx.strokeRect(this.cabL + 8, baseY - 96, w - 16, 88);
    ctx.restore();
  }

  private renderRamp(ctx: CanvasRenderingContext2D, t: number) {
    if (t < 11.32) return;

    // It drops into place from his hands.
    const u = smooth((t - 11.32) / 0.18);
    const lift = (1 - u) * 170;
    const tilt = (1 - u) * -0.3;

    ctx.save();
    ctx.translate(160, this.floorY - 60);
    ctx.rotate(tilt);
    ctx.translate(-160, -(this.floorY - 60));
    ctx.translate(0, -lift);

    // Ground shadow while settling.
    ctx.fillStyle = `rgba(0,0,0,${0.35 * u})`;
    ctx.beginPath();
    ctx.ellipse(160, this.floorY + 4, 92, 15, 0, 0, TAU);
    ctx.fill();

    ctx.fillStyle = '#d9c39a';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(85, this.floorY);
    ctx.lineTo(235, this.floorY);
    ctx.lineTo(235, 1330);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Plank grain lines (flat, no texture — just outlines).
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(120, this.floorY - 14);
    ctx.lineTo(200, 1400);
    ctx.moveTo(156, this.floorY - 6);
    ctx.lineTo(226, 1358);
    ctx.stroke();

    // Metal lip at the top.
    ctx.fillStyle = '#cbd5e1';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.fillRect(218, 1322, 22, 46);
    ctx.strokeRect(218, 1322, 22, 46);
    ctx.restore();
  }

  private renderBumper(ctx: CanvasRenderingContext2D, t: number) {
    // Rests behind the ramp until he drags it out.
    let bx = 170;
    let rot = 0;
    if (t >= 12.3 && t < 12.95) {
      const u = smooth((t - 12.3) / 0.65);
      bx = lerp(170, this.bumperX, u);
      rot = Math.sin((t - 12.3) * 24) * 0.05;
    } else if (t >= 12.95) {
      bx = this.bumperX;
      // Settle wobble after the slam.
      const dt = t - 12.95;
      if (dt < 0.4) rot = Math.sin(dt * 26) * 0.06 * (1 - dt / 0.4);
    }

    // Hit flash from the basketball.
    const hitU = t >= 15.55 && t < 15.9 ? (t - 15.55) / 0.35 : -1;
    const squash = hitU >= 0 ? 1 + bump(hitU) * 0.16 : 1;

    ctx.save();
    ctx.translate(bx, this.bumperY);
    ctx.rotate(rot);
    ctx.scale(1 / squash, squash);

    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(0, this.floorY - this.bumperY + 6, 66, 15, 0, 0, TAU);
    ctx.fill();

    // Base plate.
    ctx.fillStyle = '#8f8ab5';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 8;
    ctx.fillRect(-44, 50, 88, 44);
    ctx.strokeRect(-44, 50, 88, 44);

    // Drum.
    ctx.fillStyle = WHITE;
    ctx.beginPath();
    ctx.arc(0, 0, this.bumperR, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Rings.
    ctx.lineWidth = 10;
    ctx.strokeStyle = RED;
    ctx.beginPath();
    ctx.arc(0, 0, 40, 0, TAU);
    ctx.stroke();
    ctx.fillStyle = hitU >= 0 ? YELLOW : RED;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, TAU);
    ctx.fill();
    ctx.stroke();

    if (hitU >= 0) {
      // Impact sparkle ring.
      ctx.globalAlpha = 1 - hitU;
      ctx.strokeStyle = YELLOW;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(0, 0, 58 + hitU * 70, 0, TAU);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  private renderBackstops(ctx: CanvasRenderingContext2D, t: number) {
    const blocks = [
      { at: 13.15, x: 592, y: 1300, w: 64, h: 160, fill: YELLOW },
      { at: 13.55, x: 602, y: 1245, w: 44, h: 55, fill: '#cbd5e1' },
    ];
    for (const b of blocks) {
      if (t < b.at) continue;
      const u = smooth((t - b.at) / 0.14);
      const dy = (1 - u) * -160;
      const squash = u < 1 ? 1 + bump(u) * 0.1 : 1;

      ctx.fillStyle = `rgba(0,0,0,${0.35 * u})`;
      if (b.h > 100) {
        ctx.beginPath();
        ctx.ellipse(b.x + b.w / 2, this.floorY + 4, b.w * 0.7, 14, 0, 0, TAU);
        ctx.fill();
      }

      ctx.save();
      ctx.translate(b.x + b.w / 2, b.y + b.h + dy);
      ctx.scale(1 / squash, squash);
      ctx.translate(-(b.x + b.w / 2), -(b.y + b.h));
      ctx.fillStyle = b.fill;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 7;
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.strokeRect(b.x, b.y, b.w, b.h);
      if (b.fill === YELLOW) {
        // Hazard stripes.
        ctx.save();
        ctx.beginPath();
        ctx.rect(b.x, b.y, b.w, b.h);
        ctx.clip();
        ctx.strokeStyle = INK;
        ctx.lineWidth = 12;
        ctx.beginPath();
        for (let i = -2; i < 5; i++) {
          ctx.moveTo(b.x + i * 34, b.y + b.h);
          ctx.lineTo(b.x + i * 34 + b.h, b.y);
        }
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
    }
  }

  // ---------------------------------------------------------------------
  // The claw machine: cabinet, glass case, prize pile, claw, console.
  // ---------------------------------------------------------------------

  /** One plush bear; origin is the body centre, `s` scales the whole rig. */
  private drawBear(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    s: number,
    rot: number,
    color: string,
    ribbon = false
  ) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(s, s);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 7 / s;
    ctx.lineJoin = 'round';

    // Legs.
    ctx.fillStyle = color;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(side * 17, 46, 15, 13, 0, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }
    // Arms.
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(side * 42, 2, 15, 24, side * 0.5, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }
    // Body.
    ctx.beginPath();
    ctx.ellipse(0, 8, 40, 44, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    // Ears.
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(side * 25, -73, 15, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(0,0,0,0.16)';
      ctx.beginPath();
      ctx.arc(side * 25, -73, 7, 0, TAU);
      ctx.fill();
      ctx.fillStyle = color;
    }
    // Head.
    ctx.beginPath();
    ctx.arc(0, -47, 34, 0, TAU);
    ctx.fill();
    ctx.stroke();
    // Muzzle.
    ctx.fillStyle = '#fff6ea';
    ctx.beginPath();
    ctx.ellipse(0, -38, 17, 12, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    // Eyes + nose + smile.
    ctx.fillStyle = INK;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(side * 13, -54, 4.5, 0, TAU);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.ellipse(0, -43, 5, 4, 0, 0, TAU);
    ctx.fill();
    ctx.lineWidth = 3.5 / s;
    ctx.beginPath();
    ctx.arc(0, -37, 9, 0.18, Math.PI - 0.18);
    ctx.stroke();

    if (ribbon) {
      // The prize bear's red bow.
      ctx.lineWidth = 6 / s;
      ctx.fillStyle = MAGENTA;
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.lineTo(side * 26, -20);
        ctx.lineTo(side * 26, 6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      ctx.fillStyle = RED;
      ctx.beginPath();
      ctx.arc(0, -6, 9, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  /** The claw: parked, dropping, gripping, carrying, retracting, shuddering. */
  private clawAt(t: number): ClawState {
    if (t < 3.6) return { x: 830, y: 770, open: 1 };
    if (t < 5.0) {
      const u = smooth((t - 3.6) / 1.4);
      return { x: lerp(830, 815, u), y: lerp(770, 975, u), open: 1 };
    }
    if (t < 5.75) {
      const u = smooth((t - 5.0) / 0.75);
      return { x: 815, y: 975 + Math.sin((t - 5.0) * 22) * 2, open: lerp(1, 0.12, u) };
    }
    if (t < 7.05) {
      const u = smooth((t - 5.75) / 1.3);
      return { x: lerp(815, 905, u), y: lerp(975, 862, u), open: 0.12 };
    }
    if (t < 7.45) {
      // Strain at the peak.
      return {
        x: 905 + Math.sin((t - 7.05) * 26) * 3,
        y: 862 + Math.cos((t - 7.05) * 22) * 3,
        open: 0.12,
      };
    }
    if (t < 7.7) {
      const u = smooth((t - 7.45) / 0.25);
      return { x: 905, y: 862, open: lerp(0.12, 1, u) };
    }
    if (t < 8.6) {
      const u = smooth((t - 7.7) / 0.9);
      return { x: lerp(905, 830, u), y: lerp(862, 770, u), open: 1 };
    }
    if (t < 20.35) return { x: 830, y: 770, open: 1 };
    if (t < 21.0) {
      const u = smooth((t - 20.35) / 0.65);
      return { x: lerp(830, 815, u), y: lerp(770, 975, u), open: 1 };
    }
    if (t < 21.5) {
      const u = smooth((t - 21.0) / 0.5);
      return { x: 815, y: 975, open: lerp(1, 0.1, u) };
    }
    if (t < 22.2) {
      const u = smooth((t - 21.5) / 0.7);
      return { x: lerp(815, 948, u), y: lerp(975, 850, u), open: 0.1 };
    }
    if (t < 22.55) return { x: 948, y: 850, open: 0.1 };
    if (t < 22.8) {
      const u = smooth((t - 22.55) / 0.25);
      return { x: 948, y: 850, open: lerp(0.1, 1, u) };
    }
    if (t < 23.9) {
      const u = smooth((t - 22.8) / 1.1);
      return { x: lerp(948, 830, u), y: lerp(850, 770, u), open: 1 };
    }
    if (t >= 26.0 && t < 26.7) {
      // Malfunction shudder.
      return {
        x: 830 + Math.sin(t * 62) * 6,
        y: 770 + Math.cos(t * 55) * 4,
        open: 0.45 + Math.sin(t * 20) * 0.3,
      };
    }
    return { x: 830, y: 770, open: 1 };
  }

  /** The giant prize bear: in the pile, gripped, falling, or won. */
  private giantBear(t: number): { x: number; y: number; rot: number; hidden: boolean } {
    if (t < 5.75) return { x: 815, y: 1075, rot: 0, hidden: false };
    if (t < 7.68) {
      const claw = this.clawAt(t);
      return { x: claw.x, y: claw.y + 100, rot: Math.sin(t * 6) * 0.06, hidden: false };
    }
    if (t < 8.45) {
      const u = (t - 7.68) / 0.77;
      const p = ArcadeClawRenderer.arc({ x: 905, y: 962 }, { x: 818, y: 1075 }, 46, u);
      const bounce = u > 0.8 ? Math.sin(((u - 0.8) / 0.2) * Math.PI) * 16 : 0;
      return { x: p.x, y: p.y - bounce, rot: lerp(0.4, 0, smooth(u)), hidden: false };
    }
    if (t < 21.5) return { x: 815, y: 1075, rot: 0, hidden: false };
    if (t < 22.8) {
      const claw = this.clawAt(t);
      return { x: claw.x, y: claw.y + 100, rot: Math.sin(t * 5) * 0.05, hidden: false };
    }
    if (t < 23.45) {
      const u = (t - 22.8) / 0.65;
      return { x: 948, y: lerp(950, 1250, u * u), rot: u * 0.45, hidden: false };
    }
    return { x: 0, y: 0, rot: 0, hidden: true };
  }

  /** Trim + marquee bulbs: idle violet, chasing neon, alarm red, dead. */
  private trimColors(t: number, i: number): string {
    if (t < 19.42) return '#4b4394';
    if (t < 26.0) return [CYAN, YELLOW, MAGENTA][(i + Math.floor(t * 7)) % 3];
    if (t < 27.6) return Math.floor(t * 8) % 2 === 0 ? RED : '#3a3378';
    return '#332c66';
  }

  /** How far the giant red button is pushed in, in pixels. */
  private buttonPress(t: number): number {
    if (t >= 18.62) return smooth((t - 18.62) / 0.16) * 12;
    if (t >= 3.12 && t < 3.45) return bump((t - 3.12) / 0.33) * 12;
    return 0;
  }

  /** Position of one neon trim dot around the case frame. */
  private trimDot(i: number): { x: number; y: number } {
    const x0 = this.ml + 16;
    const x1 = this.mr - 16;
    const y0 = this.gt - 22;
    const y1 = this.gb + 44;
    const per = [
      { len: x1 - x0, horiz: true, from: { x: x0, y: y0 }, dir: { x: 1, y: 0 } },
      { len: y1 - y0, horiz: false, from: { x: x1, y: y0 }, dir: { x: 0, y: 1 } },
      { len: x1 - x0, horiz: true, from: { x: x1, y: y1 }, dir: { x: -1, y: 0 } },
      { len: y1 - y0, horiz: false, from: { x: x0, y: y1 }, dir: { x: 0, y: -1 } },
    ];
    const counts = [8, 8, 8, 8];
    let idx = i;
    for (let p = 0; p < 4; p++) {
      if (idx < counts[p]) {
        const seg = per[p];
        const u = (idx + 0.5) / counts[p];
        return { x: seg.from.x + seg.dir.x * seg.len * u, y: seg.from.y + seg.dir.y * seg.len * u };
      }
      idx -= counts[p];
    }
    return { x: x0, y: y0 };
  }

  /** Trolley, cable, hub and the three prongs. Prongs draw over the bear. */
  private renderClaw(ctx: CanvasRenderingContext2D, claw: ClawState) {
    // Rail.
    ctx.fillStyle = '#8f8ab5';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.fillRect(700, this.railY - 9, 292, 18);
    ctx.strokeRect(700, this.railY - 9, 292, 18);

    // Trolley.
    ctx.fillStyle = '#cbd5e1';
    ctx.lineWidth = 6;
    ctx.fillRect(claw.x - 30, this.railY - 22, 60, 30);
    ctx.strokeRect(claw.x - 30, this.railY - 22, 60, 30);
    ctx.fillStyle = INK;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(claw.x + side * 16, this.railY + 10, 9, 0, TAU);
      ctx.fill();
    }

    // Cable.
    ctx.strokeStyle = INK;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(claw.x, this.railY + 8);
    ctx.lineTo(claw.x, claw.y - 30);
    ctx.stroke();
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Hub.
    ctx.fillStyle = WHITE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.fillRect(claw.x - 26, claw.y - 34, 52, 36);
    ctx.strokeRect(claw.x - 26, claw.y - 34, 52, 36);

    // Prongs: a short centre one, then the two splayed arms.
    const a = lerp(0.18, 0.85, claw.open);
    const prong = (side: number, len: number, thick: number) => {
      const sx = claw.x + side * 12 * len;
      const sy = claw.y - 2;
      const tipX = claw.x + side * Math.sin(a) * 66 * len;
      const tipY = claw.y + 12 + Math.cos(a) * 64 * len;
      const cpx = claw.x + side * Math.sin(a) * 40 * len;
      const cpy = claw.y + 46 * len;
      ctx.lineCap = 'round';
      ctx.strokeStyle = INK;
      ctx.lineWidth = thick;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(cpx, cpy, tipX, tipY);
      ctx.stroke();
      ctx.strokeStyle = WHITE;
      ctx.lineWidth = thick * 0.45;
      ctx.stroke();
      // Inward tooth at the tip.
      ctx.strokeStyle = INK;
      ctx.lineWidth = thick * 0.6;
      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(tipX - side * 15 * len, tipY + 8);
      ctx.stroke();
    };
    prong(0, 0.72, 11);
    prong(-1, 1, 15);
    prong(1, 1, 15);
  }

  /** Small bears in the glass case: the back set behind the giant, the front set at its feet. */
  private renderPrizePile(ctx: CanvasRenderingContext2D, front: boolean) {
    const back = [
      { x: 706, y: 1132, s: 0.6, c: PLUSH_PINK, r: -0.1 },
      { x: 726, y: 1072, s: 0.48, c: PLUSH_MINT, r: 0.2 },
      { x: 694, y: 1028, s: 0.42, c: PLUSH_CREAM, r: 0.12 },
    ];
    const frontRow = [
      { x: 752, y: 1152, s: 0.42, c: PLUSH_MINT, r: 0.14 },
      { x: 880, y: 1150, s: 0.4, c: PLUSH_PINK, r: -0.12 },
    ];
    const set = front ? frontRow : back;
    for (const b of set) this.drawBear(ctx, b.x, b.y, b.s, b.r, b.c);
  }

  private renderClawMachine(ctx: CanvasRenderingContext2D, t: number) {
    ctx.save();
    // Malfunction shudder.
    if (t >= 26.0 && t < 26.7) {
      ctx.translate(Math.sin(t * 70) * 4, Math.cos(t * 61) * 3);
    }

    // Ground shadow.
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse((this.ml + this.mr) / 2, this.floorY + 6, 196, 20, 0, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse((this.conL + this.conR) / 2, this.floorY + 4, 70, 15, 0, 0, TAU);
    ctx.fill();

    // Cabinet body.
    ctx.fillStyle = BODY;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 8;
    ctx.fillRect(this.ml, this.mt, this.mr - this.ml, this.floorY - this.mt);
    ctx.strokeRect(this.ml, this.mt, this.mr - this.ml, this.floorY - this.mt);

    // Marquee band (shapes only — no words in any frame).
    ctx.fillStyle = MARQUEE;
    ctx.lineWidth = 6;
    ctx.fillRect(this.ml + 8, this.mt + 8, this.mr - this.ml - 16, 56);
    ctx.strokeRect(this.ml + 8, this.mt + 8, this.mr - this.ml - 16, 56);
    for (let i = 0; i < 5; i++) {
      const x = this.ml + 52 + i * 64;
      ctx.fillStyle = [CYAN, YELLOW, MAGENTA, CYAN, YELLOW][i];
      ctx.beginPath();
      ctx.moveTo(x, this.mt + 18);
      ctx.lineTo(x + 16, this.mt + 36);
      ctx.lineTo(x, this.mt + 54);
      ctx.lineTo(x - 16, this.mt + 36);
      ctx.closePath();
      ctx.fill();
    }
    // Marquee bulbs.
    for (let i = 0; i < 10; i++) {
      const x = this.ml + 30 + i * ((this.mr - this.ml - 60) / 9);
      ctx.fillStyle = this.trimColors(t, i + 40);
      ctx.beginPath();
      ctx.arc(x, this.mt + 76, 8, 0, TAU);
      ctx.fill();
    }

    // Glass case interior.
    ctx.fillStyle = CASE_DARK;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 7;
    ctx.fillRect(this.gl, this.gt, this.gr - this.gl, this.gb - this.gt);
    ctx.strokeRect(this.gl, this.gt, this.gr - this.gl, this.gb - this.gt);

    // Prize chute slot, upper right inside the case.
    ctx.fillStyle = '#05040f';
    ctx.lineWidth = 5;
    ctx.fillRect(this.chuteL, this.chuteT, this.chuteR - this.chuteL, this.gb - this.chuteT);
    ctx.strokeRect(this.chuteL, this.chuteT, this.chuteR - this.chuteL, this.gb - this.chuteT);
    ctx.fillStyle = '#141030';
    ctx.beginPath();
    ctx.moveTo(this.chuteL + 4, this.chuteT + 6);
    ctx.lineTo(this.chuteR - 4, this.chuteT + 6);
    ctx.lineTo(this.chuteR - 4, this.chuteT + 34);
    ctx.closePath();
    ctx.fill();

    // Everything living inside the case, clipped to the glass.
    ctx.save();
    ctx.beginPath();
    ctx.rect(this.gl, this.gt, this.gr - this.gl, this.gb - this.gt);
    ctx.clip();

    this.renderPrizePile(ctx, false);

    const bear = this.giantBear(t);
    if (!bear.hidden) this.drawBear(ctx, bear.x, bear.y, 1.5, bear.rot, PLUSH_CREAM, true);
    this.renderPrizePile(ctx, true);

    this.renderClaw(ctx, this.clawAt(t));
    ctx.restore();

    // Glass front: cool tint, diagonal glints, frame.
    ctx.fillStyle = 'rgba(150, 215, 255, 0.10)';
    ctx.fillRect(this.gl, this.gt, this.gr - this.gl, this.gb - this.gt);
    ctx.save();
    ctx.beginPath();
    ctx.rect(this.gl, this.gt, this.gr - this.gl, this.gb - this.gt);
    ctx.clip();
    ctx.strokeStyle = 'rgba(255,255,255,0.16)';
    ctx.lineWidth = 26;
    ctx.beginPath();
    ctx.moveTo(this.gl - 60, this.gb + 40);
    ctx.lineTo(this.gl + 200, this.gt - 60);
    ctx.moveTo(this.gl + 120, this.gb + 40);
    ctx.lineTo(this.gl + 380, this.gt - 60);
    ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 7;
    ctx.strokeRect(this.gl, this.gt, this.gr - this.gl, this.gb - this.gt);

    // Neon trim around the case.
    for (let i = 0; i < 32; i++) {
      const p = this.trimDot(i);
      ctx.fillStyle = this.trimColors(t, i);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 9, 0, TAU);
      ctx.fill();
    }

    // Front panel: coin door + a decorative star.
    ctx.fillStyle = BODY_DARK;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.fillRect(676, 1406, 92, 46);
    ctx.strokeRect(676, 1406, 92, 46);
    ctx.fillStyle = INK;
    ctx.fillRect(690, 1420, 26, 8);
    ctx.fillRect(690, 1434, 26, 8);
    ctx.fillStyle = YELLOW;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * TAU - Math.PI / 2;
      const r = i % 2 === 0 ? 24 : 10;
      const x = 960 + Math.cos(a) * r;
      const y = 1330 + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Retrieval door: dark opening, flap that flings open when he reaches in.
    ctx.fillStyle = t >= 26.55 ? '#2a1030' : '#07061a';
    if (t >= 26.55 && t < 27.6) {
      ctx.fillStyle = Math.floor(t * 10) % 2 === 0 ? '#3a1440' : '#160a26';
    }
    ctx.strokeStyle = INK;
    ctx.lineWidth = 8;
    ctx.fillRect(this.doorL, this.doorT, this.doorR - this.doorL, this.doorB - this.doorT);
    ctx.strokeRect(this.doorL, this.doorT, this.doorR - this.doorL, this.doorB - this.doorT);

    const flapOpen = t >= 25.35 ? smooth((t - 25.35) / 0.2) : 0;
    if (flapOpen > 0.001) {
      ctx.save();
      ctx.translate(this.doorL + 4, this.doorT + 4);
      ctx.rotate(-1.3 * flapOpen);
      ctx.fillStyle = BODY_DARK;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 7;
      ctx.fillRect(0, 0, this.doorR - this.doorL - 8, this.doorB - this.doorT - 8);
      ctx.strokeRect(0, 0, this.doorR - this.doorL - 8, this.doorB - this.doorT - 8);
      ctx.fillStyle = '#8f8ab5';
      ctx.beginPath();
      ctx.arc(this.doorR - this.doorL - 34, (this.doorB - this.doorT) / 2, 12, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Control console: coin slot and the giant red button.
    ctx.fillStyle = BODY;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 7;
    ctx.fillRect(this.conL, this.conT, this.conR - this.conL, this.floorY - this.conT);
    ctx.strokeRect(this.conL, this.conT, this.conR - this.conL, this.floorY - this.conT);
    ctx.fillStyle = BODY_DARK;
    ctx.fillRect(this.conL - 8, this.conT, this.conR - this.conL + 16, 30);
    ctx.strokeRect(this.conL - 8, this.conT, this.conR - this.conL + 16, 30);

    // Coin slot.
    ctx.fillStyle = YELLOW;
    ctx.lineWidth = 5;
    ctx.fillRect(1058, 1072, 34, 26);
    ctx.strokeRect(1058, 1072, 34, 26);
    ctx.fillStyle = INK;
    ctx.fillRect(1064, 1079, 22, 12);

    // Button: base + depressed cap.
    const press = this.buttonPress(t);
    ctx.fillStyle = BODY_DARK;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(this.btnX, this.btnY, this.btnBaseR, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = RED;
    ctx.beginPath();
    ctx.arc(this.btnX, this.btnY - 6 + press, this.btnCapR - press * 0.15, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.ellipse(this.btnX - 14, this.btnY - 24 + press, 14, 8, -0.5, 0, TAU);
    ctx.fill();

    // Two indicator lights beside the coin slot.
    for (let i = 0; i < 2; i++) {
      ctx.fillStyle = t >= 19.42 ? this.trimColors(t, i + 50) : '#4b4394';
      ctx.beginPath();
      ctx.arc(this.conL + 54 + i * 30, this.conT + 40, 10, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    ctx.restore();
  }

  // ---------------------------------------------------------------------
  // The trickshot basketball, the plush avalanche, the final arm.
  // ---------------------------------------------------------------------

  /** Quadratic arc between two points with a vertical bulge. */
  private static arc(a: Vec, b: Vec, bulge: number, u: number): Vec {
    const x = lerp(a.x, b.x, u);
    const y = lerp(a.y, b.y, u) - Math.sin(Math.PI * clamp(u, 0, 1)) * bulge;
    return { x, y };
  }

  private isHoldingBall(t: number): boolean {
    return t >= 13.75 && t < 14.28;
  }

  /**
   * The whole trickshot in one timeline: ramp lip → bumper → racing cabinet
   * corner → over the machines → the giant red button.
   */
  private ballFlight(t: number): { x: number; y: number; rot: number; trail: number } | null {
    // Resting on the ramp lip before the launch.
    if (t >= 14.28 && t < 15.0) return { x: this.rampLip.x, y: this.rampLip.y, rot: 0.4, trail: 0 };
    // Rolled off the lip toward the bumper.
    if (t >= 15.0 && t < 15.55) {
      const u = Math.pow((t - 15.0) / 0.55, 1.5);
      const p = ArcadeClawRenderer.arc(this.rampLip, { x: 319, y: 1329 }, 30, u);
      return { ...p, rot: 0.4 + (t - 15.0) * 9, trail: 0.8 };
    }
    // The bumper BOING.
    if (t >= 15.55 && t < 16.07) {
      const u = smooth((t - 15.55) / 0.52);
      const p = ArcadeClawRenderer.arc({ x: 319, y: 1329 }, { x: 458, y: 992 }, 48, u);
      return { ...p, rot: 0.4 + (t - 15.0) * 12, trail: 0.95 };
    }
    // Ricochet off the racing cabinet, up over the machines.
    if (t >= 16.07 && t < 17.35) {
      const u = (t - 16.07) / 1.28;
      const p = ArcadeClawRenderer.arc({ x: 458, y: 992 }, { x: 800, y: 580 }, 40, u);
      return { ...p, rot: 0.4 + (t - 15.0) * 13, trail: 0.95 };
    }
    // The long gravity dive onto the button.
    if (t >= 17.35 && t < 18.62) {
      const u = (t - 17.35) / 1.27;
      return {
        x: lerp(800, this.btnX, u),
        y: lerp(580, 1066, u * u),
        rot: 0.4 + (t - 15.0) * 13,
        trail: 0.85 - 0.4 * u,
      };
    }
    // It stays pressed into the button for the rest of the film.
    if (t >= 18.62) {
      const sink = this.buttonPress(t);
      return { x: this.btnX, y: 1066 + sink, rot: 1.2, trail: 0 };
    }
    return null;
  }

  private drawBallShape(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    r: number,
    rot: number,
    alpha: number,
    squash = 1
  ) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(1, squash);
    ctx.fillStyle = ORANGE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.fill();
    ctx.stroke();
    // Seams.
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-r, 0);
    ctx.lineTo(r, 0);
    ctx.moveTo(0, -r);
    ctx.lineTo(0, r);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.5, r, 0, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  private renderBall(ctx: CanvasRenderingContext2D, t: number) {
    const b = this.ballFlight(t);
    if (!b) return;

    if (b.trail > 0.45) {
      for (let i = 1; i <= 3; i++) {
        const g = this.ballFlight(t - i * 0.035);
        if (g) {
          this.drawBallShape(
            ctx,
            g.x,
            g.y,
            this.ballR * (1 - i * 0.14),
            g.rot,
            b.trail * (0.55 - i * 0.12)
          );
        }
      }
    }

    // Shadow under the airborne ball.
    if (t >= 15.0 && t < 18.62) {
      const h = clamp((this.floorY - b.y) / 700, 0, 1);
      ctx.fillStyle = `rgba(0,0,0,${0.35 * (1 - h)})`;
      ctx.beginPath();
      ctx.ellipse(b.x, this.floorY + 4, this.ballR * (1 + h * 0.6), 12 * (1 - h * 0.5), 0, 0, TAU);
      ctx.fill();
    }

    let sq = 1;
    if (t >= 18.62 && t < 19.0) sq = lerp(0.8, 1, smooth((t - 18.62) / 0.38));
    this.drawBallShape(ctx, b.x, b.y, this.ballR, b.rot, 1, sq);
  }

  /** Landing spots for the avalanche, bottom row first. */
  private static readonly AV_LANDINGS: { x: number; y: number; s: number }[] = [
    { x: 480, y: 1398, s: 0.82 },
    { x: 572, y: 1408, s: 0.86 },
    { x: 664, y: 1412, s: 0.9 },
    { x: 756, y: 1408, s: 0.86 },
    { x: 848, y: 1398, s: 0.82 },
    { x: 526, y: 1330, s: 0.8 },
    { x: 618, y: 1340, s: 0.84 },
    { x: 710, y: 1334, s: 0.82 },
    { x: 802, y: 1328, s: 0.8 },
    { x: 572, y: 1264, s: 0.78 },
    { x: 664, y: 1272, s: 0.8 },
    { x: 756, y: 1262, s: 0.76 },
    { x: 618, y: 1206, s: 0.74 },
    { x: 710, y: 1202, s: 0.74 },
    { x: 664, y: 1150, s: 0.72 },
  ];

  private renderAvalanche(ctx: CanvasRenderingContext2D, t: number) {
    const colors = [PLUSH_PINK, PLUSH_CREAM, PLUSH_MINT];
    const door = { x: 770, y: 1300 };

    for (let k = 0; k < ArcadeClawRenderer.AV_LANDINGS.length; k++) {
      const land = ArcadeClawRenderer.AV_LANDINGS[k];
      const launch = 26.55 + k * 0.06;
      const rest = launch + 0.72;
      if (t < launch) continue;
      const color = colors[k % 3];

      if (t >= rest) {
        this.drawBear(ctx, land.x, land.y, land.s, (k % 2 === 0 ? -1 : 1) * 0.1, color);
        continue;
      }
      const u = (t - launch) / 0.72;
      const bulge = 170 + (k % 3) * 45;
      const p = ArcadeClawRenderer.arc(door, { x: land.x, y: land.y }, bulge, u);
      this.drawBear(ctx, p.x, p.y, land.s * 0.96, u * (k % 2 === 0 ? 5 : -5) + 0.4, color);
    }

    this.renderEndArm(ctx, t);
  }

  /** The punchline: one tiny black arm out of the pile, still holding the coin. */
  private renderEndArm(ctx: CanvasRenderingContext2D, t: number) {
    if (t < 29.0) return;
    const u = smooth((t - 29.0) / 0.35);
    const wob = t < 29.55 && t > 29.3 ? Math.sin((t - 29.3) * 10) * 3 : 0;
    const baseX = 676;
    const baseY = 1190;
    const handX = 674 + wob * 0.5;
    const handY = lerp(baseY, 1120, u) + wob;

    // A dark gap in the plush where the arm pushes through.
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.beginPath();
    ctx.ellipse(baseX, baseY, 36, 17, 0, 0, TAU);
    ctx.fill();

    const midX = lerp(baseX, handX, 0.5) - 24;
    const midY = lerp(baseY, handY, 0.5) + 4;
    const drawArm = () => {
      ctx.beginPath();
      ctx.moveTo(baseX, baseY);
      ctx.quadraticCurveTo(midX, midY, handX, handY);
      ctx.stroke();
    };
    ctx.lineCap = 'round';
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 36;
    drawArm();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 26;
    drawArm();

    // Hand.
    ctx.fillStyle = WHITE;
    ctx.beginPath();
    ctx.arc(handX, handY, 22, 0, TAU);
    ctx.fill();
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(handX, handY, 17, 0, TAU);
    ctx.fill();

    // The original coin.
    this.drawCoin(ctx, handX + 8, handY - 22, 18);
  }

  /** A flat gold coin with a rim — no lettering on it. */
  private drawCoin(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
    ctx.save();
    ctx.fillStyle = YELLOW;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x, y, r * 0.6, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  // ---------------------------------------------------------------------
  // The stickman rig: white halo over black ink so he reads on any neon.
  // ---------------------------------------------------------------------

  /** Where he stands at each beat of the film. */
  private charXAt(t: number): number {
    if (t < 1.25) return lerp(700, 1060, smooth(t / 1.25)); // walks up to the machine
    if (t < 9.0) return 1060; // at the console, watching the drop
    if (t < 10.1) return lerp(1060, 640, smooth((t - 9.0) / 1.1)); // storms back to the rig
    if (t < 10.9) return 640; // shoves the racing cabinet
    if (t < 11.35) return lerp(640, 300, smooth((t - 10.9) / 0.45)); // to the ramp spot
    if (t < 11.9) return 300; // places and taps the ramp
    if (t < 12.3) return lerp(300, 240, smooth((t - 11.9) / 0.4)); // to the bumper
    if (t < 12.95) return lerp(240, 400, smooth((t - 12.3) / 0.65)); // drags the bumper
    if (t < 13.05) return 400;
    if (t < 13.6) return lerp(400, 640, smooth((t - 13.05) / 0.55)); // to the backstops
    if (t < 13.75) return 640;
    if (t < 14.15) return lerp(640, 330, smooth((t - 13.75) / 0.4)); // back with the ball
    if (t < 24.4) return 330; // aims, shoots, celebrates
    if (t < 25.3) return lerp(330, 620, smooth((t - 24.4) / 0.9)); // struts to the chute
    return 620; // reaching into the prize door
  }

  private basePose(t: number): Pose {
    return {
      hipX: this.charXAt(t),
      hipY: this.floorY - 300,
      lean: 0,
      jump: 0,
      squashY: 1,
      headTilt: 0,
      gazeX: 0.6,
      gazeY: -0.1,
      brow: 'neutral',
      eye: 'normal',
      mouth: 'flat',
      pupilScale: 1,
      leftHand: { x: -70, y: -40 },
      rightHand: { x: 70, y: -40 },
      leftHandStyle: 'relaxed',
      rightHandStyle: 'relaxed',
      leftElbow: 12,
      rightElbow: -12,
      leftFoot: { x: -50, y: 300 },
      rightFoot: { x: 50, y: 300 },
      anger: false,
      silhouette: false,
    };
  }

  /** Swing the feet for a walk. */
  private walkFeet(p: Pose, t: number, speed = 8) {
    const a = t * speed;
    p.leftFoot = { x: -50 + Math.sin(a) * 26, y: 300 - Math.abs(Math.sin(a)) * 30 };
    p.rightFoot = { x: 50 + Math.sin(a + Math.PI) * 26, y: 300 - Math.abs(Math.sin(a + Math.PI)) * 30 };
  }

  /** Aim the gaze at a world point. */
  private look(p: Pose, tx: number, ty: number, hipX: number, hipY: number) {
    const dx = tx - hipX;
    const dy = ty - (hipY - 288);
    p.gazeX = clamp(dx / 300, -0.95, 0.95);
    p.gazeY = clamp(dy / 300, -0.95, 0.95);
  }

  private renderStickman(ctx: CanvasRenderingContext2D, p: Pose, t: number) {
    // Ground shadow.
    const sc = clamp(1 - p.jump / 240, 0.35, 1);
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath();
    ctx.ellipse(p.hipX + 12, this.floorY + 4, 76 * sc, 17 * sc, 0, 0, TAU);
    ctx.fill();

    const pose = (dx: number) => {
      ctx.save();
      ctx.translate(p.hipX + dx, p.hipY - p.jump);
      ctx.rotate(p.lean);
      ctx.scale(1, p.squashY);
    };

    // Rage vibration ghosts.
    if (p.anger && t > 8.5 && t < 9.9) {
      for (const off of [-11, 11]) {
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

  /** One stroke with a white halo underneath the black ink. */
  private limbPath(
    ctx: CanvasRenderingContext2D,
    from: Vec,
    to: Vec,
    width: number,
    bend: number
  ) {
    const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.hypot(dx, dy) || 1;
    const cx = mid.x + (-dy / len) * bend;
    const cy = mid.y + (dx / len) * bend;
    const trace = () => {
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.quadraticCurveTo(cx, cy, to.x, to.y);
      ctx.stroke();
    };
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = width + 8;
    trace();
    ctx.strokeStyle = INK;
    ctx.lineWidth = width;
    trace();
  }

  private drawHand(ctx: CanvasRenderingContext2D, pos: Vec, style: HandStyle) {
    ctx.fillStyle = WHITE;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 21, 0, TAU);
    ctx.fill();
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 16, 0, TAU);
    ctx.fill();
    if (style === 'fist') {
      ctx.strokeStyle = WHITE;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(pos.x - 8, pos.y - 5);
      ctx.lineTo(pos.x + 8, pos.y - 5);
      ctx.stroke();
    }
    if (style === 'point') {
      ctx.lineCap = 'round';
      ctx.strokeStyle = WHITE;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(pos.x + 6, pos.y);
      ctx.lineTo(pos.x + 24, pos.y - 6);
      ctx.stroke();
    }
  }

  private drawFoot(ctx: CanvasRenderingContext2D, pos: Vec, facing: number) {
    const path = () => {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y - 4);
      ctx.lineTo(pos.x + facing * 26, pos.y - 2);
      ctx.stroke();
    };
    ctx.lineCap = 'round';
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 22;
    path();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 14;
    path();
  }

  private drawFace(ctx: CanvasRenderingContext2D, p: Pose) {
    const HX = 0;
    const HY = -288;
    const eyeL = { x: HX - 24, y: HY - 6 };
    const eyeR = { x: HX + 24, y: HY - 6 };
    const pupil = { x: p.gazeX * 7, y: p.gazeY * 5 };

    // Brows.
    ctx.strokeStyle = INK;
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    for (const side of [-1, 1]) {
      const raised =
        p.brow === 'oneRaised' && side === 1 ? 8 : 0;
      ctx.beginPath();
      if (p.brow === 'raised' || p.brow === 'oneRaised') {
        const lift = p.brow === 'raised' ? 10 : raised;
        ctx.arc(HX + side * 25, HY - 24 - lift, 20, Math.PI + 0.35, TAU - 0.35, false);
      } else if (p.brow === 'angry' || p.brow === 'determined') {
        ctx.moveTo(HX + side * 12, HY - 22 + (side === -1 ? 4 : 0));
        ctx.lineTo(HX + side * 44, HY - 36);
      } else if (p.brow === 'sad') {
        ctx.moveTo(HX + side * 12, HY - 38);
        ctx.lineTo(HX + side * 44, HY - 24);
      } else {
        ctx.moveTo(HX + side * 12, HY - 30);
        ctx.lineTo(HX + side * 42, HY - 30);
      }
      ctx.stroke();
    }

    // Eyes.
    const drawEye = (c: { x: number; y: number }) => {
      ctx.lineWidth = 5;
      if (p.silhouette || p.eye === 'stunned') {
        ctx.fillStyle = WHITE;
        ctx.beginPath();
        ctx.arc(c.x, c.y, 11, 0, TAU);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = INK;
        ctx.beginPath();
        ctx.arc(c.x, c.y, 4, 0, TAU);
        ctx.fill();
        return;
      }
      if (p.eye === 'closed' || p.eye === 'happy') {
        ctx.strokeStyle = INK;
        ctx.beginPath();
        if (p.eye === 'happy') ctx.arc(c.x, c.y + 4, 13, Math.PI + 0.2, TAU - 0.2);
        else ctx.moveTo(c.x - 13, c.y);
        if (p.eye !== 'happy') {
          ctx.lineTo(c.x + 13, c.y);
        }
        ctx.stroke();
        return;
      }
      if (p.eye === 'cross') {
        ctx.strokeStyle = INK;
        ctx.beginPath();
        ctx.moveTo(c.x - 11, c.y - 11);
        ctx.lineTo(c.x + 11, c.y + 11);
        ctx.moveTo(c.x + 11, c.y - 11);
        ctx.lineTo(c.x - 11, c.y + 11);
        ctx.stroke();
        return;
      }
      const rx = p.eye === 'wide' ? 15 : p.eye === 'squint' ? 14 : 13;
      const ry = p.eye === 'wide' ? 18 : p.eye === 'squint' ? 8 : 15;
      ctx.fillStyle = WHITE;
      ctx.strokeStyle = INK;
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, rx, ry, 0, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.arc(c.x + pupil.x, c.y + pupil.y, p.eye === 'wide' ? 6.5 * p.pupilScale : 6 * p.pupilScale, 0, TAU);
      ctx.fill();
    };
    drawEye(eyeL);
    drawEye(eyeR);

    // Mouth.
    const mx = HX + 8;
    const my = HY + 28;
    ctx.strokeStyle = INK;
    ctx.fillStyle = INK;
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    if (p.mouth === 'flat') {
      ctx.beginPath();
      ctx.moveTo(mx - 15, my);
      ctx.lineTo(mx + 15, my);
      ctx.stroke();
    } else if (p.mouth === 'smirk') {
      ctx.beginPath();
      ctx.arc(mx, my - 6, 22, 0.18, 0.85);
      ctx.stroke();
    } else if (p.mouth === 'grin') {
      ctx.beginPath();
      ctx.arc(mx, my - 8, 24, 0.12, 0.88);
      ctx.stroke();
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(mx - 20, my - 2);
      ctx.lineTo(mx + 20, my - 2);
      ctx.stroke();
    } else if (p.mouth === 'open') {
      ctx.beginPath();
      ctx.ellipse(mx, my + 4, 15, 19, 0, 0, TAU);
      ctx.fill();
    } else if (p.mouth === 'o') {
      ctx.beginPath();
      ctx.arc(mx + 2, my + 4, 12, 0, TAU);
      ctx.fill();
    } else if (p.mouth === 'scream') {
      ctx.beginPath();
      ctx.ellipse(mx + 2, my + 6, 17, 25, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = WHITE;
      ctx.beginPath();
      ctx.ellipse(mx + 2, my - 10, 12, 5, 0, 0, TAU);
      ctx.fill();
    } else if (p.mouth === 'grit') {
      ctx.fillStyle = WHITE;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 6;
      ctx.fillRect(mx - 18, my - 9, 36, 18);
      ctx.strokeRect(mx - 18, my - 9, 36, 18);
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(mx - 6, my - 9);
      ctx.lineTo(mx - 6, my + 9);
      ctx.moveTo(mx + 6, my - 9);
      ctx.lineTo(mx + 6, my + 9);
      ctx.stroke();
    } else if (p.mouth === 'wobble') {
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(mx - 18, my);
      ctx.quadraticCurveTo(mx - 9, my - 9, mx, my);
      ctx.quadraticCurveTo(mx + 9, my + 9, mx + 18, my);
      ctx.stroke();
    }
  }

  private drawRig(ctx: CanvasRenderingContext2D, p: Pose, t: number, ghost: boolean) {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Back leg, then front leg.
    this.drawFoot(ctx, p.leftFoot, -1);
    this.limbPath(ctx, { x: -6, y: -10 }, p.leftFoot, 14, -16);
    this.drawFoot(ctx, p.rightFoot, 1);
    this.limbPath(ctx, { x: 6, y: -10 }, p.rightFoot, 14, 16);

    // Back arm.
    this.limbPath(ctx, { x: -14, y: -200 }, p.leftHand, 13, p.leftElbow);
    this.drawHand(ctx, p.leftHand, p.leftHandStyle);

    // Torso + neck.
    this.limbPath(ctx, { x: 0, y: -8 }, { x: 0, y: -232 }, 18, 0);

    // Head (tilts on its own).
    ctx.save();
    ctx.translate(0, -288);
    ctx.rotate(p.headTilt);
    ctx.fillStyle = WHITE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(0, 0, 64, 0, TAU);
    ctx.fill();
    ctx.stroke();
    if (!ghost) this.drawFace(ctx, p);
    ctx.restore();

    // Front arm + held props.
    this.limbPath(ctx, { x: 14, y: -200 }, p.rightHand, 13, p.rightElbow);
    this.drawHand(ctx, p.rightHand, p.rightHandStyle);
    if (!ghost) {
      if (t >= 1.45 && t < 2.45) {
        // The original coin, up for the camera and into the slot.
        this.drawCoin(ctx, p.rightHand.x + 8, p.rightHand.y - 20, 16);
      } else if (this.isHoldingBall(t)) {
        this.drawBallShape(ctx, p.rightHand.x + 6, p.rightHand.y - 26, this.ballR, 0.4, 1);
      }
    }
  }

  // ---------------------------------------------------------------------
  // The six performance beats.
  // ---------------------------------------------------------------------

  private getPose(t: number): Pose {
    const p = this.basePose(t);
    if (t < 5) this.poseChallenge(p, t);
    else if (t < 9) this.poseBetrayal(p, t);
    else if (t < 15) this.poseEngineer(p, t);
    else if (t < 22.5) this.poseTrickshot(p, t);
    else if (t < 26.55) this.poseVictory(p, t);
    else this.poseBuried(p, t);
    return p;
  }

  /** Scene 1: coin up, slot it, press the button, lean in. */
  private poseChallenge(p: Pose, t: number) {
    p.gazeX = 0.9;
    p.gazeY = -0.2;

    if (t < 1.3) {
      this.walkFeet(p, t);
      p.lean = 0.06;
      p.brow = 'raised';
      p.mouth = 'flat';
      p.gazeX = 0.7;
      p.gazeY = -0.5; // spots the giant bear up the machine
      return;
    }
    if (t < 1.45) {
      p.brow = 'raised';
      p.mouth = 'smirk';
      p.gazeY = -0.5;
      return;
    }
    if (t < 2.05) {
      // The coin flourish.
      const u = smooth((t - 1.45) / 0.4);
      const lift = lerp(-60, -330, u);
      const wob = u >= 1 ? Math.sin((t - 1.85) * 12) * 8 : 0;
      p.rightHand = { x: 76 + wob * 0.4, y: lift };
      p.rightHandStyle = 'hold';
      p.leftHand = { x: -66, y: -70 };
      p.brow = 'oneRaised';
      p.mouth = 'smirk';
      p.headTilt = 0.06;
      p.gazeX = 0.4;
      p.gazeY = -0.75;
      return;
    }
    if (t < 2.55) {
      // Slotting the coin.
      const u = smooth((t - 2.05) / 0.4);
      p.rightHand = { x: lerp(76, 22, u), y: lerp(-330, -75, u) };
      p.rightHandStyle = u > 0.7 ? 'open' : 'hold';
      p.leftHand = { x: -62, y: -80 };
      p.brow = 'determined';
      p.mouth = 'flat';
      p.lean = 0.08;
      p.gazeX = 0.35;
      p.gazeY = lerp(-0.7, -0.15, u);
      return;
    }
    if (t < 2.9) {
      // Smug pull-back.
      p.rightHand = { x: 72, y: -100 };
      p.brow = 'oneRaised';
      p.mouth = 'smirk';
      p.gazeX = 0.7;
      p.gazeY = -0.25;
      return;
    }
    if (t < 3.42) {
      // The button press.
      const u = smooth((t - 2.9) / 0.32);
      const dip = t < 3.12 ? -10 : lerp(-10, 4, smooth((t - 3.12) / 0.1));
      p.rightHand = { x: lerp(72, 65, u), y: lerp(-100, dip, u) };
      p.rightHandStyle = 'open';
      p.leftHand = { x: -66, y: -70 };
      p.brow = 'determined';
      p.mouth = 'grit';
      p.lean = 0.12;
      p.gazeX = 0.55;
      p.gazeY = 0.05;
      return;
    }
    if (t < 3.6) {
      // Rebound, eyes snapping up.
      p.rightHand = { x: 74, y: -70 };
      p.eye = 'wide';
      p.pupilScale = 1.2;
      p.brow = 'raised';
      p.mouth = 'o';
      p.gazeX = 0.7;
      p.gazeY = -0.35;
      return;
    }
    // Watching the claw drop toward the pile.
    p.eye = 'wide';
    p.brow = 'raised';
    p.mouth = 'o';
    p.lean = 0.14;
    p.rightHand = { x: 66, y: -30 };
    p.leftHand = { x: -66, y: -40 };
    const claw = this.clawAt(t);
    this.look(p, claw.x, claw.y + 60, p.hipX, p.hipY);
  }

  /** Scene 2: hope, jaw drop, stunned, twitch, rage. */
  private poseBetrayal(p: Pose, t: number) {
    const claw = this.clawAt(t);
    this.look(p, claw.x, claw.y + 80, p.hipX, p.hipY);
    p.lean = 0.1;
    p.rightHand = { x: 70, y: -120 };
    p.leftHand = { x: -70, y: -120 };
    p.brow = 'raised';

    if (t < 7.45) {
      p.eye = 'wide';
      p.mouth = t < 5.9 ? 'o' : 'grin';
      return;
    }
    if (t < 7.7) {
      // The claw opens at the last second.
      p.eye = 'wide';
      p.pupilScale = 1.3;
      p.mouth = 'open';
      p.lean = -0.03;
      return;
    }
    if (t < 8.25) {
      const bear = this.giantBear(t);
      this.look(p, bear.x, bear.y - 60, p.hipX, p.hipY);
      p.eye = 'wide';
      p.mouth = 'open';
      p.rightHand = { x: 84, y: -150 };
      p.leftHand = { x: -84, y: -150 };
      return;
    }
    if (t < 8.4) {
      // Stunned by the thud.
      p.eye = 'stunned';
      p.pupilScale = 0.55;
      p.mouth = 'flat';
      p.squashY = 1.05;
      p.headTilt = 0.07;
      p.brow = 'raised';
      return;
    }
    // The twitch, then full rage.
    p.eye = 'squint';
    p.brow = 'angry';
    p.mouth = t < 8.7 ? 'flat' : 'grit';
    p.headTilt = Math.sin((t - 8.4) * 26) * 0.025;
    p.rightHand = { x: 70, y: -70 };
    p.rightHandStyle = 'fist';
    p.leftHand = { x: -70, y: -70 };
    p.leftHandStyle = 'fist';
    p.anger = t > 8.5;
    p.gazeX = 0.6;
    p.gazeY = 0.15;
  }

  /** Scene 3: rage spark, then the whole rig gets built. */
  private poseEngineer(p: Pose, t: number) {
    p.brow = 'angry';
    p.eye = 'squint';
    p.mouth = 'grit';
    p.anger = t < 9.9;

    if (t < 9.6) {
      // Rage spark, still storming.
      this.walkFeet(p, t, 9);
      p.rightHand = { x: 112 + Math.sin(t * 30) * 5, y: -330 };
      p.rightHandStyle = 'open';
      p.leftHand = { x: -112, y: -330 };
      p.leftHandStyle = 'open';
      p.eye = 'wide';
      p.pupilScale = 1.2;
      p.mouth = 'scream';
      p.headTilt = -0.06;
      p.lean = -0.04;
      p.gazeX = 0.2;
      p.gazeY = -0.5;
      return;
    }
    if (t < 10.1) {
      // Storms across the arcade.
      this.walkFeet(p, t, 9);
      p.lean = 0.08;
      p.brow = 'determined';
      p.rightHand = { x: 64, y: -110 - Math.sin(t * 9) * 22 };
      p.rightHandStyle = 'fist';
      p.leftHand = { x: -64, y: -110 + Math.sin(t * 9) * 22 };
      p.leftHandStyle = 'fist';
      this.look(p, this.cabL + 40, this.cabT + 200, p.hipX, p.hipY);
      return;
    }
    if (t < 10.9) {
      // Two shoves to square the racing cabinet.
      const push = Math.sin((t - 10.1) * 9);
      p.hipX += push * 6;
      p.lean = -0.17;
      p.rightHand = { x: -30, y: -170 };
      p.leftHand = { x: -128, y: -160 };
      p.rightHandStyle = 'open';
      p.leftHandStyle = 'open';
      p.leftFoot = { x: -70, y: 300 };
      p.rightFoot = { x: 30, y: 300 };
      p.brow = 'determined';
      this.look(p, this.cabL, this.cabT + 240, p.hipX, p.hipY);
      return;
    }
    if (t < 11.35) {
      // Fast scurry to the ramp spot.
      this.walkFeet(p, t, 10);
      p.lean = 0.1;
      p.brow = 'determined';
      this.look(p, 170, this.floorY - 140, p.hipX, p.hipY);
      return;
    }
    if (t < 11.5) {
      // Bend and slam the ramp down.
      p.lean = 0.3;
      p.squashY = 1.04;
      p.rightHand = { x: -30, y: 150 };
      p.rightHandStyle = 'open';
      p.leftHand = { x: -108, y: 130 };
      p.leftHandStyle = 'open';
      p.gazeX = -0.6;
      p.gazeY = 0.8;
      return;
    }
    if (t < 11.95) {
      // Stand, then tap the ramp with the foot.
      p.rightHand = { x: 62, y: -70 };
      p.rightHandStyle = 'fist';
      p.leftHand = { x: -62, y: -70 };
      p.leftHandStyle = 'fist';
      p.brow = 'raised';
      p.mouth = 'smirk';
      p.gazeX = -0.7;
      p.gazeY = 0.6;
      if (t > 11.78) {
        const tap = bump((t - 11.78) / 0.17);
        p.leftFoot = { x: -76 - tap * 18, y: 300 - tap * 46 };
      }
      return;
    }
    if (t < 12.3) {
      this.walkFeet(p, t, 9);
      p.lean = 0.08;
      p.brow = 'determined';
      this.look(p, 190, this.bumperY, p.hipX, p.hipY);
      return;
    }
    if (t < 12.95) {
      // Drag the pinball bumper into the line.
      this.walkFeet(p, t, 7.5);
      p.lean = 0.16;
      p.rightHand = { x: -34, y: -100 };
      p.leftHand = { x: -92, y: -140 };
      p.rightHandStyle = 'fist';
      p.leftHandStyle = 'fist';
      p.brow = 'determined';
      p.mouth = 'grit';
      p.gazeX = -0.85;
      p.gazeY = 0.35;
      return;
    }
    if (t < 13.05) {
      p.rightHand = { x: -66, y: -30 };
      p.rightHandStyle = 'open';
      p.brow = 'raised';
      p.mouth = 'smirk';
      p.gazeX = -0.7;
      p.gazeY = 0.6;
      return;
    }
    if (t < 13.75) {
      // Walk right, toss the two backstop blocks.
      this.walkFeet(p, t, 9);
      p.lean = 0.08;
      p.brow = 'determined';
      const toss =
        t >= 13.08 && t < 13.26
          ? bump((t - 13.08) / 0.18)
          : t >= 13.48 && t < 13.66
          ? bump((t - 13.48) / 0.18)
          : 0;
      p.rightHand = { x: 96 + toss * 70, y: -150 - toss * 90 };
      p.rightHandStyle = toss > 0 ? 'open' : 'fist';
      p.leftHand = { x: -70, y: -90 };
      p.leftHandStyle = 'fist';
      p.mouth = toss > 0 ? 'grit' : 'smirk';
      this.look(p, 626, this.floorY - 220, p.hipX, p.hipY);
      return;
    }
    if (t < 14.15) {
      // Walk back carrying the basketball.
      this.walkFeet(p, t, 9);
      p.lean = 0.06;
      p.rightHand = { x: 66, y: -180 };
      p.rightHandStyle = 'hold';
      p.leftHand = { x: -70, y: -80 + Math.sin(t * 9) * 16 };
      p.brow = 'determined';
      p.mouth = 'smirk';
      p.gazeX = -0.6;
      p.gazeY = 0.4;
      return;
    }
    if (t < 14.3) {
      // Bend and set the ball on the ramp lip (hand lands so the ball meets
      // the lip exactly when it detaches at 14.28s).
      p.lean = 0.1;
      p.rightHand = { x: -124, y: 198 };
      p.rightHandStyle = 'open';
      p.leftHand = { x: -30, y: 60 };
      p.gazeX = -0.7;
      p.gazeY = 0.85;
      return;
    }
    if (t < 14.55) {
      p.eye = 'squint';
      p.brow = 'raised';
      p.mouth = 'flat';
      p.lean = -0.04;
      this.look(p, this.btnX, this.btnY - 40, p.hipX, p.hipY);
      return;
    }
    // Manic aim.
    p.eye = 'squint';
    p.brow = 'determined';
    p.mouth = 'grin';
    p.rightHand = { x: 188, y: -248 };
    p.rightHandStyle = 'point';
    p.rightElbow = -6;
    p.leftHand = { x: -94, y: -70 };
    p.leftHandStyle = 'fist';
    p.lean = 0.06;
    this.look(p, this.btnX, this.btnY - 40, p.hipX, p.hipY);
  }

  /** Scene 4: the slap, the tracking, the slam, the grin. */
  private poseTrickshot(p: Pose, t: number) {
    if (t < 15.12) {
      // The slap.
      const u = smooth((t - 15.0) / 0.12);
      p.rightHand = { x: lerp(60, -104, u), y: lerp(-200, 172, u) };
      p.rightHandStyle = 'open';
      p.leftHand = { x: -90, y: -60 };
      p.leftHandStyle = 'fist';
      p.lean = lerp(0.08, -0.2, u);
      p.eye = 'wide';
      p.mouth = 'o';
      p.brow = 'raised';
      this.look(p, this.rampLip.x, this.rampLip.y, p.hipX, p.hipY);
      return;
    }
    if (t < 15.32) {
      // Follow-through, head snapping after the ball.
      const u = smooth((t - 15.12) / 0.2);
      p.rightHand = { x: lerp(-104, 176, u), y: lerp(172, -252, u) };
      p.rightHandStyle = 'open';
      p.lean = lerp(-0.2, 0.16, u);
      p.eye = 'wide';
      p.mouth = 'o';
      const ball = this.ballFlight(t);
      if (ball) this.look(p, ball.x, ball.y, p.hipX, p.hipY);
      return;
    }
    if (t < 18.6) {
      // Tracking the whole ricochet.
      const ball = this.ballFlight(t);
      if (ball) {
        this.look(p, ball.x, ball.y, p.hipX, p.hipY);
        p.headTilt = clamp((ball.x - p.hipX) / 4200, -0.12, 0.12);
      }
      p.eye = 'wide';
      p.pupilScale = 1.15;
      p.brow = 'raised';
      p.mouth = t < 17.1 ? 'o' : 'wobble';
      p.rightHand = { x: 146, y: -150 };
      p.leftHand = { x: -64, y: -128 };
      p.lean = 0.05;
      return;
    }
    if (t < 19.55) {
      // Slam freeze, then staring at the lights.
      p.lean = 0.06;
      p.eye = 'wide';
      p.pupilScale = 1.35;
      p.brow = 'raised';
      if (t >= 18.95) {
        p.mouth = 'grin';
        p.rightHand = { x: 76, y: -150 };
        p.rightHandStyle = 'fist';
        p.leftHand = { x: -76, y: -150 };
        p.leftHandStyle = 'fist';
        this.look(p, 900, 850, p.hipX, p.hipY);
      } else {
        p.mouth = 'o';
        p.rightHand = { x: 96, y: -186 };
        p.leftHand = { x: -96, y: -186 };
        this.look(p, this.btnX, this.btnY - 40, p.hipX, p.hipY);
      }
      return;
    }
    // Grinning wider as the claw does his work.
    this.look(p, this.clawAt(t).x, this.clawAt(t).y + 90, p.hipX, p.hipY);
    p.brow = 'raised';
    p.eye = t > 20.9 ? 'wide' : 'normal';
    p.mouth = t > 22.35 ? 'o' : 'grin';
    p.rightHand = { x: 74, y: -150 };
    p.rightHandStyle = 'fist';
    p.leftHand = { x: -74, y: -150 };
    p.leftHandStyle = 'fist';
    p.lean = 0.06;
  }

  /** Scene 5: the win, the dance, the reach into the prize door. */
  private poseVictory(p: Pose, t: number) {
    if (t < 23.45) {
      // Watch the bear drop into the chute.
      const bear = this.giantBear(t);
      const tx = bear.hidden ? 950 : bear.x;
      const ty = bear.hidden ? 1150 : bear.y - 60;
      this.look(p, tx, ty, p.hipX, p.hipY);
      p.eye = 'wide';
      p.brow = 'raised';
      p.mouth = t < 23.2 ? 'o' : 'grin';
      const shake = t >= 23.0 && t < 23.3 ? Math.sin((t - 23.0) * 40) * 4 : 0;
      p.rightHand = { x: 72 + shake, y: -140 };
      p.rightHandStyle = 'fist';
      p.leftHand = { x: -72 - shake, y: -140 };
      p.leftHandStyle = 'fist';
      return;
    }
    if (t < 24.4) {
      // Explosive celebration hops.
      const ph = (t - 23.45) * 7.4;
      p.jump = Math.abs(Math.sin(ph * 1.3)) * 36;
      p.lean = Math.sin(ph * 0.9) * 0.05;
      p.headTilt = Math.sin(ph) * 0.07;
      p.rightHand = { x: 108 + Math.sin(ph * 2) * 10, y: -330 };
      p.rightHandStyle = 'fist';
      p.leftHand = { x: -108, y: -330 };
      p.leftHandStyle = 'fist';
      p.eye = 'happy';
      p.brow = 'raised';
      p.mouth = 'scream';
      p.gazeX = 0.1;
      p.gazeY = -0.5;
      if (p.jump > 6) {
        p.leftFoot = { x: -46, y: 264 };
        p.rightFoot = { x: 46, y: 258 };
      }
      return;
    }
    if (t < 25.3) {
      // Strutting to the prize door.
      this.walkFeet(p, t, 8.5);
      p.lean = 0.08;
      p.rightHand = { x: 70, y: -120 - Math.sin(t * 8.5) * 24 };
      p.rightHandStyle = 'fist';
      p.leftHand = { x: -70, y: -120 + Math.sin(t * 8.5) * 24 };
      p.leftHandStyle = 'fist';
      p.eye = 'happy';
      p.brow = 'raised';
      p.mouth = 'grin';
      p.gazeX = 0.85;
      p.gazeY = 0.1;
      return;
    }
    if (t < 26.0) {
      // Reaching into the prize door.
      p.lean = 0.17;
      p.rightHand = { x: 172, y: 96 };
      p.rightHandStyle = 'open';
      p.rightElbow = -4;
      p.leftHand = { x: -68, y: -70 };
      p.leftHandStyle = 'fist';
      p.brow = 'oneRaised';
      p.mouth = 'grin';
      p.gazeX = 0.8;
      p.gazeY = 0.5;
      return;
    }
    // The alarm hits mid-reach.
    p.eye = 'wide';
    p.pupilScale = 1.3;
    p.brow = 'raised';
    p.mouth = 'scream';
    p.lean = -0.08;
    p.squashY = 1.04;
    p.rightHand = { x: 150, y: -40 };
    p.leftHand = { x: -92, y: -250 };
    p.leftHandStyle = 'open';
    p.gazeX = 0.5;
    p.gazeY = -0.75;
  }

  /** Scene 6: knocked back, duck and cover, then gone under the pile. */
  private poseBuried(p: Pose, t: number) {
    if (t < 27.0) {
      // Knocked backward by the first wave.
      const u = smooth((t - 26.55) / 0.45);
      p.hipX = lerp(620, 545, u);
      p.lean = lerp(-0.1, -0.42, u);
      p.jump = Math.sin(u * Math.PI) * 26;
      p.eye = 'wide';
      p.pupilScale = 1.3;
      p.brow = 'raised';
      p.mouth = 'scream';
      p.rightHand = { x: 96 + Math.sin(t * 26) * 26, y: -300 + Math.cos(t * 22) * 24 };
      p.rightHandStyle = 'open';
      p.leftHand = { x: -96 + Math.cos(t * 25) * 26, y: -300 + Math.sin(t * 21) * 24 };
      p.leftHandStyle = 'open';
      p.leftFoot = { x: -76, y: 300 };
      p.rightFoot = { x: 40, y: 300 - Math.abs(Math.sin(t * 9)) * 26 };
      return;
    }
    if (t < 27.75) {
      // Duck and cover.
      p.hipX = 545;
      p.hipY = 1290;
      p.squashY = 0.85;
      p.leftFoot = { x: -48, y: 200 };
      p.rightFoot = { x: 48, y: 200 };
      p.rightHand = { x: -46, y: -330 };
      p.rightHandStyle = 'open';
      p.leftHand = { x: 46, y: -330 };
      p.leftHandStyle = 'open';
      p.rightElbow = 40;
      p.leftElbow = -40;
      p.eye = 'closed';
      p.brow = 'angry';
      p.mouth = 'grit';
      p.lean = 0.12;
      return;
    }
    // Past 27.75 he is not drawn at all — the pile owns the frame.
  }

  // ---------------------------------------------------------------------
  // Flat procedural effects.
  // ---------------------------------------------------------------------

  private renderEffects(ctx: CanvasRenderingContext2D, t: number) {
    // Coin dropping into the slot.
    if (t >= 2.45 && t < 2.62) {
      const u = (t - 2.45) / 0.17;
      ctx.save();
      ctx.globalAlpha = 1 - smooth((u - 0.6) / 0.4);
      this.drawCoin(ctx, lerp(1082, 1072, u), lerp(1085, 1112, u * u), 15);
      ctx.restore();
    }
    // Sparkle on the flourish.
    this.sparkle(ctx, 1136, 800, (t - 1.58) / 0.4, YELLOW);

    // Build dust.
    this.puff(ctx, 560, 1420, (t - 10.05) / 0.3);
    this.puff(ctx, 560, 1420, (t - 10.6) / 0.3);
    this.puff(ctx, 200, 1436, (t - 11.5) / 0.3);
    this.puff(ctx, 360, 1442, (t - 12.95) / 0.3);
    this.puff(ctx, 626, 1442, (t - 13.15) / 0.3);
    this.puff(ctx, 624, 1300, (t - 13.55) / 0.3);
    this.puff(ctx, 212, 1420, (t - 14.3) / 0.35);

    // Impact bursts along the trickshot.
    this.impactBurst(ctx, 319, 1329, (t - 15.57) / 0.28, YELLOW);
    this.impactBurst(ctx, 458, 992, (t - 16.07) / 0.28, MAGENTA);
    this.impactBurst(ctx, 1125, 1050, (t - 18.62) / 0.32, CYAN);

    // The bear landing back in the pile, and into the chute.
    this.impactBurst(ctx, 818, 1150, (t - 8.28) / 0.32, PLUSH_CREAM);
    this.puff(ctx, 818, 1170, (t - 8.28) / 0.34);
    this.impactBurst(ctx, 950, 1140, (t - 23.18) / 0.3, PLUSH_CREAM);

    // Machine power-on ring at the button.
    if (t >= 19.42 && t < 19.95) this.ring(ctx, 1125, 1144, (t - 19.42) / 0.53, CYAN);

    // Victory confetti.
    this.confetti(ctx, t);

    // Alarm sparks on the cabinet corners.
    if (t >= 26.05 && t < 27.5) {
      const corners = [
        { x: 676, y: 656 },
        { x: 1014, y: 656 },
        { x: 676, y: 1196 },
        { x: 1014, y: 1196 },
      ];
      for (let i = 0; i < 8; i++) {
        const at = 26.05 + i * 0.17;
        if (t >= at && t < at + 0.1) {
          const c = corners[i % 4];
          this.sparkle(ctx, c.x, c.y, (t - at) / 0.1, WHITE);
        }
      }
    }

    // Dust out of the prize door while the bears pour.
    this.puff(ctx, 770, 1300, (t - 26.6) / 0.5);
    this.puff(ctx, 720, 1320, (t - 26.85) / 0.5);

    // The final coin ding.
    this.sparkle(ctx, 684, 1104, (t - 29.12) / 0.45, YELLOW);
  }

  private impactBurst(ctx: CanvasRenderingContext2D, x: number, y: number, u: number, color: string) {
    if (u < 0 || u > 1) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = color;
    ctx.lineCap = 'round';
    ctx.lineWidth = 9 * (1 - u * 0.6);
    ctx.globalAlpha = 1 - u;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU + 0.3;
      const r0 = 18 + u * 66;
      const r1 = 44 + u * 110;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0);
      ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1);
      ctx.stroke();
    }
    ctx.restore();
  }

  private puff(ctx: CanvasRenderingContext2D, x: number, y: number, u: number) {
    if (u < 0 || u > 1) return;
    ctx.save();
    ctx.fillStyle = 'rgba(160, 152, 210, 0.75)';
    ctx.globalAlpha = (1 - u) * 0.8;
    for (const d of [
      { dx: -34, dy: -8, r: 0.8 },
      { dx: 0, dy: -26, r: 1.05 },
      { dx: 36, dy: -6, r: 0.75 },
    ]) {
      ctx.beginPath();
      ctx.arc(x + d.dx * (0.5 + u), y + d.dy - u * 34, (12 + u * 16) * d.r, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  private sparkle(ctx: CanvasRenderingContext2D, x: number, y: number, u: number, color: string) {
    if (u < 0 || u > 1) return;
    const s = 22 * (1 - u * 0.4);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(u * 0.8);
    ctx.globalAlpha = 1 - u * u;
    ctx.strokeStyle = color;
    ctx.lineCap = 'round';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(-s, 0);
    ctx.lineTo(s, 0);
    ctx.moveTo(0, -s);
    ctx.lineTo(0, s);
    ctx.stroke();
    ctx.restore();
  }

  private ring(ctx: CanvasRenderingContext2D, x: number, y: number, u: number, color: string) {
    if (u < 0 || u > 1) return;
    ctx.save();
    ctx.globalAlpha = 1 - u;
    ctx.strokeStyle = color;
    ctx.lineWidth = 10 * (1 - u) + 3;
    ctx.beginPath();
    ctx.arc(x, y, 40 + u * 180, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  private confetti(ctx: CanvasRenderingContext2D, t: number) {
    if (t < 23.45 || t >= 25.0) return;
    const colors = [CYAN, MAGENTA, YELLOW, VIOLET, PLUSH_MINT];
    for (let i = 0; i < 18; i++) {
      const u = (t - 23.45 - (i % 6) * 0.08) / 1.1;
      if (u < 0 || u > 1) continue;
      const x = 380 + ((i * 97) % 340) + Math.sin(t * 3 + i) * 18;
      const y = lerp(760, 1480, u);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(t * 6 + i);
      ctx.fillStyle = colors[i % 5];
      ctx.fillRect(-7, -10, 14, 20);
      ctx.restore();
    }
  }
}
