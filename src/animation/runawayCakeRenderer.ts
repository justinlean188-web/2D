import { StudioConfig } from '../types';

/**
 * RunawayCakeRenderer
 *
 * "THE RUNAWAY BIRTHDAY CAKE 🎂😂"
 * 30-Second 2D Animated YouTube Short
 *
 * Visual Style:
 * Modern Pop 2D flat vector cartoon animation.
 * Vertical 9:16 (1080×1920), 24 FPS.
 * Solid vibrant colors, clean shapes, thick smooth black outlines,
 * expressive cartoon character animation and physical comedy.
 *
 * Scenes:
 * Scene 1 (0–6s):  THE BIRTHDAY SURPRISE   "FINALLY… MY BIRTHDAY CAKE!"
 * Scene 2 (6–12s): THE CAKE RUNS AWAY      "HEY! GET BACK HERE!"
 * Scene 3 (12–18s): THE FROSTING TRAP      "I'M GONNA GET YOU!"
 * Scene 4 (18–24s): THE PERFECT AMBUSH     "GOTCHA—WAIT… WHAT?!"
 * Scene 5 (24–30s): THE BIRTHDAY EXPLOSION "THIS IS THE WORST BIRTHDAY EVER!"
 */

interface Vec {
  x: number;
  y: number;
}

interface CameraKey {
  t: number;
  x: number;
  y: number;
  zoom: number;
}

const TAU = Math.PI * 2;
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const smooth = (u: number) => {
  const c = clamp(u, 0, 1);
  return c * c * (3 - 2 * c);
};
const easeOut = (u: number) => 1 - Math.pow(1 - clamp(u, 0, 1), 2);
const easeIn = (u: number) => Math.pow(clamp(u, 0, 1), 2);
const bump = (u: number) => Math.sin(clamp(u, 0, 1) * Math.PI);

export class RunawayCakeRenderer {
  public readonly width = 1080;
  public readonly height = 1920;

  // World geometry
  private readonly floorY = 1460;
  private readonly ceilingY = 180;

  // Captions for each beat
  private readonly captions = [
    { text: 'FINALLY… MY BIRTHDAY CAKE!', from: 0.6, to: 5.6 },
    { text: 'HEY! GET BACK HERE!', from: 6.6, to: 11.6 },
    { text: "I'M GONNA GET YOU!", from: 12.4, to: 17.5 },
    { text: 'GOTCHA—WAIT… WHAT?!', from: 18.5, to: 23.5 },
    { text: 'THIS IS THE WORST BIRTHDAY EVER!', from: 24.6, to: 29.8 },
  ];

  // Camera tracking keys
  private readonly cameraKeys: CameraKey[] = [
    { t: 0.0, x: 540, y: 960, zoom: 1.0 },
    { t: 2.2, x: 540, y: 960, zoom: 1.05 },
    { t: 3.8, x: 500, y: 980, zoom: 1.15 },
    { t: 4.8, x: 520, y: 1040, zoom: 1.35 }, // Zoom in on cake's tiny legs wiggling
    { t: 6.0, x: 540, y: 980, zoom: 1.05 },  // Cake jumps off table
    { t: 7.0, x: 560, y: 1040, zoom: 1.08 }, // Follow run
    { t: 9.5, x: 620, y: 1040, zoom: 1.12 }, // Side tracking
    { t: 11.8, x: 540, y: 1000, zoom: 1.0 }, // Kitchen arrival
    { t: 12.6, x: 520, y: 1040, zoom: 1.05 },// Frosting slide start
    { t: 14.5, x: 640, y: 1060, zoom: 1.12 },// Stickman spinning
    { t: 16.2, x: 740, y: 1060, zoom: 1.25 },// Cushion crash close-up
    { t: 17.8, x: 680, y: 1040, zoom: 1.15 },// Dizzy stickman
    { t: 18.5, x: 500, y: 1000, zoom: 1.05 },// Ambush sneak
    { t: 21.0, x: 440, y: 1020, zoom: 1.12 },// Sneaking to chair
    { t: 22.3, x: 430, y: 910, zoom: 1.22 }, // Cake lands on head
    { t: 23.8, x: 430, y: 910, zoom: 1.22 }, // Shocked pause
    { t: 24.5, x: 540, y: 930, zoom: 1.05 }, // Confetti explosion wide
    { t: 26.0, x: 540, y: 980, zoom: 1.12 }, // Cupcake dance
    { t: 27.4, x: 500, y: 1020, zoom: 1.25 },// Cupcake offers slice
    { t: 28.2, x: 500, y: 1020, zoom: 1.3 }, // Cupcake chomps slice
    { t: 28.8, x: 540, y: 950, zoom: 1.4 },  // Dramatic zoom on angry face!
    { t: 30.0, x: 540, y: 950, zoom: 1.45 },
  ];

  public render(ctx: CanvasRenderingContext2D, t: number, config: StudioConfig): void {
    const time = clamp(t, 0, 30);

    ctx.save();
    ctx.clearRect(0, 0, this.width, this.height);

    // Apply Camera
    const cam = this.getCameraAt(time);
    ctx.save();
    ctx.translate(this.width / 2, this.height / 2);
    ctx.scale(cam.zoom, cam.zoom);
    ctx.translate(-cam.x, -cam.y);

    // Draw Background & Environment
    this.drawEnvironment(ctx, time);

    // Draw Props & Actors based on timeline
    this.drawSceneAction(ctx, time);

    ctx.restore();

    // Draw Overlays: Burned-in Pop Captions
    this.drawCaptions(ctx, time);

    // Optional safe zone guide
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
  // ENVIRONMENT DRAWING
  // -------------------------------------------------------------
  private drawEnvironment(ctx: CanvasRenderingContext2D, t: number): void {
    const isKitchen = t >= 11.5 && t < 24.0;
    const transition = t >= 11.0 && t <= 12.0 ? (t - 11.0) : (t >= 23.5 && t <= 24.5 ? 1 - (t - 23.5) : (isKitchen ? 1 : 0));

    // Walls
    if (transition <= 0) {
      // Scene 1, 2, 5: Festive Living Room
      this.drawLivingRoom(ctx, t);
    } else if (transition >= 1) {
      // Scene 3, 4: Kitchen
      this.drawKitchen(ctx, t);
    } else {
      // Blend/cross-fade between spaces
      ctx.save();
      ctx.globalAlpha = 1 - transition;
      this.drawLivingRoom(ctx, t);
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = transition;
      this.drawKitchen(ctx, t);
      ctx.restore();
    }
  }

  private drawLivingRoom(ctx: CanvasRenderingContext2D, t: number): void {
    // Pastel festive cream/amber wall
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(-200, 0, 1480, this.floorY);

    // Skirting board
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(-200, this.floorY - 45, 1480, 45);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-200, this.floorY - 45);
    ctx.lineTo(1280, this.floorY - 45);
    ctx.stroke();

    // Wooden parquet floor
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-200, this.floorY, 1480, 500);

    // Floor planks
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 3;
    for (let x = -180; x < 1280; x += 110) {
      ctx.beginPath();
      ctx.moveTo(x, this.floorY);
      ctx.lineTo(x + 60, this.height);
      ctx.stroke();
    }

    // Floor boundary line
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(-200, this.floorY);
    ctx.lineTo(1280, this.floorY);
    ctx.stroke();

    // Large Window with blue sky and cartoon clouds
    const winX = 660;
    const winY = 360;
    const winW = 320;
    const winH = 440;

    // Window frame outer
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 8;
    ctx.fillRect(winX, winY, winW, winH);
    ctx.strokeRect(winX, winY, winW, winH);

    // Window interior sky
    ctx.save();
    ctx.beginPath();
    ctx.rect(winX + 10, winY + 10, winW - 20, winH - 20);
    ctx.clip();
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(winX, winY, winW, winH);

    // Warm sun
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(winX + 70, winY + 80, 46, 0, TAU);
    ctx.fill();

    // Fluffy cloud floating
    const cloudShift = Math.sin(t * 0.8) * 15;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(winX + 180 + cloudShift, winY + 120, 36, 0, TAU);
    ctx.arc(winX + 220 + cloudShift, winY + 110, 44, 0, TAU);
    ctx.arc(winX + 260 + cloudShift, winY + 124, 34, 0, TAU);
    ctx.fill();

    // Window panes cross
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(winX + winW / 2, winY);
    ctx.lineTo(winX + winW / 2, winY + winH);
    ctx.moveTo(winX, winY + winH * 0.45);
    ctx.lineTo(winX + winW, winY + winH * 0.45);
    ctx.stroke();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();

    // Party Bunting (triangular colorful flags)
    const buntingY = 240;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-50, buntingY);
    ctx.quadraticCurveTo(540, buntingY + 90, 1130, buntingY);
    ctx.stroke();

    const flagColors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
    const flagCount = 14;
    for (let i = 0; i < flagCount; i++) {
      const u = i / (flagCount - 1);
      const fx = lerp(-20, 1100, u);
      const fy = buntingY + Math.sin(u * Math.PI) * 90;
      const angle = (Math.sin(t * 2 + i) * 0.08);

      ctx.save();
      ctx.translate(fx, fy);
      ctx.rotate(angle);
      ctx.fillStyle = flagColors[i % flagColors.length];
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-22, 0);
      ctx.lineTo(22, 0);
      ctx.lineTo(0, 52);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Floating Birthday Balloons tethered to table or wall
    this.drawBalloons(ctx, t, 190, 680);
    this.drawBalloons(ctx, t + 1.2, 880, 710);

    // Wooden table (Scene 1 & 2)
    if (t < 11.5 || t > 23.5) {
      this.drawWoodenTable(ctx, 540, 1140);
    }
  }

  private drawKitchen(ctx: CanvasRenderingContext2D, t: number): void {
    // Cheerful mint/cyan kitchen wall
    ctx.fillStyle = '#cffafe';
    ctx.fillRect(-200, 0, 1480, this.floorY);

    // Kitchen tiles pattern
    ctx.strokeStyle = '#a5f3fc';
    ctx.lineWidth = 2;
    for (let y = 300; y < this.floorY; y += 80) {
      ctx.beginPath();
      ctx.moveTo(-200, y);
      ctx.lineTo(1280, y);
      ctx.stroke();
    }
    for (let x = -160; x < 1280; x += 80) {
      ctx.beginPath();
      ctx.moveTo(x, 300);
      ctx.lineTo(x, this.floorY);
      ctx.stroke();
    }

    // Tiled kitchen floor (checkerboard pastel tiles)
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(-200, this.floorY, 1480, 500);

    ctx.fillStyle = '#cbd5e1';
    for (let row = 0; row < 5; row++) {
      for (let col = -3; col < 14; col++) {
        if ((row + col) % 2 === 0) {
          ctx.fillRect(col * 110, this.floorY + row * 85, 110, 85);
        }
      }
    }

    // Floor boundary
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(-200, this.floorY);
    ctx.lineTo(1280, this.floorY);
    ctx.stroke();

    // Refrigerator
    this.drawRefrigerator(ctx, 720, 820);

    // Kitchen chair (Scene 4)
    this.drawKitchenChair(ctx, 230, 1200);

    // Soft pile of cushions (Scene 3 & 4)
    this.drawCushionPile(ctx, 890, 1370, t >= 15.6 && t < 18.0);
  }

  private drawBalloons(ctx: CanvasRenderingContext2D, t: number, baseX: number, baseY: number): void {
    const balloons = [
      { dx: -38, dy: -180, color: '#f43f5e', r: 42, sway: 0.8 },
      { dx: 22, dy: -230, color: '#38bdf8', r: 46, sway: 1.1 },
      { dx: -12, dy: -280, color: '#facc15', r: 40, sway: 0.9 },
    ];

    for (const b of balloons) {
      const bob = Math.sin(t * 2 + b.sway) * 12;
      const sway = Math.cos(t * 1.5 + b.sway) * 10;
      const bx = baseX + b.dx + sway;
      const by = baseY + b.dy + bob;

      // String
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(baseX, baseY);
      ctx.quadraticCurveTo(baseX + sway * 0.4, baseY + b.dy * 0.5, bx, by + b.r * 1.1);
      ctx.stroke();

      // Balloon body
      ctx.save();
      ctx.translate(bx, by);
      ctx.fillStyle = b.color;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.ellipse(0, 0, b.r, b.r * 1.25, 0, 0, TAU);
      ctx.fill();
      ctx.stroke();

      // Tie knot
      ctx.beginPath();
      ctx.moveTo(-6, b.r * 1.22);
      ctx.lineTo(6, b.r * 1.22);
      ctx.lineTo(0, b.r * 1.34);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Gloss highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.beginPath();
      ctx.ellipse(-b.r * 0.35, -b.r * 0.45, b.r * 0.22, b.r * 0.38, -0.3, 0, TAU);
      ctx.fill();

      ctx.restore();
    }
  }

  private drawWoodenTable(ctx: CanvasRenderingContext2D, cx: number, topY: number): void {
    const w = 560;
    const h = 42;
    const x = cx - w / 2;

    // Table shadow on floor
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.beginPath();
    ctx.ellipse(cx, this.floorY + 8, w * 0.52, 28, 0, 0, TAU);
    ctx.fill();

    // Legs
    ctx.fillStyle = '#b45309';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;

    const legW = 32;
    const legH = this.floorY - topY - h;
    // Left leg
    ctx.fillRect(x + 50, topY + h, legW, legH);
    ctx.strokeRect(x + 50, topY + h, legW, legH);
    // Right leg
    ctx.fillRect(x + w - 50 - legW, topY + h, legW, legH);
    ctx.strokeRect(x + w - 50 - legW, topY + h, legW, legH);

    // Cross brace
    ctx.fillRect(x + 50, topY + h + legH * 0.6, w - 100, 20);
    ctx.strokeRect(x + 50, topY + h + legH * 0.6, w - 100, 20);

    // Table top
    ctx.fillStyle = '#d97706';
    ctx.fillRect(x, topY, w, h);
    ctx.strokeRect(x, topY, w, h);

    // Table runner (festive party tablecloth strip)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - 130, topY, 260, h + 18);
    ctx.strokeRect(cx - 130, topY, 260, h + 18);

    // Scalloped tablecloth edge
    ctx.fillStyle = '#f43f5e';
    for (let sc = cx - 120; sc < cx + 120; sc += 24) {
      ctx.beginPath();
      ctx.arc(sc + 12, topY + h + 18, 12, 0, Math.PI);
      ctx.fill();
      ctx.stroke();
    }
  }

  private drawRefrigerator(ctx: CanvasRenderingContext2D, x: number, topY: number): void {
    const w = 230;
    const h = 640;

    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, this.floorY + 10, w * 0.54, 26, 0, 0, TAU);
    ctx.fill();

    // Body
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 7;
    this.roundRect(ctx, x, topY, w, h, 28);
    ctx.fill();
    ctx.stroke();

    // Freezer door split line
    const splitY = topY + h * 0.38;
    ctx.beginPath();
    ctx.moveTo(x, splitY);
    ctx.lineTo(x + w, splitY);
    ctx.stroke();

    // Chrome handles
    ctx.fillStyle = '#94a3b8';
    this.roundRect(ctx, x + 24, splitY - 80, 16, 65, 8);
    ctx.fill();
    ctx.stroke();
    this.roundRect(ctx, x + 24, splitY + 30, 16, 90, 8);
    ctx.fill();
    ctx.stroke();

    // Cute retro magnets on fridge
    // Apple magnet
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(x + 150, splitY - 50, 18, 0, TAU);
    ctx.fill();
    ctx.stroke();
    // Yellow star magnet
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(x + 130, splitY + 70, 16, 0, TAU);
    ctx.fill();
    ctx.stroke();
  }

  private drawKitchenChair(ctx: CanvasRenderingContext2D, cx: number, seatY: number): void {
    ctx.fillStyle = '#ea580c';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;

    // Chair Back
    this.roundRect(ctx, cx - 45, seatY - 180, 90, 180, 14);
    ctx.fill();
    ctx.stroke();

    // Slats
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(cx - 26, seatY - 160, 16, 140);
    ctx.strokeRect(cx - 26, seatY - 160, 16, 140);
    ctx.fillRect(cx + 10, seatY - 160, 16, 140);
    ctx.strokeRect(cx + 10, seatY - 160, 16, 140);

    // Seat
    ctx.fillStyle = '#f97316';
    this.roundRect(ctx, cx - 65, seatY, 130, 30, 10);
    ctx.fill();
    ctx.stroke();

    // Legs
    const legH = this.floorY - seatY - 30;
    ctx.fillRect(cx - 55, seatY + 30, 18, legH);
    ctx.strokeRect(cx - 55, seatY + 30, 18, legH);
    ctx.fillRect(cx + 37, seatY + 30, 18, legH);
    ctx.strokeRect(cx + 37, seatY + 30, 18, legH);
  }

  private drawCushionPile(ctx: CanvasRenderingContext2D, cx: number, baseY: number, isCrash: boolean): void {
    const squash = isCrash ? 0.72 : 1.0;
    const expand = isCrash ? 1.3 : 1.0;

    // Pile of 3 plush pastel cushions
    ctx.save();
    ctx.translate(cx, baseY);
    ctx.scale(expand, squash);

    // Bottom cushion (purple)
    ctx.fillStyle = '#a855f7';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    this.roundRect(ctx, -120, -50, 240, 80, 35);
    ctx.fill();
    ctx.stroke();

    // Middle cushion (coral pink)
    ctx.fillStyle = '#f43f5e';
    this.roundRect(ctx, -100, -110, 200, 75, 30);
    ctx.fill();
    ctx.stroke();

    // Top cushion (gold yellow)
    ctx.fillStyle = '#facc15';
    this.roundRect(ctx, -85, -165, 170, 70, 28);
    ctx.fill();
    ctx.stroke();

    ctx.restore();

    // If crash, show feathers / poof particles
    if (isCrash) {
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      for (let p = 0; p < 8; p++) {
        const px = cx + Math.sin(p * 2.1) * 110;
        const py = baseY - 120 + Math.cos(p * 1.7) * 90;
        ctx.beginPath();
        ctx.ellipse(px, py, 14, 8, p * 0.5, 0, TAU);
        ctx.fill();
        ctx.stroke();
      }
    }
  }

  // -------------------------------------------------------------
  // ACTORS & PROPS: STICKMAN & RUNAWAY CAKE
  // -------------------------------------------------------------
  private drawSceneAction(ctx: CanvasRenderingContext2D, t: number): void {
    if (t < 6.0) {
      // ---------------------------------------------------------
      // SCENE 1: THE BIRTHDAY SURPRISE (0 - 6s)
      // ---------------------------------------------------------
      // Stickman enters excitedly, notices cake on table, reaches with fork.
      // Cake legs unfold at 4.6s, cake smiles mischievously.
      const enterU = smooth(clamp(t / 2.2, 0, 1));
      const stickmanX = lerp(80, 340, enterU);
      const isReaching = t >= 3.0;
      const isShocked = t >= 4.8;

      // Stickman Pose
      this.drawStickman(ctx, {
        x: stickmanX,
        y: this.floorY,
        eye: isShocked ? 'shock' : (t >= 2.2 ? 'star' : 'happy'),
        brow: isShocked ? 'sad' : (t >= 2.2 ? 'raised' : 'neutral'),
        mouth: isShocked ? 'o' : 'bigSmile',
        beanieAngle: 0,
        holdingFork: true,
        forkHand: 'right',
        reachAngle: isReaching ? -0.65 : 0,
        lean: isReaching ? 0.08 : 0,
        walkPhase: t < 2.2 ? t * 12 : 0,
      });

      // Cake on table at (540, 1140)
      const legsUnfolded = t >= 4.5;
      const cakeWiggle = t >= 4.5 ? Math.sin((t - 4.5) * 16) * 0.08 : 0;
      const cakeMischief = t >= 4.5;

      this.drawCake(ctx, {
        x: 540,
        y: 1140,
        angle: cakeWiggle,
        legsOut: legsUnfolded,
        legsRunning: false,
        face: cakeMischief ? 'mischief' : 'cute',
        candlesLit: true,
        lidOpen: 0,
      });

    } else if (t < 12.0) {
      // ---------------------------------------------------------
      // SCENE 2: THE CAKE RUNS AWAY (6 - 12s)
      // ---------------------------------------------------------
      // 6.0 - 6.7s: Cake jumps off table onto floor
      // 6.8 - 12.0s: Cake runs toward kitchen, Stickman chases it with fork!
      let cakeX = 540;
      let cakeY = 1140;
      let cakeAngle = 0;
      let cakeSquash = 1;

      if (t < 6.7) {
        // Jump off table
        const jumpU = (t - 6.0) / 0.7;
        const jumpArc = Math.sin(jumpU * Math.PI) * 160;
        cakeX = lerp(540, 720, easeOut(jumpU));
        cakeY = lerp(1140, this.floorY, jumpU) - jumpArc;
        cakeAngle = jumpU * 0.3;
        cakeSquash = jumpU > 0.85 ? 0.8 : 1.1;
      } else {
        // Running on floor
        const runT = t - 6.7;
        cakeX = 720 + runT * 110;
        // Dodge maneuver at 8.5s - 9.5s
        if (t >= 8.5 && t < 10.0) {
          const dodgeU = bump((t - 8.5) / 1.5);
          cakeY = this.floorY - dodgeU * 75;
          cakeAngle = Math.sin(t * 18) * 0.18;
        } else {
          cakeY = this.floorY;
          cakeAngle = Math.sin(t * 22) * 0.12;
        }
      }

      // Frosting footprints left by running cake
      if (t >= 6.8) {
        ctx.fillStyle = '#f472b6';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        const startStep = 720;
        for (let fx = startStep; fx < Math.min(cakeX - 30, 1300); fx += 70) {
          ctx.beginPath();
          ctx.ellipse(fx, this.floorY - 4, 14, 7, 0, 0, TAU);
          ctx.fill();
          ctx.stroke();
        }
      }

      // Draw Cake running
      this.drawCake(ctx, {
        x: cakeX,
        y: cakeY,
        angle: cakeAngle,
        legsOut: true,
        legsRunning: t >= 6.7,
        face: 'laugh',
        candlesLit: true,
        lidOpen: 0,
        squashY: cakeSquash,
      });

      // Stickman chasing
      const chaseSpeed = t < 6.7 ? 0 : (t - 6.7) * 105;
      const stickmanX = 340 + chaseSpeed;

      this.drawStickman(ctx, {
        x: stickmanX,
        y: this.floorY,
        eye: 'wide',
        brow: 'angry',
        mouth: 'grit',
        beanieAngle: -0.1,
        holdingFork: true,
        forkHand: 'right',
        reachAngle: -0.6,
        lean: 0.28,
        walkPhase: t * 18,
      });

    } else if (t < 18.0) {
      // ---------------------------------------------------------
      // SCENE 3: THE FROSTING TRAP (12 - 18s)
      // ---------------------------------------------------------
      // Cake slides and leaves thick pink frosting trail across kitchen floor (12 - 13.5s).
      // Stickman steps on it at 13.3s, feet slide, spins 360°, crashes in cushions at 15.6s!
      // Cake laughs. Stickman is dizzy with spiral eyes (16.0 - 18.0s).

      // Frosting trail on floor
      const trailWidth = clamp((t - 12.0) * 400, 0, 520);
      ctx.fillStyle = '#f472b6';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 6;
      ctx.beginPath();
      this.roundRect(ctx, 240, this.floorY - 14, trailWidth, 24, 12);
      ctx.fill();
      ctx.stroke();

      // Shiny frosting glisten
      if (trailWidth > 60) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        this.roundRect(ctx, 270, this.floorY - 10, trailWidth * 0.7, 8, 4);
        ctx.fill();
      }

      // Dropped fork on floor after slide
      if (t >= 13.4) {
        ctx.save();
        ctx.translate(340, this.floorY - 14);
        this.drawFork(ctx, 0, 0, 1.2, 1.48);
        ctx.restore();
      }

      // Cake position: stands laughing near kitchen chair at x = 200
      this.drawCake(ctx, {
        x: 180,
        y: this.floorY,
        angle: Math.sin(t * 14) * 0.08,
        legsOut: true,
        legsRunning: false,
        face: 'laugh',
        candlesLit: true,
        lidOpen: 0,
      });

      // Stickman state:
      if (t < 13.3) {
        // Charging in
        const runU = (t - 12.0) / 1.3;
        const stickmanX = lerp(120, 270, runU);
        this.drawStickman(ctx, {
          x: stickmanX,
          y: this.floorY,
          eye: 'wide',
          brow: 'angry',
          mouth: 'grit',
          beanieAngle: 0,
          holdingFork: true,
          forkHand: 'right',
          reachAngle: -0.65,
          lean: 0.35,
          walkPhase: t * 18,
        });
      } else if (t < 15.6) {
        // SLIDING & SPINNING 360° across floor
        const slideU = (t - 13.3) / 2.3;
        const slideX = lerp(280, 840, easeOut(slideU));
        const spinAngle = slideU * TAU * 3; // 3 full spins!

        ctx.save();
        ctx.translate(slideX, this.floorY - 330);
        ctx.rotate(spinAngle);
        ctx.translate(-slideX, -(this.floorY - 330));

        this.drawStickman(ctx, {
          x: slideX,
          y: this.floorY - 60,
          eye: 'shock',
          brow: 'sad',
          mouth: 'scream',
          beanieAngle: 0.2,
          holdingFork: false,
          reachAngle: -1.1,
          lean: -0.4,
          walkPhase: 0,
        });
        ctx.restore();

        // Speed motion lines
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        for (let l = 0; l < 4; l++) {
          const ly = this.floorY - 100 - l * 50;
          ctx.beginPath();
          ctx.moveTo(slideX - 160, ly);
          ctx.lineTo(slideX - 60, ly);
          ctx.stroke();
        }
      } else {
        // Crashed in cushions at x = 860, dizzy with stars
        this.drawStickman(ctx, {
          x: 840,
          y: this.floorY,
          eye: 'spiral',
          brow: 'sad',
          mouth: 'wobble',
          beanieAngle: 0.35,
          holdingFork: false,
          reachAngle: 0,
          lean: -0.15,
          walkPhase: 0,
        });

        // Circling dizzy stars / birds above head
        const starT = t * 4;
        ctx.fillStyle = '#facc15';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        for (let s = 0; s < 3; s++) {
          const sa = starT + s * (TAU / 3);
          const sx = 840 + Math.cos(sa) * 115;
          const sy = this.floorY - 640 + Math.sin(sa) * 45;
          this.drawCartoonStar(ctx, sx, sy, 24);
        }
      }

    } else if (t < 24.0) {
      // ---------------------------------------------------------
      // SCENE 4: THE PERFECT AMBUSH (18 - 24s)
      // ---------------------------------------------------------
      // Stickman stands up, spots cake hiding behind kitchen chair (18 - 20s).
      // Crouches and tiptoes stealthily toward it holding fork (20 - 21.8s).
      // Cake leaps off chair and lands right on top of Stickman's red beanie like a hat (22.3s)!
      // Stickman freezes in shock with enormous wide eyes (22.5 - 24.0s).

      const sneakU = clamp((t - 19.5) / 2.3, 0, 1);
      const stickmanX = lerp(720, 360, easeOut(sneakU));
      const cakeLanded = t >= 22.3;

      // Cake animation:
      let cakeX = 230;
      let cakeY = 1140; // on/behind chair
      let cakeAngle = 0;

      if (t < 21.8) {
        // Hiding innocently behind chair
        cakeX = 230;
        cakeY = 1160;
        cakeAngle = Math.sin(t * 3) * 0.05;
      } else if (t < 22.3) {
        // Jump UP and onto Stickman's tall head!
        const leapU = (t - 21.8) / 0.5;
        const jumpH = Math.sin(leapU * Math.PI) * 260;
        cakeX = lerp(230, stickmanX, leapU);
        cakeY = lerp(1160, this.floorY - 635, leapU) - jumpH;
        cakeAngle = leapU * 0.2;
      } else {
        // Sitting securely on Stickman's head!
        cakeX = stickmanX;
        cakeY = this.floorY - 635;
        cakeAngle = 0;
      }

      // Draw Stickman
      const isSneaking = t >= 19.5 && t < 21.8;
      const isFrozenShock = cakeLanded;

      this.drawStickman(ctx, {
        x: stickmanX,
        y: this.floorY,
        eye: isFrozenShock ? 'hugeShock' : (isSneaking ? 'squint' : 'normal'),
        brow: isFrozenShock ? 'raised' : (isSneaking ? 'determined' : 'neutral'),
        mouth: isFrozenShock ? 'o' : (isSneaking ? 'grit' : 'flat'),
        beanieAngle: isFrozenShock ? 0 : 0.05,
        holdingFork: true,
        forkHand: 'left',
        reachAngle: isSneaking ? -0.45 : (isFrozenShock ? -0.85 : 0),
        lean: isSneaking ? -0.15 : 0,
        crouch: isSneaking ? 55 : 0,
        walkPhase: isSneaking ? t * 8 : 0,
      });

      // Draw Cake
      this.drawCake(ctx, {
        x: cakeX,
        y: cakeY,
        angle: cakeAngle,
        legsOut: true,
        legsRunning: false,
        face: cakeLanded ? 'cute' : 'mischief',
        candlesLit: true,
        lidOpen: 0,
      });

    } else {
      // ---------------------------------------------------------
      // SCENE 5: THE BIRTHDAY EXPLOSION (24 - 30s)
      // ---------------------------------------------------------
      // Cake on head starts vibrating (24 - 24.8s).
      // Top layer opens, confetti cannon explodes (25.0s)!
      // 6 tiny cupcake creatures pop out and dance around Stickman (25.2 - 27.2s).
      // Stickman smiles, leans down to eat tiny slice held by a cupcake (27.5s).
      // Cupcake chomps the slice itself (28.2s)!
      // Stickman freezes in pure boiling fury, zoom into his angry face (28.5 - 30s)!

      const stickmanX = 540;
      const cakeVibrate = t >= 24.0 && t < 25.0 ? Math.sin((t - 24.0) * 50) * 8 : 0;
      const lidOpenU = clamp((t - 25.0) / 0.4, 0, 1);
      const isCupcakeChomp = t >= 28.2;
      const isPreChompHappy = t >= 27.2 && t < 28.2;

      // Draw Stickman
      this.drawStickman(ctx, {
        x: stickmanX,
        y: this.floorY,
        eye: isCupcakeChomp ? 'furious' : (isPreChompHappy ? 'happy' : (t >= 26.2 ? 'angry' : 'shock')),
        brow: isCupcakeChomp ? 'extremeAngry' : (isPreChompHappy ? 'raised' : 'angry'),
        mouth: isCupcakeChomp ? 'flatFurious' : (isPreChompHappy ? 'openYum' : (t >= 26.2 ? 'grit' : 'o')),
        beanieAngle: 0,
        holdingFork: false,
        reachAngle: isPreChompHappy ? 0.3 : 0,
        lean: isPreChompHappy ? 0.12 : 0,
        walkPhase: 0,
        flush: isCupcakeChomp || (t >= 26.2 && !isPreChompHappy),
      });

      // Draw Cake on his head with hatch open
      this.drawCake(ctx, {
        x: stickmanX + cakeVibrate,
        y: this.floorY - 635,
        angle: 0,
        legsOut: true,
        legsRunning: false,
        face: 'laugh',
        candlesLit: t < 25.0,
        lidOpen: lidOpenU,
      });

      // Confetti Shower from 25.0s onward
      if (t >= 25.0) {
        this.drawConfetti(ctx, stickmanX, this.floorY - 710, t - 25.0);
      }

      // 6 Tiny Dancing Cupcakes on floor
      if (t >= 25.2) {
        this.drawDancingCupcakes(ctx, t, stickmanX, isCupcakeChomp);
      }
    }
  }

  // -------------------------------------------------------------
  // STICKMAN CHARACTER RIG
  // Large circular white head (40% height), red beanie, plain yellow shirt,
  // thin black arms, white rounded mitten hands, blue trousers, black shoes.
  // -------------------------------------------------------------
  private drawStickman(
    ctx: CanvasRenderingContext2D,
    p: {
      x: number;
      y: number;
      eye: 'normal' | 'happy' | 'wide' | 'shock' | 'hugeShock' | 'spiral' | 'squint' | 'furious' | 'angry' | 'star';
      brow: 'neutral' | 'raised' | 'angry' | 'extremeAngry' | 'sad' | 'determined';
      mouth: 'flat' | 'bigSmile' | 'o' | 'grit' | 'scream' | 'wobble' | 'flatFurious' | 'openYum';
      beanieAngle: number;
      holdingFork: boolean;
      forkHand?: 'left' | 'right';
      reachAngle: number;
      lean: number;
      crouch?: number;
      walkPhase: number;
      flush?: boolean;
    }
  ): void {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.lean);

    const crouchOffset = p.crouch || 0;

    // Taller proportions (540px total height, head is ~40%)
    const headR = 96;         // Large circular white head (~40% of height)
    const headCY = -395 + crouchOffset;
    const neckY = headCY + headR * 0.92;
    const torsoTopY = neckY;
    const torsoBottomY = -160 + crouchOffset;
    const hipY = torsoBottomY;

    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 95, 24, 0, 0, TAU);
    ctx.fill();

    // 1. TALL LEGS & BLUE TROUSERS
    const walk = p.walkPhase;
    const lLegAngle = Math.sin(walk) * 0.55;
    const rLegAngle = -Math.sin(walk) * 0.55;

    // Left Leg
    this.drawLeg(ctx, -24, hipY, 0, lLegAngle);
    // Right Leg
    this.drawLeg(ctx, 24, hipY, 0, rLegAngle);

    // 2. TORSO & YELLOW T-SHIRT
    ctx.fillStyle = '#facc15'; // Bright yellow plain short-sleeved T-shirt
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 7;

    // Torso block
    const torsoW = 106;
    const torsoH = torsoBottomY - torsoTopY;
    this.roundRect(ctx, -torsoW / 2, torsoTopY, torsoW, torsoH, 20);
    ctx.fill();
    ctx.stroke();

    // Sleeves
    // Left sleeve
    this.roundRect(ctx, -torsoW / 2 - 22, torsoTopY + 6, 34, 52, 12);
    ctx.fill();
    ctx.stroke();
    // Right sleeve
    this.roundRect(ctx, torsoW / 2 - 12, torsoTopY + 6, 34, 52, 12);
    ctx.fill();
    ctx.stroke();

    // 3. LONGER ARMS & MITTEN HANDS
    const leftArmReach = -p.reachAngle;
    const rightArmReach = p.reachAngle;

    // Left Arm
    this.drawArm(ctx, {
      shoulderX: -torsoW / 2 - 6,
      shoulderY: torsoTopY + 44,
      angle: 1.1 + leftArmReach,
      hasFork: p.holdingFork && p.forkHand === 'left',
      side: 'left',
    });

    // Right Arm
    this.drawArm(ctx, {
      shoulderX: torsoW / 2 + 6,
      shoulderY: torsoTopY + 44,
      angle: -0.9 + rightArmReach,
      hasFork: p.holdingFork && (p.forkHand === 'right' || !p.forkHand),
      side: 'right',
    });

    // 4. LARGE CIRCULAR WHITE HEAD
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(0, headCY, headR, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Anger Flush
    if (p.flush) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.beginPath();
      ctx.arc(0, headCY, headR - 4, 0, TAU);
      ctx.fill();

      // Anger steam puffs
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(-headR * 0.9, headCY - 35);
      ctx.quadraticCurveTo(-headR * 1.3, headCY - 60, -headR * 1.1, headCY - 95);
      ctx.moveTo(headR * 0.9, headCY - 35);
      ctx.quadraticCurveTo(headR * 1.3, headCY - 60, headR * 1.1, headCY - 95);
      ctx.stroke();
    }

    // 5. RED KNITTED BEANIE
    ctx.save();
    ctx.translate(0, headCY - headR * 0.65);
    ctx.rotate(p.beanieAngle);

    // Beanie Dome
    ctx.fillStyle = '#dc2626'; // Bright red
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.ellipse(0, -34, headR * 0.88, 64, 0, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Folded Cuff (folded lower edge)
    ctx.fillStyle = '#b91c1c';
    this.roundRect(ctx, -headR * 0.95, -34, headR * 1.9, 38, 12);
    ctx.fill();
    ctx.stroke();

    // Knitted ribbing lines on cuff
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3.5;
    for (let rx = -headR * 0.8; rx <= headR * 0.8; rx += 20) {
      ctx.beginPath();
      ctx.moveTo(rx, -34);
      ctx.lineTo(rx, 4);
      ctx.stroke();
    }
    ctx.restore();

    // 6. FACIAL FEATURES (EYES, EYEBROWS, MOUTH)
    this.drawFace(ctx, 0, headCY, p.eye, p.brow, p.mouth);

    ctx.restore();
  }

  private drawLeg(
    ctx: CanvasRenderingContext2D,
    hipX: number,
    hipY: number,
    targetY: number,
    angle: number
  ): void {
    ctx.save();
    ctx.translate(hipX, hipY);
    ctx.rotate(angle);

    const legLen = 160;

    // Blue trousers
    ctx.fillStyle = '#2563eb'; // Vibrant blue trousers
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    this.roundRect(ctx, -17, 0, 34, legLen * 0.62, 10);
    ctx.fill();
    ctx.stroke();

    // Lower thin black stick leg
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, legLen * 0.62);
    ctx.lineTo(0, legLen);
    ctx.stroke();

    // Rounded black shoe
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(10, legLen + 5, 28, 15, 0, 0, TAU);
    ctx.fill();

    ctx.restore();
  }

  private drawArm(
    ctx: CanvasRenderingContext2D,
    opt: { shoulderX: number; shoulderY: number; angle: number; hasFork: boolean; side?: 'left' | 'right' }
  ): void {
    ctx.save();
    ctx.translate(opt.shoulderX, opt.shoulderY);
    ctx.rotate(opt.angle);

    const armLen = 112;
    const isLeft = opt.side === 'left';

    // Thin black stick arm of consistent thickness
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, armLen);
    ctx.stroke();

    // White rounded mitten hand with black outline, connected directly to wrist
    ctx.save();
    ctx.translate(0, armLen);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;

    // Mitten palm
    ctx.beginPath();
    ctx.arc(0, 14, 19, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Fork gripped in hand (drawn over palm, beneath thumb so hand holds handle)
    if (opt.hasFork) {
      const forkRotation = isLeft ? -2.45 : 2.45;
      this.drawFork(ctx, 0, 14, 1.25, forkRotation);
    }

    // Mitten thumb notch overlapping handle
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(isLeft ? 10 : -10, 9, 9.5, 0, TAU);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
    ctx.restore();
  }

  private drawFork(ctx: CanvasRenderingContext2D, x: number, y: number, scale = 1.0, rotation = 0): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(scale, scale);

    // Continuous silver fork silhouette: rounded handle, flared shoulder, and 4 open-gap tines
    ctx.fillStyle = '#cbd5e1';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.8;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(-5.5, 28);
    ctx.lineTo(-3.5, -14);
    ctx.quadraticCurveTo(-17, -18, -17, -29);
    // Tine 1
    ctx.lineTo(-17, -53);
    ctx.quadraticCurveTo(-14.75, -57, -12.5, -53);
    ctx.lineTo(-12.5, -31);
    // Gap 1
    ctx.quadraticCurveTo(-10, -28, -7.5, -31);
    // Tine 2
    ctx.lineTo(-7.5, -55);
    ctx.quadraticCurveTo(-5.25, -59, -3, -55);
    ctx.lineTo(-3, -31);
    // Gap 2
    ctx.quadraticCurveTo(0, -28, 3, -31);
    // Tine 3
    ctx.lineTo(3, -55);
    ctx.quadraticCurveTo(5.25, -59, 7.5, -55);
    ctx.lineTo(7.5, -31);
    // Gap 3
    ctx.quadraticCurveTo(10, -28, 12.5, -31);
    // Tine 4
    ctx.lineTo(12.5, -53);
    ctx.quadraticCurveTo(14.75, -57, 17, -53);
    ctx.lineTo(17, -29);
    // Right shoulder & handle
    ctx.quadraticCurveTo(17, -18, 3.5, -14);
    ctx.lineTo(5.5, 28);
    ctx.quadraticCurveTo(0, 36, -5.5, 28);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Metallic shine highlight along handle & yoke
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-1.5, 24);
    ctx.lineTo(-1, -12);
    ctx.stroke();

    ctx.restore();
  }

  private drawFace(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    eye: string,
    brow: string,
    mouth: string
  ): void {
    const eyeDist = 36;
    const eyeY = cy - 2;

    // Eyebrows
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';

    const browY = eyeY - 30;
    if (brow === 'neutral') {
      ctx.beginPath();
      ctx.moveTo(cx - eyeDist - 20, browY);
      ctx.lineTo(cx - eyeDist + 20, browY);
      ctx.moveTo(cx + eyeDist - 20, browY);
      ctx.lineTo(cx + eyeDist + 20, browY);
      ctx.stroke();
    } else if (brow === 'raised') {
      ctx.beginPath();
      ctx.arc(cx - eyeDist, browY - 8, 22, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + eyeDist, browY - 8, 22, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
    } else if (brow === 'angry') {
      ctx.beginPath();
      ctx.moveTo(cx - eyeDist - 22, browY - 8);
      ctx.lineTo(cx - eyeDist + 20, browY + 10);
      ctx.moveTo(cx + eyeDist - 20, browY + 10);
      ctx.lineTo(cx + eyeDist + 22, browY - 8);
      ctx.stroke();
    } else if (brow === 'extremeAngry') {
      ctx.lineWidth = 11;
      ctx.beginPath();
      ctx.moveTo(cx - eyeDist - 26, browY - 18);
      ctx.lineTo(cx - eyeDist + 22, browY + 14);
      ctx.moveTo(cx + eyeDist - 22, browY + 14);
      ctx.lineTo(cx + eyeDist + 26, browY - 18);
      ctx.stroke();
    } else if (brow === 'sad') {
      ctx.beginPath();
      ctx.moveTo(cx - eyeDist - 22, browY + 10);
      ctx.lineTo(cx - eyeDist + 20, browY - 4);
      ctx.moveTo(cx + eyeDist - 20, browY - 4);
      ctx.lineTo(cx + eyeDist + 22, browY + 10);
      ctx.stroke();
    } else if (brow === 'determined') {
      ctx.beginPath();
      ctx.moveTo(cx - eyeDist - 22, browY - 3);
      ctx.lineTo(cx - eyeDist + 20, browY + 5);
      ctx.moveTo(cx + eyeDist - 20, browY + 5);
      ctx.lineTo(cx + eyeDist + 22, browY - 3);
      ctx.stroke();
    }

    // Eyes
    ctx.fillStyle = '#000000';
    if (eye === 'normal') {
      ctx.beginPath();
      ctx.ellipse(cx - eyeDist, eyeY, 9, 17, 0, 0, TAU);
      ctx.ellipse(cx + eyeDist, eyeY, 9, 17, 0, 0, TAU);
      ctx.fill();
    } else if (eye === 'wide') {
      ctx.beginPath();
      ctx.ellipse(cx - eyeDist, eyeY, 14, 21, 0, 0, TAU);
      ctx.ellipse(cx + eyeDist, eyeY, 14, 21, 0, 0, TAU);
      ctx.fill();
    } else if (eye === 'shock') {
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(cx - eyeDist, eyeY, 20, 0, TAU);
      ctx.arc(cx + eyeDist, eyeY, 20, 0, TAU);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(cx - eyeDist, eyeY, 6, 0, TAU);
      ctx.arc(cx + eyeDist, eyeY, 6, 0, TAU);
      ctx.fill();
    } else if (eye === 'hugeShock') {
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(cx - eyeDist, eyeY, 30, 0, TAU);
      ctx.arc(cx + eyeDist, eyeY, 30, 0, TAU);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(cx - eyeDist, eyeY, 8, 0, TAU);
      ctx.arc(cx + eyeDist, eyeY, 8, 0, TAU);
      ctx.fill();
    } else if (eye === 'star') {
      this.drawCartoonStar(ctx, cx - eyeDist, eyeY, 18);
      this.drawCartoonStar(ctx, cx + eyeDist, eyeY, 18);
    } else if (eye === 'happy') {
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(cx - eyeDist, eyeY + 5, 16, Math.PI * 1.1, Math.PI * 1.9);
      ctx.arc(cx + eyeDist, eyeY + 5, 16, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
    } else if (eye === 'squint') {
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(cx - eyeDist - 16, eyeY);
      ctx.lineTo(cx - eyeDist + 16, eyeY);
      ctx.moveTo(cx + eyeDist - 16, eyeY);
      ctx.lineTo(cx + eyeDist + 16, eyeY);
      ctx.stroke();
    } else if (eye === 'furious' || eye === 'angry') {
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(cx - eyeDist - 18, eyeY - 3);
      ctx.lineTo(cx - eyeDist + 18, eyeY + 5);
      ctx.moveTo(cx + eyeDist - 18, eyeY + 5);
      ctx.lineTo(cx + eyeDist + 18, eyeY - 3);
      ctx.stroke();
    } else if (eye === 'spiral') {
      this.drawSpiral(ctx, cx - eyeDist, eyeY, 18);
      this.drawSpiral(ctx, cx + eyeDist, eyeY, 18);
    }

    // Mouth
    const mouthY = cy + 42;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';

    if (mouth === 'bigSmile') {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, mouthY - 10, 36, 0, Math.PI);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (mouth === 'o') {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(cx, mouthY, 15, 21, 0, 0, TAU);
      ctx.fill();
      ctx.stroke();
    } else if (mouth === 'scream') {
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.ellipse(cx, mouthY + 5, 24, 34, 0, 0, TAU);
      ctx.fill();
    } else if (mouth === 'grit') {
      ctx.fillStyle = '#ffffff';
      this.roundRect(ctx, cx - 32, mouthY - 10, 64, 24, 8);
      ctx.fill();
      ctx.stroke();
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx - 32, mouthY);
      ctx.lineTo(cx + 32, mouthY);
      ctx.stroke();
    } else if (mouth === 'flat' || mouth === 'flatFurious') {
      ctx.lineWidth = mouth === 'flatFurious' ? 10 : 7;
      ctx.beginPath();
      ctx.moveTo(cx - 28, mouthY);
      ctx.lineTo(cx + 28, mouthY);
      ctx.stroke();
    } else if (mouth === 'wobble') {
      ctx.beginPath();
      ctx.moveTo(cx - 28, mouthY);
      ctx.quadraticCurveTo(cx - 14, mouthY - 10, cx, mouthY);
      ctx.quadraticCurveTo(cx + 14, mouthY + 10, cx + 28, mouthY);
      ctx.stroke();
    } else if (mouth === 'openYum') {
      ctx.fillStyle = '#f87171';
      ctx.beginPath();
      ctx.arc(cx, mouthY, 28, 0, Math.PI);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }

  // -------------------------------------------------------------
  // THE RUNAWAY BIRTHDAY CAKE RIG
  // 3-layers (pink, blue, yellow) with white drips, sprinkles,
  // 5 candles with flames, 2 tiny black legs, 2 mitten arms, cute face.
  // -------------------------------------------------------------
  private drawCake(
    ctx: CanvasRenderingContext2D,
    opt: {
      x: number;
      y: number;
      angle: number;
      legsOut: boolean;
      legsRunning: boolean;
      face: 'cute' | 'mischief' | 'laugh';
      candlesLit: boolean;
      lidOpen: number; // 0 to 1
      squashY?: number;
    }
  ): void {
    ctx.save();
    ctx.translate(opt.x, opt.y);
    ctx.rotate(opt.angle);

    const sy = opt.squashY ?? 1.0;
    const sx = 1.0 / Math.sqrt(sy);
    ctx.scale(sx, sy);

    // Layer dimensions
    const bW = 190;
    const bH = 50;
    const mW = 150;
    const mH = 46;
    const tW = 110;
    const tH = 42;

    // 1. Tiny cartoon legs underneath bottom layer
    if (opt.legsOut) {
      const legRun = opt.legsRunning ? Math.sin(performance.now() * 0.02) * 0.6 : 0;

      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';

      // Left leg
      ctx.save();
      ctx.translate(-36, 0);
      ctx.rotate(legRun);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 28);
      ctx.lineTo(-8, 30);
      ctx.stroke();
      ctx.restore();

      // Right leg
      ctx.save();
      ctx.translate(36, 0);
      ctx.rotate(-legRun);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 28);
      ctx.lineTo(8, 30);
      ctx.stroke();
      ctx.restore();
    }

    // 2. Bottom Layer (Pink)
    const bY = -bH;
    ctx.fillStyle = '#f472b6'; // Vibrant pink frosting
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    this.roundRect(ctx, -bW / 2, bY, bW, bH, 16);
    ctx.fill();
    ctx.stroke();
    // White frosting drip on bottom layer
    this.drawFrostingDrips(ctx, -bW / 2, bY, bW, 16);

    // 3. Middle Layer (Blue)
    const mY = bY - mH;
    ctx.fillStyle = '#38bdf8'; // Vibrant blue frosting
    this.roundRect(ctx, -mW / 2, mY, mW, mH, 14);
    ctx.fill();
    ctx.stroke();
    // White frosting drip on middle layer
    this.drawFrostingDrips(ctx, -mW / 2, mY, mW, 14);

    // Sprinkles on middle & bottom layers
    this.drawSprinkles(ctx, -bW / 2 + 10, bY + 12, bW - 20, bH - 18, 12);
    this.drawSprinkles(ctx, -mW / 2 + 8, mY + 12, mW - 16, mH - 18, 9);

    // 4. Cake Face on Middle Layer
    this.drawCakeFace(ctx, 0, mY + mH * 0.55, opt.face);

    // 5. Tiny White Mitten Arms on sides of middle layer
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    // Left arm
    ctx.beginPath();
    ctx.arc(-mW / 2 - 14, mY + mH * 0.5, 12, 0, TAU);
    ctx.fill();
    ctx.stroke();
    // Right arm
    ctx.beginPath();
    ctx.arc(mW / 2 + 14, mY + mH * 0.5, 12, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // 6. Top Layer (Yellow) — opens like a hatch in Scene 5!
    const tY = mY - tH;
    ctx.save();
    if (opt.lidOpen > 0) {
      // Hinge rotation on right side of top layer
      ctx.translate(tW / 2, mY);
      ctx.rotate(-opt.lidOpen * 1.5);
      ctx.translate(-tW / 2, -mY);
    }

    ctx.fillStyle = '#facc15'; // Vibrant yellow frosting
    this.roundRect(ctx, -tW / 2, tY, tW, tH, 12);
    ctx.fill();
    ctx.stroke();
    this.drawFrostingDrips(ctx, -tW / 2, tY, tW, 12);
    this.drawSprinkles(ctx, -tW / 2 + 6, tY + 8, tW - 12, tH - 14, 6);

    // 7. Five Birthday Candles on Top
    const candleColors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#a855f7'];
    for (let c = 0; c < 5; c++) {
      const cx = lerp(-tW * 0.38, tW * 0.38, c / 4);
      const cy = tY;

      // Candle wax stick
      ctx.fillStyle = candleColors[c];
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.fillRect(cx - 4, cy - 26, 8, 26);
      ctx.strokeRect(cx - 4, cy - 26, 8, 26);

      // Wick
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 26);
      ctx.lineTo(cx, cy - 32);
      ctx.stroke();

      // Cartoon Flame
      if (opt.candlesLit) {
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.ellipse(cx, cy - 39, 6, 10, 0, 0, TAU);
        ctx.fill();

        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.ellipse(cx, cy - 37, 3, 6, 0, 0, TAU);
        ctx.fill();
      }
    }

    ctx.restore();
    ctx.restore();
  }

  private drawFrostingDrips(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    r: number
  ): void {
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.moveTo(x, y + 14);
    // Drips along the bottom of the white top-strip
    let currX = x;
    const dripCount = Math.floor(w / 24);
    const step = w / dripCount;
    for (let i = 0; i < dripCount; i++) {
      const dropLen = (i % 2 === 0) ? 14 : 7;
      ctx.lineTo(currX + step * 0.5, y + 14 + dropLen);
      ctx.lineTo(currX + step, y + 14);
      currX += step;
    }
    ctx.lineTo(x + w, y);
    ctx.lineTo(x, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  private drawSprinkles(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    count: number
  ): void {
    const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#ffffff'];
    for (let i = 0; i < count; i++) {
      const sx = x + ((i * 37) % w);
      const sy = y + ((i * 19) % h);
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.arc(sx, sy, 4, 0, TAU);
      ctx.fill();
    }
  }

  private drawCakeFace(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    face: 'cute' | 'mischief' | 'laugh'
  ): void {
    const eyeDist = 24;

    ctx.fillStyle = '#000000';
    ctx.strokeStyle = '#000000';

    if (face === 'cute') {
      // Big cute shiny eyes
      ctx.beginPath();
      ctx.arc(cx - eyeDist, cy - 2, 8, 0, TAU);
      ctx.arc(cx + eyeDist, cy - 2, 8, 0, TAU);
      ctx.fill();

      // Catchlight
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx - eyeDist - 2, cy - 4, 3, 0, TAU);
      ctx.arc(cx + eyeDist - 2, cy - 4, 3, 0, TAU);
      ctx.fill();

      // Tiny smile
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, cy + 4, 10, 0, Math.PI);
      ctx.stroke();
    } else if (face === 'mischief') {
      // One winking eye, one open with curved eyebrow
      ctx.lineWidth = 4;
      // Left eye open
      ctx.beginPath();
      ctx.arc(cx - eyeDist, cy - 2, 8, 0, TAU);
      ctx.fill();

      // Right eye winking >
      ctx.beginPath();
      ctx.moveTo(cx + eyeDist - 8, cy - 6);
      ctx.lineTo(cx + eyeDist + 6, cy);
      ctx.lineTo(cx + eyeDist - 8, cy + 6);
      ctx.stroke();

      // Mischievous smirk
      ctx.beginPath();
      ctx.arc(cx + 4, cy + 4, 12, 0.2, Math.PI * 0.9);
      ctx.stroke();
    } else if (face === 'laugh') {
      // Squinched happy laughing eyes ^ ^
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx - eyeDist, cy, 10, Math.PI * 1.1, Math.PI * 1.9);
      ctx.arc(cx + eyeDist, cy, 10, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();

      // Open happy laughing mouth
      ctx.fillStyle = '#f87171';
      ctx.beginPath();
      ctx.arc(cx, cy + 4, 14, 0, Math.PI);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }

  // -------------------------------------------------------------
  // CONFETTI BURST (SCENE 5)
  // -------------------------------------------------------------
  private drawConfetti(
    ctx: CanvasRenderingContext2D,
    originX: number,
    originY: number,
    elapsed: number
  ): void {
    const colors = ['#f43f5e', '#3b82f6', '#10b981', '#facc15', '#a855f7', '#ec4899', '#06b6d4'];
    const count = 48;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * TAU + Math.sin(i * 3.7) * 0.4;
      const speed = 120 + ((i * 47) % 360);
      const dist = Math.min(speed * elapsed, 850);
      const gravity = elapsed * elapsed * 200;

      const px = originX + Math.cos(angle) * dist;
      const py = originY + Math.sin(angle) * dist + gravity;

      if (py < this.floorY + 20) {
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(elapsed * 8 + i);
        ctx.fillStyle = colors[i % colors.length];
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2.5;

        if (i % 2 === 0) {
          ctx.fillRect(-10, -6, 20, 12);
          ctx.strokeRect(-10, -6, 20, 12);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, 7, 0, TAU);
          ctx.fill();
          ctx.stroke();
        }
        ctx.restore();
      }
    }
  }

  // -------------------------------------------------------------
  // SIX DANCING CUPCAKE CREATURES (SCENE 5)
  // Each has colorful frosting swirl, tiny eyes, smile, and legs.
  // One in front holds a tiny slice of cake and chomps it!
  // -------------------------------------------------------------
  private drawDancingCupcakes(
    ctx: CanvasRenderingContext2D,
    t: number,
    stickmanX: number,
    isChomped: boolean
  ): void {
    const cupcakeColors = [
      { name: 'Strawberry', color: '#f43f5e' },
      { name: 'Blueberry', color: '#38bdf8' },
      { name: 'Lemon', color: '#facc15' },
      { name: 'Grape', color: '#a855f7' },
      { name: 'Orange', color: '#fb923c' },
      { name: 'Mint', color: '#4ade80' },
    ];

    const positions = [
      { dx: -260, y: this.floorY - 30 },
      { dx: -160, y: this.floorY - 20 },
      { dx: -60,  y: this.floorY - 10 },
      { dx: 60,   y: this.floorY - 10 }, // FRONT-RIGHT CUPCAKE: Holds cake slice!
      { dx: 160,  y: this.floorY - 20 },
      { dx: 260,  y: this.floorY - 30 },
    ];

    for (let c = 0; c < 6; c++) {
      const pos = positions[c];
      const isFeatureCupcake = c === 3; // holds slice
      const bounce = Math.abs(Math.sin(t * 8 + c * 1.2)) * 26;

      ctx.save();
      ctx.translate(stickmanX + pos.dx, pos.y - bounce);

      // Wrapper cup (striped pastel)
      ctx.fillStyle = '#fde047';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-22, 0);
      ctx.lineTo(22, 0);
      ctx.lineTo(16, 28);
      ctx.lineTo(-16, 28);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Frosting swirl dome
      ctx.fillStyle = cupcakeColors[c].color;
      ctx.beginPath();
      ctx.arc(0, -6, 24, Math.PI, 0);
      ctx.lineTo(22, 0);
      ctx.lineTo(-22, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Top swirl tip
      ctx.beginPath();
      ctx.arc(0, -30, 8, 0, TAU);
      ctx.fill();
      ctx.stroke();

      // Cute face
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(-8, 6, 3, 0, TAU);
      ctx.arc(8, 6, 3, 0, TAU);
      ctx.fill();

      // Smile
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 14, 6, 0, Math.PI);
      ctx.stroke();

      // Tiny black legs
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-10, 28);
      ctx.lineTo(-10, 40);
      ctx.moveTo(10, 28);
      ctx.lineTo(10, 40);
      ctx.stroke();

      // Front Cupcake holding tiny slice of cake!
      if (isFeatureCupcake) {
        if (!isChomped) {
          // Plate and delicious cake slice held up
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.ellipse(-26, 4, 18, 7, 0, 0, TAU);
          ctx.fill();
          ctx.stroke();

          // Tiny cake slice (pink + yellow)
          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.moveTo(-34, 4);
          ctx.lineTo(-18, -12);
          ctx.lineTo(-12, 4);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Cherry on top
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(-22, -14, 4, 0, TAU);
          ctx.fill();
        } else {
          // CHOMPED! Cupcake has big happy mouth with crumbs and rubbing belly
          ctx.fillStyle = '#f87171';
          ctx.beginPath();
          ctx.arc(0, 14, 9, 0, Math.PI);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Crumbs
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(-12, 22, 3, 3);
          ctx.fillRect(8, 20, 3, 3);
        }
      }

      ctx.restore();
    }
  }

  // -------------------------------------------------------------
  // BURNED-IN POP CAPTIONS
  // Modern Pop 2D flat vector cartoon style:
  // Large, bold, readable mobile captions with thick black outline.
  // -------------------------------------------------------------
  private drawCaptions(ctx: CanvasRenderingContext2D, t: number): void {
    const caption = this.captions.find((c) => t >= c.from && t <= c.to);
    if (!caption) return;

    // Pop scale & entrance
    const popIn = clamp((t - caption.from) / 0.18, 0, 1);
    const popOut = clamp((caption.to - t) / 0.22, 0, 1);
    const scale = easeOut(popIn) * easeOut(popOut);

    const captionY = 1710; // Caption safe zone

    ctx.save();
    ctx.translate(this.width / 2, captionY);
    ctx.scale(scale, scale);

    const fontSize = 48;
    ctx.font = `900 ${fontSize}px "Plus Jakarta Sans", system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Yellow / Gold vibrant Pop typography
    const text = caption.text;

    // Heavy black outline (pop vector cartoon stroke)
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 16;
    ctx.strokeText(text, 0, 0);

    // Inner bright pop fill
    ctx.fillStyle = '#fef08a'; // Sunny vibrant yellow
    ctx.fillText(text, 0, 0);

    ctx.restore();
  }

  // -------------------------------------------------------------
  // HELPER DRAWING METHODS
  // -------------------------------------------------------------
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

  private drawCartoonStar(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    r: number
  ): void {
    ctx.fillStyle = '#fde047';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const radius = i % 2 === 0 ? r : r * 0.42;
      const a = (i / 8) * TAU - Math.PI / 2;
      const x = cx + Math.cos(a) * radius;
      const y = cy + Math.sin(a) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  private drawSpiral(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    maxR: number
  ): void {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    for (let a = 0; a < TAU * 2.5; a += 0.25) {
      const r = (a / (TAU * 2.5)) * maxR;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      if (a === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  private drawSafeZones(ctx: CanvasRenderingContext2D): void {
    // 9:16 vertical safe margins
    ctx.save();
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.7)';
    ctx.lineWidth = 3;
    ctx.setLineDash([16, 12]);
    // 80px side margins, 200px top, 260px bottom
    ctx.strokeRect(80, 200, this.width - 160, this.height - 460);
    ctx.restore();
  }
}
