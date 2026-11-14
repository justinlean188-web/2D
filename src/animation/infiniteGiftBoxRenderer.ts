import { StudioConfig } from '../types';

/**
 * InfiniteGiftBoxRenderer
 * Renders "THE INFINITE GIFT BOX" — a 30-second vertical 9:16 (1080x1920, 24fps)
 * Modern Pop 2D flat vector comedy short in five continuous 6-second scenes:
 *   Scene 1 (0–6s):   THE MYSTERIOUS PRESENT   ("WHAT'S INSIDE?!")
 *   Scene 2 (6–12s):  ANOTHER GIFT?!           ("WAIT… THERE'S ANOTHER ONE?!")
 *   Scene 3 (12–18s): THE BOXES GET BIGGER!    ("WHY IS IT GETTING BIGGER?!")
 *   Scene 4 (18–24s): THE ENTIRE HOUSE IS A PRESENT ("I'M LIVING INSIDE A GIFT!")
 *   Scene 5 (24–30s): THE WORST SURPRISE       ("I HATE SURPRISES!")
 */

const TAU = Math.PI * 2;
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * clamp(t, 0, 1);
const smooth = (t: number) => {
  const c = clamp(t, 0, 1);
  return c * c * (3 - 2 * c);
};
const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
const easeInOut = (t: number) => {
  const c = clamp(t, 0, 1);
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
};

interface CameraKey {
  t: number;
  x: number;
  y: number;
  zoom: number;
}

interface StickmanPose {
  x: number;
  y: number;
  eye: 'normal' | 'happy' | 'star' | 'wide' | 'shock' | 'hugeShock' | 'annoyed' | 'angry';
  brow: 'neutral' | 'raised' | 'angry' | 'sad' | 'annoyed' | 'confused';
  mouth: 'flat' | 'bigSmile' | 'o' | 'grit' | 'frown';
  beanieOn?: boolean;
  beanieOffset?: { x: number; y: number; angle: number };
  leftArmAngle?: number;
  rightArmAngle?: number;
  lean?: number;
  walkPhase?: number;
  crossedArms?: boolean;
  facing?: 1 | -1;
}

interface MiniGiftParticle {
  id: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  ribbonColor: string;
  rotSpeed: number;
  rotOffset: number;
  landX: number;
}

export class InfiniteGiftBoxRenderer {
  private readonly width = 1080;
  private readonly height = 1920;
  private readonly floorY = 1480;

  private readonly tableX = 635;
  private readonly tableTopY = 1215;

  private readonly captions = [
    { text: "WHAT'S INSIDE?!", from: 0.6, to: 5.75 },
    { text: "WAIT… THERE'S ANOTHER ONE?!", from: 6.45, to: 11.75 },
    { text: "WHY IS IT GETTING BIGGER?!", from: 12.45, to: 17.75 },
    { text: "I'M LIVING INSIDE A GIFT!", from: 18.45, to: 23.75 },
    { text: "I HATE SURPRISES!", from: 24.45, to: 29.85 },
  ];

  private readonly cameraKeys: CameraKey[] = [
    { t: 0.0, x: 540, y: 970, zoom: 1.0 },
    { t: 3.1, x: 545, y: 1030, zoom: 1.15 }, // Closer on Stickman + purple box
    { t: 5.8, x: 545, y: 1030, zoom: 1.15 },
    { t: 6.5, x: 575, y: 1065, zoom: 1.36 }, // Quick zoom 1: small blue box
    { t: 8.1, x: 550, y: 1070, zoom: 1.52 }, // Quick zoom 2: tiny green box
    { t: 9.7, x: 540, y: 1075, zoom: 1.68 }, // Quick zoom 3: tiny red box
    { t: 11.4, x: 525, y: 1040, zoom: 1.25 }, // Pull back on confused stare
    { t: 12.2, x: 540, y: 990, zoom: 1.02 }, // Scene 3 throw & bounce
    { t: 14.8, x: 540, y: 980, zoom: 0.96 }, // Giant red box unfolds + pushes sofa + wraps lamp
    { t: 17.8, x: 540, y: 980, zoom: 0.96 },
    { t: 18.6, x: 550, y: 980, zoom: 0.95 }, // Living room walls enclose into giant box
    { t: 20.6, x: 640, y: 1010, zoom: 1.05 }, // Stickman pulls doorway ribbon
    { t: 21.75, x: 640, y: 1010, zoom: 1.05 },
    { t: 21.85, x: 540, y: 980, zoom: 1.0 }, // Cut to exterior wide shot
    { t: 23.15, x: 540, y: 980, zoom: 1.0 },
    { t: 23.25, x: 560, y: 990, zoom: 0.98 }, // Return inside wrapped room
    { t: 24.4, x: 540, y: 950, zoom: 1.0 },  // Sees giant bow above
    { t: 25.8, x: 540, y: 975, zoom: 1.02 }, // Pulls ribbon & walls retract
    { t: 27.1, x: 540, y: 1010, zoom: 1.1 }, // Celebration & fountain launch
    { t: 28.6, x: 510, y: 1050, zoom: 1.22 }, // Beanie knocked off + angry camera stare
    { t: 30.0, x: 510, y: 1050, zoom: 1.24 },
  ];

  // Deterministic precomputed particles for Scene 5 gift explosion (110 tiny colorful boxes)
  private readonly confettiBoxes: MiniGiftParticle[] = Array.from({ length: 110 }, (_, i) => {
    const palette = [
      { box: '#ef4444', rib: '#facc15' },
      { box: '#3b82f6', rib: '#fde047' },
      { box: '#22c55e', rib: '#fef08a' },
      { box: '#a855f7', rib: '#facc15' },
      { box: '#ec4899', rib: '#ffffff' },
      { box: '#f97316', rib: '#fef08a' },
      { box: '#06b6d4', rib: '#facc15' },
    ];
    const p = palette[i % palette.length];
    const hash1 = Math.sin(i * 12.9898) * 43758.5453;
    const f1 = hash1 - Math.floor(hash1);
    const hash2 = Math.sin(i * 78.233 + 1.5) * 43758.5453;
    const f2 = hash2 - Math.floor(hash2);
    const hash3 = Math.sin(i * 41.17 + 3.1) * 43758.5453;
    const f3 = hash3 - Math.floor(hash3);

    return {
      id: i,
      vx: (f1 - 0.5) * 860,
      vy: -980 - f2 * 760,
      size: 20 + Math.floor(f3 * 18),
      color: p.box,
      ribbonColor: p.rib,
      rotSpeed: (f1 - 0.5) * 14,
      rotOffset: f2 * TAU,
      landX: 90 + f1 * 900,
    };
  });

  public render(ctx: CanvasRenderingContext2D, t: number, config: StudioConfig): void {
    const time = clamp(t, 0, 30);

    ctx.save();
    ctx.clearRect(0, 0, this.width, this.height);

    // Exterior house wide shot window (21.8s – 23.2s)
    const isExteriorShot = time >= 21.8 && time < 23.2;

    if (isExteriorShot) {
      this.drawExteriorHouseShot(ctx, time);
    } else {
      const cam = this.getCameraAt(time);
      ctx.save();
      ctx.translate(this.width / 2, this.height / 2);
      ctx.scale(cam.zoom, cam.zoom);
      ctx.translate(-cam.x, -cam.y);

      this.drawLivingRoomScene(ctx, time);

      ctx.restore();
    }

    // Burned-in captions inside Vertical Shorts safe zone
    this.drawCaptions(ctx, time);

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
        // Snap across exterior cut boundaries cleanly
        if ((a.t === 21.75 && b.t === 21.85) || (a.t === 23.15 && b.t === 23.25)) {
          return t < (a.t + b.t) * 0.5 ? a : b;
        }
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
  // COZY LIVING ROOM + SCENE CHOREOGRAPHY
  // -------------------------------------------------------------
  private drawLivingRoomScene(ctx: CanvasRenderingContext2D, t: number): void {
    // Scene 4 room-enclosure & Scene 5 reverse-fold progress
    let roomWrap = 0;
    if (t >= 18.0 && t < 24.0) {
      roomWrap = easeInOut((t - 18.0) / 1.9);
    } else if (t >= 24.0 && t < 25.3) {
      roomWrap = 1;
    } else if (t >= 25.3 && t < 26.65) {
      roomWrap = 1 - easeInOut((t - 25.3) / 1.35);
    }

    // Sofa push in Scene 3 & 4 + return in Scene 5
    let sofaShift = 0;
    if (t >= 13.8 && t < 18.0) {
      sofaShift = -165 * easeOut((t - 13.8) / 1.8);
    } else if (t >= 18.0 && t < 25.3) {
      sofaShift = lerp(-165, -240, easeInOut((t - 18.0) / 1.4));
    } else if (t >= 25.3 && t < 26.65) {
      sofaShift = lerp(-240, 0, easeInOut((t - 25.3) / 1.35));
    }

    // Lamp shift & ribbon wrap in Scene 3 & 4 + unwind in Scene 5
    let lampShift = 0;
    let lampWrapProgress = 0;
    if (t >= 15.1 && t < 18.0) {
      lampWrapProgress = smooth((t - 15.1) / 1.2);
    } else if (t >= 18.0 && t < 25.3) {
      lampWrapProgress = 1;
      lampShift = 85 * easeInOut((t - 18.0) / 1.4);
    } else if (t >= 25.3 && t < 26.65) {
      const rev = 1 - easeInOut((t - 25.3) / 1.35);
      lampWrapProgress = rev;
      lampShift = 85 * rev;
    }

    // 1. LIVING ROOM BACKGROUND WALLS & FLOOR
    ctx.fillStyle = '#fef3c7'; // Warm sunny cream wall
    ctx.fillRect(-300, 0, 1700, this.floorY);

    // Lower painted mint/teal wainscoting
    ctx.fillStyle = '#a7f3d0';
    ctx.fillRect(-300, this.floorY - 240, 1700, 240);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-300, this.floorY - 240);
    ctx.lineTo(1400, this.floorY - 240);
    ctx.stroke();

    // Living Room Window (back-left)
    this.drawWindow(ctx, 115, 370, 240, 310);

    // Framed Artwork on back wall
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.fillRect(465, 410, 210, 155);
    ctx.strokeRect(465, 410, 210, 155);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(483, 428, 174, 119);
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(530, 468, 20, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.moveTo(483, 547);
    ctx.lineTo(560, 492);
    ctx.lineTo(657, 547);
    ctx.closePath();
    ctx.fill();

    // Doorway on the right wall (Stickman tries to escape through it in Scene 4!)
    this.drawDoorway(ctx, 935, this.floorY - 620, 190, 620);

    // Wooden Floor
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-300, this.floorY, 1700, 650);
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 3;
    for (let px = -240; px < 1400; px += 120) {
      ctx.beginPath();
      ctx.moveTo(px, this.floorY);
      ctx.lineTo(px + 45, this.floorY + 500);
      ctx.stroke();
    }
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-300, this.floorY);
    ctx.lineTo(1400, this.floorY);
    ctx.stroke();

    // Cozy Patterned Oval Rug
    ctx.fillStyle = '#fb7185';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(540, this.floorY + 46, 360, 32, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // 2. ROOM ENCLOSURE GIFT-BOX WALLS (SCENE 4–5 UNFOLD & RETRACT)
    if (roomWrap > 0.01) {
      this.drawRoomGiftEnclosure(ctx, roomWrap, t);
    }

    // 3. COZY FURNITURE (Sofa, Table, Floor Lamp)
    // Sofa on left (slides backward when pushed by giant box!)
    this.drawSofa(ctx, 210 + sofaShift, this.floorY);

    // Wooden Table (shifts slightly aside during full-room enclosure, returns cleanly)
    const tableShift = roomWrap > 0 ? lerp(0, 145, roomWrap) : 0;
    const tableYOffset = roomWrap > 0.6 && t < 25.3 ? 0 : 0;
    this.drawTable(ctx, this.tableX + tableShift, this.floorY + tableYOffset);

    // Floor Lamp on right (gets wrapped by shooting golden ribbon in Scene 3!)
    const lampX = 855 + lampShift;
    const lampTilt = lampWrapProgress * -0.09;
    this.drawFloorLamp(ctx, lampX, this.floorY, lampTilt, lampWrapProgress);

    // 4. SCENE-BY-SCENE GIFT BOXES & STICKMAN
    this.drawPropsAndActors(ctx, t, lampX, sofaShift, roomWrap, lampWrapProgress);
  }

  private drawPropsAndActors(
    ctx: CanvasRenderingContext2D,
    t: number,
    lampX: number,
    sofaShift: number,
    roomWrap: number,
    lampWrapProgress: number
  ): void {
    // Determine Stickman pose & box state across 0..30s
    let pose: StickmanPose = {
      x: 410,
      y: this.floorY,
      eye: 'normal',
      brow: 'neutral',
      mouth: 'flat',
      beanieOn: true,
      facing: 1,
    };

    // -----------------------------------------------------------
    // SCENE 1 (0–6s): THE MYSTERIOUS PRESENT
    // -----------------------------------------------------------
    if (t < 6.0) {
      const boxX = this.tableX;
      const boxY = this.tableTopY;

      if (t < 1.5) {
        const u = smooth(t / 1.5);
        pose = {
          x: lerp(210, 445, u),
          y: this.floorY,
          eye: u > 0.7 ? 'star' : 'wide',
          brow: 'raised',
          mouth: u > 0.65 ? 'bigSmile' : 'o',
          walkPhase: u * 9,
          leftArmAngle: Math.sin(u * 9) * 0.45,
          rightArmAngle: -Math.sin(u * 9) * 0.45,
          beanieOn: true,
        };
      } else if (t < 3.2) {
        // Rubs hands together excitedly
        const rub = Math.sin((t - 1.5) * 16) * 0.14;
        pose = {
          x: 445,
          y: this.floorY,
          eye: 'star',
          brow: 'raised',
          mouth: 'bigSmile',
          lean: 0.08,
          leftArmAngle: -1.15 + rub,
          rightArmAngle: -1.25 - rub,
          beanieOn: true,
        };
      } else {
        // Reaches out & pulls the golden ribbon with both white mitten hands!
        const reach = smooth((t - 3.2) / 0.7);
        const pullOsc = t >= 3.9 ? Math.sin((t - 3.9) * 11) * 0.12 : 0;
        pose = {
          x: lerp(445, 475, reach) - Math.max(0, pullOsc) * 30,
          y: this.floorY,
          eye: 'happy',
          brow: 'raised',
          mouth: 'bigSmile',
          lean: lerp(0.08, 0.14, reach) - pullOsc * 0.5,
          leftArmAngle: lerp(-1.15, -1.68, reach) + pullOsc,
          rightArmAngle: lerp(-1.25, -1.52, reach) - pullOsc,
          beanieOn: true,
        };
      }

      // Draw mysterious purple box on table with glowing golden ?
      const glowPulse = 0.6 + 0.4 * Math.sin(t * 5);
      const ribbonLift = t >= 3.9 ? Math.max(0, Math.sin((t - 3.9) * 11)) * 18 : 0;
      this.drawGiftBox(ctx, boxX, boxY, 124, 108, {
        boxColor: '#9333ea',
        lidColor: '#a855f7',
        ribbonColor: '#facc15',
        questionGlow: glowPulse,
        bowLift: ribbonLift,
      });

      this.drawStickman(ctx, pose);
      return;
    }

    // -----------------------------------------------------------
    // SCENE 2 (6–12s): ANOTHER GIFT?! (Nested Blue -> Green -> Red)
    // -----------------------------------------------------------
    if (t >= 6.0 && t < 12.0) {
      const boxX = this.tableX;
      const boxY = this.tableTopY;

      // Sub-beats:
      // 6.0-7.2: Purple lid pops open, small blue box rises out
      // 7.2-8.7: Stickman holds blue box, pops blue lid open -> tiny green box
      // 8.7-10.3: Opens tiny green box -> tiny red box
      // 10.3-12.0: Confusion/annoyed stare at tiny red box
      const purpleOpen = smooth((t - 6.0) / 0.55);

      if (t < 7.2) {
        pose = {
          x: 475,
          y: this.floorY,
          eye: 'wide',
          brow: 'raised',
          mouth: 'o',
          lean: 0.1,
          leftArmAngle: -1.45,
          rightArmAngle: -1.35,
          beanieOn: true,
        };

        this.drawGiftBox(ctx, boxX, boxY, 124, 108, {
          boxColor: '#9333ea',
          lidColor: '#a855f7',
          ribbonColor: '#facc15',
          questionGlow: 0.3,
          lidOpen: purpleOpen,
        });

        // Blue box popping up out of purple box
        const rise = easeOut((t - 6.35) / 0.65);
        this.drawGiftBox(ctx, boxX, boxY - 68 - rise * 48, 76, 68, {
          boxColor: '#3b82f6',
          lidColor: '#60a5fa',
          ribbonColor: '#facc15',
        });

        this.drawStickman(ctx, pose);
      } else if (t < 8.8) {
        const blueOpen = smooth((t - 7.8) / 0.5);
        pose = {
          x: 475,
          y: this.floorY,
          eye: blueOpen > 0.4 ? 'wide' : 'happy',
          brow: blueOpen > 0.4 ? 'confused' : 'raised',
          mouth: blueOpen > 0.4 ? 'flat' : 'bigSmile',
          lean: 0.08,
          leftArmAngle: -1.32,
          rightArmAngle: -1.25,
          beanieOn: true,
        };

        // Opened purple box resting on table
        this.drawGiftBox(ctx, boxX, boxY, 124, 108, {
          boxColor: '#9333ea',
          lidColor: '#a855f7',
          ribbonColor: '#facc15',
          lidOpen: 1,
        });

        this.drawStickman(ctx, pose);

        // Held blue box in front of Stickman's mitten hands
        const heldX = 562;
        const heldY = this.floorY - 220;
        this.drawGiftBox(ctx, heldX, heldY, 76, 68, {
          boxColor: '#3b82f6',
          lidColor: '#60a5fa',
          ribbonColor: '#facc15',
          lidOpen: blueOpen,
        });

        // Tiny green box revealed inside blue box
        if (blueOpen > 0.25) {
          const gRise = easeOut((t - 8.05) / 0.55);
          this.drawGiftBox(ctx, heldX, heldY - 40 - gRise * 32, 50, 44, {
            boxColor: '#22c55e',
            lidColor: '#4ade80',
            ribbonColor: '#facc15',
          });
        }
      } else {
        // 8.8-12.0s: Opening green box -> reveals tiny red box -> confusion!
        const greenOpen = smooth((t - 9.0) / 0.5);
        const redRise = easeOut((t - 9.35) / 0.6);
        const isAngryConfused = t >= 10.4;

        pose = {
          x: 475,
          y: this.floorY,
          eye: isAngryConfused ? 'annoyed' : 'wide',
          brow: isAngryConfused ? 'angry' : 'confused',
          mouth: isAngryConfused ? 'frown' : 'flat',
          lean: 0.06,
          leftArmAngle: -1.28,
          rightArmAngle: -1.22,
          beanieOn: true,
        };

        // Purple box on table
        this.drawGiftBox(ctx, boxX, boxY, 124, 108, {
          boxColor: '#9333ea',
          lidColor: '#a855f7',
          ribbonColor: '#facc15',
          lidOpen: 1,
        });

        // Blue open box resting next to purple box on table
        this.drawGiftBox(ctx, boxX + 82, boxY, 76, 68, {
          boxColor: '#3b82f6',
          lidColor: '#60a5fa',
          ribbonColor: '#facc15',
          lidOpen: 1,
        });

        this.drawStickman(ctx, pose);

        // Held green box opening -> reveals tiny red box
        const heldX = 558;
        const heldY = this.floorY - 216;
        this.drawGiftBox(ctx, heldX, heldY, 50, 44, {
          boxColor: '#22c55e',
          lidColor: '#4ade80',
          ribbonColor: '#facc15',
          lidOpen: greenOpen,
        });

        this.drawGiftBox(ctx, heldX, heldY - 26 - redRise * 28, 34, 30, {
          boxColor: '#ef4444',
          lidColor: '#f87171',
          ribbonColor: '#facc15',
        });
      }
      return;
    }

    // -----------------------------------------------------------
    // SCENE 3 (12–18s): THE BOXES GET BIGGER!
    // -----------------------------------------------------------
    if (t >= 12.0 && t < 18.0) {
      // Purple + Blue + Green empty boxes remain visible on table
      this.drawGiftBox(ctx, this.tableX, this.tableTopY, 124, 108, {
        boxColor: '#9333ea',
        lidColor: '#a855f7',
        ribbonColor: '#facc15',
        lidOpen: 1,
      });
      this.drawGiftBox(ctx, this.tableX + 82, this.tableTopY, 76, 68, {
        boxColor: '#3b82f6',
        lidColor: '#60a5fa',
        ribbonColor: '#facc15',
        lidOpen: 1,
      });

      // Tiny red box trajectory: held (12.0-12.3) -> thrown onto floor (12.3-12.75) -> bounces once (12.75-13.25) -> expands!
      let redX = 640;
      let redY = this.floorY;
      let redW = 34;
      let redH = 30;
      let redRot = 0;
      let unfold = 0;

      if (t < 12.3) {
        // Winding up throw
        const wind = smooth((t - 12.0) / 0.3);
        pose = {
          x: 475,
          y: this.floorY,
          eye: 'wide',
          brow: 'angry',
          mouth: 'grit',
          lean: lerp(0.05, -0.18, wind),
          leftArmAngle: lerp(-1.2, 0.4, wind),
          rightArmAngle: lerp(-1.2, -2.5, wind),
          beanieOn: true,
        };
        redX = lerp(555, 430, wind);
        redY = lerp(this.floorY - 235, this.floorY - 310, wind);
      } else if (t < 12.75) {
        // Thrown downward onto floor
        const u = (t - 12.3) / 0.45;
        pose = {
          x: 475,
          y: this.floorY,
          eye: 'wide',
          brow: 'angry',
          mouth: 'grit',
          lean: lerp(-0.18, 0.22, smooth(u)),
          leftArmAngle: 0.4,
          rightArmAngle: lerp(-2.5, -0.85, easeOut(u)),
          beanieOn: true,
        };
        redX = lerp(430, 560, u);
        redY = lerp(this.floorY - 310, this.floorY, u * u);
        redRot = u * 3.8;
      } else if (t < 13.25) {
        // Visibly bounces ONCE cleanly!
        const u = (t - 12.75) / 0.5;
        const arc = Math.sin(u * Math.PI);
        pose = {
          x: 465,
          y: this.floorY,
          eye: 'wide',
          brow: 'angry',
          mouth: 'flat',
          lean: 0.1,
          leftArmAngle: 0.35,
          rightArmAngle: -0.7,
          beanieOn: true,
        };
        redX = lerp(560, 620, u);
        redY = this.floorY - arc * 135;
        redRot = 3.8 + u * 2.48;
      } else {
        // Rapid expansion! Box unfolds outward into giant red gift box
        const grow = easeInOut((t - 13.3) / 2.2);
        unfold = smooth((t - 13.3) / 0.9) * (1 - smooth((t - 15.0) / 0.8));
        redX = lerp(620, 520, grow);
        redY = this.floorY;
        redW = lerp(34, 480, grow);
        redH = lerp(30, 410, grow);

        // Stickman jumps backward in shock!
        const jumpT = clamp((t - 14.1) / 0.7, 0, 1);
        const jumpArc = Math.sin(jumpT * Math.PI);
        const stepBack = easeOut((t - 13.8) / 1.3);
        pose = {
          x: lerp(465, 225, stepBack),
          y: this.floorY - jumpArc * 125,
          eye: 'hugeShock',
          brow: 'raised',
          mouth: 'o',
          lean: lerp(0.1, -0.18, stepBack),
          leftArmAngle: lerp(0.35, 1.9, stepBack),
          rightArmAngle: lerp(-0.7, -2.0, stepBack),
          beanieOn: true,
        };
      }

      // Draw Giant Expanding Red Gift Box (with physical unfolding side flaps!)
      this.drawGiantRedBox(ctx, redX, redY, redW, redH, redRot, unfold);

      // Shoot long golden ribbon outward to wrap around the nearby floor lamp!
      if (lampWrapProgress > 0.01) {
        this.drawShootingLampRibbon(ctx, redX + redW * 0.45, this.floorY - redH * 0.55, lampX, this.floorY - 240, lampWrapProgress);
      }

      this.drawStickman(ctx, pose);
      return;
    }

    // -----------------------------------------------------------
    // SCENE 4 (18–24s): THE ENTIRE HOUSE IS A PRESENT
    // -----------------------------------------------------------
    if (t >= 18.0 && t < 24.0) {
      // Note: 21.8-23.2 is rendered by drawExteriorHouseShot above.
      // Smoothly unfold the giant red box outward into the room walls (18.0-19.3s)
      if (t < 19.3) {
        const exp = easeInOut((t - 18.0) / 1.3);
        const bw = lerp(480, 1180, exp);
        const bh = lerp(410, 1480, exp);
        const unfoldOut = Math.sin(exp * Math.PI);
        ctx.save();
        ctx.globalAlpha = 1 - smooth((t - 18.85) / 0.45);
        this.drawGiantRedBox(ctx, lerp(520, 540, exp), this.floorY, bw, bh, 0, unfoldOut);
        ctx.restore();
      }

      // Shooting ribbon still connects to lamp until room is fully wrapped
      if (lampWrapProgress > 0.01) {
        this.drawShootingLampRibbon(ctx, 760, this.floorY - 220, lampX, this.floorY - 240, lampWrapProgress);
      }

      // Giant golden ribbon blocking the doorway on the right (appears at 19.6s)
      const doorRibbonIn = smooth((t - 19.4) / 0.5);
      const tugPull = t >= 20.6 && t < 21.8 ? Math.sin((t - 20.6) * 14) * 10 : 0;
      if (doorRibbonIn > 0.01) {
        this.drawDoorwayBarrierRibbon(ctx, 935, this.floorY, doorRibbonIn, tugPull);
      }

      if (t < 19.8) {
        // Reacts in shock as room walls fold into giant red gift box
        pose = {
          x: 240,
          y: this.floorY,
          eye: 'hugeShock',
          brow: 'raised',
          mouth: 'o',
          lean: -0.1,
          leftArmAngle: 1.75,
          rightArmAngle: -1.85,
          beanieOn: true,
        };
      } else if (t < 20.6) {
        // Runs frantically toward the doorway on the right
        const run = smooth((t - 19.8) / 0.8);
        pose = {
          x: lerp(240, 815, run),
          y: this.floorY,
          eye: 'shock',
          brow: 'angry',
          mouth: 'o',
          lean: 0.18,
          walkPhase: run * 14,
          leftArmAngle: Math.sin(run * 14) * 0.7,
          rightArmAngle: -1.5,
          beanieOn: true,
        };
      } else if (t < 21.8) {
        // Grabs golden ribbon at doorway with BOTH white mitten hands and pulls hard!
        const strain = Math.sin((t - 20.6) * 16) * 0.08;
        pose = {
          x: 815 - Math.abs(strain) * 60,
          y: this.floorY,
          eye: 'angry',
          brow: 'angry',
          mouth: 'grit',
          lean: -0.24 + strain,
          leftArmAngle: -1.58,
          rightArmAngle: -1.48,
          beanieOn: true,
        };
      } else {
        // Returned inside (23.2-24.0s): defeated/furious glare inside gift-wrapped house
        pose = {
          x: 780,
          y: this.floorY,
          eye: 'annoyed',
          brow: 'angry',
          mouth: 'frown',
          lean: 0,
          crossedArms: true,
          beanieOn: true,
        };
      }

      this.drawStickman(ctx, pose);
      return;
    }

    // -----------------------------------------------------------
    // SCENE 5 (24–30s): THE WORST SURPRISE
    // -----------------------------------------------------------
    const bowY = 640;
    const looseRibbonEndX = 520;
    const looseRibbonEndY = 1040;

    // Giant golden bow & loose ribbon end visible until retraction finishes (26.55s)
    const bowScale = t < 25.3 ? 1 : 1 - easeInOut((t - 25.3) / 1.25);
    if (bowScale > 0.04) {
      const pullY = t >= 25.2 && t < 26.55 ? smooth((t - 25.2) / 0.4) * 115 : 0;
      this.drawGiantHangingBow(ctx, looseRibbonEndX, bowY + pullY * 0.4, looseRibbonEndY + pullY, bowScale);
    }

    // Doorway barrier ribbon unwinding during reverse fold
    if (t < 26.55) {
      const rev = t < 25.3 ? 1 : 1 - easeInOut((t - 25.3) / 1.25);
      this.drawDoorwayBarrierRibbon(ctx, 935, this.floorY, rev, 0);
    }

    // Lamp ribbon unwinding
    if (lampWrapProgress > 0.01) {
      this.drawShootingLampRibbon(ctx, 690, this.floorY - 210, lampX, this.floorY - 240, lampWrapProgress);
    }

    // Rapid inward fold of giant red box shrinking back onto the table (25.35-26.45s)
    if (t >= 25.35 && t < 26.55) {
      const fold = easeInOut((t - 25.35) / 1.15);
      const bx = lerp(540, this.tableX, fold);
      const by = lerp(this.floorY, this.tableTopY, fold);
      const bw = lerp(920, 124, fold);
      const bh = lerp(960, 108, fold);
      ctx.save();
      ctx.globalAlpha = t > 26.2 ? 1 - smooth((t - 26.2) / 0.35) : 1;
      this.drawGiantRedBox(ctx, bx, by, bw, bh, 0, Math.sin(fold * Math.PI) * 0.7);
      ctx.restore();
    }

    // Original Purple Box returning cleanly on the table during reverse fold!
    const purpleReturnScale = t < 26.05 ? 0 : smooth((t - 26.05) / 0.55);
    let purpleLidOpen = 0;
    let purpleShakeX = 0;

    if (t >= 27.35 && t < 27.55) {
      purpleShakeX = Math.sin((t - 27.35) * 65) * 9;
    }
    if (t >= 27.55) {
      purpleLidOpen = smooth((t - 27.55) / 0.25);
    }

    if (purpleReturnScale > 0.04) {
      ctx.save();
      ctx.translate(this.tableX + purpleShakeX, this.tableTopY);
      ctx.scale(purpleReturnScale, purpleReturnScale);
      this.drawGiftBox(ctx, 0, 0, 124, 108, {
        boxColor: '#9333ea',
        lidColor: '#a855f7',
        ribbonColor: '#facc15',
        questionGlow: t >= 26.6 ? 0.85 : 0.2,
        lidOpen: purpleLidOpen,
      });
      ctx.restore();
    }

    // Stickman acting in Scene 5
    if (t < 24.7) {
      const walk = smooth((t - 24.0) / 0.7);
      pose = {
        x: lerp(780, 495, walk),
        y: this.floorY,
        eye: 'wide',
        brow: 'raised',
        mouth: 'o',
        walkPhase: walk * 6,
        leftArmAngle: lerp(0.5, -2.3, walk),
        rightArmAngle: lerp(-0.5, -2.4, walk),
        beanieOn: true,
      };
    } else if (t < 25.2) {
      // Reaches up and grabs loose golden ribbon end with BOTH mitten hands
      const grab = smooth((t - 24.7) / 0.45);
      pose = {
        x: 495,
        y: this.floorY,
        eye: 'wide',
        brow: 'angry',
        mouth: 'grit',
        lean: 0.08,
        leftArmAngle: lerp(-2.3, -2.85, grab),
        rightArmAngle: lerp(-2.4, -2.95, grab),
        beanieOn: true,
      };
    } else if (t < 26.55) {
      // Pulls HARD downward!
      const pull = Math.sin((t - 25.2) * 15) * 0.08;
      pose = {
        x: 495,
        y: this.floorY,
        eye: 'angry',
        brow: 'angry',
        mouth: 'grit',
        lean: -0.22 + pull,
        leftArmAngle: -2.6 + pull * 1.4,
        rightArmAngle: -2.75 - pull * 1.4,
        beanieOn: true,
      };
    } else if (t < 27.5) {
      // Celebrates with BOTH arms raised!
      const bounce = Math.abs(Math.sin((t - 26.55) * 9)) * 22;
      pose = {
        x: 480,
        y: this.floorY - bounce,
        eye: 'star',
        brow: 'raised',
        mouth: 'bigSmile',
        lean: 0,
        leftArmAngle: 2.65,
        rightArmAngle: -2.65,
        beanieOn: true,
      };
    } else if (t < 28.2) {
      // Shocked as hundreds of mini gift boxes erupt upward!
      pose = {
        x: 480,
        y: this.floorY,
        eye: 'hugeShock',
        brow: 'raised',
        mouth: 'o',
        lean: -0.06,
        leftArmAngle: 1.9,
        rightArmAngle: -1.9,
        beanieOn: true,
      };
    } else {
      // 28.2s: One box bonks head & knocks off red beanie!
      // 28.6-30.0s: Crossed arms, furious stare straight at camera!
      const hitSquash = t < 28.5 ? Math.sin(((t - 28.2) / 0.3) * Math.PI) * 14 : 0;
      const knockU = clamp((t - 28.2) / 0.45, 0, 1);

      pose = {
        x: 480,
        y: this.floorY + hitSquash,
        eye: t < 28.6 ? 'shock' : 'angry',
        brow: 'angry',
        mouth: t < 28.6 ? 'o' : 'frown',
        lean: 0,
        crossedArms: t >= 28.6,
        leftArmAngle: 1.4,
        rightArmAngle: -1.4,
        beanieOn: false,
        beanieOffset: {
          x: lerp(480, 330, knockU),
          y: lerp(this.floorY - 385, this.floorY - 12, knockU * knockU) - Math.sin(knockU * Math.PI) * 110,
          angle: lerp(0, -1.95, knockU),
        },
      };
    }

    this.drawStickman(ctx, pose);

    // Draw raining mini colorful gift boxes + the head-bonker box (27.55–30.0s)
    if (t >= 27.55) {
      this.drawMiniGiftRain(ctx, t, this.tableX, this.tableTopY - 85, 480, this.floorY - 340);
    }

    // Draw knocked-off red knitted beanie lying on floor (28.2–30.0s)
    if (!pose.beanieOn && pose.beanieOffset) {
      this.drawLooseBeanie(
        ctx,
        pose.beanieOffset.x,
        pose.beanieOffset.y,
        pose.beanieOffset.angle
      );
    }
  }

  // -------------------------------------------------------------
  // SCENE 4 EXTERIOR HOUSE WIDE SHOT (21.8s – 23.2s)
  // -------------------------------------------------------------
  private drawExteriorHouseShot(ctx: CanvasRenderingContext2D, t: number): void {
    // Sunny sky background
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(0, 0, this.width, this.height);

    // Fluffy vector clouds
    this.drawCloud(ctx, 210, 290, 1.0);
    this.drawCloud(ctx, 840, 360, 0.85);

    // Sun in upper-left corner
    ctx.fillStyle = '#fde047';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(170, 195, 58, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Bright green lawn
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(0, 1340, this.width, 580);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(0, 1340);
    ctx.lineTo(this.width, 1340);
    ctx.stroke();

    // Stone path to front door
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(470, 1340);
    ctx.lineTo(610, 1340);
    ctx.lineTo(680, 1920);
    ctx.lineTo(400, 1920);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Subtle cartoon house-rattle while Stickman tugs inside!
    const shakeX = Math.sin(t * 28) * 5;
    const shakeY = Math.abs(Math.cos(t * 22)) * 3;

    ctx.save();
    ctx.translate(540 + shakeX, 1340 - shakeY);

    // House body COMPLETELY WRAPPED AS A RED GIFT BOX!
    const hw = 640;
    const hh = 470;
    ctx.fillStyle = '#ef4444';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 9;
    this.roundRect(ctx, -hw / 2, -hh, hw, hh, 16);
    ctx.fill();
    ctx.stroke();

    // Subtle house outline details under wrapping (windows + door silhouette)
    ctx.fillStyle = '#dc2626';
    this.roundRect(ctx, -230, -340, 110, 110, 8);
    ctx.fill();
    ctx.stroke();
    this.roundRect(ctx, 120, -340, 110, 110, 8);
    ctx.fill();
    ctx.stroke();

    // House Roof wrapped in red box lid
    ctx.fillStyle = '#f87171';
    ctx.beginPath();
    ctx.moveTo(-hw / 2 - 40, -hh);
    ctx.lineTo(0, -hh - 210);
    ctx.lineTo(hw / 2 + 40, -hh);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Gigantic Golden Ribbon wrapping the entire house!
    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 7;
    // Vertical ribbon
    ctx.fillRect(-52, -hh - 172, 104, hh + 172);
    ctx.strokeRect(-52, -hh - 172, 104, hh + 172);
    // Horizontal ribbon
    ctx.fillRect(-hw / 2, -hh * 0.52, hw, 84);
    ctx.strokeRect(-hw / 2, -hh * 0.52, hw, 84);

    // Enormous Golden Bow on top of the roof!
    this.drawBow(ctx, 0, -hh - 205, 2.35, '#facc15');

    // Comic impact lines around shaking house
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    for (const dir of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(dir * 380, -320);
      ctx.lineTo(dir * 435, -345);
      ctx.moveTo(dir * 390, -240);
      ctx.lineTo(dir * 450, -240);
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(-48, 12, 34, 0, TAU);
    ctx.arc(0, -6, 46, 0, TAU);
    ctx.arc(52, 12, 34, 0, TAU);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillRect(-52, 6, 106, 40);
    ctx.restore();
  }

  // -------------------------------------------------------------
  // LIVING ROOM PROP RENDERING
  // -------------------------------------------------------------
  private drawWindow(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
    ctx.fillStyle = '#7dd3fc';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);

    // Fluffy white cloud visible through window
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x + 85, y + 110, 32, 0, TAU);
    ctx.arc(x + 125, y + 98, 38, 0, TAU);
    ctx.arc(x + 165, y + 112, 28, 0, TAU);
    ctx.fill();

    // Window frame mullions
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 10;
    ctx.strokeRect(x + 5, y + 5, w - 10, h - 10);
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y);
    ctx.lineTo(x + w / 2, y + h);
    ctx.moveTo(x, y + h / 2);
    ctx.lineTo(x + w, y + h / 2);
    ctx.stroke();
  }

  private drawDoorway(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
    // Open hallway glimpse
    ctx.fillStyle = '#cbd5e1';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);

    // Wooden door frame
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 14;
    ctx.strokeRect(x - 6, y - 6, w + 12, h + 6);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;
    ctx.strokeRect(x - 13, y - 13, w + 26, h + 13);
  }

  private drawSofa(ctx: CanvasRenderingContext2D, cx: number, floorY: number): void {
    ctx.save();
    ctx.translate(cx, floorY);

    ctx.fillStyle = '#0ea5e9'; // Cheerful teal/blue sofa
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;

    // Backrest
    this.roundRect(ctx, -145, -245, 290, 130, 22);
    ctx.fill();
    ctx.stroke();

    // Seat cushions
    this.roundRect(ctx, -155, -135, 310, 90, 18);
    ctx.fill();
    ctx.stroke();

    // Left & right armrests
    ctx.fillStyle = '#0284c7';
    this.roundRect(ctx, -168, -175, 48, 135, 16);
    ctx.fill();
    ctx.stroke();
    this.roundRect(ctx, 120, -175, 48, 135, 16);
    ctx.fill();
    ctx.stroke();

    // Wooden sofa legs
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-130, -45, 24, 45);
    ctx.strokeRect(-130, -45, 24, 45);
    ctx.fillRect(106, -45, 24, 45);
    ctx.strokeRect(106, -45, 24, 45);

    ctx.restore();
  }

  private drawTable(ctx: CanvasRenderingContext2D, cx: number, floorY: number): void {
    ctx.save();
    ctx.translate(cx, floorY);
    const topY = this.tableTopY - floorY;

    ctx.fillStyle = '#b45309';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;

    // Legs
    ctx.fillRect(-115, topY + 28, 24, -topY - 28);
    ctx.strokeRect(-115, topY + 28, 24, -topY - 28);
    ctx.fillRect(91, topY + 28, 24, -topY - 28);
    ctx.strokeRect(91, topY + 28, 24, -topY - 28);

    // Table top
    ctx.fillStyle = '#d97706';
    this.roundRect(ctx, -145, topY, 290, 34, 10);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  private drawFloorLamp(
    ctx: CanvasRenderingContext2D,
    x: number,
    floorY: number,
    tilt: number,
    wrapProgress: number
  ): void {
    ctx.save();
    ctx.translate(x, floorY);
    ctx.rotate(tilt);

    // Base
    ctx.fillStyle = '#475569';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;
    this.roundRect(ctx, -45, -22, 90, 22, 10);
    ctx.fill();
    ctx.stroke();

    // Tall pole
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-9, -470, 18, 448);
    ctx.strokeRect(-9, -470, 18, 448);

    // Cozy warm light glow
    ctx.fillStyle = 'rgba(253, 224, 71, 0.25)';
    ctx.beginPath();
    ctx.moveTo(-45, -445);
    ctx.lineTo(45, -445);
    ctx.lineTo(130, -180);
    ctx.lineTo(-130, -180);
    ctx.closePath();
    ctx.fill();

    // Lampshade
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.moveTo(-64, -445);
    ctx.lineTo(-42, -555);
    ctx.lineTo(42, -555);
    ctx.lineTo(64, -445);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Golden ribbon coils wrapped visibly around the lamp pole!
    if (wrapProgress > 0.25) {
      const coilScale = clamp((wrapProgress - 0.25) / 0.75, 0, 1);
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      for (let i = 0; i < 4; i++) {
        const cy = -215 - i * 32;
        ctx.save();
        ctx.translate(0, cy);
        ctx.scale(coilScale, 1);
        this.roundRect(ctx, -26, -9, 52, 18, 8);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    }

    ctx.restore();
  }

  // -------------------------------------------------------------
  // GIFT BOXES, UNFOLDS, RIBBONS & MINI GIFT FOUNTAIN
  // -------------------------------------------------------------
  private drawGiftBox(
    ctx: CanvasRenderingContext2D,
    cx: number,
    bottomY: number,
    w: number,
    h: number,
    opts: {
      boxColor: string;
      lidColor: string;
      ribbonColor: string;
      questionGlow?: number;
      lidOpen?: number;
      bowLift?: number;
    }
  ): void {
    ctx.save();
    ctx.translate(cx, bottomY);

    const lidH = Math.max(16, h * 0.24);
    const bodyH = h - lidH * 0.65;
    const ribW = Math.max(10, w * 0.18);

    // Subtle ground shadow
    ctx.fillStyle = 'rgba(0,0,0,0.16)';
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.52, 10, 0, 0, TAU);
    ctx.fill();

    // Box main body
    ctx.fillStyle = opts.boxColor;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = clamp(w * 0.055, 3.5, 6.5);
    this.roundRect(ctx, -w / 2, -bodyH, w, bodyH, 8);
    ctx.fill();
    ctx.stroke();

    // Dark interior gap when lid is opened
    if (opts.lidOpen && opts.lidOpen > 0.05) {
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(-w * 0.44, -bodyH, w * 0.88, 12 * opts.lidOpen);
    }

    // Vertical Golden Ribbon on body
    ctx.fillStyle = opts.ribbonColor;
    ctx.fillRect(-ribW / 2, -bodyH, ribW, bodyH);
    ctx.strokeRect(-ribW / 2, -bodyH, ribW, bodyH);

    // Horizontal Golden Ribbon on body
    ctx.fillRect(-w / 2, -bodyH * 0.56, w, ribW * 0.8);
    ctx.strokeRect(-w / 2, -bodyH * 0.56, w, ribW * 0.8);

    // Glowing Golden Question Mark on original purple box
    if (opts.questionGlow && opts.questionGlow > 0.05) {
      ctx.save();
      ctx.translate(0, -bodyH * 0.48);
      ctx.fillStyle = `rgba(253, 224, 71, ${0.42 * opts.questionGlow})`;
      ctx.beginPath();
      ctx.arc(0, 0, w * 0.24, 0, TAU);
      ctx.fill();

      ctx.font = `900 ${Math.round(w * 0.42)}px "Plus Jakarta Sans", system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 6;
      ctx.strokeText('?', 0, 2);
      ctx.fillStyle = '#fde047';
      ctx.fillText('?', 0, 2);
      ctx.restore();
    }

    // Lid (hinged open upward/left when lidOpen > 0)
    const open = opts.lidOpen ?? 0;
    const lift = opts.bowLift ?? 0;
    ctx.save();
    ctx.translate(-w / 2 - 4, -bodyH);
    ctx.rotate(-open * 1.15);
    ctx.translate(w / 2 + 4, -lift * 0.4);

    ctx.fillStyle = opts.lidColor;
    this.roundRect(ctx, -w / 2 - 6, -lidH, w + 12, lidH, 7);
    ctx.fill();
    ctx.stroke();

    // Ribbon strip across lid
    ctx.fillStyle = opts.ribbonColor;
    ctx.fillRect(-ribW / 2, -lidH, ribW, lidH);
    ctx.strokeRect(-ribW / 2, -lidH, ribW, lidH);

    // Golden Bow on top of lid
    this.drawBow(ctx, 0, -lidH - lift * 0.5, w / 120, opts.ribbonColor);

    ctx.restore();
    ctx.restore();
  }

  private drawGiantRedBox(
    ctx: CanvasRenderingContext2D,
    cx: number,
    bottomY: number,
    w: number,
    h: number,
    rot: number,
    unfold: number
  ): void {
    ctx.save();
    ctx.translate(cx, bottomY);
    if (rot) ctx.rotate(rot);

    // Unfolding cardboard flaps on left/right sides during expansion!
    if (unfold > 0.02) {
      ctx.fillStyle = '#dc2626';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 6;
      for (const side of [-1, 1]) {
        ctx.save();
        ctx.translate(side * w * 0.5, -h * 0.5);
        ctx.rotate(side * unfold * 0.85);
        this.roundRect(ctx, side > 0 ? 0 : -w * 0.25, -h * 0.42, w * 0.25, h * 0.84, 8);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    }

    this.drawGiftBox(ctx, 0, 0, w, h, {
      boxColor: '#ef4444',
      lidColor: '#f87171',
      ribbonColor: '#facc15',
    });

    ctx.restore();
  }

  private drawShootingLampRibbon(
    ctx: CanvasRenderingContext2D,
    sx: number,
    sy: number,
    tx: number,
    ty: number,
    progress: number
  ): void {
    const u = clamp(progress, 0, 1);
    const curX = lerp(sx, tx, u);
    const curY = lerp(sy, ty, u) - Math.sin(u * Math.PI) * 70;

    ctx.save();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 24;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo((sx + curX) * 0.5, Math.min(sy, curY) - 95, curX, curY);
    ctx.stroke();

    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo((sx + curX) * 0.5, Math.min(sy, curY) - 95, curX, curY);
    ctx.stroke();
    ctx.restore();
  }

  private drawRoomGiftEnclosure(ctx: CanvasRenderingContext2D, progress: number, t: number): void {
    ctx.save();
    const wallW = lerp(0, 310, progress);
    const roofH = lerp(0, 260, progress);

    // Unfolding giant red cardboard gift walls on left & right of living room
    ctx.fillStyle = '#ef4444';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 7;

    // Left unfolding wall
    ctx.fillRect(-300, 0, wallW + 300, this.floorY);
    ctx.strokeRect(-300, 0, wallW + 300, this.floorY);

    // Right unfolding wall framing doorway
    ctx.fillRect(this.width - wallW * 0.55, 0, wallW + 400, this.floorY);
    ctx.strokeRect(this.width - wallW * 0.55, 0, wallW + 400, this.floorY);

    // Giant Red Gift Lid Ceiling unfolding downward
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-300, 0, 1700, roofH);
    ctx.strokeRect(-300, 0, 1700, roofH);

    // Gigantic Golden Ribbons crisscrossing the wrapped living room!
    if (progress > 0.25) {
      const rScale = clamp((progress - 0.25) / 0.75, 0, 1);
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 6;

      // Vertical room ribbon band
      ctx.fillRect(540 - 42 * rScale, 0, 84 * rScale, roofH + 90 * rScale);
      ctx.strokeRect(540 - 42 * rScale, 0, 84 * rScale, roofH + 90 * rScale);

      // Horizontal golden ribbon band along upper wall
      ctx.fillRect(-300, roofH - 55, 1700, 55 * rScale);
      ctx.strokeRect(-300, roofH - 55, 1700, 55 * rScale);

      // Diagonal side ribbons wrapping room corners
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 42 * rScale;
      ctx.beginPath();
      ctx.moveTo(0, roofH);
      ctx.lineTo(wallW * 0.8, this.floorY);
      ctx.stroke();
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 28 * rScale;
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawDoorwayBarrierRibbon(
    ctx: CanvasRenderingContext2D,
    doorX: number,
    floorY: number,
    progress: number,
    tugOffset: number
  ): void {
    ctx.save();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 38 * progress;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(doorX - 10, floorY - 610);
    ctx.quadraticCurveTo(doorX + 30 + tugOffset, floorY - 310, doorX + 140, floorY - 120);
    ctx.stroke();

    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 24 * progress;
    ctx.stroke();

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 34 * progress;
    ctx.beginPath();
    ctx.moveTo(doorX - 20, floorY - 260);
    ctx.quadraticCurveTo(doorX + 10 + tugOffset, floorY - 340, doorX + 170, floorY - 460);
    ctx.stroke();

    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 20 * progress;
    ctx.stroke();
    ctx.restore();
  }

  private drawGiantHangingBow(
    ctx: CanvasRenderingContext2D,
    x: number,
    bowY: number,
    endY: number,
    scale: number
  ): void {
    ctx.save();
    ctx.translate(x, bowY);
    ctx.scale(scale, scale);

    // Loose dangling ribbon tail Stickman grabs and pulls!
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 30;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 20);
    ctx.quadraticCurveTo(-24, (endY - bowY) * 0.5, 0, endY - bowY);
    ctx.stroke();

    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 18;
    ctx.stroke();

    // Giant golden bow above
    this.drawBow(ctx, 0, 0, 2.2, '#facc15');
    ctx.restore();
  }

  private drawBow(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    scale: number,
    color: string
  ): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = color;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;

    // Left loop
    ctx.beginPath();
    ctx.ellipse(-28, -14, 28, 16, -0.35, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Right loop
    ctx.beginPath();
    ctx.ellipse(28, -14, 28, 16, 0.35, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Center knot
    ctx.beginPath();
    ctx.arc(0, -10, 12, 0, TAU);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  private drawMiniGiftRain(
    ctx: CanvasRenderingContext2D,
    t: number,
    originX: number,
    originY: number,
    headX: number,
    headTopY: number
  ): void {
    const dt = t - 27.55;
    if (dt < 0) return;

    const g = 2100;

    // Draw 109 colorful gift boxes raining and settling on the floor
    for (const p of this.confettiBoxes) {
      let x = originX + p.vx * dt;
      let y = originY + p.vy * dt + 0.5 * g * dt * dt;
      let rot = p.rotOffset + p.rotSpeed * dt;

      if (y >= this.floorY) {
        y = this.floorY;
        rot = (p.id % 5 - 2) * 0.14;
      }
      x = clamp(x, 60, 1020);

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      this.drawGiftBox(ctx, 0, 0, p.size, p.size * 0.9, {
        boxColor: p.color,
        lidColor: p.color,
        ribbonColor: p.ribbonColor,
      });
      ctx.restore();
    }

    // Special head-bonker gift box (lands squarely on Stickman's head at 28.2s -> bounces onto floor!)
    const hitTime = 28.2;
    let hx = lerp(originX, headX, clamp(dt / 0.65, 0, 1));
    let hy: number;
    let hrot = dt * 6;
    if (t < hitTime) {
      const u = dt / 0.65;
      hy = lerp(originY, headTopY, u) - Math.sin(u * Math.PI) * 520;
    } else if (t < 28.8) {
      const bU = (t - hitTime) / 0.6;
      hx = lerp(headX, headX + 115, bU);
      hy = lerp(headTopY, this.floorY, bU * bU) - Math.sin(bU * Math.PI) * 140;
      hrot = 4.0 + bU * 3.2;
    } else {
      hx = headX + 115;
      hy = this.floorY;
      hrot = 0.15;
    }

    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(hrot);
    this.drawGiftBox(ctx, 0, 0, 56, 50, {
      boxColor: '#ef4444',
      lidColor: '#f87171',
      ribbonColor: '#facc15',
    });
    ctx.restore();
  }

  // -------------------------------------------------------------
  // STRICT MAIN CHARACTER RIG — ANGRY STICKMAN (100% CONSISTENT)
  // -------------------------------------------------------------
  private drawStickman(ctx: CanvasRenderingContext2D, p: StickmanPose): void {
    ctx.save();
    ctx.translate(p.x, p.y);
    if (p.lean) ctx.rotate(p.lean);
    if (p.facing === -1) ctx.scale(-1, 1);

    // Exact proportions matching ~40% circular head height:
    // legLen = 148, torsoH = 88, headR = 92 (diameter = 184px; total height ~450px)
    const legLen = 148;
    const torsoH = 88;
    const torsoW = 58;
    const headR = 92;

    const hipY = -legLen;
    const torsoTopY = hipY - torsoH;
    const headCY = torsoTopY - headR + 10;

    // Ground drop shadow
    ctx.fillStyle = 'rgba(0,0,0,0.16)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 62, 16, 0, 0, TAU);
    ctx.fill();

    // 1. LEGS, BLUE TROUSERS, AND ROUNDED SOLID-BLACK SHOES
    const walk = p.walkPhase ?? 0;
    const lAngle = Math.sin(walk) * 0.52;
    const rAngle = -Math.sin(walk) * 0.52;
    this.drawLeg(ctx, -22, hipY, legLen, lAngle);
    this.drawLeg(ctx, 22, hipY, legLen, rAngle);

    // 2. SMALL COMPACT TORSO — BRIGHT YELLOW PLAIN T-SHIRT (NO LOGOS/PATTERNS)
    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 7;
    this.roundRect(ctx, -torsoW / 2, torsoTopY, torsoW, torsoH, 18);
    ctx.fill();
    ctx.stroke();

    // Short sleeves connected directly
    this.roundRect(ctx, -torsoW / 2 - 20, torsoTopY + 6, 30, 44, 10);
    ctx.fill();
    ctx.stroke();
    this.roundRect(ctx, torsoW / 2 - 10, torsoTopY + 6, 30, 44, 10);
    ctx.fill();
    ctx.stroke();

    // 3. THIN BLACK ARMS + CONNECTED WHITE ROUNDED MITTEN HANDS
    const leftAngle = p.crossedArms ? 0.55 : (p.leftArmAngle ?? 0.35);
    const rightAngle = p.crossedArms ? -0.55 : (p.rightArmAngle ?? -0.35);

    this.drawStickmanArm(ctx, -torsoW / 2 - 5, torsoTopY + 38, leftAngle, 'left', p.crossedArms);
    this.drawStickmanArm(ctx, torsoW / 2 + 5, torsoTopY + 38, rightAngle, 'right', p.crossedArms);

    // 4. LARGE CIRCULAR WHITE HEAD (~40% total character height)
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(0, headCY, headR, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // 5. BRIGHT RED KNITTED BEANIE (when still on head)
    if (p.beanieOn !== false) {
      this.drawBeanie(ctx, 0, headCY - headR * 0.65, headR, 0);
    }

    // 6. EXPRESSIVE FACE (NO NOSE, NO EARS, NO HAIR)
    this.drawStickmanFace(ctx, 0, headCY, p.eye, p.brow, p.mouth);

    ctx.restore();
  }

  private drawBeanie(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    headR: number,
    angle: number
  ): void {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // Rounded top dome
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

    // Knitted ribbing
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3.5;
    for (let rx = -headR * 0.78; rx <= headR * 0.78; rx += 19) {
      ctx.beginPath();
      ctx.moveTo(rx, -32);
      ctx.lineTo(rx, 4);
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawLooseBeanie(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number): void {
    this.drawBeanie(ctx, x, y, 92, angle);
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

    // Thin black leg
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

    // Thin black stick arm connected directly to yellow sleeve
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, armLen);
    ctx.stroke();

    // White rounded mitten hand connected directly to wrist (zero gap!)
    ctx.save();
    ctx.translate(0, armLen);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5.5;
    ctx.beginPath();
    ctx.arc(0, 12, 17, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Inner mitten thumb bump
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
    } else if (brow === 'confused') {
      ctx.beginPath();
      ctx.arc(cx - eyeDist, browY - 7, 19, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + eyeDist - 18, browY + 6);
      ctx.lineTo(cx + eyeDist + 18, browY - 4);
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

    // Two small vertical black oval eyes
    ctx.fillStyle = '#000000';
    if (eye === 'normal' || eye === 'angry') {
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
  // BURNED-IN POP CAPTIONS (SHORTS SAFE AREA: x 80..1000, y 200..1660)
  // -------------------------------------------------------------
  private drawCaptions(ctx: CanvasRenderingContext2D, t: number): void {
    const caption = this.captions.find((c) => t >= c.from && t <= c.to);
    if (!caption) return;

    const popIn = clamp((t - caption.from) / 0.16, 0, 1);
    const popOut = clamp((caption.to - t) / 0.2, 0, 1);
    const scale = easeOut(popIn) * easeOut(popOut);

    ctx.save();
    // Placed inside the Shorts safe area above bottom UI overlay
    ctx.translate(this.width / 2, 1600);
    ctx.scale(scale, scale);

    ctx.font = '900 48px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 16;
    ctx.strokeText(caption.text, 0, 0, 880);

    ctx.fillStyle = '#facc15';
    ctx.fillText(caption.text, 0, 0, 880);
    ctx.restore();
  }

  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ): void {
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
