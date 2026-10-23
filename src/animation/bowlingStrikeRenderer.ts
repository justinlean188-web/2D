import { StudioConfig } from '../types';

/**
 * BowlingStrikeRenderer
 *
 * "THE ANGRY STICKMAN: BOWLING MARBLE TRICKSHOT" — a 30-second vertical
 * 9:16 comedy animation in a colorful, minimalist retro bowling alley.
 *
 * SCENE 1 (0–5s):  Holds tiny marble, points dramatically at ten pins. Confident pose.
 *                  Caption: "He wants to knock down 10 pins with ONE tiny marble!"
 * SCENE 2 (5–9s):  Rolls marble. It moves in hilarious slow motion, stopping an inch
 *                  short of the head pin. Stickman stomps angrily, and the wind from
 *                  his stomp makes pin 1 wobble and fall.
 *                  Caption: "First try… absolutely embarrassing."
 * SCENE 3 (9–15s): Furious, he builds a ridiculous marble launcher using a bowling ramp,
 *                  heavy springs, and a giant plunger. Loads marble, pulls lever, braces himself.
 *                  Caption: "So he builds a MARBLE LAUNCHER!"
 * SCENE 4 (15–22s): Supersonic launch! Marble ricochets off wall, bounces off ceiling pipe,
 *                  races down the lane, triggering a spectacular domino strike knocking all
 *                  ten pins down! He celebrates wildly like a world champion!
 *                  Caption: "THE MOST IMPOSSIBLE SHOT EVER!"
 * SCENE 5 (22–27s): One pin rebounds off back wall, knocks another pin, and pins start rolling
 *                  and charging back down the lane toward him. Record scratch! Horror zoom!
 *                  Caption: "BUT HE CELEBRATED TOO EARLY…"
 * SCENE 6 (27–30s): Avalanche of pins crashes over him, burying him in a pile. The tiny marble
 *                  rolls out and knocks over the final standing pin with a dink. His arm emerges
 *                  to give a furious thumbs-up! Comedic freeze-frame!
 *                  Caption: "STRIKE! …AND GAME OVER 💀"
 *
 * Strict constraint: All captions rendered in editing stage near the top of the vertical frame!
 */

type EyeStyle = 'normal' | 'wide' | 'happy' | 'closed' | 'stunned' | 'squint' | 'intense';
type BrowStyle = 'neutral' | 'angry' | 'raised' | 'determined' | 'sad' | 'oneRaised';
type MouthStyle = 'flat' | 'smirk' | 'grin' | 'open' | 'grit' | 'o' | 'wobble' | 'scream';
type HandStyle = 'relaxed' | 'fist' | 'open' | 'point' | 'hold' | 'thumb';

interface Vec {
  x: number;
  y: number;
}

interface Pose {
  hipX: number;
  hipY: number;
  lean: number;
  jump: number;
  squashX: number;
  squashY: number;
  headTilt: number;
  leftFoot: Vec;
  rightFoot: Vec;
  leftKnee: number;
  rightKnee: number;
  leftHand: Vec;
  rightHand: Vec;
  leftElbow: number;
  rightElbow: number;
  leftHandStyle: HandStyle;
  rightHandStyle: HandStyle;
  eye: EyeStyle;
  brow: BrowStyle;
  mouth: MouthStyle;
  gazeX: number;
  gazeY: number;
  pupilScale: number;
  anger: boolean;
  sweat: boolean;
  silhouette: boolean;
}

interface CameraKey {
  t: number;
  x: number;
  y: number;
  zoom: number;
}

interface BowlingPin {
  id: number;
  initX: number;
  initY: number;
  x: number;
  y: number;
  rot: number;
  fallen: boolean;
}

const TAU = Math.PI * 2;
const INK = '#000000';
const WHITE = '#ffffff';
const PIN_RED = '#ef4444';
const LANE_WOOD = '#f59e0b';
const LANE_WOOD_LIGHT = '#fbbf24';
const GUTTER_DARK = '#334155';
const NEON_CYAN = '#06b6d4';
const NEON_MAGENTA = '#ec4899';
const MARBLE_TEAL = '#14b8a6';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const smooth = (u: number) => {
  const c = clamp(u, 0, 1);
  return c * c * (3 - 2 * c);
};
const easeOut = (u: number) => 1 - Math.pow(1 - clamp(u, 0, 1), 2);
const easeIn = (u: number) => Math.pow(clamp(u, 0, 1), 2);

export class BowlingStrikeRenderer {
  public readonly width = 1080;
  public readonly height = 1920;

  // Bowling Alley Geometry:
  // Floor / Approach at y=1460
  // Bowling lane extends into perspective:
  // Approach line at x=340..740, y=1460
  // Lane head at (240..840, 1460) tapering into perspective pit at (420..660, 920)
  // Pin deck centered around x=540, y=930..990
  private readonly floorY = 1460;
  private readonly pinDeckY = 940;

  // 10 Bowling Pins triangle coordinates on pin deck:
  // Row 1: Pin 1 at (540, 990)
  // Row 2: Pin 2 (515, 965), Pin 3 (565, 965)
  // Row 3: Pin 4 (490, 940), Pin 5 (540, 940), Pin 6 (590, 940)
  // Row 4: Pin 7 (465, 915), Pin 8 (515, 915), Pin 9 (565, 915), Pin 10 (615, 915)
  private readonly initialPins: BowlingPin[] = [
    { id: 1, initX: 540, initY: 990, x: 540, y: 990, rot: 0, fallen: false },
    { id: 2, initX: 515, initY: 965, x: 515, y: 965, rot: 0, fallen: false },
    { id: 3, initX: 565, initY: 965, x: 565, y: 965, rot: 0, fallen: false },
    { id: 4, initX: 490, initY: 940, x: 490, y: 940, rot: 0, fallen: false },
    { id: 5, initX: 540, initY: 940, x: 540, y: 940, rot: 0, fallen: false },
    { id: 6, initX: 590, initY: 940, x: 590, y: 940, rot: 0, fallen: false },
    { id: 7, initX: 465, initY: 915, x: 465, y: 915, rot: 0, fallen: false },
    { id: 8, initX: 515, initY: 915, x: 515, y: 915, rot: 0, fallen: false },
    { id: 9, initX: 565, initY: 915, x: 565, y: 915, rot: 0, fallen: false },
    { id: 10, initX: 615, initY: 915, x: 615, y: 915, rot: 0, fallen: false },
  ];

  // Camera tracking keys for quick comedic cuts and dynamic tracking
  private readonly cameraKeys: CameraKey[] = [
    // Scene 1: Dramatic close-up on confident smirk & tiny marble (0-5s)
    { t: 0.0, x: 420, y: 1140, zoom: 1.35 },
    { t: 1.8, x: 480, y: 1160, zoom: 1.1 }, // point at 10 pins
    { t: 3.5, x: 500, y: 1180, zoom: 1.0 },

    // Scene 2: Epic failure slow-motion roll (5-9s)
    { t: 5.0, x: 540, y: 1220, zoom: 1.0 },
    { t: 6.2, x: 540, y: 1060, zoom: 1.45 }, // zoom on marble crawling to a halt
    { t: 7.2, x: 380, y: 1240, zoom: 1.25 }, // stickman stomp
    { t: 8.2, x: 540, y: 990, zoom: 1.6 }, // pin 1 wobbles & topples

    // Scene 3: The Invention (9-15s)
    { t: 9.0, x: 380, y: 1200, zoom: 1.15 },
    { t: 11.0, x: 460, y: 1240, zoom: 1.1 }, // assembling launcher
    { t: 13.5, x: 420, y: 1220, zoom: 1.3 }, // loading marble & pulling lever
    { t: 14.2, x: 310, y: 880, zoom: 2.2 }, // intense anime grimace close-up

    // Scene 4: The Perfect Shot & Domino Strike (15-22s)
    { t: 15.0, x: 540, y: 1180, zoom: 0.95 },
    { t: 16.0, x: 820, y: 860, zoom: 1.25 }, // wall ricochet
    { t: 17.0, x: 540, y: 640, zoom: 1.3 }, // ceiling pipe bounce
    { t: 18.5, x: 540, y: 980, zoom: 1.35 }, // head pin strike & domino crash!
    { t: 20.0, x: 360, y: 1160, zoom: 1.2 }, // wild world champion celebration

    // Scene 5: The Revenge of the Pins (22-27s)
    { t: 22.0, x: 540, y: 940, zoom: 1.3 }, // pins rebound off back bumper
    { t: 24.0, x: 540, y: 1120, zoom: 1.1 }, // pins charging down lane
    { t: 25.2, x: 340, y: 1060, zoom: 1.85 }, // record scratch! horror zoom on face!
    { t: 26.8, x: 340, y: 1060, zoom: 1.95 },

    // Scene 6: The Punchline (27-30s)
    { t: 27.0, x: 380, y: 1220, zoom: 1.25 }, // avalanche crash burying stickman
    { t: 28.2, x: 460, y: 1340, zoom: 1.55 }, // marble rolls out, knocks final pin
    { t: 29.2, x: 420, y: 1300, zoom: 1.7 }, // furious thumbs-up from pile!
    { t: 30.0, x: 420, y: 1300, zoom: 1.7 },
  ];

  // Top editing captions (timed to scenes, rendered near top of vertical 9:16 frame)
  private readonly captions = [
    { text: 'He wants to knock down 10 pins with ONE tiny marble!', from: 0.4, to: 4.8 },
    { text: 'First try… absolutely embarrassing.', from: 5.2, to: 8.8 },
    { text: 'So he builds a MARBLE LAUNCHER!', from: 9.3, to: 14.8 },
    { text: 'THE MOST IMPOSSIBLE SHOT EVER!', from: 15.2, to: 21.8 },
    { text: 'BUT HE CELEBRATED TOO EARLY…', from: 22.2, to: 26.8 },
    { text: 'STRIKE! …AND GAME OVER 💀', from: 27.2, to: 29.8 },
  ];

  public render(ctx: CanvasRenderingContext2D, t: number, config: StudioConfig) {
    ctx.save();

    // 1. Bowling Alley Background (retro colorful neon walls & lanes)
    this.renderAlleyBackground(ctx);

    // 2. Camera Transform & Impact Shakes
    this.applyCamera(ctx, t);

    // 3. Perspective Bowling Lane & Gutters
    this.renderBowlingLane(ctx, t);

    // 4. Ceiling Pipes & Walls
    this.renderCeilingPipesAndWalls(ctx, t);

    // 5. Ten Bowling Pins
    const pins = this.calculatePinPositions(t);
    this.renderBowlingPins(ctx, pins, t);

    // 6. Marble Launcher Contraption (Scene 3 & 4)
    this.renderLauncher(ctx, t);

    // 7. Stickman Character (or Pile of Pins in Scene 6)
    const pose = this.getPose(t);
    if (t < 27.2) {
      this.renderStickman(ctx, pose, t);
    } else {
      this.renderStickmanBuriedPile(ctx, t);
    }

    // 8. Tiny Marble (held, rolling slow, supersonic ricochet, or roll-out)
    this.renderMarble(ctx, t);

    // 9. Overlays, Motion Lines & Speed Effects
    this.renderSpeedEffects(ctx, t, pose);

    ctx.restore();

    // 10. Large High-Contrast Editing Captions at Top of Frame
    this.renderTopCaptions(ctx, t);

    // 11. Safe zones if enabled
    if (config.showSafeZones) this.renderSafeZones(ctx);
  }

  // ==========================================================
  // BOWLING ALLEY ENVIRONMENT
  // ==========================================================

  private renderAlleyBackground(ctx: CanvasRenderingContext2D) {
    ctx.save();
    // Vibrant retro bowling alley walls: deep indigo with neon cyan & magenta stripes
    const bg = ctx.createLinearGradient(0, 0, 0, this.height);
    bg.addColorStop(0, '#0f172a'); // deep midnight blue
    bg.addColorStop(0.45, '#1e1b4b'); // retro bowling indigo
    bg.addColorStop(0.75, '#312e81');
    bg.addColorStop(1, '#1e293b');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, this.width, this.height);

    // Neon wall glow stripes
    ctx.strokeStyle = NEON_CYAN;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(0, 380);
    ctx.lineTo(this.width, 380);
    ctx.stroke();

    ctx.strokeStyle = NEON_MAGENTA;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(0, 420);
    ctx.lineTo(this.width, 420);
    ctx.stroke();

    // Overhead scoreboard screens & pin indicator lights
    ctx.fillStyle = '#020617';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.fillRect(360, 220, 360, 120);
    ctx.strokeRect(360, 220, 360, 120);

    // Score digits in neon amber
    ctx.fillStyle = '#f59e0b';
    ctx.font = '900 48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('STRIKE: 300', 540, 296);

    ctx.restore();
  }

  private renderBowlingLane(ctx: CanvasRenderingContext2D, _t: number) {
    ctx.save();
    ctx.strokeStyle = INK;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // Perspective polished maple wood bowling lane
    // Tapers from bottom approach (180..900, y=1460) to pin pit (420..660, y=910)
    const lane = ctx.createLinearGradient(540, 1460, 540, 910);
    lane.addColorStop(0, LANE_WOOD);
    lane.addColorStop(0.7, LANE_WOOD_LIGHT);
    lane.addColorStop(1, '#fde68a');

    ctx.fillStyle = lane;
    ctx.beginPath();
    ctx.moveTo(200, this.floorY);
    ctx.lineTo(440, 910);
    ctx.lineTo(640, 910);
    ctx.lineTo(880, this.floorY);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = 7;
    ctx.stroke();

    // Gutters on left and right (dark slate)
    ctx.fillStyle = GUTTER_DARK;
    // Left gutter
    ctx.beginPath();
    ctx.moveTo(140, this.floorY);
    ctx.lineTo(410, 910);
    ctx.lineTo(440, 910);
    ctx.lineTo(200, this.floorY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Right gutter
    ctx.beginPath();
    ctx.moveTo(880, this.floorY);
    ctx.lineTo(640, 910);
    ctx.lineTo(670, 910);
    ctx.lineTo(940, this.floorY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Wood boards perspective lines
    ctx.strokeStyle = 'rgba(0,0,0,0.18)';
    ctx.lineWidth = 3;
    for (let i = 1; i < 7; i++) {
      const u = i / 7;
      const bx = lerp(200, 880, u);
      const tx = lerp(440, 640, u);
      ctx.beginPath();
      ctx.moveTo(bx, this.floorY);
      ctx.lineTo(tx, 910);
      ctx.stroke();
    }

    // Lane targeting arrows (classic chevron marks)
    ctx.fillStyle = '#b45309';
    for (let a = 1; a < 6; a++) {
      const u = a / 6;
      const ax = lerp(270, 810, u);
      const ay = 1260;
      ctx.beginPath();
      ctx.moveTo(ax, ay - 24);
      ctx.lineTo(ax - 9, ay);
      ctx.lineTo(ax + 9, ay);
      ctx.closePath();
      ctx.fill();
    }

    // Approach floor where stickman stands (bottom foreground)
    ctx.fillStyle = '#e2e8f0';
    ctx.lineWidth = 7;
    ctx.fillRect(40, this.floorY, 1000, 480);
    ctx.strokeRect(40, this.floorY, 1000, 480);

    // Foul line (thick solid black)
    ctx.lineWidth = 9;
    ctx.strokeStyle = INK;
    ctx.beginPath();
    ctx.moveTo(140, this.floorY);
    ctx.lineTo(940, this.floorY);
    ctx.stroke();

    // Back wall pit bumper behind pins
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(410, 840, 260, 70);
    ctx.strokeRect(410, 840, 260, 70);

    ctx.restore();
  }

  private renderCeilingPipesAndWalls(ctx: CanvasRenderingContext2D, _t: number) {
    ctx.save();
    ctx.strokeStyle = INK;
    ctx.fillStyle = '#94a3b8';
    ctx.lineWidth = 6;
    ctx.lineJoin = 'round';

    // Right bowling alley sidewall (at x=960..1060)
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(960, 440, 90, 1020);
    ctx.strokeRect(960, 440, 90, 1020);

    // Metallic ceiling pipe (at y=560 across top) - ricochet target in Scene 4
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(80, 560, 920, 36);
    ctx.strokeRect(80, 560, 920, 36);

    // Pipe joints / flanges
    for (let px of [220, 540, 820]) {
      ctx.strokeRect(px - 10, 552, 20, 52);
    }

    ctx.restore();
  }

  // ==========================================================
  // BOWLING PINS (Ten Pins Simulation & Physics)
  // ==========================================================

  private drawPin(ctx: CanvasRenderingContext2D, x: number, y: number, rot = 0, scale = 1.0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(scale, scale);

    ctx.strokeStyle = INK;
    ctx.fillStyle = WHITE;
    ctx.lineWidth = 5;
    ctx.lineJoin = 'round';

    // Classic bowling pin silhouette:
    // Narrow rounded top head, slim neck, wide belly bulb, flat base
    ctx.beginPath();
    // Head top
    ctx.arc(0, -56, 12, Math.PI, 0);
    // Neck taper
    ctx.quadraticCurveTo(7, -35, 9, -20);
    // Bulbous belly
    ctx.quadraticCurveTo(24, 8, 16, 32);
    // Flat base
    ctx.lineTo(-16, 32);
    // Left belly
    ctx.quadraticCurveTo(-24, 8, -9, -20);
    // Left neck
    ctx.quadraticCurveTo(-7, -35, -12, -56);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Two bright red horizontal stripes on neck
    ctx.fillStyle = PIN_RED;
    ctx.fillRect(-7.5, -34, 15, 6);
    ctx.fillRect(-8.5, -24, 17, 6);

    ctx.restore();
  }

  private calculatePinPositions(t: number): BowlingPin[] {
    const pins = this.initialPins.map((p) => ({ ...p }));

    // ----------------------------------------------------
    // SCENE 2 (5-9s): Pin 1 wobbles from stomp draft and falls at t=8.2s
    // ----------------------------------------------------
    if (t >= 7.8 && t < 15.0) {
      if (t < 8.2) {
        // Wobble draft
        pins[0].rot = Math.sin((t - 7.8) * 22) * 0.18;
      } else {
        // Topples over onto its side
        const topple = smooth(clamp((t - 8.2) / 0.5, 0, 1));
        pins[0].rot = lerp(0, 1.45, topple);
        pins[0].x = 540 + topple * 28;
        pins[0].y = 990 + topple * 10;
        pins[0].fallen = true;
      }
    }

    // ----------------------------------------------------
    // SCENE 4 (15-22s): Domino strike explosion at t=18.85s!
    // ----------------------------------------------------
    if (t >= 18.85 && t < 22.0) {
      const u = clamp((t - 18.85) / 1.8, 0, 1);
      const blast = smooth(u);
      // Explode outwards in dramatic domino directions
      const dirs = [
        { dx: 30, dy: -40, rot: 2.1 },
        { dx: -70, dy: -50, rot: -2.8 },
        { dx: 80, dy: -45, rot: 3.2 },
        { dx: -120, dy: -20, rot: -3.5 },
        { dx: -20, dy: -60, rot: 1.8 },
        { dx: 110, dy: -30, rot: 3.4 },
        { dx: -140, dy: -10, rot: -4.0 },
        { dx: -50, dy: -40, rot: -2.2 },
        { dx: 60, dy: -45, rot: 2.5 },
        { dx: 140, dy: -15, rot: 3.8 },
      ];

      for (let i = 0; i < 10; i++) {
        pins[i].x = pins[i].initX + dirs[i].dx * blast;
        pins[i].y = pins[i].initY + dirs[i].dy * blast;
        pins[i].rot = dirs[i].rot * blast;
        pins[i].fallen = true;
      }
    }

    // ----------------------------------------------------
    // SCENE 5 (22-27s): Rebound & roll back down the lane toward stickman!
    // ----------------------------------------------------
    if (t >= 22.0 && t < 27.2) {
      const u = (t - 22.0) / 5.2;
      for (let i = 0; i < 10; i++) {
        // Pins tumble back down lane from y=920 toward stickman at y=1460
        const stagger = (i * 0.08);
        const pinU = clamp(u - stagger, 0, 1);
        const startX = 460 + (i % 5) * 45;
        const targetX = 320 + (i % 3) * 60;
        pins[i].x = lerp(startX, targetX, easeIn(pinU));
        pins[i].y = lerp(890, 1420, easeIn(pinU));
        pins[i].rot = pinU * TAU * (i % 2 === 0 ? 3 : -3);
        pins[i].fallen = true;
      }
    }

    return pins;
  }

  private renderBowlingPins(ctx: CanvasRenderingContext2D, pins: BowlingPin[], t: number) {
    // In Scene 6 (t>=27.2s), pins form a pile on the stickman
    if (t >= 27.2) return;

    for (const p of pins) {
      this.drawPin(ctx, p.x, p.y, p.rot, 0.85);
    }
  }

  // ==========================================================
  // MARBLE LAUNCHER (Bowling Ramp + Heavy Springs + Giant Plunger)
  // ==========================================================

  private renderLauncher(ctx: CanvasRenderingContext2D, t: number) {
    if (t < 10.2 || t > 21.0) return;

    ctx.save();
    const lx = 420;
    const ly = 1460;
    ctx.translate(lx, ly);

    ctx.strokeStyle = INK;
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // 1. Bowling metal ramp (curved tubular metal track)
    ctx.strokeStyle = '#64748b';
    ctx.beginPath();
    ctx.moveTo(-110, 0);
    ctx.lineTo(-40, -140);
    ctx.lineTo(90, -180);
    ctx.stroke();

    // Support legs
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-40, 0);
    ctx.lineTo(-40, -140);
    ctx.moveTo(60, 0);
    ctx.lineTo(60, -170);
    ctx.stroke();

    // 2. Heavy coiled metal springs
    ctx.strokeStyle = '#38bdf8'; // bright blue spring coils
    ctx.lineWidth = 5;
    ctx.beginPath();
    for (let c = 0; c < 6; c++) {
      const cx = -30 + c * 18;
      const cy = -140 - Math.sin(c * Math.PI) * 16;
      ctx.arc(cx, cy, 14, 0, TAU);
    }
    ctx.stroke();

    // 3. Giant cartoon plunger (wooden handle + big red suction cup)
    const stretch = t >= 13.8 && t < 15.02 ? smooth((t - 13.8) / 1.2) : 0;
    const snap = t >= 15.02 && t < 15.3 ? 1 - smooth((t - 15.02) / 0.28) : 0;
    const pullBack = stretch * 55 - snap * 50;

    ctx.save();
    ctx.translate(50, -180);
    ctx.rotate(0.35); // angled toward lane

    // Wooden plunger shaft
    ctx.fillStyle = '#fde047';
    ctx.fillRect(-pullBack - 80, -7, 100, 14);
    ctx.strokeRect(-pullBack - 80, -7, 100, 14);

    // Giant Red Rubber Plunger Head
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(-pullBack + 20, 0, 36, -Math.PI / 2, Math.PI / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Loaded marble resting inside plunger cup
    if (t >= 13.0 && t < 15.02) {
      this.drawMarble(ctx, -pullBack + 36, 0, 1.2);
    }

    ctx.restore();
    ctx.restore();
  }

  // ==========================================================
  // TINY MARBLE
  // ==========================================================

  private drawMarble(ctx: CanvasRenderingContext2D, x: number, y: number, scale = 1.0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Shiny translucent teal/cyan glass marble
    ctx.fillStyle = MARBLE_TEAL;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Glass reflection white swirl
    ctx.fillStyle = WHITE;
    ctx.beginPath();
    ctx.arc(-3, -3, 3, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(2, 2, 4, 0, Math.PI);
    ctx.stroke();

    ctx.restore();
  }

  private renderMarble(ctx: CanvasRenderingContext2D, t: number) {
    // ----------------------------------------------------
    // SCENE 1 (0-5s): Marble held in stickman's hand at (370, 1220)
    // ----------------------------------------------------
    if (t < 5.0) {
      // Marble is held in right hand
      return; // drawn on hand in renderStickman
    }

    // ----------------------------------------------------
    // SCENE 2 (5-9s): Rolls in hilarious slow motion, stopping an inch short
    // Starts at (360, 1440), rolls to (536, 1005)
    // ----------------------------------------------------
    if (t >= 5.0 && t < 10.2) {
      const rollU = clamp((t - 5.0) / 2.2, 0, 1);
      const mx = lerp(360, 536, smooth(rollU));
      const my = lerp(1440, 1005, smooth(rollU));
      this.drawMarble(ctx, mx, my, 0.9);
      return;
    }

    // ----------------------------------------------------
    // SCENE 4 (15.02-18.85s): Supersonic ricochet flight course!
    // Launcher (510, 1280) -> Wall (980, 860) -> Pipe (540, 560) -> Head Pin (540, 990)
    // ----------------------------------------------------
    if (t >= 15.02 && t < 18.9) {
      const flight = this.calculateMarbleFlight(t);
      if (flight) {
        this.drawMarble(ctx, flight.x, flight.y, 1.1);
        // Supersonic motion blur trail
        ctx.save();
        ctx.strokeStyle = 'rgba(20, 184, 166, 0.7)';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(flight.x, flight.y);
        ctx.lineTo(flight.x - Math.cos(flight.angle) * 60, flight.y - Math.sin(flight.angle) * 60);
        ctx.stroke();
        ctx.restore();
      }
      return;
    }

    // ----------------------------------------------------
    // SCENE 6 (27.8-30s): Rolls out of pile and knocks final pin!
    // From (400, 1340) to (470, 1350)
    // ----------------------------------------------------
    if (t >= 27.8) {
      const u = clamp((t - 27.8) / 0.8, 0, 1);
      const mx = lerp(400, 470, smooth(u));
      const my = lerp(1340, 1350, smooth(u));
      this.drawMarble(ctx, mx, my, 1.0);
    }
  }

  private calculateMarbleFlight(t: number): { x: number; y: number; angle: number } | null {
    // 15.02 - 16.0s: Launcher to Right Wall
    if (t < 16.0) {
      const u = (t - 15.02) / 0.98;
      const x = lerp(510, 980, u);
      const y = lerp(1280, 860, u);
      return { x, y, angle: -0.7 };
    }
    // 16.0 - 17.2s: Wall rebound to Ceiling Pipe at (540, 560)
    if (t < 17.2) {
      const u = (t - 16.0) / 1.2;
      const x = lerp(980, 540, u);
      const y = lerp(860, 560, u);
      return { x, y, angle: 2.5 };
    }
    // 17.2 - 18.85s: Ceiling Pipe ricochet races down lane center to Head Pin (540, 990)
    if (t < 18.85) {
      const u = (t - 17.2) / 1.65;
      const x = lerp(540, 540, u);
      const y = lerp(560, 990, u);
      return { x, y, angle: Math.PI / 2 };
    }
    return null;
  }

  // ==========================================================
  // STICKMAN CHARACTER & RIG
  // ==========================================================

  private getPose(t: number): Pose {
    const p: Pose = {
      hipX: 310,
      hipY: this.floorY - 260,
      lean: 0,
      jump: 0,
      squashX: 1,
      squashY: 1,
      headTilt: 0,
      leftFoot: { x: -50, y: 260 },
      rightFoot: { x: 50, y: 260 },
      leftKnee: -12,
      rightKnee: 12,
      leftHand: { x: -60, y: -40 },
      rightHand: { x: 60, y: -40 },
      leftElbow: -18,
      rightElbow: 18,
      leftHandStyle: 'relaxed',
      rightHandStyle: 'relaxed',
      eye: 'normal',
      brow: 'neutral',
      mouth: 'flat',
      gazeX: 0.8,
      gazeY: -0.2,
      pupilScale: 1,
      anger: false,
      sweat: false,
      silhouette: false,
    };

    // ----------------------------------------------------
    // SCENE 1 (0-5s): The Challenge — holds tiny marble, points at pins
    // ----------------------------------------------------
    if (t < 5.0) {
      if (t < 1.8) {
        // Dramatic close-up hold: holding tiny marble proudly
        p.brow = 'oneRaised';
        p.mouth = 'smirk';
        p.eye = 'normal';
        p.rightHand = { x: 60, y: -260 };
        p.rightHandStyle = 'hold';
        p.leftHand = { x: -50, y: -40 };
      } else if (t < 3.2) {
        // Dramatic point at ten pins
        p.brow = 'determined';
        p.mouth = 'smirk';
        p.rightHand = { x: 70, y: -260 };
        p.rightHandStyle = 'hold';
        p.leftHand = { x: 160, y: -200 };
        p.leftHandStyle = 'point';
        p.lean = 0.08;
      } else {
        // Wind-up: preparing to roll marble
        const u = (t - 3.2) / 1.8;
        p.lean = lerp(0.08, -0.15, u);
        p.rightHand = { x: lerp(70, -20, u), y: lerp(-260, -80, u) };
        p.rightHandStyle = 'hold';
        p.leftHand = { x: 60, y: -120 };
        p.brow = 'determined';
        p.mouth = 'grit';
        p.eye = 'squint';
      }
      return p;
    }

    // ----------------------------------------------------
    // SCENE 2 (5-9s): Epic Failure — slow roll, stare, rage stomp
    // ----------------------------------------------------
    if (t < 9.0) {
      if (t < 7.2) {
        // Bents forward watching marble crawl
        p.lean = 0.22;
        p.rightHand = { x: 120, y: -140 };
        p.leftHand = { x: -60, y: -140 };
        p.eye = 'wide';
        p.brow = 'raised';
        p.mouth = 'wobble';
        p.headTilt = 0.14;
        p.gazeX = 0.9;
        p.gazeY = 0.7;
      } else if (t < 8.0) {
        // RAGE STOMP! Lifts foot and slams floor with wind puff
        const u = (t - 7.2) / 0.8;
        const slam = Math.sin(u * Math.PI);
        p.rightFoot = { x: 50, y: 260 - slam * 60 };
        p.lean = 0.12;
        p.rightHand = { x: 80, y: -80 };
        p.leftHand = { x: -80, y: -80 };
        p.rightHandStyle = 'fist';
        p.leftHandStyle = 'fist';
        p.eye = 'squint';
        p.brow = 'angry';
        p.mouth = 'scream';
        p.anger = true;
      } else {
        // One pin topples: deadpan stunned stare
        p.eye = 'stunned';
        p.brow = 'raised';
        p.mouth = 'flat';
        p.headTilt = 0.06;
        p.pupilScale = 0.6;
        p.rightHand = { x: 60, y: -60 };
        p.leftHand = { x: -60, y: -60 };
      }
      return p;
    }

    // ----------------------------------------------------
    // SCENE 3 (9-15s): The Invention — rage, building & anime grimace
    // ----------------------------------------------------
    if (t < 15.0) {
      if (t < 10.2) {
        // Furious reaction: stomps and clenches fists
        p.brow = 'angry';
        p.mouth = 'scream';
        p.eye = 'wide';
        p.anger = true;
        p.rightHand = { x: 90, y: -290 };
        p.leftHand = { x: -90, y: -290 };
      } else if (t < 13.5) {
        // Assembling ramp and springs
        p.hipX = 350;
        p.lean = 0.15;
        p.rightHand = { x: 70, y: -120 };
        p.leftHand = { x: 30, y: -140 };
        p.brow = 'determined';
        p.mouth = 'grit';
        p.eye = 'squint';
      } else if (t < 14.2) {
        // Pulling back plunger lever
        p.hipX = 340;
        p.lean = -0.12;
        p.rightHand = { x: 50, y: -160 };
        p.leftHand = { x: 20, y: -130 };
        p.brow = 'determined';
        p.mouth = 'grit';
        p.eye = 'squint';
      } else {
        // DRAMATIC ANIME INTENSITY CLOSE-UP
        p.hipX = 310;
        p.brow = 'determined';
        p.eye = 'intense';
        p.mouth = 'grit';
        p.pupilScale = 1.45;
        p.gazeX = 0.95;
        p.gazeY = -0.1;
      }
      return p;
    }

    // ----------------------------------------------------
    // SCENE 4 (15-22s): Supersonic flight & wild champion celebration
    // ----------------------------------------------------
    if (t < 22.0) {
      if (t < 19.0) {
        // Tracking ricochet with mouth open
        p.lean = 0.12;
        p.eye = 'wide';
        p.mouth = 'open';
        p.brow = 'raised';
        p.gazeX = 0.9;
        p.rightHand = { x: 90, y: -160 };
        p.leftHand = { x: -90, y: -160 };
      } else {
        // STRIKE! Wild world-champion celebration dance!
        const dance = (t - 19.0) * 8;
        p.jump = Math.abs(Math.sin(dance)) * 45;
        p.rightHand = { x: 90 + Math.sin(dance) * 20, y: -300 };
        p.leftHand = { x: -90 - Math.sin(dance) * 20, y: -300 };
        p.rightHandStyle = 'fist';
        p.leftHandStyle = 'fist';
        p.eye = 'happy';
        p.brow = 'raised';
        p.mouth = 'scream';
        p.headTilt = Math.sin(dance) * 0.12;
      }
      return p;
    }

    // ----------------------------------------------------
    // SCENE 5 (22-27s): Revenge of the Pins — horror zoom
    // ----------------------------------------------------
    if (t < 27.2) {
      if (t < 24.5) {
        // Still celebrating happily
        p.rightHand = { x: 80, y: -280 };
        p.leftHand = { x: -80, y: -280 };
        p.eye = 'happy';
        p.mouth = 'grin';
      } else {
        // Record scratch! Celebration freezes, arms slowly drop in pure horror!
        const u = smooth((t - 24.5) / 2.5);
        p.rightHand = { x: lerp(80, 65, u), y: lerp(-280, -90, u) };
        p.leftHand = { x: lerp(-80, -65, u), y: lerp(-280, -90, u) };
        p.rightHandStyle = 'open';
        p.leftHandStyle = 'open';
        p.eye = 'wide';
        p.brow = 'raised';
        p.mouth = 'o';
        p.headTilt = 0.05;
        p.pupilScale = 1.35;
        p.sweat = true;
      }
      return p;
    }

    return p;
  }

  private renderStickman(ctx: CanvasRenderingContext2D, pose: Pose, t: number) {
    ctx.save();
    ctx.translate(pose.hipX, pose.hipY - pose.jump);
    ctx.scale(pose.squashX, pose.squashY);
    ctx.rotate(pose.lean);

    ctx.strokeStyle = INK;
    ctx.fillStyle = INK;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 1. Legs
    const leftKnee = this.drawLimb(ctx, { x: 0, y: 0 }, pose.leftFoot, pose.leftKnee, 12);
    const rightKnee = this.drawLimb(ctx, { x: 0, y: 0 }, pose.rightFoot, pose.rightKnee, 12);
    this.drawFoot(ctx, pose.leftFoot, leftKnee, -1);
    this.drawFoot(ctx, pose.rightFoot, rightKnee, 1);

    // 2. Torso
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -220);
    ctx.stroke();

    // 3. Arms
    const leftElbow = this.drawLimb(ctx, { x: 0, y: -220 }, pose.leftHand, pose.leftElbow, 11);
    const rightElbow = this.drawLimb(ctx, { x: 0, y: -220 }, pose.rightHand, pose.rightElbow, 11);
    this.drawHand(ctx, pose.leftHand, leftElbow, pose.leftHandStyle);
    this.drawHand(ctx, pose.rightHand, rightElbow, pose.rightHandStyle);

    // If holding marble in Scene 1
    if (t < 5.0 && pose.rightHandStyle === 'hold') {
      this.drawMarble(ctx, pose.rightHand.x + 8, pose.rightHand.y - 8, 1.1);
    }

    // 4. Neck & Head
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(0, -220);
    ctx.lineTo(0, -265);
    ctx.stroke();

    ctx.save();
    ctx.translate(0, -330);
    ctx.rotate(pose.headTilt);

    // Round white head with clean outline
    ctx.fillStyle = WHITE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(0, 0, 70, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Face features
    this.drawFace(ctx, pose);

    ctx.restore();
    ctx.restore();
  }

  private drawFace(ctx: CanvasRenderingContext2D, pose: Pose) {
    const eyeX = 26;
    const eyeY = -4;

    // Eyebrows
    ctx.strokeStyle = INK;
    ctx.lineCap = 'round';
    ctx.lineWidth = 6;

    const drawBrow = (side: -1 | 1, kind: BrowStyle) => {
      const x = side * eyeX;
      ctx.beginPath();
      if (kind === 'angry') {
        ctx.moveTo(x - side * 16, -30);
        ctx.lineTo(x + side * 14, -42);
      } else if (kind === 'determined') {
        ctx.moveTo(x - side * 15, -32);
        ctx.lineTo(x + side * 14, -40);
      } else if (kind === 'raised') {
        ctx.arc(x, -32, 14, Math.PI * 1.15, Math.PI * 1.85);
      } else if (kind === 'oneRaised') {
        if (side === -1) {
          ctx.moveTo(x - 14, -36);
          ctx.lineTo(x + 14, -36);
        } else {
          ctx.arc(x, -32, 14, Math.PI * 1.15, Math.PI * 1.85);
        }
      } else {
        ctx.moveTo(x - 14, -35);
        ctx.lineTo(x + 14, -35);
      }
      ctx.stroke();
    };

    drawBrow(-1, pose.brow);
    drawBrow(1, pose.brow);

    // Eyes
    for (const side of [-1, 1] as const) {
      const x = side * eyeX;
      if (pose.eye === 'happy') {
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(x, eyeY + 4, 10, Math.PI * 1.1, Math.PI * 1.9);
        ctx.stroke();
        continue;
      }
      if (pose.eye === 'intense') {
        ctx.fillStyle = INK;
        ctx.beginPath();
        ctx.arc(x + pose.gazeX * 4, eyeY, 11 * pose.pupilScale, 0, TAU);
        ctx.fill();
        ctx.fillStyle = WHITE;
        ctx.beginPath();
        ctx.arc(x + pose.gazeX * 4 - 3, eyeY - 3, 3.5, 0, TAU);
        ctx.fill();
        continue;
      }

      ctx.fillStyle = INK;
      const r = pose.eye === 'wide' ? 10 : pose.eye === 'stunned' ? 6 : 8;
      ctx.beginPath();
      ctx.arc(x + pose.gazeX * 4, eyeY + pose.gazeY * 4, r * pose.pupilScale, 0, TAU);
      ctx.fill();
    }

    // Mouth
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();

    if (pose.mouth === 'smirk') {
      ctx.arc(4, 20, 16, Math.PI * 0.1, Math.PI * 0.65);
    } else if (pose.mouth === 'grin') {
      ctx.arc(0, 16, 20, 0, Math.PI);
      ctx.fillStyle = WHITE;
      ctx.fill();
    } else if (pose.mouth === 'grit') {
      ctx.moveTo(-16, 26);
      ctx.lineTo(16, 26);
      ctx.moveTo(-8, 22);
      ctx.lineTo(-8, 30);
      ctx.moveTo(0, 22);
      ctx.lineTo(0, 30);
      ctx.moveTo(8, 22);
      ctx.lineTo(8, 30);
    } else if (pose.mouth === 'o') {
      ctx.arc(0, 26, 11, 0, TAU);
    } else if (pose.mouth === 'scream') {
      ctx.arc(0, 24, 22, 0, Math.PI);
      ctx.closePath();
      ctx.fillStyle = INK;
      ctx.fill();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, 36, 12, Math.PI, 0);
      ctx.fill();
    } else if (pose.mouth === 'wobble') {
      ctx.moveTo(-15, 26);
      ctx.quadraticCurveTo(-7, 21, 0, 26);
      ctx.quadraticCurveTo(7, 31, 15, 26);
    } else {
      ctx.moveTo(-14, 26);
      ctx.lineTo(14, 26);
    }
    ctx.stroke();

    // Sweat drop in horror
    if (pose.sweat) {
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(38, -10, 6, 0, TAU);
      ctx.fill();
    }
  }

  // ==========================================================
  // SCENE 6: BURIED UNDER PILE OF PINS & FURIOUS THUMBS-UP
  // ==========================================================

  private renderStickmanBuriedPile(ctx: CanvasRenderingContext2D, t: number) {
    ctx.save();
    const pileX = 360;
    const pileY = 1440;

    // 1. Huge tangled pile of fallen bowling pins covering stickman
    const pilePins = [
      { x: pileX - 80, y: pileY - 20, rot: 1.2 },
      { x: pileX - 40, y: pileY - 45, rot: -0.8 },
      { x: pileX, y: pileY - 60, rot: 0.4 },
      { x: pileX + 40, y: pileY - 50, rot: 1.5 },
      { x: pileX + 80, y: pileY - 25, rot: -1.3 },
      { x: pileX - 25, y: pileY - 90, rot: 0.9 },
      { x: pileX + 25, y: pileY - 85, rot: -0.6 },
      { x: pileX - 50, y: pileY - 10, rot: 2.2 },
      { x: pileX + 50, y: pileY - 12, rot: -2.1 },
    ];

    for (const p of pilePins) {
      this.drawPin(ctx, p.x, p.y, p.rot, 0.9);
    }

    // One final standing pin beside his head (at x=480, y=1400)
    // Knocked over by tiny marble at t=28.6s!
    if (t < 28.6) {
      this.drawPin(ctx, 480, 1400, 0, 0.9);
    } else {
      const topple = smooth(clamp((t - 28.6) / 0.4, 0, 1));
      this.drawPin(ctx, 480 + topple * 24, 1400 + topple * 14, topple * 1.5, 0.9);
    }

    // Stickman's black stick arm emerging from the pile giving a FURIOUS THUMBS-UP!
    if (t >= 28.8) {
      const emerge = smooth(clamp((t - 28.8) / 0.35, 0, 1));
      ctx.save();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const handX = pileX - 30;
      const handY = pileY - 80 - emerge * 80;

      // Arm stick poking straight out of pile
      ctx.beginPath();
      ctx.moveTo(pileX - 30, pileY - 40);
      ctx.lineTo(handX, handY);
      ctx.stroke();

      // Furious trembling thumbs-up hand
      ctx.translate(handX, handY);
      if (t >= 29.2 && t < 29.8) {
        // Trembling with rage
        ctx.rotate(Math.sin(t * 40) * 0.08);
      }

      ctx.fillStyle = WHITE;
      ctx.lineWidth = 5;
      // Fist
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, TAU);
      ctx.fill();
      ctx.stroke();
      // Upright extended thumb!
      ctx.beginPath();
      ctx.moveTo(4, -8);
      ctx.lineTo(4, -28);
      ctx.lineTo(-4, -28);
      ctx.lineTo(-4, -8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Popping angry red vein mark above the thumb
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(12, -26);
      ctx.lineTo(24, -26);
      ctx.moveTo(18, -32);
      ctx.lineTo(18, -20);
      ctx.stroke();

      ctx.restore();
    }

    ctx.restore();
  }

  // Draw 2-joint limb
  private drawLimb(
    ctx: CanvasRenderingContext2D,
    from: Vec,
    to: Vec,
    bend: number,
    width: number
  ): Vec {
    const mx = (from.x + to.x) / 2;
    const my = (from.y + to.y) / 2;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const joint = { x: mx + nx * bend, y: my + ny * bend };

    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(joint.x, joint.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    return joint;
  }

  private drawFoot(ctx: CanvasRenderingContext2D, foot: Vec, _knee: Vec, facing: -1 | 1) {
    ctx.lineWidth = 6;
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.ellipse(foot.x + facing * 8, foot.y, 16, 8, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
  }

  private drawHand(ctx: CanvasRenderingContext2D, hand: Vec, _elbow: Vec, style: HandStyle) {
    ctx.save();
    ctx.translate(hand.x, hand.y);
    ctx.lineWidth = 5;
    ctx.fillStyle = WHITE;
    ctx.strokeStyle = INK;

    if (style === 'fist') {
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, TAU);
      ctx.fill();
      ctx.stroke();
    } else if (style === 'point') {
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(18, 0);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.ellipse(0, 0, 10, 8, 0, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  // ==========================================================
  // SPEED LINES & VISUAL FX
  // ==========================================================

  private renderSpeedEffects(ctx: CanvasRenderingContext2D, t: number, pose: Pose) {
    // Scene 3 Anime Speed Lines
    if (t >= 14.2 && t < 15.0) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.45)';
      ctx.lineWidth = 4;
      const cx = pose.hipX;
      const cy = pose.hipY - 330;
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * TAU;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * 320, cy + Math.sin(a) * 320);
        ctx.lineTo(cx + Math.cos(a) * 640, cy + Math.sin(a) * 640);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Freeze frame border at 29.8s
    if (t >= 29.8) {
      ctx.save();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 22;
      ctx.strokeRect(10, 10, this.width - 20, this.height - 20);
      ctx.restore();
    }
  }

  // ==========================================================
  // TOP HIGH-CONTRAST CAPTIONS (Rendered near top of 9:16 frame)
  // ==========================================================

  private renderTopCaptions(ctx: CanvasRenderingContext2D, t: number) {
    for (const cap of this.captions) {
      if (t < cap.from || t > cap.to) continue;

      const fadeIn = Math.min(1, (t - cap.from) / 0.16);
      const fadeOut = Math.min(1, (cap.to - t) / 0.16);
      const alpha = Math.max(0, Math.min(fadeIn, fadeOut));
      const pop = 1 + 0.08 * Math.exp(-Math.max(0, t - cap.from) * 18);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(this.width / 2, 190); // Positioned prominently near the top of vertical frame
      ctx.scale(pop, pop);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '900 52px "Arial Black", "Impact", "Helvetica Neue", Arial, sans-serif';
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      // Heavy black stroke outline
      ctx.strokeStyle = INK;
      ctx.lineWidth = 14;
      ctx.strokeText(cap.text, 0, 0);

      // Bright high-contrast yellow face text
      ctx.fillStyle = '#fde047';
      ctx.fillText(cap.text, 0, 0);

      ctx.restore();
    }
  }

  // ==========================================================
  // CAMERA ENGINE
  // ==========================================================

  private cameraAt(t: number): CameraKey {
    const keys = this.cameraKeys;
    let i = 0;
    while (i < keys.length - 2 && t > keys[i + 1].t) i++;
    const a = keys[i];
    const b = keys[i + 1];
    const u = smooth((t - a.t) / Math.max(0.0001, b.t - a.t));
    const zoom = lerp(a.zoom, b.zoom, u);
    const x = lerp(a.x, b.x, u);
    const y = lerp(a.y, b.y, u);
    return { t, x, y, zoom };
  }

  private applyCamera(ctx: CanvasRenderingContext2D, t: number) {
    const cam = this.cameraAt(t);

    // Screen shakes
    const kick = (at: number, decay: number, amp: number) =>
      t < at ? 0 : Math.exp(-(t - at) * decay) * amp;

    const shake =
      kick(7.4, 12, 6) + // stomp
      kick(15.02, 9, 11) + // plunger launch blast
      kick(18.85, 7, 18) + // STRIKE DOMINO EXPLOSION
      kick(27.2, 9, 14); // pins avalanche crash

    const sx = Math.sin(t * 38) * shake;
    const sy = Math.cos(t * 32) * shake;

    ctx.translate(this.width / 2 + sx, this.height / 2 + sy);
    ctx.scale(cam.zoom, cam.zoom);
    ctx.translate(-cam.x, -cam.y);
  }

  private renderSafeZones(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.85)';
    ctx.setLineDash([14, 12]);
    ctx.lineWidth = 3;

    // Title / action safe area (9:16)
    ctx.strokeRect(48, 120, this.width - 96, this.height - 240);

    // Right-hand action bar (Shorts buttons)
    ctx.beginPath();
    ctx.moveTo(this.width - 150, 520);
    ctx.lineTo(this.width - 150, 1380);
    ctx.stroke();

    // Bottom caption band
    ctx.strokeRect(48, 1590, this.width - 96, 210);
    ctx.restore();
  }
}
