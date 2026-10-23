import { StudioConfig } from '../types';

/**
 * PaperBallRenderer renders "The Paper Ball Ricochet"
 * 9:16 vertical 1080×1920 animation with comedic cartoon physics,
 * deliberate readable pacing, elastic squash-and-stretch, rotating ceiling fan,
 * table lamp, crumpled paper ball, small black trash can, and deadpan stickman.
 */

export class PaperBallRenderer {
  public readonly width = 1080;
  public readonly height = 1920;

  // Key room coordinates in 1080x1920 space
  private readonly floorY = 1450;
  private readonly ceilingY = 180;
  private readonly fanCenterX = 540;
  private readonly fanCenterY = 320;

  // Desk coordinates
  private readonly deskX = 140;
  private readonly deskY = 1180;
  private readonly deskW = 320;

  // Lamp coordinates (sits on the desk)
  private readonly lampBaseX = 400;
  private readonly lampBaseY = 1180;

  // Trash can coordinates (on the floor to the right)
  private readonly trashX = 840;
  private readonly trashY = 1450;
  private readonly trashW = 110;
  private readonly trashH = 150;

  // Stickman seated position behind/at desk
  private readonly stickmanX = 260;
  private readonly stickmanY = 1180; // seated hip/torso base

  public render(
    ctx: CanvasRenderingContext2D,
    time: number,
    config: StudioConfig
  ) {
    const t = Math.max(0, Math.min(10.0, time));

    // Pure white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, this.width, this.height);

    // Floor baseline (crisp, bold black line)
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(60, this.floorY);
    ctx.lineTo(1020, this.floorY);
    ctx.stroke();

    // 1. Ceiling Fan (spinning smoothly at relaxed comedic speed)
    this.renderCeilingFan(ctx, t);

    // 2. Small Black Trash Can on floor
    this.renderTrashCan(ctx, t);

    // 3. Desk / Table
    this.renderDesk(ctx);

    // 4. Calculate Ball Position & State with relaxed comedic trajectory
    const ballState = this.calculateBallPhysics(t);

    // 5. Table Lamp (wobbles when ball hits it)
    this.renderTableLamp(ctx, t);

    // 6. Stickman Character (reacts & tracks ball)
    this.renderStickman(ctx, t, ballState);

    // 7. Motion trails & Speed lines
    this.renderSpeedTrails(ctx, t, ballState);

    // 8. Crumpled White Paper Ball
    this.renderPaperBall(ctx, ballState);

    // Safe zone guides if enabled by user in studio tools
    if (config.showSafeZones) {
      this.renderSafeZones(ctx);
    }
  }

  // ==========================================================
  // 1. CEILING FAN (Downrod, hub, 3 blades rotating calmly)
  // ==========================================================
  private renderCeilingFan(ctx: CanvasRenderingContext2D, t: number) {
    ctx.save();

    // Ceiling mount plate & downrod
    ctx.fillStyle = '#000000';
    ctx.fillRect(this.fanCenterX - 40, this.ceilingY, 80, 16);

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(this.fanCenterX, this.ceilingY + 16);
    ctx.lineTo(this.fanCenterX, this.fanCenterY - 25);
    ctx.stroke();

    // Motor cylindrical hub
    ctx.fillRect(this.fanCenterX - 35, this.fanCenterY - 25, 70, 50);

    // Fan blade rotation: relaxed 0.75 rev/second (deliberate & clean, not a blur)
    const spinRate = 0.75 * Math.PI * 2;
    let angle = t * spinRate;

    // Elastic reaction at fan hit (t between 7.5s and 8.0s)
    let flexOffset = 0;
    if (t >= 7.5 && t <= 8.0) {
      const hitProg = (t - 7.5) / 0.5;
      flexOffset = Math.sin(hitProg * Math.PI * 3) * 16 * (1 - hitProg);
    }

    ctx.translate(this.fanCenterX, this.fanCenterY);

    // Draw 3 blades (120 deg apart)
    for (let i = 0; i < 3; i++) {
      const bladeAngle = angle + (i * Math.PI * 2) / 3;
      const bladeLen = 175;
      const bladeW = 34;

      ctx.save();
      ctx.rotate(bladeAngle);

      // Black blade with geometric crisp contour
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(25, -bladeW / 2 + (i === 0 ? flexOffset : 0));
      ctx.lineTo(bladeLen, -bladeW / 2 + 6);
      ctx.arc(bladeLen, 0, bladeW / 2, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(25, bladeW / 2 + (i === 0 ? flexOffset : 0));
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    // Center cap
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fill();

    // Fan strike impact shockwave burst at t = 7.5s
    if (t >= 7.5 && t <= 7.78) {
      const burstT = (t - 7.5) / 0.28;
      const radius = burstT * 60;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4 * (1 - burstT);
      ctx.beginPath();
      ctx.arc(100, 30, radius, 0, Math.PI * 2);
      ctx.stroke();

      for (let s = 0; s < 6; s++) {
        const spikeAngle = (s * Math.PI * 2) / 6;
        const r1 = radius * 0.5;
        const r2 = radius * 1.2;
        ctx.beginPath();
        ctx.moveTo(100 + Math.cos(spikeAngle) * r1, 30 + Math.sin(spikeAngle) * r1);
        ctx.lineTo(100 + Math.cos(spikeAngle) * r2, 30 + Math.sin(spikeAngle) * r2);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  // ==========================================================
  // 2. SMALL BLACK TRASH CAN (Geometric silhouette on floor)
  // ==========================================================
  private renderTrashCan(ctx: CanvasRenderingContext2D, t: number) {
    ctx.save();
    ctx.translate(this.trashX, this.trashY);

    // Rim vibration on impact at t = 4.4s to 4.9s
    let vibrateX = 0;
    if (t >= 4.4 && t <= 4.9) {
      const vibT = (t - 4.4) / 0.5;
      vibrateX = Math.sin(vibT * Math.PI * 8) * 7 * (1 - vibT);
    }
    ctx.translate(vibrateX, 0);

    const topW = this.trashW;
    const botW = this.trashW * 0.75;
    const h = this.trashH;

    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(-topW / 2, -h);
    ctx.lineTo(topW / 2, -h);
    ctx.lineTo(botW / 2, 0);
    ctx.lineTo(-botW / 2, 0);
    ctx.closePath();
    ctx.fill();

    // Top rim ring
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0, -h, topW / 2 - 4, 12, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Rim contact impact flash at t = 4.4s
    if (t >= 4.4 && t <= 4.58) {
      const flashT = (t - 4.4) / 0.18;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(-topW / 2 - 10, -h - 5);
        ctx.lineTo(-topW / 2 - 25 - flashT * 20, -h - 15 + i * 15);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  // ==========================================================
  // 3. DESK / TABLE
  // ==========================================================
  private renderDesk(ctx: CanvasRenderingContext2D) {
    ctx.save();

    // Table top slab
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.rect(this.deskX, this.deskY, this.deskW, 24);
    ctx.fill();
    ctx.stroke();

    // Table legs
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(this.deskX + 24, this.deskY + 24);
    ctx.lineTo(this.deskX + 24, this.floorY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(this.deskX + this.deskW - 24, this.deskY + 24);
    ctx.lineTo(this.deskX + this.deskW - 24, this.floorY);
    ctx.stroke();

    ctx.restore();
  }

  // ==========================================================
  // 4. TABLE LAMP (Oscillates smoothly upon strike)
  // ==========================================================
  private renderTableLamp(ctx: CanvasRenderingContext2D, t: number) {
    ctx.save();
    ctx.translate(this.lampBaseX, this.lampBaseY);

    // Lamp wobble oscillation on strike at t = 6.0s to 7.4s
    let wobble = 0;
    if (t >= 6.0 && t <= 7.4) {
      const wobT = (t - 6.0) / 1.4;
      wobble = Math.sin(wobT * Math.PI * 6) * 0.32 * Math.exp(-wobT * 2.8);
    }

    // Lamp base
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(0, 0, 36, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Stem
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -90);
    ctx.stroke();

    ctx.translate(0, -90);
    ctx.rotate(wobble);

    // Lampshade
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(-18, 0);
    ctx.lineTo(18, 0);
    ctx.lineTo(44, -75);
    ctx.lineTo(-44, -75);
    ctx.closePath();
    ctx.fill();

    // Finial
    ctx.fillRect(-6, -88, 12, 13);

    // Lamp strike impact ring at t = 6.0s
    if (t >= 6.0 && t <= 6.22) {
      const ringT = (t - 6.0) / 0.22;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3 * (1 - ringT);
      ctx.beginPath();
      ctx.arc(35, -35, ringT * 40, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  // ==========================================================
  // 5. BALL PHYSICS ENGINE (Well-paced, hilarious comedic timing)
  // ==========================================================
  private calculateBallPhysics(t: number): {
    x: number;
    y: number;
    rotation: number;
    scaleX: number;
    scaleY: number;
    isHeld: boolean;
    speed: number;
  } {
    // Stage 1: In stickman's hand (0.0s to 2.0s)
    if (t < 2.0) {
      const windPhase = Math.sin(t * 3.5);
      const handX = this.stickmanX + 65 + windPhase * 6;
      const handY = this.stickmanY - 95 + windPhase * 3;
      return {
        x: handX,
        y: handY,
        rotation: t * 0.6,
        scaleX: 1,
        scaleY: 1,
        isHeld: true,
        speed: 0,
      };
    }

    // Stage 2: Graceful, high-arcing parabolic toss (2.0s to 4.4s = 2.4s duration)
    if (t < 4.4) {
      const prog = (t - 2.0) / 2.4;
      const startX = this.stickmanX + 70;
      const startY = this.stickmanY - 95;
      const targetX = this.trashX - 45;
      const targetY = this.trashY - this.trashH;

      const x = startX + prog * (targetX - startX);
      const arcHeight = 360;
      const y = startY + prog * (targetY - startY) - Math.sin(prog * Math.PI) * arcHeight;

      return {
        x,
        y,
        rotation: t * 3.5,
        scaleX: 1.04,
        scaleY: 0.96,
        isHeld: false,
        speed: 9,
      };
    }

    // Stage 3: Rim ricochet high lob back to table lamp (4.4s to 6.0s = 1.6s duration)
    if (t < 6.0) {
      const prog = (t - 4.4) / 1.6;
      const startX = this.trashX - 45;
      const startY = this.trashY - this.trashH;
      const targetX = this.lampBaseX + 25;
      const targetY = this.lampBaseY - 120;

      // Deliberate bounce arc with comedic hang-time apex
      const x = startX + prog * (targetX - startX);
      const arcHeight = 240;
      const y = startY + prog * (targetY - startY) - Math.sin(prog * Math.PI) * arcHeight;

      let scaleX = 1.0;
      let scaleY = 1.0;
      if (prog < 0.15) {
        scaleX = 0.75;
        scaleY = 1.25;
      }

      return {
        x,
        y,
        rotation: t * 6,
        scaleX,
        scaleY,
        isHeld: false,
        speed: 11,
      };
    }

    // Stage 4: Lamp strike up to ceiling fan (6.0s to 7.5s = 1.5s duration)
    if (t < 7.5) {
      const prog = (t - 6.0) / 1.5;
      const startX = this.lampBaseX + 25;
      const startY = this.lampBaseY - 120;
      const targetX = this.fanCenterX + 100;
      const targetY = this.fanCenterY + 30;

      const x = startX + prog * (targetX - startX);
      const y = startY + prog * (targetY - startY) - Math.sin(prog * Math.PI) * 90;

      return {
        x,
        y,
        rotation: t * 7.5,
        scaleX: 1.05,
        scaleY: 0.95,
        isHeld: false,
        speed: 12,
      };
    }

    // Stage 5: Fan blade batting to right wall (7.5s to 8.6s = 1.1s duration)
    if (t < 8.6) {
      const prog = (t - 7.5) / 1.1;
      const startX = this.fanCenterX + 100;
      const startY = this.fanCenterY + 30;
      const targetX = 990; // right wall
      const targetY = 820;

      const x = startX + prog * (targetX - startX);
      const y = startY + prog * (targetY - startY) - Math.sin(prog * Math.PI) * 45;

      return {
        x,
        y,
        rotation: t * 11,
        scaleX: 1.2,
        scaleY: 0.85,
        isHeld: false,
        speed: 16,
      };
    }

    // Stage 6: Wall bounce back directly to stickman forehead (8.6s to 9.4s = 0.8s duration)
    if (t < 9.4) {
      const prog = (t - 8.6) / 0.8;
      const startX = 990;
      const startY = 820;
      const targetX = this.stickmanX + 48;
      const targetY = this.stickmanY - 170;

      const x = startX + prog * (targetX - startX);
      const y = startY + prog * (targetY - startY) - Math.sin(prog * Math.PI) * 30;

      let scaleX = 1.15;
      let scaleY = 0.85;
      if (prog < 0.15) {
        scaleX = 0.65;
        scaleY = 1.35;
      }

      return {
        x,
        y,
        rotation: -t * 12,
        scaleX,
        scaleY,
        isHeld: false,
        speed: 15,
      };
    }

    // Stage 7: Forehead bonk & gentle drop to desk (9.4s to 9.6s = 0.2s duration)
    if (t < 9.6) {
      const prog = (t - 9.4) / 0.2;
      const startX = this.stickmanX + 48;
      const startY = this.stickmanY - 170;
      const deskLandingX = this.stickmanX + 85;
      const deskLandingY = this.deskY - 16;

      const x = startX + prog * (deskLandingX - startX);
      const y = startY + prog * (deskLandingY - startY) + Math.sin(prog * Math.PI) * 12;

      return {
        x,
        y,
        rotation: t * 6,
        scaleX: 0.95,
        scaleY: 1.05,
        isHeld: false,
        speed: 6,
      };
    }

    // Stage 8: Peaceful deadpan rest on desk (9.6s to 10.0s)
    const restProg = Math.min(1.0, (t - 9.6) / 0.2);
    const finalX = this.stickmanX + 85 + restProg * 10;
    return {
      x: finalX,
      y: this.deskY - 16,
      rotation: 0.4,
      scaleX: 1,
      scaleY: 1,
      isHeld: false,
      speed: 0,
    };
  }

  // ==========================================================
  // 6. STICKMAN (Round head, clean black lines, tracks ball)
  // ==========================================================
  private renderStickman(
    ctx: CanvasRenderingContext2D,
    t: number,
    ball: { x: number; y: number }
  ) {
    ctx.save();
    ctx.translate(this.stickmanX, this.stickmanY);

    const hipY = 0;
    const shoulderY = -120;
    let headY = shoulderY - 55;
    const headRadius = 46;

    // Head recoil on forehead impact at t = 9.4s
    let headTilt = 0;
    let headOffsetX = 0;

    if (t >= 9.4 && t <= 9.7) {
      const recoilT = (t - 9.4) / 0.3;
      headTilt = -Math.sin(recoilT * Math.PI) * 0.45;
      headOffsetX = -Math.sin(recoilT * Math.PI) * 28;
    } else if (t > 9.6) {
      // Deadpan looking down at paper ball on desk
      headTilt = 0.16;
    }

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Stool base
    ctx.beginPath();
    ctx.moveTo(-35, hipY + 10);
    ctx.lineTo(35, hipY + 10);
    ctx.moveTo(0, hipY + 10);
    ctx.lineTo(-20, this.floorY - this.stickmanY);
    ctx.moveTo(0, hipY + 10);
    ctx.lineTo(20, this.floorY - this.stickmanY);
    ctx.stroke();

    // Thighs & calves down
    ctx.beginPath();
    ctx.moveTo(0, hipY);
    ctx.lineTo(45, hipY + 15);
    ctx.lineTo(45, this.floorY - this.stickmanY);
    ctx.stroke();

    // Torso
    ctx.beginPath();
    ctx.moveTo(0, hipY);
    ctx.lineTo(headOffsetX * 0.3, shoulderY);
    ctx.stroke();

    // Arms based on animation timing
    if (t < 2.0) {
      // Aiming: Left arm on desk, right arm holding ball up
      ctx.beginPath();
      ctx.moveTo(0, shoulderY);
      ctx.lineTo(30, shoulderY + 40);
      ctx.lineTo(75, this.deskY - this.stickmanY);
      ctx.stroke();

      const wind = Math.sin(t * 3.5) * 10;
      ctx.beginPath();
      ctx.moveTo(0, shoulderY);
      ctx.lineTo(40 + wind, shoulderY - 10);
      ctx.lineTo(ball.x - this.stickmanX, ball.y - this.stickmanY + 10);
      ctx.stroke();
    } else if (t < 2.3) {
      // Snappy release follow-through
      ctx.beginPath();
      ctx.moveTo(0, shoulderY);
      ctx.lineTo(60, shoulderY - 30);
      ctx.lineTo(110, shoulderY - 20);
      ctx.stroke();
    } else if (t < 9.4) {
      // Tracking pose:
      ctx.beginPath();
      ctx.moveTo(0, shoulderY);
      ctx.lineTo(45, shoulderY + 40);
      ctx.lineTo(85, this.deskY - this.stickmanY);
      ctx.stroke();

      if (t > 6.0) {
        // Alarmed hand raised
        ctx.beginPath();
        ctx.moveTo(0, shoulderY);
        ctx.lineTo(-20, shoulderY - 30);
        ctx.lineTo(-10, shoulderY - 65);
        ctx.stroke();
      } else {
        // Smug chin rest
        ctx.beginPath();
        ctx.moveTo(0, shoulderY);
        ctx.lineTo(30, shoulderY + 25);
        ctx.lineTo(25, shoulderY - 15);
        ctx.stroke();
      }
    } else {
      // Deadpan post-impact: arms resting limp on desk
      ctx.beginPath();
      ctx.moveTo(0, shoulderY);
      ctx.lineTo(35, shoulderY + 45);
      ctx.lineTo(70, this.deskY - this.stickmanY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, shoulderY);
      ctx.lineTo(-15, shoulderY + 50);
      ctx.lineTo(25, this.deskY - this.stickmanY);
      ctx.stroke();
    }

    // Round Head
    ctx.save();
    ctx.translate(headOffsetX, headY);
    ctx.rotate(headTilt);

    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(0, 0, headRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Eye tracking vector toward the paper ball
    const worldHeadX = this.stickmanX + headOffsetX;
    const worldHeadY = this.stickmanY + headY;
    const dx = ball.x - worldHeadX;
    const dy = ball.y - worldHeadY;
    const dist = Math.hypot(dx, dy) || 1;
    const eyePupilLimit = 10;
    const pupilX = (dx / dist) * eyePupilLimit;
    const pupilY = (dy / dist) * eyePupilLimit;

    // Blinking logic:
    // Blink at 1.0s, blink on toss (2.0s), slow deadpan blink at 9.7s
    let isBlinking = false;
    if ((t >= 0.95 && t <= 1.1) || (t >= 9.7 && t <= 9.95)) {
      isBlinking = true;
    }

    if (t >= 9.4 && t <= 9.7) {
      // Dazed cartoon spiral eyes during impact
      ctx.fillStyle = '#000000';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(8, -4, 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(28, -4, 6, 0, Math.PI * 2);
      ctx.stroke();

      // Impact stars / vibration curve
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(headRadius - 5, -15, 14, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
    } else if (isBlinking) {
      // Deadpan horizontal flat eyelid lines
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(2, -4);
      ctx.lineTo(16, -4);
      ctx.moveTo(20, -4);
      ctx.lineTo(34, -4);
      ctx.stroke();
    } else {
      // Active eye tracking
      ctx.fillStyle = '#000000';
      const leftEyeX = 10;
      const rightEyeX = 28;
      const eyeY = -4;

      ctx.beginPath();
      ctx.arc(leftEyeX + pupilX, eyeY + pupilY, 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(rightEyeX + pupilX, eyeY + pupilY, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Mouth expression
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.beginPath();
      if (t < 2.0) {
        // Concentrated small pout
        ctx.arc(20, 16, 4, 0, Math.PI * 2);
        ctx.stroke();
      } else if (t >= 4.4 && t < 9.4) {
        // Alarmed open circle mouth "o"
        ctx.arc(20, 16, 6, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // Flat deadpan straight line
        ctx.moveTo(12, 16);
        ctx.lineTo(28, 16);
        ctx.stroke();
      }
    }

    ctx.restore();
    ctx.restore();
  }

  // ==========================================================
  // 7. CARTOON SPEED TRAILS
  // ==========================================================
  private renderSpeedTrails(
    ctx: CanvasRenderingContext2D,
    t: number,
    ball: { x: number; y: number; speed: number }
  ) {
    if (ball.speed < 14) return;

    ctx.save();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    if (t >= 7.5 && t <= 8.6) {
      for (let i = 1; i <= 3; i++) {
        const offset = i * 40;
        ctx.beginPath();
        ctx.moveTo(ball.x - offset * 0.9, ball.y - offset * 0.45);
        ctx.lineTo(ball.x - (offset + 25) * 0.9, ball.y - (offset + 12) * 0.45);
        ctx.stroke();
      }
    } else if (t >= 8.6 && t <= 9.4) {
      for (let i = 1; i <= 3; i++) {
        const offset = i * 35;
        ctx.beginPath();
        ctx.moveTo(ball.x + offset, ball.y);
        ctx.lineTo(ball.x + offset + 20, ball.y);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  // ==========================================================
  // 8. CRUMPLED WHITE PAPER BALL
  // ==========================================================
  private renderPaperBall(
    ctx: CanvasRenderingContext2D,
    ball: {
      x: number;
      y: number;
      rotation: number;
      scaleX: number;
      scaleY: number;
    }
  ) {
    ctx.save();
    ctx.translate(ball.x, ball.y);
    ctx.rotate(ball.rotation);
    ctx.scale(ball.scaleX, ball.scaleY);

    const radius = 22;

    const points = [
      { r: radius * 1.05, a: 0 },
      { r: radius * 0.88, a: Math.PI * 0.22 },
      { r: radius * 1.12, a: Math.PI * 0.45 },
      { r: radius * 0.92, a: Math.PI * 0.72 },
      { r: radius * 1.08, a: Math.PI * 0.98 },
      { r: radius * 0.85, a: Math.PI * 1.25 },
      { r: radius * 1.15, a: Math.PI * 1.52 },
      { r: radius * 0.9, a: Math.PI * 1.78 },
    ];

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    points.forEach((pt, idx) => {
      const px = Math.cos(pt.a) * pt.r;
      const py = Math.sin(pt.a) * pt.r;
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Internal paper fold crinkle lines
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-radius * 0.6, -radius * 0.3);
    ctx.lineTo(0, radius * 0.1);
    ctx.lineTo(radius * 0.7, -radius * 0.2);

    ctx.moveTo(-radius * 0.2, radius * 0.6);
    ctx.lineTo(radius * 0.1, -radius * 0.4);
    ctx.lineTo(radius * 0.5, radius * 0.4);
    ctx.stroke();

    ctx.restore();
  }

  // ==========================================================
  // 9. MOBILE SAFE BOUNDS
  // ==========================================================
  private renderSafeZones(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.lineWidth = 3;
    ctx.setLineDash([12, 8]);

    ctx.strokeRect(60, 220, this.width - 120, this.height - 560);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
    ctx.fillRect(this.width - 160, 400, 120, 900);
    ctx.fillRect(60, this.height - 340, this.width - 120, 260);

    ctx.fillStyle = '#111111';
    ctx.font = '600 24px "JetBrains Mono", monospace';
    ctx.fillText('9:16 MOBILE SAFE BOUNDS (1080 × 1920)', 80, 200);

    ctx.restore();
  }
}
