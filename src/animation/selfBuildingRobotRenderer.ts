import { StudioConfig } from '../types';

/**
 * SelfBuildingRobotRenderer
 * Renders "THE SELF-BUILDING ROBOT" — a 30-second vertical 9:16 (1080x1920, 24fps)
 * Modern Pop 2D flat vector comedy short in five continuous 6-second scenes:
 *   Scene 1 (0–6s):   MEET MY ROBOT!
 *   Scene 2 (6–12s):  FIRST UPGRADE!
 *   Scene 3 (12–18s): THE MONSTER UPGRADE
 *   Scene 4 (18–24s): ROBOT TAKES OVER!
 *   Scene 5 (24–30s): THE FINAL UPGRADE
 */

const TAU = Math.PI * 2;
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * clamp(t, 0, 1);
const smooth = (t: number) => {
  const c = clamp(t, 0, 1);
  return c * c * (3 - 2 * c);
};
const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

interface CameraKey {
  t: number;
  x: number;
  y: number;
  zoom: number;
}

interface StickmanPose {
  x: number;
  y: number;
  eye: 'normal' | 'happy' | 'star' | 'wide' | 'shock' | 'hugeShock' | 'annoyed' | 'grit';
  brow: 'neutral' | 'raised' | 'angry' | 'sad' | 'annoyed';
  mouth: 'flat' | 'bigSmile' | 'o' | 'grit' | 'frown';
  beanieAngle?: number;
  leftArmAngle?: number;
  rightArmAngle?: number;
  lean?: number;
  walkPhase?: number;
  sitting?: boolean;
  holdingPowerBank?: boolean;
  holdingTinyRobot?: boolean;
  crossedArms?: boolean;
  facing?: 1 | -1;
}

interface RobotState {
  x: number;
  y: number;
  scaleW: number;       // 1.0 = tiny box (104px), 2.1 = fridge size (218px)
  scaleH: number;       // 1.0 = tiny box (116px), 2.9 = fridge size (336px)
  eyeOn: boolean;
  eyeGlow: number;      // 0..1.5
  eyeLookX: number;     // -1..1
  eyeLookY: number;     // -1..1
  lowBattery: boolean;
  lowBatteryBlink: boolean;
  turboWheels: number;  // 0..1 (bigger sporty wheels from toy car)
  wheelSpin: number;
  fanLevel: number;     // 0..1 mounted on back
  fanSpin: number;
  hasHoseArm: number;   // 0..1 vacuum hose replacing right arm
  hoseExtendX: number;  // offset for hose reach/grab
  hoseExtendY: number;
  hasPotArmor: number;  // 0..1 two metal pots as shoulder armor
  hasLampHead: number;  // 0..1 desk lamp headlight on top
  lampOn: boolean;
  hasCushionArmor: number; // 0..1 sofa cushion chest armor
  legExtend: number;    // 0..1 giant mechanical legs unfolding underneath
  leftArmAngle: number;
  rightArmAngle: number;
  laserTarget?: { x: number; y: number } | null;
  scanPulse?: number;
  cableDangling?: boolean;
  cablePluggedTo?: { x: number; y: number } | null;
  rechargePulse?: number;
  wobble?: number;
  facing?: 1 | -1;
}

export class SelfBuildingRobotRenderer {
  private readonly width = 1080;
  private readonly height = 1920;
  private readonly floorY = 1480;

  // World prop anchors across Workshop (0..1100) & Living Room (1100..2250)
  private readonly workbenchX = 430;
  private readonly workbenchTopY = 1150;

  private readonly captions = [
    { text: 'MY NEW ROBOT!', from: 0.6, to: 5.7 },
    { text: "IT'S UPGRADING?!", from: 6.5, to: 11.7 },
    { text: 'WHO GAVE IT PERMISSION?!', from: 12.5, to: 17.7 },
    { text: 'GIVE MY STUFF BACK!', from: 18.5, to: 23.7 },
    { text: 'I BUILT MY OWN BOSS!', from: 24.5, to: 29.85 },
  ];

  private readonly cameraKeys: CameraKey[] = [
    { t: 0.0, x: 540, y: 970, zoom: 1.0 },
    { t: 2.8, x: 480, y: 1010, zoom: 1.15 }, // Close-in on workbench & ON button
    { t: 5.5, x: 500, y: 1000, zoom: 1.12 },
    { t: 6.4, x: 580, y: 990, zoom: 1.02 },  // Laser scan across workshop
    { t: 8.6, x: 600, y: 1030, zoom: 1.02 }, // Toy car wheel upgrade
    { t: 11.5, x: 560, y: 1010, zoom: 1.0 },
    { t: 12.5, x: 530, y: 1000, zoom: 1.0 }, // Monster upgrade wide
    { t: 16.5, x: 560, y: 990, zoom: 1.05 }, // Fridge expansion + flex
    { t: 18.0, x: 1480, y: 990, zoom: 1.0 }, // Smooth pan into Living Room
    { t: 20.5, x: 1680, y: 1000, zoom: 1.05 }, // Lamp & cushion armor
    { t: 22.2, x: 1420, y: 1020, zoom: 1.05 }, // Tug-of-war over red toolbox
    { t: 23.8, x: 1080, y: 1010, zoom: 1.0 }, // Dragged back toward workshop
    { t: 24.4, x: 640, y: 1000, zoom: 1.0 },  // Low-battery stop near workbench
    { t: 26.2, x: 620, y: 1010, zoom: 1.06 }, // Power bank plug-in
    { t: 27.6, x: 660, y: 940, zoom: 1.02 },  // Giant legs unfold upward!
    { t: 28.8, x: 680, y: 900, zoom: 1.2 },   // Stickman sits on shoulder, annoyed stare
    { t: 30.0, x: 680, y: 890, zoom: 1.24 },
  ];

  public render(ctx: CanvasRenderingContext2D, t: number, config: StudioConfig): void {
    const time = clamp(t, 0, 30);

    ctx.save();
    ctx.clearRect(0, 0, this.width, this.height);

    const cam = this.getCameraAt(time);
    ctx.save();
    ctx.translate(this.width / 2, this.height / 2);
    ctx.scale(cam.zoom, cam.zoom);
    ctx.translate(-cam.x, -cam.y);

    // 1. Continuous Colorful Home Interior (Workshop + Living Room)
    this.drawEnvironment(ctx, time);

    // 2. Scene Action (Actors, Loose Props, Lasers, Sparks)
    this.drawSceneAction(ctx, time);

    ctx.restore();

    // 3. Burned-in Pop Captions inside Vertical Shorts Safe Area
    this.drawCaptions(ctx, time);

    // 4. Optional Safe Zone Guide
    if (config.showSafeZones) {
      this.drawSafeZones(ctx);
    }

    ctx.restore();
  }

  private getCameraAt(t: number): CameraKey {
    const keys = this.cameraKeys;
    if (t <= keys[0].t) return keys[0];
    if (t >= keys[keys.length - 1].t) return keys[keys.length - 1];

    for (let i = 0; i < keys.length - 1; i++) {
      const a = keys[i];
      const b = keys[i + 1];
      if (t >= a.t && t <= b.t) {
        const u = smooth((t - a.t) / (b.t - a.t));
        return {
          t,
          x: lerp(a.x, b.x, u),
          y: lerp(a.y, b.y, u),
          zoom: lerp(a.zoom, b.zoom, u),
        };
      }
    }
    return keys[0];
  }

  // -------------------------------------------------------------
  // ENVIRONMENTS: COLORFUL WORKSHOP (x < 1120) & LIVING ROOM (x >= 1120)
  // -------------------------------------------------------------
  private drawEnvironment(ctx: CanvasRenderingContext2D, t: number): void {
    const splitX = 1120;

    // --- WORKSHOP WALL (x: -400 .. 1120) ---
    ctx.fillStyle = '#dff2fe'; // Bright sky blue workshop wall
    ctx.fillRect(-400, 0, splitX + 400, this.floorY);

    // Lower painted workshop wainscoting
    ctx.fillStyle = '#bae6fd';
    ctx.fillRect(-400, this.floorY - 260, splitX + 400, 260);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-400, this.floorY - 260);
    ctx.lineTo(splitX, this.floorY - 260);
    ctx.stroke();

    // Workshop Window (x: 680..960, y: 360..720)
    this.drawWindow(ctx, 680, 360, 280, 340, t);

    // Tool Pegboard above workbench (x: 190..560, y: 420..740)
    this.drawPegboard(ctx, 190, 420, 370, 310);

    // Workshop Shelf (x: 110..330, y: 840)
    ctx.fillStyle = '#b45309';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;
    this.roundRect(ctx, 110, 840, 220, 22, 6);
    ctx.fill();
    ctx.stroke();
    // Paint cans / jars on shelf
    ctx.fillStyle = '#f43f5e';
    this.roundRect(ctx, 135, 785, 44, 55, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#facc15';
    this.roundRect(ctx, 195, 795, 38, 45, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#22c55e';
    this.roundRect(ctx, 250, 775, 48, 65, 6);
    ctx.fill();
    ctx.stroke();

    // Workshop Floor (warm wood planks)
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-400, this.floorY, splitX + 400, 600);
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 3;
    for (let x = -360; x < splitX; x += 110) {
      ctx.beginPath();
      ctx.moveTo(x, this.floorY);
      ctx.lineTo(x + 40, this.height + 100);
      ctx.stroke();
    }

    // --- LIVING ROOM WALL (x: 1120 .. 2600) ---
    ctx.fillStyle = '#fef3c7'; // Warm sunny cream wall
    ctx.fillRect(splitX, 0, 1500, this.floorY);

    // Framed Artwork on Living Room Wall
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.fillRect(1560, 420, 240, 170);
    ctx.strokeRect(1560, 420, 240, 170);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(1580, 440, 200, 130);
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(1635, 485, 22, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.moveTo(1580, 570);
    ctx.lineTo(1660, 510);
    ctx.lineTo(1740, 570);
    ctx.closePath();
    ctx.fill();

    // Living Room Floor (cozy warm rug over wood)
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(splitX, this.floorY, 1500, 600);
    ctx.fillStyle = '#fda4af'; // Pastel coral living room rug
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;
    this.roundRect(ctx, 1340, this.floorY + 12, 740, 44, 14);
    ctx.fill();
    ctx.stroke();

    // Shared Floor Boundary Line
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(-400, this.floorY);
    ctx.lineTo(2600, this.floorY);
    ctx.stroke();

    // Doorway Arch / Column Dividing Rooms at x = 1120
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.fillRect(splitX - 24, 240, 48, this.floorY - 240);
    ctx.strokeRect(splitX - 24, 240, 48, this.floorY - 240);
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(splitX - 40, 210, 80, 46);
    ctx.strokeRect(splitX - 40, 210, 80, 46);

    // Living Room Sofa (x: 1620..2020)
    this.drawSofa(ctx, 1620, this.floorY, t < 20.5);

    // Side Table on Right (x: 2070..2220)
    this.drawSideTable(ctx, 2060, 1230);

    // Workshop Wooden Workbench (x: 250..610)
    this.drawWorkbench(ctx, this.workbenchX, this.workbenchTopY);

    // Workshop Side Stand for Pots (x: 680..820)
    this.drawSmallStand(ctx, 750, 1340);
  }

  private drawWindow(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, t: number): void {
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 7;
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);

    ctx.save();
    ctx.beginPath();
    ctx.rect(x + 10, y + 10, w - 20, h - 20);
    ctx.clip();
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(x, y, w, h);

    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(x + 65, y + 70, 36, 0, TAU);
    ctx.fill();

    const drift = Math.sin(t * 0.6) * 14;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x + 160 + drift, y + 105, 28, 0, TAU);
    ctx.arc(x + 195 + drift, y + 95, 34, 0, TAU);
    ctx.arc(x + 230 + drift, y + 108, 26, 0, TAU);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y);
    ctx.lineTo(x + w / 2, y + h);
    ctx.moveTo(x, y + h * 0.5);
    ctx.lineTo(x + w, y + h * 0.5);
    ctx.stroke();
    ctx.restore();
  }

  private drawPegboard(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
    ctx.fillStyle = '#fed7aa';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    this.roundRect(ctx, x, y, w, h, 14);
    ctx.fill();
    ctx.stroke();

    // Peg holes
    ctx.fillStyle = '#c2410c';
    for (let py = y + 32; py < y + h - 20; py += 42) {
      for (let px = x + 32; px < x + w - 20; px += 44) {
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, TAU);
        ctx.fill();
      }
    }

    // Hanging Wrench
    ctx.fillStyle = '#94a3b8';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    this.roundRect(ctx, x + 65, y + 60, 20, 150, 8);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + 75, y + 58, 22, 0.3, TAU - 0.3);
    ctx.fill();
    ctx.stroke();

    // Hanging Hammer
    ctx.fillStyle = '#d97706';
    this.roundRect(ctx, x + 175, y + 80, 18, 130, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#64748b';
    this.roundRect(ctx, x + 148, y + 60, 72, 30, 8);
    ctx.fill();
    ctx.stroke();

    // Hanging Gear Prop
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(x + 295, y + 140, 36, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(x + 295, y + 140, 14, 0, TAU);
    ctx.fill();
    ctx.stroke();
  }

  private drawWorkbench(ctx: CanvasRenderingContext2D, cx: number, topY: number): void {
    const w = 360;
    const h = 38;
    const x = cx - w / 2;
    const legH = this.floorY - topY - h;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.14)';
    ctx.beginPath();
    ctx.ellipse(cx, this.floorY + 8, w * 0.52, 22, 0, 0, TAU);
    ctx.fill();

    // Legs & Lower Shelf
    ctx.fillStyle = '#92400e';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.fillRect(x + 28, topY + h, 28, legH);
    ctx.strokeRect(x + 28, topY + h, 28, legH);
    ctx.fillRect(x + w - 56, topY + h, 28, legH);
    ctx.strokeRect(x + w - 56, topY + h, 28, legH);

    // Lower shelf board
    ctx.fillStyle = '#b45309';
    ctx.fillRect(x + 28, topY + h + legH * 0.58, w - 56, 20);
    ctx.strokeRect(x + 28, topY + h + legH * 0.58, w - 56, 20);

    // Heavy wooden tabletop
    ctx.fillStyle = '#d97706';
    this.roundRect(ctx, x, topY, w, h, 8);
    ctx.fill();
    ctx.stroke();

    // Screwdriver & bolt resting on right edge of bench
    ctx.fillStyle = '#94a3b8';
    ctx.lineWidth = 3.5;
    ctx.fillRect(x + w - 80, topY - 12, 42, 8);
    ctx.strokeRect(x + w - 80, topY - 12, 42, 8);
    ctx.fillStyle = '#ef4444';
    this.roundRect(ctx, x + w - 42, topY - 18, 28, 18, 5);
    ctx.fill();
    ctx.stroke();
  }

  private drawSmallStand(ctx: CanvasRenderingContext2D, cx: number, topY: number): void {
    const w = 160;
    const h = 24;
    const x = cx - w / 2;
    ctx.fillStyle = '#64748b';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;
    ctx.fillRect(x + 18, topY + h, 18, this.floorY - topY - h);
    ctx.strokeRect(x + 18, topY + h, 18, this.floorY - topY - h);
    ctx.fillRect(x + w - 36, topY + h, 18, this.floorY - topY - h);
    ctx.strokeRect(x + w - 36, topY + h, 18, this.floorY - topY - h);
    ctx.fillStyle = '#94a3b8';
    this.roundRect(ctx, x, topY, w, h, 6);
    ctx.fill();
    ctx.stroke();
  }

  private drawSofa(ctx: CanvasRenderingContext2D, x: number, floorY: number, hasLooseCushion: boolean): void {
    const w = 400;
    const baseY = floorY - 110;
    ctx.fillStyle = '#0d9488'; // Bright teal cartoon sofa
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;

    // Backrest
    this.roundRect(ctx, x + 20, baseY - 130, w - 40, 150, 26);
    ctx.fill();
    ctx.stroke();

    // Seat base
    ctx.fillStyle = '#14b8a6';
    this.roundRect(ctx, x, baseY - 15, w, 105, 22);
    ctx.fill();
    ctx.stroke();

    // Armrests
    ctx.fillStyle = '#0f766e';
    this.roundRect(ctx, x - 12, baseY - 75, 58, 150, 22);
    ctx.fill();
    ctx.stroke();
    this.roundRect(ctx, x + w - 46, baseY - 75, 58, 150, 22);
    ctx.fill();
    ctx.stroke();

    // Fixed right seat cushion
    ctx.fillStyle = '#2dd4bf';
    this.roundRect(ctx, x + w * 0.5, baseY - 38, w * 0.36, 40, 14);
    ctx.fill();
    ctx.stroke();

    // Wooden sofa feet
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x + 28, floorY - 22, 22, 22);
    ctx.strokeRect(x + 28, floorY - 22, 22, 22);
    ctx.fillRect(x + w - 50, floorY - 22, 22, 22);
    ctx.strokeRect(x + w - 50, floorY - 22, 22, 22);

    // Removable Coral Sofa Cushion (picked up in Scene 4!)
    if (hasLooseCushion) {
      this.drawCushionProp(ctx, x + 120, baseY - 35, 1.0);
    }
  }

  private drawSideTable(ctx: CanvasRenderingContext2D, x: number, topY: number): void {
    const w = 150;
    ctx.fillStyle = '#92400e';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;
    ctx.fillRect(x + 20, topY + 24, 20, this.floorY - topY - 24);
    ctx.strokeRect(x + 20, topY + 24, 20, this.floorY - topY - 24);
    ctx.fillRect(x + w - 40, topY + 24, 20, this.floorY - topY - 24);
    ctx.strokeRect(x + w - 40, topY + 24, 20, this.floorY - topY - 24);
    ctx.fillStyle = '#b45309';
    this.roundRect(ctx, x, topY, w, 24, 6);
    ctx.fill();
    ctx.stroke();
  }

  // -------------------------------------------------------------
  // SCENE TIMELINE & CHOREOGRAPHY (0 - 30s)
  // -------------------------------------------------------------
  private drawSceneAction(ctx: CanvasRenderingContext2D, t: number): void {
    // 1. Loose Portable Power Bank on Workbench (always present until Stickman grabs it at 25.4s)
    if (t < 25.4) {
      this.drawPowerBank(ctx, 315, this.workbenchTopY, 1.0);
    }

    // 2. Toy Car on Workshop Floor (0 - 7.9s whole; 7.9 - 18s body shell left behind without wheels)
    if (t < 7.9) {
      this.drawToyCar(ctx, 845, this.floorY, true);
    } else if (t < 18.0) {
      this.drawToyCar(ctx, 845, this.floorY + 12, false);
    }

    // 3. Electric Fan on floor (0 - 12.9s)
    if (t < 12.9) {
      this.drawFanProp(ctx, 165, this.floorY, 1.0, 0);
    }

    // 4. Vacuum Cleaner + Hose on Workshop Floor (0 - 14.3s whole; 14.3 - 18s canister stays)
    if (t < 14.3) {
      this.drawVacuumProp(ctx, 945, this.floorY, true);
    } else if (t < 18.0) {
      this.drawVacuumProp(ctx, 945, this.floorY, false);
    }

    // 5. Two Metal Kitchen Pots on Small Stand (0 - 15.5s)
    if (t < 15.5) {
      this.drawPotProp(ctx, 725, 1340, 1.0);
      this.drawPotProp(ctx, 780, 1340, 1.0);
    }

    // 6. Desk Lamp on Living Room Side Table (0 - 19.0s)
    if (t < 19.0) {
      this.drawDeskLampProp(ctx, 2135, 1230, 1.0, false);
    }

    // 7. Stickman's Red Toolbox in Living Room (pulled across floor in Scene 4)
    if (t < 21.5) {
      this.drawToolboxProp(ctx, 1340, this.floorY);
    } else if (t < 23.1) {
      const pullU = smooth((t - 21.5) / 1.4);
      const boxX = lerp(1340, 1490, pullU);
      this.drawToolboxProp(ctx, boxX, this.floorY);
    } else if (t < 24.5) {
      // Carried/pulled along beside robot back toward workshop
      const dragU = smooth((t - 23.1) / 1.1);
      const boxX = lerp(1490, 910, dragU);
      this.drawToolboxProp(ctx, boxX, this.floorY);
    } else {
      this.drawToolboxProp(ctx, 920, this.floorY);
    }

    // -----------------------------------------------------------
    // COMPUTE STICKMAN & ROBOT STATES PER SCENE
    // -----------------------------------------------------------
    let stickman: StickmanPose;
    let robot: RobotState | null = null;
    let carriedProp:
      | { kind: 'car'; x: number; y: number }
      | { kind: 'fan'; x: number; y: number }
      | { kind: 'hose'; x: number; y: number }
      | { kind: 'pots'; x: number; y: number }
      | { kind: 'lamp'; x: number; y: number }
      | { kind: 'cushion'; x: number; y: number }
      | null = null;

    if (t < 6.0) {
      // =========================================================
      // SCENE 1: MEET MY ROBOT! (0 - 6s)
      // =========================================================
      if (t < 1.8) {
        const u = smooth(t / 1.8);
        const sx = lerp(110, 270, u);
        stickman = {
          x: sx,
          y: this.floorY,
          eye: 'happy',
          brow: 'raised',
          mouth: 'bigSmile',
          walkPhase: t * 10,
          leftArmAngle: 0.7,
          rightArmAngle: -1.1,
          holdingTinyRobot: true,
        };
      } else if (t < 2.7) {
        // Places robot onto workbench
        const placeU = smooth((t - 1.8) / 0.6);
        stickman = {
          x: 270,
          y: this.floorY,
          eye: 'star',
          brow: 'raised',
          mouth: 'bigSmile',
          leftArmAngle: 0.9,
          rightArmAngle: lerp(-1.2, -0.7, placeU),
          lean: lerp(0.12, 0.02, placeU),
        };
        robot = {
          x: lerp(370, 490, placeU),
          y: lerp(1240, this.workbenchTopY, placeU),
          scaleW: 1,
          scaleH: 1,
          eyeOn: false,
          eyeGlow: 0,
          eyeLookX: 0,
          eyeLookY: 0,
          lowBattery: false,
          lowBatteryBlink: false,
          turboWheels: 0,
          wheelSpin: 0,
          fanLevel: 0,
          fanSpin: 0,
          hasHoseArm: 0,
          hoseExtendX: 0,
          hoseExtendY: 0,
          hasPotArmor: 0,
          hasLampHead: 0,
          lampOn: false,
          hasCushionArmor: 0,
          legExtend: 0,
          leftArmAngle: 0.3,
          rightArmAngle: -0.3,
        };
      } else if (t < 3.6) {
        // Reaches out and presses the red ON button!
        const reachU = smooth(clamp((t - 2.7) / 0.55, 0, 1));
        const pressBack = t > 3.25 ? smooth((t - 3.25) / 0.35) : 0;
        stickman = {
          x: 270,
          y: this.floorY,
          eye: 'happy',
          brow: 'raised',
          mouth: 'bigSmile',
          leftArmAngle: 0.95,
          rightArmAngle: lerp(-0.7, -1.65, reachU) + pressBack * 0.4,
          lean: lerp(0.02, 0.12, reachU) - pressBack * 0.08,
        };
        const woken = t >= 3.25;
        robot = {
          x: 490,
          y: this.workbenchTopY,
          scaleW: 1,
          scaleH: 1,
          eyeOn: woken,
          eyeGlow: woken ? smooth((t - 3.25) / 0.35) : 0,
          eyeLookX: -0.2,
          eyeLookY: 0,
          lowBattery: false,
          lowBatteryBlink: false,
          turboWheels: 0,
          wheelSpin: 0,
          fanLevel: 0,
          fanSpin: 0,
          hasHoseArm: 0,
          hoseExtendX: 0,
          hoseExtendY: 0,
          hasPotArmor: 0,
          hasLampHead: 0,
          lampOn: false,
          hasCushionArmor: 0,
          legExtend: 0,
          leftArmAngle: 0.3,
          rightArmAngle: -0.3,
        };
      } else {
        // Robot wakes up, blue eye glows, waves one mechanical arm cheerfully!
        const wave = Math.sin((t - 3.6) * 9) * 0.45;
        const hop = Math.abs(Math.sin((t - 3.6) * 5)) * 10;
        stickman = {
          x: 270,
          y: this.floorY,
          eye: 'star',
          brow: 'raised',
          mouth: 'bigSmile',
          leftArmAngle: 0.9,
          rightArmAngle: -0.8,
        };
        robot = {
          x: 490,
          y: this.workbenchTopY - hop,
          scaleW: 1,
          scaleH: 1,
          eyeOn: true,
          eyeGlow: 1.0,
          eyeLookX: -0.3,
          eyeLookY: -0.1,
          lowBattery: false,
          lowBatteryBlink: false,
          turboWheels: 0,
          wheelSpin: 0,
          fanLevel: 0,
          fanSpin: 0,
          hasHoseArm: 0,
          hoseExtendX: 0,
          hoseExtendY: 0,
          hasPotArmor: 0,
          hasLampHead: 0,
          lampOn: false,
          hasCushionArmor: 0,
          legExtend: 0,
          leftArmAngle: 0.35,
          rightArmAngle: -2.2 + wave,
        };
      }
    } else if (t < 12.0) {
      // =========================================================
      // SCENE 2: FIRST UPGRADE! (6 - 12s)
      // =========================================================
      if (t < 6.9) {
        // Robot projects thin blue laser line onto toy car on floor
        robot = {
          x: 490,
          y: this.workbenchTopY,
          scaleW: 1,
          scaleH: 1,
          eyeOn: true,
          eyeGlow: 1.1,
          eyeLookX: 0.45,
          eyeLookY: 0.35,
          lowBattery: false,
          lowBatteryBlink: false,
          turboWheels: 0,
          wheelSpin: 0,
          fanLevel: 0,
          fanSpin: 0,
          hasHoseArm: 0,
          hoseExtendX: 0,
          hoseExtendY: 0,
          hasPotArmor: 0,
          hasLampHead: 0,
          lampOn: false,
          hasCushionArmor: 0,
          legExtend: 0,
          leftArmAngle: 0.3,
          rightArmAngle: -0.5,
          laserTarget: { x: 845, y: this.floorY - 26 },
          scanPulse: (t - 6.0) / 0.9,
        };
        stickman = {
          x: 270,
          y: this.floorY,
          eye: 'wide',
          brow: 'raised',
          mouth: 'o',
          leftArmAngle: 0.95,
          rightArmAngle: -0.95,
        };
      } else if (t < 7.8) {
        // Robot hops off workbench & rolls toward toy car
        const u = (t - 6.9) / 0.9;
        const rx = lerp(490, 775, smooth(u));
        const ry = u < 0.65
          ? lerp(this.workbenchTopY, this.floorY, smooth(u / 0.65)) - Math.sin((u / 0.65) * Math.PI) * 140
          : this.floorY;
        robot = {
          x: rx,
          y: ry,
          scaleW: 1,
          scaleH: 1,
          eyeOn: true,
          eyeGlow: 1.0,
          eyeLookX: 0.45,
          eyeLookY: 0.2,
          lowBattery: false,
          lowBatteryBlink: false,
          turboWheels: 0,
          wheelSpin: t * 14,
          fanLevel: 0,
          fanSpin: 0,
          hasHoseArm: 0,
          hoseExtendX: 0,
          hoseExtendY: 0,
          hasPotArmor: 0,
          hasLampHead: 0,
          lampOn: false,
          hasCushionArmor: 0,
          legExtend: 0,
          leftArmAngle: 0.5,
          rightArmAngle: -0.9,
        };
        stickman = {
          x: 270,
          y: this.floorY,
          eye: 'shock',
          brow: 'raised',
          mouth: 'o',
          leftArmAngle: 1.2,
          rightArmAngle: -1.3,
        };
      } else if (t < 8.8) {
        // Robot picks up toy car with both arms and attaches its 4 wheels!
        const grabU = smooth(clamp((t - 7.8) / 0.5, 0, 1));
        const attachU = smooth(clamp((t - 8.2) / 0.6, 0, 1));
        if (t >= 7.9 && t < 8.55) {
          carriedProp = {
            kind: 'car',
            x: lerp(845, 775, grabU),
            y: lerp(this.floorY, this.floorY - 95, grabU) + attachU * 65,
          };
        }
        robot = {
          x: 775,
          y: this.floorY,
          scaleW: 1 + attachU * 0.08,
          scaleH: 1 + attachU * 0.08,
          eyeOn: true,
          eyeGlow: 1.2,
          eyeLookX: 0.2,
          eyeLookY: 0.3,
          lowBattery: false,
          lowBatteryBlink: false,
          turboWheels: attachU,
          wheelSpin: attachU * 6,
          fanLevel: 0,
          fanSpin: 0,
          hasHoseArm: 0,
          hoseExtendX: 0,
          hoseExtendY: 0,
          hasPotArmor: 0,
          hasLampHead: 0,
          lampOn: false,
          hasCushionArmor: 0,
          legExtend: 0,
          leftArmAngle: lerp(0.9, 0.3, attachU),
          rightArmAngle: lerp(-1.5, -0.4, attachU),
          wobble: attachU > 0.7 ? Math.sin(t * 28) * 0.06 : 0,
        };
        stickman = {
          x: lerp(270, 320, grabU),
          y: this.floorY,
          eye: 'shock',
          brow: 'raised',
          mouth: 'o',
          leftArmAngle: 1.3,
          rightArmAngle: -1.4,
          walkPhase: grabU * 8,
        };
      } else {
        // Robot zooms rapidly around workbench! Stickman chases and misses!
        const zt = t - 8.8; // 0..3.2s
        let rx = 775;
        let facing: 1 | -1 = -1;
        if (zt < 0.9) {
          rx = lerp(775, 190, smooth(zt / 0.9));
          facing = -1;
        } else if (zt < 1.9) {
          rx = lerp(190, 900, smooth((zt - 0.9) / 1.0));
          facing = 1;
        } else {
          rx = lerp(900, 740, smooth((zt - 1.9) / 1.3));
          facing = -1;
        }
        const sx = zt < 1.2
          ? lerp(320, 220, smooth(zt / 1.2))
          : zt < 2.4
          ? lerp(220, 720, smooth((zt - 1.2) / 1.2))
          : lerp(720, 300, smooth((zt - 2.4) / 0.8));

        // Motion blur speed lines
        this.drawSpeedLines(ctx, rx, this.floorY - 70, facing);

        robot = {
          x: rx,
          y: this.floorY,
          scaleW: 1.08,
          scaleH: 1.08,
          eyeOn: true,
          eyeGlow: 1.25,
          eyeLookX: facing * 0.5,
          eyeLookY: 0,
          lowBattery: false,
          lowBatteryBlink: false,
          turboWheels: 1,
          wheelSpin: t * 38 * facing,
          fanLevel: 0,
          fanSpin: 0,
          hasHoseArm: 0,
          hoseExtendX: 0,
          hoseExtendY: 0,
          hasPotArmor: 0,
          hasLampHead: 0,
          lampOn: false,
          hasCushionArmor: 0,
          legExtend: 0,
          leftArmAngle: 1.2,
          rightArmAngle: -1.2,
          facing,
        };
        stickman = {
          x: sx,
          y: this.floorY,
          eye: 'wide',
          brow: 'angry',
          mouth: 'grit',
          walkPhase: t * 20,
          lean: zt < 1.2 ? -0.22 : zt < 2.4 ? 0.25 : -0.18,
          leftArmAngle: 1.7 + Math.sin(t * 16) * 0.3,
          rightArmAngle: -1.7 - Math.sin(t * 16) * 0.3,
        };
      }
    } else if (t < 18.0) {
      // =========================================================
      // SCENE 3: THE MONSTER UPGRADE (12 - 18s)
      // =========================================================
      let rx = 740;
      let laser: { x: number; y: number } | null = null;
      let fanLv = 0;
      let hoseLv = 0;
      let potLv = 0;
      let scaleW = 1.08;
      let scaleH = 1.08;
      let rArm = -0.5;
      let lArm = 0.5;
      let facing: 1 | -1 = -1;

      if (t < 13.4) {
        // Scan & attach Electric Fan on back
        if (t < 12.4) {
          laser = { x: 165, y: this.floorY - 95 };
          rx = 740;
        } else if (t < 12.9) {
          rx = lerp(740, 250, smooth((t - 12.4) / 0.5));
          rArm = -1.3;
          lArm = 1.3;
        } else {
          const u = smooth((t - 12.9) / 0.5);
          rx = 250;
          carriedProp = u < 0.7 ? { kind: 'fan', x: lerp(165, 250, u), y: lerp(this.floorY - 50, this.floorY - 140, u) } : null;
          fanLv = clamp((u - 0.3) / 0.7, 0, 1);
          scaleW = lerp(1.08, 1.35, fanLv);
          scaleH = lerp(1.08, 1.45, fanLv);
          lArm = 1.8 - u * 1.1;
          rArm = -1.8 + u * 1.1;
        }
      } else if (t < 14.8) {
        // Scan & attach Vacuum Hose as right mechanical arm
        fanLv = 1;
        scaleW = 1.35;
        scaleH = 1.45;
        facing = 1;
        if (t < 13.8) {
          laser = { x: 945, y: this.floorY - 80 };
          rx = 250;
        } else if (t < 14.3) {
          rx = lerp(250, 825, smooth((t - 13.8) / 0.5));
          rArm = -1.4;
        } else {
          const u = smooth((t - 14.3) / 0.5);
          rx = 825;
          if (u < 0.65) {
            carriedProp = { kind: 'hose', x: lerp(945, 865, u), y: lerp(this.floorY - 60, this.floorY - 120, u) };
          }
          hoseLv = clamp((u - 0.35) / 0.65, 0, 1);
          scaleW = lerp(1.35, 1.65, hoseLv);
          scaleH = lerp(1.45, 1.9, hoseLv);
        }
      } else if (t < 16.3) {
        // Scan & attach Two Metal Pots as shoulder armor
        fanLv = 1;
        hoseLv = 1;
        scaleW = 1.65;
        scaleH = 1.9;
        facing = -1;
        if (t < 15.15) {
          laser = { x: 750, y: 1315 };
          rx = 825;
        } else if (t < 15.5) {
          rx = lerp(825, 750, smooth((t - 15.15) / 0.35));
          lArm = 1.4;
          rArm = -1.4;
        } else {
          const u = smooth((t - 15.5) / 0.8);
          rx = 750;
          if (u < 0.6) {
            carriedProp = { kind: 'pots', x: 750, y: lerp(1315, this.floorY - 220, u) };
          }
          potLv = clamp((u - 0.35) / 0.65, 0, 1);
          scaleW = lerp(1.65, 2.05, potLv);
          scaleH = lerp(1.9, 2.7, potLv);
        }
      } else {
        // Refrigerator size reached! Flexes new hose-arm dramatically!
        fanLv = 1;
        hoseLv = 1;
        potLv = 1;
        const growU = smooth(clamp((t - 16.3) / 0.5, 0, 1));
        scaleW = lerp(2.05, 2.15, growU);
        scaleH = lerp(2.7, 2.85, growU);
        rx = 750;
        facing = -1;
        const flex = Math.sin((t - 16.3) * 7) * 0.35;
        rArm = -1.7 + flex;
        lArm = 1.6 - flex;
      }

      robot = {
        x: rx,
        y: this.floorY,
        scaleW,
        scaleH,
        eyeOn: true,
        eyeGlow: 1.35,
        eyeLookX: facing * 0.3,
        eyeLookY: 0,
        lowBattery: false,
        lowBatteryBlink: false,
        turboWheels: 1,
        wheelSpin: t * 20,
        fanLevel: fanLv,
        fanSpin: t * 28,
        hasHoseArm: hoseLv,
        hoseExtendX: t >= 16.3 ? Math.sin((t - 16.3) * 6) * 28 : 0,
        hoseExtendY: t >= 16.3 ? -50 - Math.abs(Math.sin((t - 16.3) * 6)) * 40 : 0,
        hasPotArmor: potLv,
        hasLampHead: 0,
        lampOn: false,
        hasCushionArmor: 0,
        legExtend: 0,
        leftArmAngle: lArm,
        rightArmAngle: rArm,
        laserTarget: laser,
        scanPulse: (t * 2) % 1,
        facing,
      };

      const stickX = t < 13.5 ? 290 : lerp(290, 240, smooth((t - 13.5) / 1.0));
      stickman = {
        x: stickX,
        y: this.floorY,
        eye: t > 16.0 ? 'hugeShock' : 'shock',
        brow: 'raised',
        mouth: 'o',
        leftArmAngle: 1.8,
        rightArmAngle: -1.8,
        lean: t > 16.0 ? -0.14 : -0.05,
      };
    } else if (t < 24.0) {
      // =========================================================
      // SCENE 4: ROBOT TAKES OVER! (18 - 24s)
      // =========================================================
      if (t < 19.6) {
        // Rolls into living room, scans desk lamp & attaches as headlight!
        const moveU = smooth(clamp((t - 18.0) / 0.85, 0, 1));
        const rx = lerp(750, 1910, moveU);
        const laser = t >= 18.5 && t < 19.0 ? { x: 2135, y: 1170 } : null;
        const lampU = smooth(clamp((t - 19.0) / 0.6, 0, 1));
        if (t >= 19.0 && t < 19.4) {
          carriedProp = { kind: 'lamp', x: lerp(2135, 1910, lampU * 1.4), y: lerp(1170, this.floorY - 380, lampU * 1.4) };
        }
        robot = {
          x: rx,
          y: this.floorY,
          scaleW: 2.15,
          scaleH: 2.85,
          eyeOn: true,
          eyeGlow: 1.35,
          eyeLookX: 0.4,
          eyeLookY: -0.1,
          lowBattery: false,
          lowBatteryBlink: false,
          turboWheels: 1,
          wheelSpin: t * 24,
          fanLevel: 1,
          fanSpin: t * 30,
          hasHoseArm: 1,
          hoseExtendX: 0,
          hoseExtendY: 0,
          hasPotArmor: 1,
          hasLampHead: clamp((lampU - 0.5) * 2, 0, 1),
          lampOn: lampU > 0.7,
          hasCushionArmor: 0,
          legExtend: 0,
          leftArmAngle: 0.5,
          rightArmAngle: t >= 19.0 ? -2.3 : -0.8,
          laserTarget: laser,
          scanPulse: (t * 2.5) % 1,
          facing: 1,
        };
        stickman = {
          x: lerp(240, 1180, moveU),
          y: this.floorY,
          eye: 'wide',
          brow: 'angry',
          mouth: 'frown',
          walkPhase: moveU < 1 ? t * 14 : 0,
          leftArmAngle: 1.1,
          rightArmAngle: -1.1,
        };
      } else if (t < 21.0) {
        // Scans sofa cushion & attaches as chest armor!
        const moveU = smooth(clamp((t - 19.6) / 0.55, 0, 1));
        const rx = lerp(1910, 1690, moveU);
        const laser = t >= 20.0 && t < 20.45 ? { x: 1740, y: 1335 } : null;
        const cushU = smooth(clamp((t - 20.45) / 0.55, 0, 1));
        if (t >= 20.45 && t < 20.85) {
          carriedProp = { kind: 'cushion', x: lerp(1740, 1690, cushU * 1.5), y: lerp(1335, this.floorY - 140, cushU * 1.5) };
        }
        robot = {
          x: rx,
          y: this.floorY,
          scaleW: 2.15,
          scaleH: 2.85,
          eyeOn: true,
          eyeGlow: 1.35,
          eyeLookX: -0.3,
          eyeLookY: 0.2,
          lowBattery: false,
          lowBatteryBlink: false,
          turboWheels: 1,
          wheelSpin: t * 20,
          fanLevel: 1,
          fanSpin: t * 30,
          hasHoseArm: 1,
          hoseExtendX: 0,
          hoseExtendY: 0,
          hasPotArmor: 1,
          hasLampHead: 1,
          lampOn: true,
          hasCushionArmor: clamp((cushU - 0.5) * 2, 0, 1),
          legExtend: 0,
          leftArmAngle: 1.2,
          rightArmAngle: -1.1,
          laserTarget: laser,
          scanPulse: (t * 2.5) % 1,
          facing: -1,
        };
        stickman = {
          x: 1180,
          y: this.floorY,
          eye: 'wide',
          brow: 'angry',
          mouth: 'grit',
          leftArmAngle: 1.1,
          rightArmAngle: -1.3,
        };
      } else if (t < 23.0) {
        // Hose spots & pulls red toolbox; Stickman grabs hose with BOTH mitten hands & pulls back!
        const tugShake = Math.sin(t * 28) * 8;
        const pullU = smooth(clamp((t - 21.0) / 0.7, 0, 1));
        const stickGrab = t >= 21.7;
        const sx = stickGrab ? 1235 + tugShake : lerp(1180, 1235, smooth((t - 21.0) / 0.7));
        const rx = 1660;
        const hoseTipX = stickGrab ? sx + 85 : lerp(rx - 140, 1340, pullU);
        const hoseTipY = stickGrab ? this.floorY - 210 : this.floorY - 30;

        robot = {
          x: rx,
          y: this.floorY,
          scaleW: 2.15,
          scaleH: 2.85,
          eyeOn: true,
          eyeGlow: 1.4,
          eyeLookX: -0.5,
          eyeLookY: 0.15,
          lowBattery: false,
          lowBatteryBlink: false,
          turboWheels: 1,
          wheelSpin: 0,
          fanLevel: 1,
          fanSpin: t * 32,
          hasHoseArm: 1,
          hoseExtendX: hoseTipX - rx,
          hoseExtendY: hoseTipY - (this.floorY - 220),
          hasPotArmor: 1,
          hasLampHead: 1,
          lampOn: true,
          hasCushionArmor: 1,
          legExtend: 0,
          leftArmAngle: 0.8,
          rightArmAngle: -1.3,
          laserTarget: t < 21.5 ? { x: 1340, y: this.floorY - 35 } : null,
          scanPulse: (t * 2.5) % 1,
          facing: -1,
        };
        stickman = {
          x: sx,
          y: this.floorY,
          eye: 'wide',
          brow: 'angry',
          mouth: 'grit',
          lean: stickGrab ? -0.28 : 0.15,
          walkPhase: stickGrab ? 0 : t * 12,
          leftArmAngle: stickGrab ? -1.4 : 0.9,
          rightArmAngle: stickGrab ? -1.6 : -1.2,
        };
      } else {
        // Robot wins tug-of-war & gently drags Stickman leftward back toward workshop!
        const dragU = smooth((t - 23.0) / 1.0);
        const rx = lerp(1660, 820, dragU);
        const sx = rx - 210;
        robot = {
          x: rx,
          y: this.floorY,
          scaleW: 2.15,
          scaleH: 2.85,
          eyeOn: true,
          eyeGlow: 1.3,
          eyeLookX: -0.35,
          eyeLookY: 0.1,
          lowBattery: false,
          lowBatteryBlink: false,
          turboWheels: 1,
          wheelSpin: -t * 24,
          fanLevel: 1,
          fanSpin: t * 30,
          hasHoseArm: 1,
          hoseExtendX: sx + 85 - rx,
          hoseExtendY: 10,
          hasPotArmor: 1,
          hasLampHead: 1,
          lampOn: true,
          hasCushionArmor: 1,
          legExtend: 0,
          leftArmAngle: 0.6,
          rightArmAngle: -1.0,
          facing: -1,
        };
        stickman = {
          x: sx,
          y: this.floorY,
          eye: 'shock',
          brow: 'angry',
          mouth: 'grit',
          lean: -0.32,
          leftArmAngle: -1.35,
          rightArmAngle: -1.55,
        };
      }
    } else {
      // =========================================================
      // SCENE 5: THE FINAL UPGRADE (24 - 30s)
      // =========================================================
      const rx = 820;
      if (t < 25.0) {
        // Robot stops moving! Eye flashes & shows low-battery symbol; cable hangs out.
        const blink = Math.floor((t - 24.0) * 5) % 2 === 0;
        robot = {
          x: rx,
          y: this.floorY,
          scaleW: 2.15,
          scaleH: 2.85,
          eyeOn: false,
          eyeGlow: 0.1,
          eyeLookX: 0,
          eyeLookY: 0,
          lowBattery: true,
          lowBatteryBlink: blink,
          turboWheels: 1,
          wheelSpin: 0,
          fanLevel: 1,
          fanSpin: lerp(20, 0, (t - 24.0)),
          hasHoseArm: 1,
          hoseExtendX: -40,
          hoseExtendY: 80,
          hasPotArmor: 1,
          hasLampHead: 1,
          lampOn: false,
          hasCushionArmor: 1,
          legExtend: 0,
          leftArmAngle: 0.35,
          rightArmAngle: -0.35,
          cableDangling: true,
          facing: -1,
        };
        stickman = {
          x: 610,
          y: this.floorY,
          eye: 'wide',
          brow: 'raised',
          mouth: 'o',
          leftArmAngle: 0.9,
          rightArmAngle: -1.1,
        };
      } else if (t < 26.4) {
        // Stickman runs to workbench (x=340), grabs power bank (25.4s), plugs cable in (26.2s)!
        const goU = smooth(clamp((t - 25.0) / 0.45, 0, 1));
        const backU = smooth(clamp((t - 25.5) / 0.65, 0, 1));
        const sx = t < 25.5 ? lerp(610, 355, goU) : lerp(355, 615, backU);
        const holdingBank = t >= 25.4 && t < 26.25;
        const plugged = t >= 26.25;
        const bankPos = plugged ? { x: 685, y: this.floorY - 190 } : null;
        if (bankPos) {
          this.drawPowerBank(ctx, bankPos.x, bankPos.y + 36, 1.0, true);
        }
        robot = {
          x: rx,
          y: this.floorY,
          scaleW: 2.15,
          scaleH: 2.85,
          eyeOn: plugged,
          eyeGlow: plugged ? 1.5 : 0.1,
          eyeLookX: -0.35,
          eyeLookY: 0.15,
          lowBattery: !plugged,
          lowBatteryBlink: Math.floor(t * 6) % 2 === 0,
          turboWheels: 1,
          wheelSpin: 0,
          fanLevel: 1,
          fanSpin: plugged ? t * 28 : 0,
          hasHoseArm: 1,
          hoseExtendX: -40,
          hoseExtendY: 70,
          hasPotArmor: 1,
          hasLampHead: 1,
          lampOn: plugged,
          hasCushionArmor: 1,
          legExtend: 0,
          leftArmAngle: 0.35,
          rightArmAngle: -0.35,
          cableDangling: !plugged,
          cablePluggedTo: plugged ? { x: 685, y: this.floorY - 175 } : null,
          rechargePulse: plugged ? (t - 26.25) / 0.2 : 0,
          facing: -1,
        };
        stickman = {
          x: sx,
          y: this.floorY,
          eye: 'normal',
          brow: 'angry',
          mouth: 'grit',
          walkPhase: t < 26.2 ? t * 18 : 0,
          holdingPowerBank: holdingBank,
          leftArmAngle: holdingBank ? -1.1 : 1.0,
          rightArmAngle: holdingBank ? -1.4 : -1.5,
          lean: t < 25.5 ? -0.18 : 0.15,
        };
      } else if (t < 27.7) {
        // Recharging glow! Giant mechanical legs visibly unfold and lift robot way up!
        const legU = smooth(clamp((t - 26.55) / 1.1, 0, 1));
        this.drawPowerBank(ctx, 685, this.floorY - 154, 1.0, true);
        robot = {
          x: rx,
          y: this.floorY,
          scaleW: 2.15,
          scaleH: 2.85,
          eyeOn: true,
          eyeGlow: 1.5,
          eyeLookX: -0.35,
          eyeLookY: 0.2,
          lowBattery: false,
          lowBatteryBlink: false,
          turboWheels: 1,
          wheelSpin: 0,
          fanLevel: 1,
          fanSpin: t * 34,
          hasHoseArm: 1,
          hoseExtendX: -20,
          hoseExtendY: -30,
          hasPotArmor: 1,
          hasLampHead: 1,
          lampOn: true,
          hasCushionArmor: 1,
          legExtend: legU,
          leftArmAngle: 0.5 + legU * 0.4,
          rightArmAngle: -0.5 - legU * 0.4,
          cablePluggedTo: { x: 685, y: this.floorY - 175 },
          rechargePulse: (t - 26.25) * 1.4,
          facing: -1,
        };
        stickman = {
          x: 605,
          y: this.floorY,
          eye: 'hugeShock',
          brow: 'raised',
          mouth: 'o',
          leftArmAngle: 1.6,
          rightArmAngle: -1.6,
          lean: -0.1,
        };
      } else {
        // Giant robot gently lifts Stickman & places him on its shoulder like a tiny passenger!
        const liftU = smooth(clamp((t - 27.7) / 1.0, 0, 1));
        const legH = 265;
        const bodyTopY = this.floorY - legH - 2.85 * 116; // ~884
        const shoulderX = rx - 152;
        const shoulderY = bodyTopY + 56; // sits cleanly on top of left pot armor!

        const sx = lerp(605, shoulderX, liftU);
        const sy = liftU < 0.55
          ? lerp(this.floorY, shoulderY - 90, smooth(liftU / 0.55))
          : lerp(shoulderY - 90, shoulderY, smooth((liftU - 0.55) / 0.45));

        const seated = liftU >= 0.9;
        const handTargetX = sx - rx;
        const handTargetY = (sy - 190) - (this.floorY - legH - 200);

        this.drawPowerBank(ctx, 685, this.floorY - 154, 1.0, true);
        robot = {
          x: rx,
          y: this.floorY,
          scaleW: 2.15,
          scaleH: 2.85,
          eyeOn: true,
          eyeGlow: 1.35,
          eyeLookX: seated ? -0.1 : -0.45,
          eyeLookY: seated ? -0.15 : 0.1,
          lowBattery: false,
          lowBatteryBlink: false,
          turboWheels: 1,
          wheelSpin: 0,
          fanLevel: 1,
          fanSpin: t * 28,
          hasHoseArm: 1,
          hoseExtendX: seated ? 60 : handTargetX,
          hoseExtendY: seated ? -80 : handTargetY,
          hasPotArmor: 1,
          hasLampHead: 1,
          lampOn: true,
          hasCushionArmor: 1,
          legExtend: 1,
          leftArmAngle: seated ? 0.5 : 1.55,
          rightArmAngle: -1.4,
          cablePluggedTo: { x: 685, y: this.floorY - 175 },
          rechargePulse: 2.0,
          facing: -1,
        };

        stickman = {
          x: sx,
          y: sy,
          eye: seated ? 'annoyed' : 'shock',
          brow: seated ? 'annoyed' : 'raised',
          mouth: seated ? 'flat' : 'o',
          sitting: seated,
          crossedArms: seated,
          leftArmAngle: seated ? 0.8 : 1.3,
          rightArmAngle: seated ? -0.8 : -1.3,
          lean: 0,
        };
      }
    }

    // Draw in clean depth order
    if (robot) {
      this.drawRobot(ctx, robot, t);
    }
    if (carriedProp) {
      this.drawCarriedProp(ctx, carriedProp);
    }
    this.drawStickman(ctx, stickman, t);
  }

  // -------------------------------------------------------------
  // STICKMAN CHARACTER RIG (STRICT DESIGN — IDENTICAL EVERY SCENE)
  // Large circular white head (~40% height), oval eyes, thick brows,
  // red knitted beanie with folded edge, plain yellow short-sleeve T-shirt,
  // thin black arms connected directly to sleeves, connected white mittens,
  // blue trousers, thin black legs, solid black rounded shoes.
  // -------------------------------------------------------------
  private drawStickman(ctx: CanvasRenderingContext2D, p: StickmanPose, t: number): void {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.lean ?? 0);

    // Total standing height ~470px; head diameter = 180px (~38-40%)
    const headR = 90;
    const legLen = p.sitting ? 105 : 145;
    const torsoH = 115;
    const torsoW = 92;
    const hipY = p.sitting ? -20 : -legLen;
    const torsoBottomY = hipY;
    const torsoTopY = torsoBottomY - torsoH;
    const headCY = torsoTopY - headR * 0.88;

    // Ground drop shadow (only when standing on floor)
    if (!p.sitting && Math.abs(p.y - this.floorY) < 25) {
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 82, 20, 0, 0, TAU);
      ctx.fill();
    }

    // 1. LEGS & BLUE TROUSERS
    const walk = p.walkPhase ?? 0;
    if (p.sitting) {
      // Sitting legs dangling forward cleanly with blue trousers + black legs + shoes
      this.drawSittingLeg(ctx, -20, hipY, -0.15);
      this.drawSittingLeg(ctx, 20, hipY, 0.1);
    } else {
      const lAngle = Math.sin(walk) * 0.52;
      const rAngle = -Math.sin(walk) * 0.52;
      this.drawLeg(ctx, -22, hipY, legLen, lAngle);
      this.drawLeg(ctx, 22, hipY, legLen, rAngle);
    }

    // 2. SMALL COMPACT TORSO — BRIGHT YELLOW PLAIN T-SHIRT (NO LOGOS/PATTERNS)
    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 7;
    this.roundRect(ctx, -torsoW / 2, torsoTopY, torsoW, torsoH, 18);
    ctx.fill();
    ctx.stroke();

    // Short sleeves connected cleanly
    this.roundRect(ctx, -torsoW / 2 - 20, torsoTopY + 6, 30, 44, 10);
    ctx.fill();
    ctx.stroke();
    this.roundRect(ctx, torsoW / 2 - 10, torsoTopY + 6, 30, 44, 10);
    ctx.fill();
    ctx.stroke();

    // 3. THIN BLACK ARMS + CONNECTED WHITE MITTEN HANDS
    const leftAngle = p.crossedArms ? 0.55 : (p.leftArmAngle ?? 1.0);
    const rightAngle = p.crossedArms ? -0.55 : (p.rightArmAngle ?? -0.95);

    this.drawStickmanArm(ctx, -torsoW / 2 - 5, torsoTopY + 38, leftAngle, 'left', p.crossedArms);
    this.drawStickmanArm(ctx, torsoW / 2 + 5, torsoTopY + 38, rightAngle, 'right', p.crossedArms);

    // Props held directly in Stickman's mitten hands
    if (p.holdingTinyRobot) {
      this.drawRobot(
        ctx,
        {
          x: 92,
          y: torsoTopY + 35,
          scaleW: 0.92,
          scaleH: 0.92,
          eyeOn: false,
          eyeGlow: 0,
          eyeLookX: 0,
          eyeLookY: 0,
          lowBattery: false,
          lowBatteryBlink: false,
          turboWheels: 0,
          wheelSpin: 0,
          fanLevel: 0,
          fanSpin: 0,
          hasHoseArm: 0,
          hoseExtendX: 0,
          hoseExtendY: 0,
          hasPotArmor: 0,
          hasLampHead: 0,
          lampOn: false,
          hasCushionArmor: 0,
          legExtend: 0,
          leftArmAngle: 0.3,
          rightArmAngle: -0.3,
        },
        t
      );
    }
    if (p.holdingPowerBank) {
      this.drawPowerBank(ctx, 96, torsoTopY + 55, 1.0, false);
    }

    // 4. LARGE CIRCULAR WHITE HEAD (~40% height)
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(0, headCY, headR, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // 5. RED KNITTED BEANIE (ROUNDED TOP + FOLDED LOWER EDGE)
    ctx.save();
    ctx.translate(0, headCY - headR * 0.65);
    ctx.rotate(p.beanieAngle ?? 0);

    // Beanie dome
    ctx.fillStyle = '#dc2626';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.ellipse(0, -32, headR * 0.88, 60, 0, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Folded lower cuff
    ctx.fillStyle = '#b91c1c';
    this.roundRect(ctx, -headR * 0.95, -32, headR * 1.9, 36, 12);
    ctx.fill();
    ctx.stroke();

    // Knitted vertical ribbing
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3.5;
    for (let rx = -headR * 0.78; rx <= headR * 0.78; rx += 19) {
      ctx.beginPath();
      ctx.moveTo(rx, -32);
      ctx.lineTo(rx, 4);
      ctx.stroke();
    }
    ctx.restore();

    // 6. FACIAL FEATURES (NO NOSE, NO EARS, NO HAIR)
    this.drawStickmanFace(ctx, 0, headCY, p.eye, p.brow, p.mouth);

    ctx.restore();
  }

  private drawLeg(ctx: CanvasRenderingContext2D, hx: number, hy: number, legLen: number, angle: number): void {
    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(angle);

    // Blue trousers (upper 62%)
    ctx.fillStyle = '#2563eb';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    this.roundRect(ctx, -16, 0, 32, legLen * 0.62, 9);
    ctx.fill();
    ctx.stroke();

    // Lower thin black leg
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, legLen * 0.62);
    ctx.lineTo(0, legLen);
    ctx.stroke();

    // Small rounded solid-black shoe
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(9, legLen + 4, 25, 13, 0, 0, TAU);
    ctx.fill();

    ctx.restore();
  }

  private drawSittingLeg(ctx: CanvasRenderingContext2D, hx: number, hy: number, spread: number): void {
    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(spread);

    // Blue trousers bent forward & dangling
    ctx.fillStyle = '#2563eb';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    this.roundRect(ctx, -15, 0, 30, 68, 9);
    ctx.fill();
    ctx.stroke();

    // Thin black lower leg dangling over shoulder armor
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 68);
    ctx.lineTo(-4, 114);
    ctx.stroke();

    // Rounded solid black shoe
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(4, 118, 22, 12, 0.15, 0, TAU);
    ctx.fill();

    ctx.restore();
  }

  private drawStickmanArm(
    ctx: CanvasRenderingContext2D,
    sx: number,
    sy: number,
    angle: number,
    side: 'left' | 'right',
    crossed?: boolean
  ): void {
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(angle);

    const armLen = crossed ? 68 : 98;

    // Thin black stick arm of consistent thickness
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, armLen);
    ctx.stroke();

    // White rounded mitten hand connected DIRECTLY to wrist (zero gap!)
    ctx.save();
    ctx.translate(0, armLen);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5.5;
    ctx.beginPath();
    ctx.arc(0, 12, 17, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Small thumb bump on inner mitten side
    ctx.beginPath();
    ctx.arc(side === 'left' ? 9 : -9, 7, 8, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  private drawStickmanFace(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    eye: StickmanPose['eye'],
    brow: StickmanPose['brow'],
    mouth: StickmanPose['mouth']
  ): void {
    const eyeDist = 33;
    const eyeY = cy - 2;
    const browY = eyeY - 28;

    // Thick expressive black eyebrows
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';

    if (brow === 'neutral') {
      ctx.beginPath();
      ctx.moveTo(cx - eyeDist - 18, browY);
      ctx.lineTo(cx - eyeDist + 18, browY);
      ctx.moveTo(cx + eyeDist - 18, browY);
      ctx.lineTo(cx + eyeDist + 18, browY);
      ctx.stroke();
    } else if (brow === 'raised') {
      ctx.beginPath();
      ctx.arc(cx - eyeDist, browY - 7, 20, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + eyeDist, browY - 7, 20, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
    } else if (brow === 'angry') {
      ctx.beginPath();
      ctx.moveTo(cx - eyeDist - 20, browY - 7);
      ctx.lineTo(cx - eyeDist + 18, browY + 9);
      ctx.moveTo(cx + eyeDist - 18, browY + 9);
      ctx.lineTo(cx + eyeDist + 20, browY - 7);
      ctx.stroke();
    } else if (brow === 'annoyed') {
      ctx.beginPath();
      ctx.moveTo(cx - eyeDist - 20, browY - 2);
      ctx.lineTo(cx - eyeDist + 18, browY + 4);
      ctx.moveTo(cx + eyeDist - 18, browY + 4);
      ctx.lineTo(cx + eyeDist + 20, browY - 2);
      ctx.stroke();
    } else if (brow === 'sad') {
      ctx.beginPath();
      ctx.moveTo(cx - eyeDist - 20, browY + 8);
      ctx.lineTo(cx - eyeDist + 18, browY - 5);
      ctx.moveTo(cx + eyeDist - 18, browY - 5);
      ctx.lineTo(cx + eyeDist + 20, browY + 8);
      ctx.stroke();
    }

    // Two small vertical black oval eyes (and expressive reactions)
    ctx.fillStyle = '#000000';
    if (eye === 'normal' || eye === 'grit') {
      ctx.beginPath();
      ctx.ellipse(cx - eyeDist, eyeY, 8.5, 16, 0, 0, TAU);
      ctx.ellipse(cx + eyeDist, eyeY, 8.5, 16, 0, 0, TAU);
      ctx.fill();
    } else if (eye === 'happy') {
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(cx - eyeDist, eyeY + 5, 15, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + eyeDist, eyeY + 5, 15, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
    } else if (eye === 'star') {
      this.drawStar(ctx, cx - eyeDist, eyeY, 16);
      this.drawStar(ctx, cx + eyeDist, eyeY, 16);
    } else if (eye === 'wide') {
      ctx.beginPath();
      ctx.ellipse(cx - eyeDist, eyeY, 12, 20, 0, 0, TAU);
      ctx.ellipse(cx + eyeDist, eyeY, 12, 20, 0, 0, TAU);
      ctx.fill();
    } else if (eye === 'shock' || eye === 'hugeShock') {
      const r = eye === 'hugeShock' ? 24 : 18;
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(cx - eyeDist, eyeY, r, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + eyeDist, eyeY, r, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(cx - eyeDist, eyeY, 6, 0, TAU);
      ctx.arc(cx + eyeDist, eyeY, 6, 0, TAU);
      ctx.fill();
    } else if (eye === 'annoyed') {
      // Half-lidded deadpan oval eyes looking right at camera
      ctx.beginPath();
      ctx.ellipse(cx - eyeDist, eyeY + 2, 10, 14, 0, 0, Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + eyeDist, eyeY + 2, 10, 14, 0, 0, Math.PI);
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(cx - eyeDist - 14, eyeY + 2);
      ctx.lineTo(cx - eyeDist + 14, eyeY + 2);
      ctx.moveTo(cx + eyeDist - 14, eyeY + 2);
      ctx.lineTo(cx + eyeDist + 14, eyeY + 2);
      ctx.stroke();
    }

    // Simple black mouth
    const mouthY = cy + 38;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6.5;
    if (mouth === 'bigSmile') {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, mouthY - 8, 30, 0, Math.PI);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (mouth === 'o') {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(cx, mouthY, 13, 18, 0, 0, TAU);
      ctx.fill();
      ctx.stroke();
    } else if (mouth === 'grit') {
      ctx.fillStyle = '#ffffff';
      this.roundRect(ctx, cx - 28, mouthY - 8, 56, 20, 7);
      ctx.fill();
      ctx.stroke();
    } else if (mouth === 'frown') {
      ctx.beginPath();
      ctx.arc(cx, mouthY + 14, 22, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(cx - 24, mouthY);
      ctx.lineTo(cx + 24, mouthY);
      ctx.stroke();
    }
  }

  // -------------------------------------------------------------
  // SELF-BUILDING ROBOT RIG (BASE + ALL VISIBLE UPGRADES)
  // -------------------------------------------------------------
  private drawRobot(ctx: CanvasRenderingContext2D, r: RobotState, t: number): void {
    ctx.save();
    ctx.translate(r.x, r.y);
    if (r.wobble) ctx.rotate(r.wobble);

    const baseW = 104 * r.scaleW;
    const baseH = 116 * r.scaleH;
    const wheelR = lerp(14, 28, r.turboWheels);
    const legH = r.legExtend * 265;
    const chassisBottomY = -wheelR * 2 - legH;
    const chassisTopY = chassisBottomY - baseH;
    const bodyCenterY = chassisTopY + baseH * 0.5;

    // Ground drop shadow
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath();
    ctx.ellipse(0, 0, baseW * 0.56, 20, 0, 0, TAU);
    ctx.fill();

    // 1. GIANT MECHANICAL LEGS (SCENE 5 — unfold from beneath body)
    if (r.legExtend > 0.02) {
      this.drawRobotGiantLegs(ctx, baseW * 0.28, chassisBottomY, r.legExtend);
    }

    // 2. ELECTRIC FAN MOUNTED ON BACK (SCENE 3+)
    if (r.fanLevel > 0.05) {
      ctx.save();
      ctx.translate(-baseW * 0.42 * (r.facing ?? -1), chassisTopY + baseH * 0.38);
      ctx.scale(r.fanLevel, r.fanLevel);
      this.drawMountedFan(ctx, r.fanSpin);
      ctx.restore();
    }

    // 3. FOUR BLACK WHEELS UNDER CHASSIS (upgrade to bigger sporty toy-car wheels in Scene 2!)
    const wheelOffsets = [-baseW * 0.36, -baseW * 0.14, baseW * 0.14, baseW * 0.36];
    for (const wx of wheelOffsets) {
      this.drawRobotWheel(ctx, wx, chassisBottomY + wheelR, wheelR, r.turboWheels, r.wheelSpin);
    }

    // 4. RECHARGE CABLE (Scene 5 — dangling or plugged into power bank)
    if (r.cableDangling || r.cablePluggedTo) {
      ctx.save();
      const startX = -baseW * 0.48;
      const startY = chassisBottomY - 45;
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      if (r.cablePluggedTo) {
        const px = r.cablePluggedTo.x - r.x;
        const py = r.cablePluggedTo.y - r.y;
        ctx.bezierCurveTo(startX - 55, startY + 70, px - 30, py + 45, px, py);
        ctx.stroke();

        // Recharge electric pulse dots traveling up the cable
        const pulse = (r.rechargePulse ?? 0) % 1;
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(lerp(px, startX, pulse), lerp(py, startY, pulse), 9, 0, TAU);
        ctx.fill();
      } else {
        const sway = Math.sin(t * 4) * 14;
        ctx.quadraticCurveTo(startX - 45, startY + 85, startX - 25 + sway, startY + 145);
        ctx.stroke();
        // Plug tip
        ctx.fillStyle = '#ef4444';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        this.roundRect(ctx, startX - 36 + sway, startY + 140, 22, 24, 5);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }

    // 5. MAIN SILVER RECTANGULAR BOX BODY (RETAINED THROUGH ALL UPGRADES!)
    ctx.fillStyle = '#cbd5e1';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 7;
    this.roundRect(ctx, -baseW / 2, chassisTopY, baseW, baseH, 18);
    ctx.fill();
    ctx.stroke();

    // Inner metallic highlight panel
    ctx.fillStyle = '#e2e8f0';
    this.roundRect(ctx, -baseW * 0.4, chassisTopY + 12, baseW * 0.8, baseH - 24, 12);
    ctx.fill();

    // Subtle panel rivets
    ctx.fillStyle = '#64748b';
    const rOffX = baseW * 0.34;
    ctx.beginPath();
    ctx.arc(-rOffX, chassisTopY + 22, 4, 0, TAU);
    ctx.arc(rOffX, chassisTopY + 22, 4, 0, TAU);
    ctx.arc(-rOffX, chassisBottomY - 22, 4, 0, TAU);
    ctx.arc(rOffX, chassisBottomY - 22, 4, 0, TAU);
    ctx.fill();

    // 6. SOFA CUSHION CHEST ARMOR (SCENE 4+ — sits on lower torso so eye & button stay clear)
    if (r.hasCushionArmor > 0.05) {
      ctx.save();
      ctx.translate(0, chassisBottomY - baseH * 0.25);
      ctx.scale(r.hasCushionArmor, r.hasCushionArmor);
      this.drawCushionProp(ctx, 0, 0, 1.15);
      ctx.restore();
    }

    // 7. SMALL RED ON/OFF BUTTON ON UPPER BODY
    const btnX = baseW * 0.28;
    const btnY = chassisTopY + Math.min(34, baseH * 0.22);
    ctx.fillStyle = r.eyeOn ? '#ef4444' : '#b91c1c';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(btnX, btnY, 11, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // 8. ONE LARGE CIRCULAR BLUE GLOWING EYE ON THE FRONT
    const eyeR = clamp(24 * (0.85 + r.scaleW * 0.32), 24, 46);
    const eyeY = chassisTopY + Math.min(baseH * 0.38, 105);

    if (r.eyeOn && r.eyeGlow > 0.2) {
      ctx.fillStyle = `rgba(56, 189, 248, ${0.28 * r.eyeGlow})`;
      ctx.beginPath();
      ctx.arc(0, eyeY, eyeR + 18, 0, TAU);
      ctx.fill();
    }

    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(0, eyeY, eyeR, 0, TAU);
    ctx.fill();
    ctx.stroke();

    if (r.lowBattery) {
      // Flashing simple low-battery symbol inside circular lens
      if (r.lowBatteryBlink) {
        ctx.strokeStyle = '#ef4444';
        ctx.fillStyle = '#ef4444';
        ctx.lineWidth = 4;
        ctx.strokeRect(-18, eyeY - 10, 32, 20);
        ctx.fillRect(14, eyeY - 5, 5, 10);
        ctx.fillRect(-14, eyeY - 6, 7, 12);
      }
    } else if (r.eyeOn) {
      // Bright glowing blue circular iris
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(r.eyeLookX * 8, eyeY + r.eyeLookY * 8, eyeR * 0.72, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#e0f2fe';
      ctx.beginPath();
      ctx.arc(r.eyeLookX * 8 - eyeR * 0.2, eyeY + r.eyeLookY * 8 - eyeR * 0.2, eyeR * 0.26, 0, TAU);
      ctx.fill();
    } else {
      // Powered-off dim blue glass
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(0, eyeY, eyeR * 0.68, 0, TAU);
      ctx.fill();
    }

    // 9. THIN BLUE LASER SCAN LINE (when scanning an object!)
    if (r.laserTarget) {
      const lx = r.laserTarget.x - r.x;
      const ly = r.laserTarget.y - r.y;
      ctx.save();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(0, eyeY);
      ctx.lineTo(lx, ly);
      ctx.stroke();

      ctx.strokeStyle = '#bae6fd';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, eyeY);
      ctx.lineTo(lx, ly);
      ctx.stroke();

      // Target reticle ring
      const pulseR = 18 + Math.sin((r.scanPulse ?? 0) * Math.PI) * 12;
      ctx.strokeStyle = '#0ea5e9';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(lx, ly, pulseR, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }

    // 10. DESK LAMP HEADLIGHT ATTACHED ON TOP (SCENE 4+)
    if (r.hasLampHead > 0.05) {
      ctx.save();
      ctx.translate(0, chassisTopY);
      ctx.scale(r.hasLampHead, r.hasLampHead);
      this.drawDeskLampProp(ctx, 0, 0, 1.0, r.lampOn);
      ctx.restore();
    }

    // 11. TWO METAL POTS AS SHOULDER ARMOR (SCENE 3+)
    if (r.hasPotArmor > 0.05) {
      const potY = chassisTopY + 26;
      ctx.save();
      ctx.translate(-baseW * 0.54, potY);
      ctx.rotate(-0.22);
      ctx.scale(r.hasPotArmor, r.hasPotArmor);
      this.drawPotArmorPiece(ctx);
      ctx.restore();

      ctx.save();
      ctx.translate(baseW * 0.54, potY);
      ctx.rotate(0.22);
      ctx.scale(-r.hasPotArmor, r.hasPotArmor);
      this.drawPotArmorPiece(ctx);
      ctx.restore();
    }

    // 12. MECHANICAL ARMS (Left = silver gripper arm, Right = silver arm or Vacuum Hose Arm!)
    const armShoulderY = chassisTopY + Math.min(baseH * 0.45, 95);
    const armScale = clamp(0.85 + r.scaleW * 0.28, 0.9, 1.45);
    this.drawRobotGripperArm(ctx, -baseW / 2 - 4, armShoulderY, r.leftArmAngle, armScale);

    if (r.hasHoseArm > 0.5) {
      // Flexible corrugated vacuum hose arm (left/right depending on facing)
      const hoseBaseX = (r.facing ?? 1) < 0 ? -baseW / 2 - 8 : baseW / 2 + 8;
      this.drawVacuumHoseArm(
        ctx,
        hoseBaseX,
        armShoulderY + 20,
        r.hoseExtendX || (r.facing ?? 1) * 110,
        r.hoseExtendY || 40
      );
      this.drawRobotGripperArm(ctx, baseW / 2 + 4, armShoulderY, r.rightArmAngle, armScale);
    } else {
      this.drawRobotGripperArm(ctx, baseW / 2 + 4, armShoulderY, r.rightArmAngle, armScale);
    }

    // 13. RECHARGE SPARKLES (SCENE 5)
    if (r.rechargePulse && r.rechargePulse > 0 && r.rechargePulse < 1.8) {
      ctx.fillStyle = '#38bdf8';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2.5;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU + t * 4;
        const dist = baseW * 0.65 + Math.sin(t * 10 + i) * 18;
        this.drawStar(ctx, Math.cos(a) * dist, bodyCenterY + Math.sin(a) * dist, 14);
      }
    }

    ctx.restore();
  }

  private drawRobotWheel(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    r: number,
    turbo: number,
    spin: number
  ): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(spin);
    ctx.fillStyle = '#18181b';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Hubcap (turns red sporty rim after toy car upgrade!)
    ctx.fillStyle = turbo > 0.5 ? '#ef4444' : '#94a3b8';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.52, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Spoke cross so wheel rotation reads clearly
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-r * 0.45, 0);
    ctx.lineTo(r * 0.45, 0);
    ctx.stroke();
    ctx.restore();
  }

  private drawRobotGripperArm(
    ctx: CanvasRenderingContext2D,
    sx: number,
    sy: number,
    angle: number,
    scale: number
  ): void {
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(angle);
    ctx.scale(scale, scale);

    // Silver rod arm
    ctx.fillStyle = '#94a3b8';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4.5;
    this.roundRect(ctx, -7, 0, 14, 58, 6);
    ctx.fill();
    ctx.stroke();

    // Rounded C-gripper claw
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.arc(0, 68, 16, 0.4, Math.PI * 1.85);
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.fill();

    ctx.restore();
  }

  private drawVacuumHoseArm(
    ctx: CanvasRenderingContext2D,
    sx: number,
    sy: number,
    tx: number,
    ty: number
  ): void {
    ctx.save();
    const cx1 = sx + (tx - sx) * 0.45;
    const cy1 = sy - 45;
    const cx2 = sx + (tx - sx) * 0.75;
    const cy2 = ty + 35;

    // Outer black outline of ribbed hose
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 24;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.bezierCurveTo(cx1, cy1, cx2, cy2, tx, ty);
    ctx.stroke();

    // Inner grey hose fill
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.bezierCurveTo(cx1, cy1, cx2, cy2, tx, ty);
    ctx.stroke();

    // Vacuum nozzle / claw tip
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.arc(tx, ty, 17, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private drawMountedFan(ctx: CanvasRenderingContext2D, spin: number): void {
    ctx.fillStyle = '#e2e8f0';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, 48, 0, TAU);
    ctx.fill();
    ctx.stroke();

    ctx.save();
    ctx.rotate(spin);
    ctx.fillStyle = '#38bdf8';
    for (let i = 0; i < 3; i++) {
      ctx.rotate(TAU / 3);
      ctx.beginPath();
      ctx.ellipse(0, -22, 11, 20, 0, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawPotArmorPiece(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#94a3b8';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;
    this.roundRect(ctx, -38, -28, 76, 56, 16);
    ctx.fill();
    ctx.stroke();
    // Pot rim & handle
    ctx.fillStyle = '#e2e8f0';
    this.roundRect(ctx, -44, -32, 88, 14, 6);
    ctx.fill();
    ctx.stroke();
  }

  private drawRobotGiantLegs(ctx: CanvasRenderingContext2D, spreadX: number, topY: number, ext: number): void {
    const legH = ext * 265;
    for (const side of [-1, 1]) {
      const lx = side * spreadX;
      ctx.fillStyle = '#94a3b8';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 6;
      // Upper hydraulic thigh
      this.roundRect(ctx, lx - 22, topY, 44, legH * 0.55, 10);
      ctx.fill();
      ctx.stroke();
      // Lower shin piston
      ctx.fillStyle = '#cbd5e1';
      this.roundRect(ctx, lx - 16, topY + legH * 0.5, 32, legH * 0.45, 8);
      ctx.fill();
      ctx.stroke();
      // Heavy mechanical foot
      ctx.fillStyle = '#334155';
      this.roundRect(ctx, lx - 36, topY + legH - 28, 72, 30, 12);
      ctx.fill();
      ctx.stroke();
    }
  }

  // -------------------------------------------------------------
  // COLLECTIBLE WORKSHOP & LIVING ROOM PROPS
  // -------------------------------------------------------------
  private drawToyCar(ctx: CanvasRenderingContext2D, x: number, y: number, hasWheels: boolean): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#ef4444'; // Bright red toy car
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;

    // Car body
    this.roundRect(ctx, -56, -42, 112, 28, 10);
    ctx.fill();
    ctx.stroke();
    // Cabin roof
    ctx.fillStyle = '#38bdf8';
    this.roundRect(ctx, -32, -66, 60, 28, 10);
    ctx.fill();
    ctx.stroke();

    if (hasWheels) {
      for (const wx of [-34, 34]) {
        ctx.fillStyle = '#18181b';
        ctx.beginPath();
        ctx.arc(wx, -14, 15, 0, TAU);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(wx, -14, 6, 0, TAU);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  private drawFanProp(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, spin: number): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;
    this.roundRect(ctx, -34, -18, 68, 18, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillRect(-8, -68, 16, 52);
    ctx.strokeRect(-8, -68, 16, 52);
    ctx.translate(0, -96);
    this.drawMountedFan(ctx, spin);
    ctx.restore();
  }

  private drawVacuumProp(ctx: CanvasRenderingContext2D, x: number, y: number, hasHose: boolean): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#a855f7'; // Purple canister vacuum
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;
    this.roundRect(ctx, -45, -56, 90, 44, 16);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#18181b';
    ctx.beginPath();
    ctx.arc(-26, -12, 13, 0, TAU);
    ctx.arc(26, -12, 13, 0, TAU);
    ctx.fill();
    ctx.stroke();

    if (hasHose) {
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 18;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-36, -50);
      ctx.bezierCurveTo(-80, -110, -25, -165, -75, -135);
      ctx.stroke();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(-36, -50);
      ctx.bezierCurveTo(-80, -110, -25, -165, -75, -135);
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawPotProp(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = '#94a3b8';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4.5;
    this.roundRect(ctx, -24, -44, 48, 44, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#e2e8f0';
    this.roundRect(ctx, -28, -48, 56, 10, 4);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private drawDeskLampProp(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, lightOn: boolean): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    if (lightOn) {
      ctx.fillStyle = 'rgba(253, 224, 71, 0.28)';
      ctx.beginPath();
      ctx.moveTo(-18, -76);
      ctx.lineTo(-220, -170);
      ctx.lineTo(-220, 40);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;
    // Base
    this.roundRect(ctx, -26, -14, 52, 14, 6);
    ctx.fill();
    ctx.stroke();
    // Neck
    ctx.beginPath();
    ctx.moveTo(0, -14);
    ctx.lineTo(14, -56);
    ctx.lineTo(-10, -76);
    ctx.stroke();
    // Shade
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(-36, -54);
    ctx.lineTo(10, -92);
    ctx.lineTo(18, -50);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private drawCushionProp(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = '#fb7185';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;
    this.roundRect(ctx, -56, -24, 112, 48, 18);
    ctx.fill();
    ctx.stroke();
    // Button tuft
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private drawToolboxProp(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#dc2626';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;
    this.roundRect(ctx, -52, -56, 104, 56, 10);
    ctx.fill();
    ctx.stroke();
    // Handle
    ctx.beginPath();
    ctx.moveTo(-22, -56);
    ctx.lineTo(-22, -74);
    ctx.lineTo(22, -74);
    ctx.lineTo(22, -56);
    ctx.stroke();
    // Clasp
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-10, -38, 20, 14);
    ctx.strokeRect(-10, -38, 20, 14);
    ctx.restore();
  }

  private drawPowerBank(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    scale: number,
    charging = false
  ): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = '#0ea5e9';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4.5;
    this.roundRect(ctx, -30, -44, 60, 44, 10);
    ctx.fill();
    ctx.stroke();
    // Lightning bolt icon
    ctx.fillStyle = charging ? '#fef08a' : '#facc15';
    ctx.beginPath();
    ctx.moveTo(4, -36);
    ctx.lineTo(-10, -20);
    ctx.lineTo(0, -20);
    ctx.lineTo(-4, -8);
    ctx.lineTo(12, -24);
    ctx.lineTo(2, -24);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  private drawCarriedProp(
    ctx: CanvasRenderingContext2D,
    prop: { kind: 'car' | 'fan' | 'hose' | 'pots' | 'lamp' | 'cushion'; x: number; y: number }
  ): void {
    if (prop.kind === 'car') {
      this.drawToyCar(ctx, prop.x, prop.y, true);
    } else if (prop.kind === 'fan') {
      this.drawFanProp(ctx, prop.x, prop.y, 0.85, 0);
    } else if (prop.kind === 'hose') {
      this.drawVacuumHoseArm(ctx, prop.x - 30, prop.y, prop.x + 35, prop.y - 25);
    } else if (prop.kind === 'pots') {
      this.drawPotProp(ctx, prop.x - 30, prop.y, 1.0);
      this.drawPotProp(ctx, prop.x + 30, prop.y, 1.0);
    } else if (prop.kind === 'lamp') {
      this.drawDeskLampProp(ctx, prop.x, prop.y, 1.0, false);
    } else if (prop.kind === 'cushion') {
      this.drawCushionProp(ctx, prop.x, prop.y, 1.0);
    }
  }

  private drawSpeedLines(ctx: CanvasRenderingContext2D, x: number, y: number, facing: number): void {
    ctx.save();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    const dir = -facing;
    for (let i = 0; i < 4; i++) {
      const ly = y - 40 + i * 26;
      ctx.beginPath();
      ctx.moveTo(x + dir * 70, ly);
      ctx.lineTo(x + dir * (160 + i * 25), ly);
      ctx.stroke();
    }
    ctx.restore();
  }

  // -------------------------------------------------------------
  // BURNED-IN POP CAPTIONS (SHORTS SAFE ZONE)
  // -------------------------------------------------------------
  private drawCaptions(ctx: CanvasRenderingContext2D, t: number): void {
    const caption = this.captions.find((c) => t >= c.from && t <= c.to);
    if (!caption) return;

    const popIn = clamp((t - caption.from) / 0.16, 0, 1);
    const popOut = clamp((caption.to - t) / 0.2, 0, 1);
    const scale = easeOut(popIn) * easeOut(popOut);

    ctx.save();
    ctx.translate(this.width / 2, 1710);
    ctx.scale(scale, scale);

    ctx.font = '900 50px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 16;
    ctx.strokeText(caption.text, 0, 0);

    ctx.fillStyle = '#38bdf8';
    ctx.fillText(caption.text, 0, 0);
    ctx.restore();
  }

  // -------------------------------------------------------------
  // HELPERS
  // -------------------------------------------------------------
  private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  }

  private drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
    ctx.fillStyle = '#fde047';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const rad = i % 2 === 0 ? r : r * 0.42;
      const a = (i / 8) * TAU - Math.PI / 2;
      const x = cx + Math.cos(a) * rad;
      const y = cy + Math.sin(a) * rad;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  private drawSafeZones(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.7)';
    ctx.lineWidth = 3;
    ctx.setLineDash([16, 12]);
    ctx.strokeRect(80, 200, this.width - 160, this.height - 460);
    ctx.restore();
  }
}
