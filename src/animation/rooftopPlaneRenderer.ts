import { StudioConfig } from '../types';

/**
 * RooftopPlaneRenderer
 *
 * "THE ANGRY STICKMAN: ROOFTOP PAPER AIRPLANE TRICKSHOT" — a 30-second vertical
 * 9:16 comedy animation on a skyscraper rooftop at sunset.
 *
 * Minimalist flat 2D vector style: clean black outlines, white stickman head,
 * black stickman body, expressive eyebrows, cartoon physics, exaggerated reactions.
 *
 * Scene 1 (0-5s):  Stands on rooftop, aims at tiny window on neighboring roof, throws confidently.
 *                  Airplane smacks wall and flops down. Smug smile freezes into deadpan disbelief.
 * Scene 2 (5-10s): Throws second airplane. Bounces off AC unit with a metallic boing,
 *                  orbits his head in an absurd loop, and lands right inside his coffee cup.
 *                  He glares at the cup and hurls it away in fury.
 * Scene 3 (10-16s): Crazy idea! Builds an absurd launcher from a mop, rubber bands, and a traffic cone.
 *                  Loads fresh plane, pulls back elastic. Dramatic anime close-up on determined eyes.
 * Scene 4 (16-23s): Supersonic launch! Slalom through narrow gap, curves around rooftop water tank,
 *                  ricochets off satellite dish, swoops cleanly through tiny window! Wild premature celebration!
 * Scene 5 (23-27s): Reveal: the airplane landed in a coffee cup resting on a loose rooftop panel.
 *                  The panel tilts like a seesaw and launches the cup high into the air!
 *                  Stickman stops cheering and turns toward it in sheer horror.
 * Scene 6 (27-30s): The coffee cup drops upside down squarely onto his head. The airplane glides
 *                  down and docks inside the cup bottom. He raises arms in triumphant champion pose...
 *                  then coffee drips down his face! Expression flips to boiling rage! Comedic freeze-frame!
 *
 * NO captions, text, subtitles, or watermarks in render.
 */

type EyeStyle = 'normal' | 'wide' | 'happy' | 'closed' | 'cross' | 'stunned' | 'squint' | 'intense';
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

const TAU = Math.PI * 2;
const INK = '#000000';
const WHITE = '#ffffff';
const CONE_ORANGE = '#ff7700';
const COFFEE_BROWN = '#4a2c11';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const smooth = (u: number) => {
  const c = clamp(u, 0, 1);
  return c * c * (3 - 2 * c);
};
const easeOut = (u: number) => 1 - Math.pow(1 - clamp(u, 0, 1), 2);
const easeIn = (u: number) => Math.pow(clamp(u, 0, 1), 2);

export class RooftopPlaneRenderer {
  public readonly width = 1080;
  public readonly height = 1920;

  // Rooftop layout coordinates
  private readonly floorY = 1460;
  private readonly ledgeLeft = 30;
  private readonly ledgeRight = 1050;

  // Rooftop Props layout:
  // Stickman standing around x=280..320
  // Coffee cup 1 on small ledge/air conditioning unit
  // AC Unit at x=440..580, y=1280..1460
  // Rooftop Water Tank at x=680..860, y=860..1240
  // Satellite Dish at x=890..1010, y=980..1220
  // Distant Neighboring Rooftop & Tiny Window across right chasm at x=1380..1580, y=720..1300
  // Tiny Window at (1420, 840)

  private readonly cameraKeys: CameraKey[] = [
    // Scene 1: Medium shot on stickman & rooftop (0-5s)
    { t: 0.0, x: 540, y: 1180, zoom: 0.95 },
    { t: 2.4, x: 500, y: 1140, zoom: 1.05 },
    { t: 3.4, x: 820, y: 1040, zoom: 0.9 }, // track plane to distant wall
    { t: 4.0, x: 340, y: 1020, zoom: 1.35 }, // punch in on frozen face

    // Scene 2: AC Ricochet & orbit (5-10s)
    { t: 5.0, x: 440, y: 1140, zoom: 1.05 },
    { t: 6.6, x: 520, y: 1220, zoom: 1.2 }, // AC unit bounce
    { t: 7.4, x: 340, y: 1060, zoom: 1.3 }, // orbit around head
    { t: 8.2, x: 410, y: 1160, zoom: 1.25 }, // cup stare
    { t: 9.4, x: 480, y: 1180, zoom: 1.05 }, // cup throw

    // Scene 3: Building the launcher & dramatic eye close-up (10-16s)
    { t: 10.0, x: 380, y: 1160, zoom: 1.15 },
    { t: 12.0, x: 480, y: 1220, zoom: 1.15 }, // building launcher
    { t: 13.8, x: 460, y: 1180, zoom: 1.25 }, // loading & stretch
    { t: 14.6, x: 310, y: 800, zoom: 2.5 }, // DRAMATIC ANIME CLOSE-UP OF EYES
    { t: 15.9, x: 310, y: 800, zoom: 2.7 },

    // Scene 4: Supersonic flight course (16-23s)
    { t: 16.0, x: 540, y: 1160, zoom: 0.95 }, // launch
    { t: 17.5, x: 740, y: 1080, zoom: 1.1 }, // water tank curve
    { t: 19.2, x: 920, y: 1020, zoom: 1.2 }, // satellite dish
    { t: 20.4, x: 1350, y: 880, zoom: 1.2 }, // through tiny window
    { t: 21.6, x: 340, y: 1120, zoom: 1.2 }, // stickman wild celebration!

    // Scene 5: Reveal cup on loose rooftop panel (23-27s)
    { t: 23.0, x: 1380, y: 860, zoom: 1.55 }, // zoom into tiny window ledge
    { t: 25.2, x: 1380, y: 800, zoom: 1.35 }, // panel launches cup skyward
    { t: 26.1, x: 420, y: 1100, zoom: 1.15 }, // stickman turns in horror

    // Scene 6: Cup drops onto head, plane docks, drip & rage freeze (27-30s)
    { t: 27.0, x: 400, y: 1080, zoom: 1.25 },
    { t: 28.0, x: 380, y: 980, zoom: 1.45 }, // champion pose with cup
    { t: 28.8, x: 380, y: 880, zoom: 1.7 }, // push in on dripping face
    { t: 29.5, x: 380, y: 880, zoom: 1.75 }, // extreme rage freeze-frame
    { t: 30.0, x: 380, y: 880, zoom: 1.75 },
  ];

  public render(ctx: CanvasRenderingContext2D, t: number, config: StudioConfig) {
    ctx.save();

    // 1. Sky & Sunset Background (warm pastel sunset gradients allowed for sky backdrop)
    this.renderSunsetSky(ctx, t);

    // 2. Camera Transform & Shake
    this.applyCamera(ctx, t);

    // 3. Distant City Skyline Silhouettes
    this.renderCitySkyline(ctx);

    // 4. Neighboring Rooftop & Tiny Window (x: 1200..1600)
    this.renderNeighboringRooftop(ctx, t);

    // 5. Main Rooftop Base & Ledge Floor
    const pose = this.getPose(t);
    this.renderMainRooftop(ctx, pose);

    // 6. Rooftop Props: AC Unit, Water Tank, Satellite Dish
    this.renderACUnit(ctx, t);
    this.renderWaterTank(ctx, t);
    this.renderSatelliteDish(ctx, t);

    // 7. Launcher Prop (Scene 3 & 4)
    this.renderLauncher(ctx, t);

    // 8. Ground Shadows & Props
    this.renderLooseProps(ctx, t);

    // 9. Stickman Character
    this.renderStickman(ctx, pose, t);

    // 10. Flying Paper Airplanes & Flying Coffee Cup
    this.renderPaperAirplanes(ctx, t);
    this.renderCoffeeCups(ctx, t);

    // 11. Overlays & FX (wind lines, motion trails, anime speed lines in Scene 3/4)
    this.renderVisualFX(ctx, t, pose);

    ctx.restore();

    // Safe zones if enabled in UI
    if (config.showSafeZones) this.renderSafeZones(ctx);
  }

  // ==========================================================
  // SUNSET SKY & CITY SKYLINE
  // ==========================================================

  private renderSunsetSky(ctx: CanvasRenderingContext2D, _t: number) {
    ctx.save();
    // Warm gradient sunset sky (Orange/Pink to Soft Violet/Gold)
    const sky = ctx.createLinearGradient(0, 0, 0, this.height);
    sky.addColorStop(0, '#f97316'); // vibrant sunset orange
    sky.addColorStop(0.35, '#fb923c'); // warm amber
    sky.addColorStop(0.65, '#fde047'); // golden yellow
    sky.addColorStop(0.85, '#fef08a'); // pale sunset glow
    sky.addColorStop(1, '#ffffff');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, this.width, this.height);

    // Distant soft glowing sun on horizon
    ctx.fillStyle = '#fffbeb';
    ctx.beginPath();
    ctx.arc(880, 820, 110, 0, TAU);
    ctx.fill();

    ctx.restore();
  }

  private renderCitySkyline(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.fillStyle = '#fed7aa'; // Far distant silhouette layer
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';

    // Layer 1: Very distant towers
    const farBuildings = [
      { x: -100, w: 180, h: 650 },
      { x: 110, w: 140, h: 580 },
      { x: 280, w: 220, h: 720 },
      { x: 530, w: 160, h: 610 },
      { x: 720, w: 190, h: 690 },
      { x: 940, w: 230, h: 740 },
      { x: 1200, w: 180, h: 630 },
      { x: 1420, w: 210, h: 700 },
    ];

    for (const b of farBuildings) {
      ctx.fillRect(b.x, this.floorY - b.h, b.w, b.h);
      ctx.strokeRect(b.x, this.floorY - b.h, b.w, b.h);
      // Spire/Antenna on select buildings
      if (b.w > 180) {
        ctx.beginPath();
        ctx.moveTo(b.x + b.w / 2, this.floorY - b.h);
        ctx.lineTo(b.x + b.w / 2, this.floorY - b.h - 80);
        ctx.stroke();
      }
    }

    // Layer 2: Mid-distance darker city blocks
    ctx.fillStyle = '#fbcfe8';
    const midBuildings = [
      { x: -40, w: 160, h: 480 },
      { x: 160, w: 170, h: 520 },
      { x: 380, w: 190, h: 450 },
      { x: 610, w: 150, h: 540 },
      { x: 810, w: 170, h: 490 },
      { x: 1040, w: 220, h: 560 },
      { x: 1310, w: 160, h: 470 },
    ];
    for (const b of midBuildings) {
      ctx.fillRect(b.x, this.floorY - b.h, b.w, b.h);
      ctx.strokeRect(b.x, this.floorY - b.h, b.w, b.h);
      // Small clean window grids
      ctx.fillStyle = '#ffffff';
      for (let wy = this.floorY - b.h + 30; wy < this.floorY - 100; wy += 45) {
        for (let wx = b.x + 25; wx < b.x + b.w - 30; wx += 35) {
          ctx.fillRect(wx, wy, 16, 22);
        }
      }
      ctx.fillStyle = '#fbcfe8';
    }

    ctx.restore();
  }

  // ==========================================================
  // NEIGHBORING ROOFTOP & TINY WINDOW (Across chasm at right)
  // ==========================================================

  private renderNeighboringRooftop(ctx: CanvasRenderingContext2D, t: number) {
    ctx.save();
    ctx.strokeStyle = INK;
    ctx.fillStyle = '#f1f5f9';
    ctx.lineWidth = 6;
    ctx.lineJoin = 'round';

    const roofX = 1260;
    const roofY = 740;
    const roofW = 420;
    const roofH = this.floorY - roofY + 300;

    // Building body
    ctx.fillRect(roofX, roofY, roofW, roofH);
    ctx.strokeRect(roofX, roofY, roofW, roofH);

    // Decorative ledge trim
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(roofX - 15, roofY - 24, roofW + 30, 24);
    ctx.strokeRect(roofX - 15, roofY - 24, roofW + 30, 24);

    // Tiny target window at (1420, 840)
    const winX = 1420;
    const winY = 840;
    const winW = 86;
    const winH = 110;

    ctx.fillStyle = '#0f172a'; // dark cozy interior
    ctx.fillRect(winX, winY, winW, winH);
    ctx.strokeRect(winX, winY, winW, winH);

    // Window sill & frame cross
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.fillRect(winX - 10, winY + winH, winW + 20, 14);
    ctx.strokeRect(winX - 10, winY + winH, winW + 20, 14);

    ctx.beginPath();
    ctx.moveTo(winX + winW / 2, winY);
    ctx.lineTo(winX + winW / 2, winY + winH);
    ctx.moveTo(winX, winY + winH / 2);
    ctx.lineTo(winX + winW, winY + winH / 2);
    ctx.stroke();

    // Loose rooftop panel teetering on neighboring roof edge (Scene 5)
    // resting on ledge at (1360, 716)
    if (t >= 22.0) {
      this.renderLooseRooftopPanel(ctx, t);
    }

    ctx.restore();
  }

  private renderLooseRooftopPanel(ctx: CanvasRenderingContext2D, t: number) {
    ctx.save();
    const pivotX = 1380;
    const pivotY = 716;

    // Teeter & launch rotation
    let rot = 0.05;
    if (t >= 24.2 && t < 25.2) {
      // plane lands in coffee cup, panel teeters
      const u = (t - 24.2) / 1.0;
      rot = 0.05 + Math.sin(u * TAU * 3) * 0.12 * (1 - u * 0.5);
    } else if (t >= 25.2) {
      // SNAPS down like a catapult lever!
      const snap = smooth(clamp((t - 25.2) / 0.18, 0, 1));
      rot = lerp(0.05, -0.65, snap);
    }

    ctx.translate(pivotX, pivotY);
    ctx.rotate(rot);

    // Wooden plank / metal panel
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.rect(-90, -10, 180, 20);
    ctx.fill();
    ctx.stroke();

    // Fulcrum triangular block
    ctx.restore();

    ctx.save();
    ctx.fillStyle = '#cbd5e1';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(1365, 716);
    ctx.lineTo(1380, 696);
    ctx.lineTo(1395, 716);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // ==========================================================
  // MAIN ROOFTOP BASE
  // ==========================================================

  private renderMainRooftop(ctx: CanvasRenderingContext2D, pose: Pose) {
    ctx.save();
    ctx.strokeStyle = INK;
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 7;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // Main roof slab
    ctx.beginPath();
    ctx.rect(this.ledgeLeft, this.floorY, this.ledgeRight - this.ledgeLeft, 500);
    ctx.fill();
    ctx.stroke();

    // Rooftop perimeter safety rail / concrete parapet ledge
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.rect(this.ledgeLeft - 8, this.floorY - 26, this.ledgeRight - this.ledgeLeft + 16, 26);
    ctx.fill();
    ctx.stroke();

    // Subtle floor seam tiles
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(0,0,0,0.18)';
    for (let x = 180; x < 1000; x += 180) {
      ctx.beginPath();
      ctx.moveTo(x, this.floorY);
      ctx.lineTo(x - 50, this.floorY + 280);
      ctx.stroke();
    }

    // Shadow under stickman
    const lift = Math.max(0, pose.jump);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.beginPath();
    ctx.ellipse(pose.hipX, this.floorY + 4, 90 - lift * 0.2, 14 - lift * 0.02, 0, 0, TAU);
    ctx.fill();

    ctx.restore();
  }

  // ==========================================================
  // PROPS: AC UNIT, WATER TANK, SATELLITE DISH
  // ==========================================================

  private renderACUnit(ctx: CanvasRenderingContext2D, t: number) {
    // Air conditioning unit at x=440..580, y=1280..1460
    ctx.save();
    const acX = 490;
    const acY = 1320;
    const acW = 140;
    const acH = 140;

    // Vibration / bounce shake when hit in Scene 2 (t=6.6s)
    let shake = 0;
    if (t >= 6.6 && t < 7.4) {
      shake = Math.sin((t - 6.6) * 35) * Math.exp(-(t - 6.6) * 4) * 8;
    }

    ctx.translate(acX + shake, acY);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.lineJoin = 'round';

    // Box body
    ctx.fillRect(0, 0, acW, acH);
    ctx.strokeRect(0, 0, acW, acH);

    // AC Fan grill circle
    ctx.beginPath();
    ctx.arc(acW * 0.42, acH * 0.48, 42, 0, TAU);
    ctx.stroke();

    // Fan blades (slow spinning)
    const fanAngle = t * 6;
    for (let b = 0; b < 3; b++) {
      const a = fanAngle + (b * TAU) / 3;
      ctx.beginPath();
      ctx.ellipse(acW * 0.42 + Math.cos(a) * 18, acH * 0.48 + Math.sin(a) * 18, 18, 8, a, 0, TAU);
      ctx.fillStyle = '#e2e8f0';
      ctx.fill();
      ctx.stroke();
    }

    // Horizontal vent slats on right side
    ctx.lineWidth = 4;
    for (let vy = 25; vy < acH - 25; vy += 18) {
      ctx.beginPath();
      ctx.moveTo(acW * 0.72, vy);
      ctx.lineTo(acW - 14, vy);
      ctx.stroke();
    }

    // Small support feet
    ctx.lineWidth = 6;
    ctx.strokeRect(10, acH, 20, 10);
    ctx.strokeRect(acW - 30, acH, 20, 10);

    ctx.restore();
  }

  private renderWaterTank(ctx: CanvasRenderingContext2D, t: number) {
    // Rooftop water tank at x=700..850, y=940..1280 (stands on tall legs)
    ctx.save();
    const tankX = 760;
    const tankY = 960;
    const tankW = 150;
    const tankH = 220;

    ctx.translate(tankX, tankY);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.lineJoin = 'round';

    // 4 Truss legs
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(15, tankH);
    ctx.lineTo(5, 1460 - tankY);
    ctx.moveTo(tankW - 15, tankH);
    ctx.lineTo(tankW - 5, 1460 - tankY);
    ctx.moveTo(40, tankH);
    ctx.lineTo(35, 1460 - tankY);
    ctx.moveTo(tankW - 40, tankH);
    ctx.lineTo(tankW - 35, 1460 - tankY);
    // Cross bracing
    ctx.moveTo(10, tankH + 50);
    ctx.lineTo(tankW - 10, tankH + 150);
    ctx.moveTo(tankW - 10, tankH + 50);
    ctx.lineTo(10, tankH + 150);
    ctx.stroke();

    // Wooden / metal cylinder barrel
    ctx.lineWidth = 6;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, tankW, tankH);
    ctx.strokeRect(0, 0, tankW, tankH);

    // Barrel hoops
    for (let hy of [45, 110, 175]) {
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, hy);
      ctx.lineTo(tankW, hy);
      ctx.stroke();
    }

    // Conical roof cap
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(tankW / 2, -50);
    ctx.lineTo(tankW + 10, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Little finial sphere
    ctx.beginPath();
    ctx.arc(tankW / 2, -55, 6, 0, TAU);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  private renderSatelliteDish(ctx: CanvasRenderingContext2D, t: number) {
    // Satellite dish at x=940, y=1180
    ctx.save();
    const dishX = 950;
    const dishY = 1260;

    // Dish wobble on ricochet in Scene 4 (t=19.4s)
    let wobble = 0;
    if (t >= 19.45 && t < 20.8) {
      wobble = Math.sin((t - 19.45) * 32) * Math.exp(-(t - 19.45) * 4) * 0.22;
    }

    ctx.translate(dishX, dishY);
    ctx.rotate(wobble);

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.lineJoin = 'round';

    // Tripod mount base
    ctx.beginPath();
    ctx.moveTo(-35, 1460 - dishY);
    ctx.lineTo(0, 0);
    ctx.lineTo(35, 1460 - dishY);
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 1460 - dishY);
    ctx.stroke();

    // Parabolic curved dish facing up-right
    ctx.save();
    ctx.rotate(-0.4);
    ctx.beginPath();
    ctx.ellipse(0, -60, 65, 30, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Center antenna stalk & LNB receiver
    ctx.beginPath();
    ctx.moveTo(0, -60);
    ctx.lineTo(25, -110);
    ctx.stroke();
    ctx.fillRect(18, -120, 14, 16);
    ctx.strokeRect(18, -120, 14, 16);
    ctx.restore();

    ctx.restore();
  }

  // ==========================================================
  // ABSURD LAUNCHER (Mop + Traffic Cone + Stretched Rubber Bands)
  // ==========================================================

  private renderLauncher(ctx: CanvasRenderingContext2D, t: number) {
    // Launcher sits at x=410, y=1460 during Scene 3 & 4 (11.2s - 22.0s)
    if (t < 11.2 || t > 23.0) return;

    ctx.save();
    const lx = 410;
    const ly = 1460;
    ctx.translate(lx, ly);

    ctx.strokeStyle = INK;
    ctx.fillStyle = '#ffffff';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // 1. Bright Traffic Cone base (orange with white safety stripes)
    ctx.lineWidth = 6;
    // Cone base flange
    ctx.fillStyle = CONE_ORANGE;
    ctx.fillRect(-60, -14, 120, 14);
    ctx.strokeRect(-60, -14, 120, 14);

    // Cone body (tapered)
    ctx.beginPath();
    ctx.moveTo(-45, -14);
    ctx.lineTo(-12, -140);
    ctx.lineTo(12, -140);
    ctx.lineTo(45, -14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // White stripes on cone
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-32, -50);
    ctx.lineTo(-24, -85);
    ctx.lineTo(24, -85);
    ctx.lineTo(32, -50);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 2. Mop handle inserted into cone at a 45-degree launch angle
    ctx.save();
    ctx.translate(0, -120);
    ctx.rotate(0.55); // angled toward the right!

    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 7;
    // Mop stick
    ctx.fillRect(-7, -190, 14, 210);
    ctx.strokeRect(-7, -190, 14, 210);

    // Mop head bristles at top
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.ellipse(0, -190, 32, 16, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Hanging strings
    ctx.lineWidth = 3;
    for (let s = -22; s <= 22; s += 7) {
      ctx.beginPath();
      ctx.moveTo(s, -188);
      ctx.lineTo(s + (s % 2 === 0 ? 4 : -4), -160);
      ctx.stroke();
    }

    // 3. Stretched thick red rubber bands & loading pouch
    const stretch = t >= 13.8 && t < 16.0 ? smooth((t - 13.8) / 0.8) : 0;
    const snap = t >= 16.0 && t < 16.3 ? 1 - smooth((t - 16.0) / 0.25) : 0;
    const pullBack = stretch * 65 - snap * 50;

    ctx.strokeStyle = '#ef4444'; // red elastic bands
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-25, -180);
    ctx.lineTo(0, -180 + pullBack);
    ctx.lineTo(25, -180);
    ctx.stroke();

    // Loaded Paper Airplane riding the pouch before 16.02s
    if (t >= 13.5 && t < 16.02) {
      this.drawPaperAirplane(ctx, 0, -180 + pullBack - 16, 0, 1.1);
    }

    ctx.restore();
    ctx.restore();
  }

  // ==========================================================
  // PAPER AIRPLANES
  // ==========================================================

  /**
   * Draws a clean, crisp, minimalist vector paper airplane with thick black outlines
   * and clean wing fold lines.
   */
  private drawPaperAirplane(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    angle: number,
    scale = 1.0
  ) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(scale, scale);

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // Left wing
    ctx.beginPath();
    ctx.moveTo(34, 0); // nose tip
    ctx.lineTo(-28, -22); // wing wingtip
    ctx.lineTo(-18, 0); // inner keel fold
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Right wing (slightly darker/shaded underneath)
    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.moveTo(34, 0);
    ctx.lineTo(-18, 0);
    ctx.lineTo(-28, 22);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Center spine fold
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(34, 0);
    ctx.lineTo(-32, 0);
    ctx.stroke();

    ctx.restore();
  }

  private renderPaperAirplanes(ctx: CanvasRenderingContext2D, t: number) {
    // ----------------------------------------------------
    // PLANE 1 (Scene 1: 2.6s - 5.0s)
    // Throws, smacks wall at x=1260, y=860 at t=3.5s, flops down to floor
    // ----------------------------------------------------
    if (t >= 2.65 && t < 5.0) {
      if (t < 3.52) {
        // In flight toward wall
        const u = easeOut((t - 2.65) / 0.87);
        const x = lerp(360, 1260, u);
        const y = lerp(1100, 860, u) - Math.sin(u * Math.PI) * 110;
        const angle = -0.15 + u * 0.1;
        this.drawPaperAirplane(ctx, x, y, angle, 1.0);

        // Motion trails behind plane
        this.drawMotionTrail(ctx, x - 30, y, 40, angle);
      } else {
        // Smacked wall! Crumpled nose, flops downward
        const u = clamp((t - 3.52) / 0.8, 0, 1);
        const flopY = lerp(860, 1420, easeIn(u));
        const rot = u * Math.PI * 1.5;
        this.drawPaperAirplane(ctx, 1260, flopY, rot, 0.95);
      }
    }

    // ----------------------------------------------------
    // PLANE 2 (Scene 2: 5.85s - 10.0s)
    // Throws, hits AC unit (t=6.62s), orbits head (7.0-7.8s), plops in coffee cup (7.92s)
    // ----------------------------------------------------
    if (t >= 5.85 && t < 10.0) {
      if (t < 6.62) {
        // Throw toward AC unit
        const u = (t - 5.85) / 0.77;
        const x = lerp(360, 520, u);
        const y = lerp(1120, 1340, u) - Math.sin(u * Math.PI) * 40;
        this.drawPaperAirplane(ctx, x, y, 0.4, 1.0);
      } else if (t < 7.85) {
        // Ricochet & orbit stickman's head (head at x=310, y=1126)
        const u = (t - 6.62) / 1.23;
        const angle = u * TAU * 1.35 - 0.5;
        const rx = 130;
        const ry = 80;
        const x = 310 + Math.cos(angle) * rx;
        const y = 1126 + Math.sin(angle) * ry;
        this.drawPaperAirplane(ctx, x, y, angle + Math.PI / 2, 1.0);
        this.drawMotionTrail(ctx, x, y, 30, angle + Math.PI / 2);
      } else if (t < 7.95) {
        // Drops right into coffee cup at (390, 1260)
        const u = (t - 7.85) / 0.1;
        const x = lerp(370, 390, u);
        const y = lerp(1180, 1260, u);
        this.drawPaperAirplane(ctx, x, y, Math.PI / 2, 0.85);
      }
      // After 7.95s, plane rides inside coffee cup 1
    }

    // ----------------------------------------------------
    // PLANE 3: THE IMPOSSIBLE SHOT (Scene 4: 16.02s - 23.85s)
    // Launches supersonic, slaloms gap, curves around water tank,
    // hits satellite dish, enters tiny window at (1420, 840)
    // ----------------------------------------------------
    if (t >= 16.02 && t < 24.0) {
      const flight = this.calculateTrickshotFlight(t);
      if (flight) {
        this.drawPaperAirplane(ctx, flight.x, flight.y, flight.angle, flight.scale);
        this.drawSupersonicTrail(ctx, flight.x, flight.y, flight.angle);
      }
    }

    // ----------------------------------------------------
    // SCENE 6: Plane glides down and docks neatly into cup on stickman's head (27.5s - 30.0s)
    // ----------------------------------------------------
    if (t >= 27.5) {
      const dock = clamp((t - 27.5) / 0.28, 0, 1);
      const headX = 310;
      const cupTopY = 1060; // cup bottom on top of head
      const startX = headX + 45;
      const startY = cupTopY - 140;

      const px = lerp(startX, headX, smooth(dock));
      const py = lerp(startY, cupTopY - 14, smooth(dock));
      const pAngle = lerp(-0.4, 0, dock);
      this.drawPaperAirplane(ctx, px, py, pAngle, 0.8);
    }
  }

  private calculateTrickshotFlight(t: number): { x: number; y: number; angle: number; scale: number } | null {
    // 16.02 - 17.2s: Launch from mop at (410, 1280) through narrow gap
    if (t < 17.2) {
      const u = easeOut((t - 16.02) / 1.18);
      const x = lerp(410, 680, u);
      const y = lerp(1280, 1140, u) - Math.sin(u * Math.PI) * 70;
      return { x, y, angle: -0.28, scale: 1.1 };
    }
    // 17.2 - 19.3s: Swoop & curve around water tank at (760, 1000)
    if (t < 19.3) {
      const u = (t - 17.2) / 2.1;
      const angle = -Math.PI / 2 + u * Math.PI * 0.9;
      const x = 760 + Math.cos(angle) * 110;
      const y = 1040 + Math.sin(angle) * 90;
      return { x, y, angle: angle + Math.PI / 2, scale: 1.0 };
    }
    // 19.3 - 20.4s: Ricochet off satellite dish at (950, 1200)
    if (t < 20.4) {
      const u = (t - 19.3) / 1.1;
      const x = lerp(860, 950, u);
      const y = lerp(1080, 1200, u);
      return { x, y, angle: 0.55, scale: 0.95 };
    }
    // 20.4 - 22.0s: Ricochet trajectory soaring through tiny window at (1420, 840)
    if (t < 22.0) {
      const u = easeOut((t - 20.4) / 1.6);
      const x = lerp(950, 1420, u);
      const y = lerp(1200, 840, u) - Math.sin(u * Math.PI) * 140;
      return { x, y, angle: -0.55, scale: lerp(0.95, 0.65, u) };
    }
    // 22.0 - 23.85s: Dives into window and lands into coffee cup on loose panel
    if (t < 23.85) {
      const u = (t - 22.0) / 1.85;
      const x = lerp(1420, 1380, u);
      const y = lerp(840, 710, u);
      return { x, y, angle: 0.2, scale: 0.6 };
    }
    return null;
  }

  // ==========================================================
  // COFFEE CUPS
  // ==========================================================

  private drawCoffeeCup(ctx: CanvasRenderingContext2D, x: number, y: number, rot = 0, scale = 1.0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(scale, scale);

    ctx.strokeStyle = INK;
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 5;
    ctx.lineJoin = 'round';

    // Ceramic cup body (tapered mug)
    ctx.beginPath();
    ctx.moveTo(-20, -28);
    ctx.lineTo(20, -28);
    ctx.lineTo(15, 20);
    ctx.lineTo(-15, 20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Handle on right
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(22, -6, 12, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();

    // Dark hot coffee inside if upright
    if (Math.abs(rot) < 1.0) {
      ctx.fillStyle = COFFEE_BROWN;
      ctx.beginPath();
      ctx.ellipse(0, -28, 18, 5, 0, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  private renderCoffeeCups(ctx: CanvasRenderingContext2D, t: number) {
    // ----------------------------------------------------
    // CUP 1: On rooftop AC unit / ledge (Scene 1 & 2)
    // At (390, 1280) until hurled away at t=9.2s
    // ----------------------------------------------------
    if (t < 9.25) {
      this.drawCoffeeCup(ctx, 390, 1280, 0, 1.0);
    } else if (t < 10.2) {
      // Hurled off roof in frustration!
      const u = (t - 9.25) / 0.95;
      const cx = lerp(390, 180, u);
      const cy = lerp(1280, 1600, easeIn(u));
      const rot = u * Math.PI * 4;
      this.drawCoffeeCup(ctx, cx, cy, rot, 1.0);
    }

    // ----------------------------------------------------
    // CUP 2: On loose rooftop panel (Scene 5 & 6)
    // Rested on panel at (1380, 700) until launched at 25.2s
    // ----------------------------------------------------
    if (t >= 22.0 && t < 25.2) {
      this.drawCoffeeCup(ctx, 1380, 700, 0, 0.9);
    } else if (t >= 25.2 && t < 27.28) {
      // Launch high into sky and drops over stickman's head!
      const u = (t - 25.2) / 2.08;
      const peak = Math.sin(u * Math.PI) * 450;
      const cx = lerp(1380, 310, smooth(u));
      const cy = lerp(700, 1110, u) - peak;
      // Flips upside down!
      const rot = lerp(0, Math.PI, easeOut(u));
      this.drawCoffeeCup(ctx, cx, cy, rot, 1.05);

      // Drops of coffee spilling in arc
      ctx.fillStyle = COFFEE_BROWN;
      for (let d = 0; d < 3; d++) {
        ctx.beginPath();
        ctx.arc(cx - d * 18, cy + 20 + d * 8, 4, 0, TAU);
        ctx.fill();
      }
    } else if (t >= 27.28) {
      // DOCKED UPSIDE DOWN ON STICKMAN'S HEAD LIKE A HELMET!
      // Head center is at x=310, y=1126
      const headTop = 1056;
      this.drawCoffeeCup(ctx, 310, headTop + 20, Math.PI, 1.15);
    }
  }

  private renderLooseProps(ctx: CanvasRenderingContext2D, t: number) {
    // Coffee puddle & drips on face in Scene 6 (28.7s - 30.0s)
    if (t >= 28.7) {
      ctx.save();
      ctx.fillStyle = COFFEE_BROWN;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;

      const dripLen = clamp((t - 28.7) / 0.7, 0, 1) * 38;
      // Drip down left cheek
      ctx.beginPath();
      ctx.moveTo(292, 1110);
      ctx.lineTo(292, 1110 + dripLen);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(292, 1110 + dripLen, 5, 0, TAU);
      ctx.fill();

      // Drip down right cheek
      ctx.beginPath();
      ctx.moveTo(328, 1115);
      ctx.lineTo(328, 1115 + dripLen * 0.9);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(328, 1115 + dripLen * 0.9, 4.5, 0, TAU);
      ctx.fill();

      ctx.restore();
    }
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
    // SCENE 1 (0-5s): Confident aim & throw, wall smack freeze
    // ----------------------------------------------------
    if (t < 5.0) {
      if (t < 1.8) {
        // Confident standing pose holding plane up
        p.brow = 'oneRaised';
        p.mouth = 'smirk';
        p.eye = 'normal';
        p.rightHand = { x: 70, y: -260 };
        p.rightHandStyle = 'hold';
        p.leftHand = { x: -60, y: -30 };
        p.gazeX = 0.9;
      } else if (t < 2.65) {
        // Wind-up: pull airplane behind ear
        const u = (t - 1.8) / 0.85;
        p.brow = 'determined';
        p.mouth = 'grit';
        p.eye = 'squint';
        p.lean = lerp(0, -0.1, u);
        p.rightHand = { x: lerp(70, -10, u), y: lerp(-260, -250, u) };
        p.leftHand = { x: 140, y: -190 }; // pointing at target window
        p.leftHandStyle = 'point';
      } else if (t < 3.52) {
        // Throw follow-through
        p.lean = 0.18;
        p.rightHand = { x: 180, y: -220 };
        p.rightHandStyle = 'open';
        p.brow = 'raised';
        p.mouth = 'smirk';
        p.gazeX = 0.95;
      } else {
        // Wall smack! Smirk vanishes into deadpan stunned shock
        p.lean = 0.05;
        p.rightHand = { x: 120, y: -160 };
        p.leftHand = { x: -60, y: -40 };
        p.eye = 'stunned';
        p.brow = 'raised';
        p.mouth = 'wobble';
        p.pupilScale = 0.6;
        if (t > 4.2) {
          p.headTilt = 0.08 + Math.sin(t * 26) * 0.02; // eye/brow twitch
          p.brow = 'angry';
          p.mouth = 'flat';
        }
      }
      return p;
    }

    // ----------------------------------------------------
    // SCENE 2 (5-10s): Second throw, AC bounce, orbit, cup glare & hurl
    // ----------------------------------------------------
    if (t < 10.0) {
      if (t < 5.85) {
        // Pulls out second plane
        p.brow = 'angry';
        p.mouth = 'grit';
        p.eye = 'squint';
        p.rightHand = { x: 60, y: -240 };
        p.rightHandStyle = 'hold';
        p.anger = true;
      } else if (t < 6.62) {
        // Hard throw
        p.lean = 0.22;
        p.rightHand = { x: 190, y: -200 };
        p.rightHandStyle = 'open';
        p.mouth = 'scream';
      } else if (t < 7.85) {
        // Tracks plane orbiting around head
        p.mouth = 'o';
        p.eye = 'wide';
        p.brow = 'raised';
        p.headTilt = Math.sin(t * 8) * 0.15;
        p.gazeX = Math.cos(t * 8);
        p.gazeY = Math.sin(t * 8);
        p.rightHand = { x: 80, y: -120 };
        p.leftHand = { x: -80, y: -120 };
      } else if (t < 9.1) {
        // Shocked glare at coffee cup
        p.headTilt = 0.24;
        p.gazeX = 0.6;
        p.gazeY = 0.8;
        p.eye = 'squint';
        p.brow = 'angry';
        p.mouth = 'grit';
        p.anger = true;
      } else {
        // Grabs cup and hurls away in rage
        const u = (t - 9.1) / 0.9;
        p.lean = lerp(0.1, -0.2, u);
        p.rightHand = { x: lerp(80, -180, u), y: lerp(-140, -220, u) };
        p.rightHandStyle = 'fist';
        p.mouth = 'scream';
        p.brow = 'angry';
        p.eye = 'wide';
        p.anger = true;
      }
      return p;
    }

    // ----------------------------------------------------
    // SCENE 3 (10-16s): Crazy idea & dramatic anime eyes
    // ----------------------------------------------------
    if (t < 16.0) {
      if (t < 11.2) {
        // Lightbulb idea jump!
        p.jump = Math.sin((t - 10.0) * Math.PI) * 40;
        p.rightHand = { x: 90, y: -290 };
        p.rightHandStyle = 'point';
        p.eye = 'happy';
        p.brow = 'raised';
        p.mouth = 'grin';
      } else if (t < 13.8) {
        // Building the launcher
        const u = (t - 11.2) / 2.6;
        p.hipX = 350;
        p.lean = 0.12;
        p.rightHand = { x: 70 + Math.sin(u * 20) * 20, y: -120 + Math.cos(u * 20) * 15 };
        p.leftHand = { x: 40 - Math.sin(u * 20) * 15, y: -130 };
        p.brow = 'determined';
        p.mouth = 'grit';
        p.eye = 'squint';
      } else if (t < 14.6) {
        // Loads plane and pulls back rubber band
        p.hipX = 330;
        p.lean = -0.08;
        p.rightHand = { x: 60, y: -160 };
        p.leftHand = { x: 20, y: -140 };
        p.brow = 'determined';
        p.mouth = 'grit';
        p.eye = 'squint';
      } else {
        // DRAMATIC ANIME CLOSE-UP! Extreme intensity, intense pupils
        p.hipX = 310;
        p.brow = 'determined';
        p.eye = 'intense';
        p.mouth = 'grit';
        p.gazeX = 0.95;
        p.gazeY = -0.1;
        p.pupilScale = 1.4;
      }
      return p;
    }

    // ----------------------------------------------------
    // SCENE 4 (16-23s): Supersonic launch & wild celebration
    // ----------------------------------------------------
    if (t < 23.0) {
      if (t < 17.5) {
        // Release launch!
        p.lean = 0.25;
        p.rightHand = { x: 190, y: -210 };
        p.rightHandStyle = 'open';
        p.eye = 'wide';
        p.mouth = 'scream';
        p.brow = 'raised';
      } else if (t < 21.5) {
        // Watching the obstacle course flight with open mouth
        p.lean = 0.1;
        p.eye = 'wide';
        p.mouth = 'open';
        p.brow = 'raised';
        p.gazeX = 0.95;
        p.rightHand = { x: 80, y: -140 };
        p.leftHand = { x: -80, y: -140 };
      } else {
        // Premature wild celebration dance!
        const dance = (t - 21.5) * 8;
        p.jump = Math.abs(Math.sin(dance)) * 40;
        p.rightHand = { x: 90 + Math.sin(dance) * 20, y: -300 };
        p.leftHand = { x: -90 - Math.sin(dance) * 20, y: -300 };
        p.rightHandStyle = 'fist';
        p.leftHandStyle = 'fist';
        p.eye = 'happy';
        p.brow = 'raised';
        p.mouth = 'scream';
        p.headTilt = Math.sin(dance) * 0.1;
      }
      return p;
    }

    // ----------------------------------------------------
    // SCENE 5 (23-27s): Reveal & turning in horror
    // ----------------------------------------------------
    if (t < 27.0) {
      if (t < 25.5) {
        // Still holding victory pose before checking
        p.rightHand = { x: 90, y: -290 };
        p.leftHand = { x: -90, y: -290 };
        p.rightHandStyle = 'fist';
        p.leftHandStyle = 'fist';
        p.eye = 'happy';
        p.mouth = 'grin';
      } else {
        // Horror turn! Celebration dies, arms slowly drop, eyes bug out toward sky
        const u = smooth((t - 25.5) / 1.5);
        p.rightHand = { x: lerp(90, 80, u), y: lerp(-290, -120, u) };
        p.leftHand = { x: lerp(-90, -80, u), y: lerp(-290, -120, u) };
        p.rightHandStyle = 'open';
        p.leftHandStyle = 'open';
        p.eye = 'wide';
        p.brow = 'raised';
        p.mouth = 'o';
        p.headTilt = lerp(0, -0.3, u); // looking high up into sky!
        p.gazeX = 0.4;
        p.gazeY = -1.0;
        p.pupilScale = 1.3;
      }
      return p;
    }

    // ----------------------------------------------------
    // SCENE 6 (27-30s): Cup bonk, champion pose, coffee drip & boiling rage freeze
    // ----------------------------------------------------
    if (t < 27.6) {
      // Cup bonks down onto head! Squash & shake
      p.squashY = 0.88;
      p.squashX = 1.12;
      p.eye = 'stunned';
      p.brow = 'raised';
      p.mouth = 'o';
      p.rightHand = { x: 70, y: -110 };
      p.leftHand = { x: -70, y: -110 };
    } else if (t < 28.7) {
      // Raises arms triumphantly like a champion with the cup crown!
      const u = smooth((t - 27.6) / 0.5);
      p.rightHand = { x: lerp(70, 95, u), y: lerp(-110, -290, u) };
      p.leftHand = { x: lerp(-70, -95, u), y: lerp(-110, -290, u) };
      p.rightHandStyle = 'fist';
      p.leftHandStyle = 'fist';
      p.eye = 'happy';
      p.brow = 'raised';
      p.mouth = 'grin';
    } else if (t < 29.4) {
      // Coffee drips down face... smile slowly flips into stunned fury
      const u = (t - 28.7) / 0.7;
      p.rightHand = { x: lerp(95, 65, u), y: lerp(-290, -110, u) };
      p.leftHand = { x: lerp(-95, -65, u), y: lerp(-110, -110, u) };
      p.rightHandStyle = 'fist';
      p.leftHandStyle = 'fist';
      p.eye = 'squint';
      p.brow = 'angry';
      p.mouth = 'grit';
      p.headTilt = 0.05;
      p.anger = true;
    } else {
      // ABSOLUTE BOILING RAGE FREEZE-FRAME!
      p.rightHand = { x: 60, y: -100 };
      p.leftHand = { x: -60, y: -100 };
      p.rightHandStyle = 'fist';
      p.leftHandStyle = 'fist';
      p.eye = 'wide';
      p.brow = 'angry';
      p.mouth = 'scream';
      p.pupilScale = 0.55; // pinpoint pupils in boiling rage
      p.anger = true;
      p.headTilt = 0.04;
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

    // 4. Neck & Head
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(0, -220);
    ctx.lineTo(0, -265);
    ctx.stroke();

    ctx.save();
    ctx.translate(0, -330);
    ctx.rotate(pose.headTilt);

    // White round head with clean thick outline
    ctx.fillStyle = WHITE;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(0, 0, 70, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Face features
    this.drawFace(ctx, pose, t);

    ctx.restore();
    ctx.restore();
  }

  private drawFace(ctx: CanvasRenderingContext2D, pose: Pose, _t: number) {
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
        // Dramatic anime eye styling
        ctx.fillStyle = INK;
        ctx.beginPath();
        ctx.arc(x + pose.gazeX * 4, eyeY, 11 * pose.pupilScale, 0, TAU);
        ctx.fill();
        // Star reflection glint
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
      ctx.arc(0, 26, 10, 0, TAU);
    } else if (pose.mouth === 'scream') {
      ctx.arc(0, 24, 22, 0, Math.PI);
      ctx.closePath();
      ctx.fillStyle = INK;
      ctx.fill();
      // Tongue
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

    // Cartoon Anger symbols (popping vein symbol)
    if (pose.anger) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 4;
      const vx = 45;
      const vy = -45;
      ctx.beginPath();
      ctx.moveTo(vx - 8, vy);
      ctx.lineTo(vx + 8, vy);
      ctx.moveTo(vx, vy - 8);
      ctx.lineTo(vx, vy + 8);
      ctx.moveTo(vx - 6, vy - 6);
      ctx.lineTo(vx + 6, vy + 6);
      ctx.stroke();
    }
  }

  // Draw 2-joint limb with bending angle
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

  private drawHand(ctx: CanvasRenderingContext2D, hand: Vec, elbow: Vec, style: HandStyle) {
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
      ctx.lineTo(16, 0);
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
  // VISUAL EFFECTS: TRAILS, SPEED LINES, FREEZE-FRAME
  // ==========================================================

  private drawMotionTrail(ctx: CanvasRenderingContext2D, x: number, y: number, len: number, angle: number) {
    ctx.save();
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - Math.cos(angle) * len, y - Math.sin(angle) * len);
    ctx.stroke();
    ctx.restore();
  }

  private drawSupersonicTrail(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - Math.cos(angle) * 80, y - Math.sin(angle) * 80);
    ctx.stroke();

    // Shockwave cone
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - Math.cos(angle - 0.5) * 35, y - Math.sin(angle - 0.5) * 35);
    ctx.moveTo(x, y);
    ctx.lineTo(x - Math.cos(angle + 0.5) * 35, y - Math.sin(angle + 0.5) * 35);
    ctx.stroke();
    ctx.restore();
  }

  private renderVisualFX(ctx: CanvasRenderingContext2D, t: number, pose: Pose) {
    // Scene 3 Dramatic Anime Speed Lines (14.6s - 16.0s)
    if (t >= 14.6 && t < 16.0) {
      ctx.save();
      ctx.strokeStyle = 'rgba(0,0,0,0.35)';
      ctx.lineWidth = 4;
      const cx = pose.hipX;
      const cy = pose.hipY - 330;
      for (let i = 0; i < 28; i++) {
        const a = (i / 28) * TAU;
        const r1 = 340 + Math.sin(i * 12) * 50;
        const r2 = 680;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
        ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Comedic Freeze Frame Flash & Border in Scene 6 (29.8s - 30.0s)
    if (t >= 29.8) {
      ctx.save();
      // Film freeze border
      ctx.strokeStyle = INK;
      ctx.lineWidth = 20;
      ctx.strokeRect(10, 10, this.width - 20, this.height - 20);
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

    // Impact screen shakes
    const kick = (at: number, decay: number, amp: number) =>
      t < at ? 0 : Math.exp(-(t - at) * decay) * amp;

    const shake =
      kick(3.52, 10, 7) + // wall smack
      kick(6.62, 12, 6) + // AC bounce
      kick(16.02, 8, 12) + // launch blast
      kick(19.45, 12, 8) + // satellite ricochet
      kick(25.35, 9, 9) + // catapult lever slam
      kick(27.28, 9, 14); // cup head bonk

    const sx = Math.sin(t * 40) * shake;
    const sy = Math.cos(t * 35) * shake;

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

    // Caption band
    ctx.strokeRect(48, 1590, this.width - 96, 210);
    ctx.restore();
  }
}
