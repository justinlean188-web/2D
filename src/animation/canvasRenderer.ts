import { StudioConfig } from '../types';

/**
 * CanvasRenderer renders the 10-second animation at high-resolution (1080 x 1920)
 * perfectly adhering to the master style prompt.
 */

export class CanvasRenderer {
  public readonly width = 1080;
  public readonly height = 1920;

  // Ground level line
  private readonly groundY = 1380;

  public render(
    ctx: CanvasRenderingContext2D,
    time: number,
    config: StudioConfig
  ) {
    const t = Math.max(0, Math.min(10.0, time));

    // Clear background to pure white
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, this.width, this.height);

    // Subtle crisp floor baseline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(80, this.groundY);
    ctx.lineTo(1000, this.groundY);
    ctx.stroke();

    // Determine characters' poses based on time
    this.renderScene(ctx, t, config);

    // Render Captions
    if (config.showCaptions) {
      this.renderCaptions(ctx, t, config);
    }

    // Render Safe Zones overlay if enabled
    if (config.showSafeZones) {
      this.renderSafeZones(ctx);
    }
  }

  private renderScene(
    ctx: CanvasRenderingContext2D,
    t: number,
    config: StudioConfig
  ) {
    if (t < 2.0) {
      this.renderScene1(ctx, t, config);
    } else if (t < 4.0) {
      this.renderScene2(ctx, t, config);
    } else if (t < 6.0) {
      this.renderScene3(ctx, t, config);
    } else if (t < 8.0) {
      this.renderScene4(ctx, t, config);
    } else {
      this.renderScene5(ctx, t, config);
    }
  }

  // ==========================================
  // SCENE 1: The Perfect Relationship (0.0 - 2.0s)
  // ==========================================
  private renderScene1(ctx: CanvasRenderingContext2D, t: number, _config: StudioConfig) {
    // Stick figure walks from x=240 to x=560
    const progress = t / 2.0;
    let x = 240 + progress * 320;
    let y = this.groundY;

    // Normal walk bounce
    const walkFreq = 8.5; // step frequency
    let headBob = Math.sin(t * walkFreq * 2) * 8;
    let legCycle = Math.sin(t * walkFreq);
    let armCycle = -Math.sin(t * walkFreq);

    // Skip at 1.2s - 1.6s
    if (t >= 1.15 && t <= 1.6) {
      const skipT = (t - 1.15) / 0.45;
      const skipHeight = Math.sin(skipT * Math.PI) * 75;
      y = this.groundY - skipHeight;
      headBob = -skipHeight * 0.2;
      legCycle = Math.sin(skipT * Math.PI * 2) * 1.4;
      armCycle = Math.sin(skipT * Math.PI) * 1.5;
    }

    // Shadow is attached naturally to feet on the floor
    this.renderAttachedShadow(ctx, x, this.groundY, legCycle, armCycle, y < this.groundY);

    // Main character
    this.renderStickFigure(ctx, {
      x,
      y,
      headBob,
      facing: 1,
      legPhase: legCycle,
      armPhase: armCycle,
      headTilt: 0,
      armState: 'walking',
      eyeDirection: 'forward',
      isSkipping: t >= 1.15 && t <= 1.6,
    });
  }

  // ==========================================
  // SCENE 2: The Resignation (2.0 - 4.0s)
  // ==========================================
  private renderScene2(ctx: CanvasRenderingContext2D, t: number, _config: StudioConfig) {
    // Shadow stops dead at x = 560
    const shadowX = 560;

    // Figure continues walking unaware from x=560 to x=720 (until ~2.8s), then stops
    let figureX = 560;
    let legCycle = 0;
    let armCycle = 0;
    let headBob = 0;

    if (t < 2.8) {
      const stepProg = (t - 2.0) / 0.8;
      figureX = 560 + stepProg * 160;
      const walkFreq = 8.5;
      legCycle = Math.sin((t - 2.0) * walkFreq);
      armCycle = -Math.sin((t - 2.0) * walkFreq);
      headBob = Math.sin((t - 2.0) * walkFreq * 2) * 6;
    } else {
      figureX = 720;
    }

    // Shadow remains detached, solid black silhouette standing still at shadowX
    // Clean separation from feet
    this.renderDetachedShadowStanding(ctx, shadowX, this.groundY, 0, 1);

    // At t >= 3.0s, stick figure head slowly tilts backward towards shadow
    let headTilt = 0;
    let eyeDirection: 'forward' | 'backward' | 'down' | 'wide' = 'forward';

    if (t >= 3.0) {
      const tiltProg = Math.min(1.0, (t - 3.0) / 0.7);
      // Smooth ease in-out
      headTilt = -tiltProg * 0.42; // tilt back toward left
      eyeDirection = 'backward';
    }

    this.renderStickFigure(ctx, {
      x: figureX,
      y: this.groundY,
      headBob,
      facing: 1,
      legPhase: legCycle,
      armPhase: armCycle,
      headTilt,
      armState: t < 2.8 ? 'walking' : 'idle',
      eyeDirection,
    });
  }

  // ==========================================
  // SCENE 3: Formal Complaint (4.0 - 6.0s)
  // ==========================================
  private renderScene3(ctx: CanvasRenderingContext2D, t: number, config: StudioConfig) {
    const shadowX = 460;
    const figureX = 720;

    // Shadow rises and produces clipboard
    // 4.0 - 4.5: Shadow stands tall, reaches behind back
    // 4.5 - 4.9: Pulls out clipboard
    // 4.9 - 5.5: Holds clipboard, taps twice (tap 1 at 5.05s, tap 2 at 5.25s)
    // 5.5 - 6.0: Points accusingly at figure
    let shadowState: 'pulling_clipboard' | 'tapping' | 'accusing' = 'pulling_clipboard';
    let tapPhase = 0;

    if (t >= 5.5) {
      shadowState = 'accusing';
    } else if (t >= 4.8) {
      shadowState = 'tapping';
      if (t >= 4.95 && t < 5.15) {
        tapPhase = Math.sin(((t - 4.95) / 0.2) * Math.PI);
      } else if (t >= 5.15 && t < 5.35) {
        tapPhase = Math.sin(((t - 5.15) / 0.2) * Math.PI);
      }
    }

    this.renderShadowWithClipboard(ctx, shadowX, this.groundY, shadowState, tapPhase, config);

    // Stick figure: straightens posture, looks increasingly uncomfortable
    const postureProg = Math.min(1.0, (t - 4.0) / 1.2);
    const twitch = t >= 5.0 ? Math.sin(t * 18) * 1.5 : 0;

    this.renderStickFigure(ctx, {
      x: figureX,
      y: this.groundY,
      headBob: 0,
      facing: -1, // turned facing shadow
      legPhase: 0,
      armPhase: 0,
      headTilt: -0.15 + postureProg * 0.15 + twitch * 0.02,
      armState: 'stiff_nervous',
      eyeDirection: 'backward',
    });
  }

  // ==========================================
  // SCENE 4: Unpaid Overtime (6.0 - 8.0s)
  // ==========================================
  private renderScene4(ctx: CanvasRenderingContext2D, t: number, _config: StudioConfig) {
    const shadowX = 440;

    // Shadow lowers to floor, sits cross-legged, folds arms
    // Slowly shakes head side-to-side at 7.4s - 7.9s
    let shadowHeadShake = 0;
    if (t >= 7.3) {
      const shakeT = (t - 7.3) / 0.6;
      shadowHeadShake = Math.sin(shakeT * Math.PI * 4) * 0.22;
    }

    this.renderShadowSittingCrossLegged(ctx, shadowX, this.groundY, shadowHeadShake);

    // Stick figure:
    // 6.0 - 6.8: approaches cautiously from x=720 to x=640
    // 6.8 - 7.3: gives a small friendly hesitant wave
    // 7.4 - 8.0: shoulders slump, arms fall to sides in defeat
    let figureX = 720;
    let legPhase = 0;
    let armState: 'walking' | 'idle' | 'waving' | 'slumped' = 'idle';

    if (t < 6.8) {
      const walkProg = (t - 6.0) / 0.8;
      figureX = 720 - walkProg * 80;
      legPhase = Math.sin((t - 6.0) * 8);
      armState = 'walking';
    } else if (t < 7.4) {
      figureX = 640;
      armState = 'waving';
    } else {
      figureX = 640;
      armState = 'slumped';
    }

    this.renderStickFigure(ctx, {
      x: figureX,
      y: this.groundY,
      headBob: 0,
      facing: -1,
      legPhase,
      armPhase: 0,
      headTilt: t >= 7.4 ? 0.28 : -0.05,
      armState,
      eyeDirection: t >= 7.4 ? 'down' : 'backward',
      wavePhase: t >= 6.8 && t < 7.4 ? Math.sin((t - 6.8) * 12) : 0,
    });
  }

  // ==========================================
  // SCENE 5: HR Has Been Notified (8.0 - 10.0s)
  // ==========================================
  private renderScene5(ctx: CanvasRenderingContext2D, t: number, _config: StudioConfig) {
    let shadowX = 440;
    let shadowState: 'thumbs_down' | 'walk_off' = 'thumbs_down';

    if (t >= 9.2) {
      shadowState = 'walk_off';
      const walkOffProg = (t - 9.2) / 0.8;
      shadowX = 440 - walkOffProg * 650; // walks out of frame to left
    }

    if (shadowX > -150) {
      if (shadowState === 'thumbs_down') {
        this.renderShadowThumbsDown(ctx, shadowX, this.groundY, t);
      } else {
        const walkCycle = Math.sin((t - 9.2) * 10);
        this.renderShadowWalkingAway(ctx, shadowX, this.groundY, walkCycle);
      }
    }

    // Stick figure:
    // 8.0 - 9.2: raises both hands in confusion, points at itself ("Me?")
    // 9.2 - 10.0: frozen devastated expression, completely isolated without shadow
    const figureX = 640;
    this.renderStickFigure(ctx, {
      x: figureX,
      y: this.groundY,
      headBob: 0,
      facing: -1,
      legPhase: 0,
      armPhase: 0,
      headTilt: t >= 9.2 ? 0.35 : -0.1,
      armState: t < 9.2 ? 'pointing_self' : 'devastated_limp',
      eyeDirection: t < 9.2 ? 'backward' : 'down',
      isShocked: t >= 9.2,
    });
  }

  // ==========================================================
  // STICK FIGURE DRAWING (Clean black lines, round white head)
  // ==========================================================
  private renderStickFigure(
    ctx: CanvasRenderingContext2D,
    pose: {
      x: number;
      y: number;
      headBob: number;
      facing: 1 | -1; // 1 = right, -1 = left
      legPhase: number;
      armPhase: number;
      headTilt: number;
      armState: 'walking' | 'idle' | 'stiff_nervous' | 'waving' | 'slumped' | 'pointing_self' | 'devastated_limp';
      eyeDirection: 'forward' | 'backward' | 'down' | 'wide';
      isSkipping?: boolean;
      wavePhase?: number;
      isShocked?: boolean;
    }
  ) {
    ctx.save();
    ctx.translate(pose.x, pose.y);

    const f = pose.facing;
    const bodyHeight = 220;
    const hipY = -120;
    const shoulderY = -230;
    const headCenterY = shoulderY - 60 + pose.headBob;
    const headRadius = 48;

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 1. LEGS
    if (pose.armState === 'walking') {
      const legSpread = pose.legPhase * 40;
      // Left leg
      ctx.beginPath();
      ctx.moveTo(0, hipY);
      ctx.lineTo(legSpread * f, 0);
      ctx.stroke();

      // Right leg
      ctx.beginPath();
      ctx.moveTo(0, hipY);
      ctx.lineTo(-legSpread * f, 0);
      ctx.stroke();
    } else if (pose.isSkipping) {
      // Cheerful tucked legs
      ctx.beginPath();
      ctx.moveTo(0, hipY);
      ctx.lineTo(25 * f, -40);
      ctx.lineTo(40 * f, 0);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, hipY);
      ctx.lineTo(-20 * f, -30);
      ctx.lineTo(-30 * f, 0);
      ctx.stroke();
    } else {
      // Standing legs
      ctx.beginPath();
      ctx.moveTo(0, hipY);
      ctx.lineTo(15 * f, 0);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, hipY);
      ctx.lineTo(-15 * f, 0);
      ctx.stroke();
    }

    // 2. TORSO
    ctx.beginPath();
    ctx.moveTo(0, hipY);
    if (pose.armState === 'slumped' || pose.armState === 'devastated_limp') {
      // Curved slumping spine
      ctx.quadraticCurveTo(-15 * f, (hipY + shoulderY) / 2, -8 * f, shoulderY + 14);
    } else {
      ctx.lineTo(0, shoulderY);
    }
    ctx.stroke();

    // 3. ARMS
    const actualShoulderY = (pose.armState === 'slumped' || pose.armState === 'devastated_limp') ? shoulderY + 14 : shoulderY;
    const shoulderX = (pose.armState === 'slumped' || pose.armState === 'devastated_limp') ? -8 * f : 0;

    if (pose.armState === 'walking') {
      const armSpread = pose.armPhase * 50;
      // Front arm
      ctx.beginPath();
      ctx.moveTo(shoulderX, actualShoulderY);
      ctx.lineTo(shoulderX + armSpread * f, actualShoulderY + 70);
      ctx.stroke();

      // Back arm
      ctx.beginPath();
      ctx.moveTo(shoulderX, actualShoulderY);
      ctx.lineTo(shoulderX - armSpread * f, actualShoulderY + 70);
      ctx.stroke();
    } else if (pose.armState === 'waving') {
      // Left arm idle
      ctx.beginPath();
      ctx.moveTo(shoulderX, actualShoulderY);
      ctx.lineTo(shoulderX - 10 * f, actualShoulderY + 80);
      ctx.stroke();

      // Right arm waving
      const waveAngle = (pose.wavePhase || 0) * 0.4;
      ctx.beginPath();
      ctx.moveTo(shoulderX, actualShoulderY);
      const elbowX = shoulderX + 25 * f;
      const elbowY = actualShoulderY - 40;
      ctx.lineTo(elbowX, elbowY);
      ctx.lineTo(elbowX + Math.sin(waveAngle) * 35 * f, elbowY - 45 + Math.cos(waveAngle) * 10);
      ctx.stroke();
    } else if (pose.armState === 'stiff_nervous') {
      // Arms held stiffly close to body, hands slightly clenched
      ctx.beginPath();
      ctx.moveTo(shoulderX, actualShoulderY);
      ctx.lineTo(shoulderX + 12 * f, actualShoulderY + 50);
      ctx.lineTo(shoulderX + 5 * f, actualShoulderY + 95);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(shoulderX, actualShoulderY);
      ctx.lineTo(shoulderX - 12 * f, actualShoulderY + 50);
      ctx.lineTo(shoulderX - 5 * f, actualShoulderY + 95);
      ctx.stroke();
    } else if (pose.armState === 'pointing_self') {
      // "Who, me??" Both hands raised or pointing back at own chest
      ctx.beginPath();
      ctx.moveTo(shoulderX, actualShoulderY);
      ctx.lineTo(shoulderX - 35 * f, actualShoulderY - 30);
      ctx.lineTo(shoulderX - 10 * f, actualShoulderY + 20); // pointing at chest
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(shoulderX, actualShoulderY);
      ctx.lineTo(shoulderX + 45 * f, actualShoulderY - 40);
      ctx.lineTo(shoulderX + 70 * f, actualShoulderY - 80); // raised palm in disbelief
      ctx.stroke();
    } else if (pose.armState === 'slumped' || pose.armState === 'devastated_limp') {
      // Completely limp straight down
      ctx.beginPath();
      ctx.moveTo(shoulderX, actualShoulderY);
      ctx.lineTo(shoulderX + 8 * f, actualShoulderY + 95);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(shoulderX, actualShoulderY);
      ctx.lineTo(shoulderX - 10 * f, actualShoulderY + 92);
      ctx.stroke();
    } else {
      // Idle
      ctx.beginPath();
      ctx.moveTo(shoulderX, actualShoulderY);
      ctx.lineTo(shoulderX + 15 * f, actualShoulderY + 75);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(shoulderX, actualShoulderY);
      ctx.lineTo(shoulderX - 15 * f, actualShoulderY + 75);
      ctx.stroke();
    }

    // 4. HEAD (Oversized round head, pure white fill with crisp black outline)
    ctx.save();
    ctx.translate(shoulderX, headCenterY);
    ctx.rotate(pose.headTilt);

    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(0, 0, headRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 5. EYES (two small black expressive dots)
    ctx.fillStyle = '#000000';
    let eyeOffsetX = 12 * f;
    let eyeOffsetY = -4;
    let eyeRadius = 4.5;

    if (pose.eyeDirection === 'backward') {
      eyeOffsetX = -15 * f; // looking behind
      eyeOffsetY = -2;
    } else if (pose.eyeDirection === 'down') {
      eyeOffsetX = 4 * f;
      eyeOffsetY = 14; // looking down at empty floor
    }

    if (pose.isShocked) {
      eyeRadius = 6.0; // wide eyes
    }

    // Left eye & right eye
    ctx.beginPath();
    ctx.arc(eyeOffsetX - 10 * f, eyeOffsetY, eyeRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(eyeOffsetX + 10 * f, eyeOffsetY, eyeRadius, 0, Math.PI * 2);
    ctx.fill();

    // Little mouth for shocked or awkward expression
    if (pose.isShocked) {
      ctx.beginPath();
      ctx.arc(eyeOffsetX, eyeOffsetY + 16, 5, 0, Math.PI * 2);
      ctx.stroke();
    } else if (pose.headTilt > 0.2) {
      // Downcast little curved mouth
      ctx.beginPath();
      ctx.arc(eyeOffsetX, eyeOffsetY + 22, 10, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
    }

    ctx.restore();
    ctx.restore();
  }

  // ==========================================================
  // SHADOW: Attached to feet (Scene 1)
  // ==========================================================
  private renderAttachedShadow(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    legCycle: number,
    _armCycle: number,
    isAirborne: boolean
  ) {
    ctx.save();
    ctx.fillStyle = '#000000';

    if (isAirborne) {
      // Compact ellipse directly below airborne character
      ctx.beginPath();
      ctx.ellipse(x, y + 2, 45, 12, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Projection shadow matching stride
      const spread = legCycle * 35;
      ctx.beginPath();
      ctx.ellipse(x + spread * 0.4, y + 2, 65, 13, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // ==========================================================
  // SHADOW: Standing Detached Silhouette (Scene 2)
  // ==========================================================
  private renderDetachedShadowStanding(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    tilt: number,
    facing: number
  ) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#000000';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const hipY = -120;
    const shoulderY = -230;
    const headCenterY = shoulderY - 60;
    const headRadius = 48;

    // Legs: solid black lines
    ctx.beginPath();
    ctx.moveTo(0, hipY);
    ctx.lineTo(15 * facing, 0);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, hipY);
    ctx.lineTo(-15 * facing, 0);
    ctx.stroke();

    // Torso
    ctx.beginPath();
    ctx.moveTo(0, hipY);
    ctx.lineTo(0, shoulderY);
    ctx.stroke();

    // Arms: stiff, formal posture
    ctx.beginPath();
    ctx.moveTo(0, shoulderY);
    ctx.lineTo(18 * facing, shoulderY + 80);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, shoulderY);
    ctx.lineTo(-18 * facing, shoulderY + 80);
    ctx.stroke();

    // Head: SOLID BLACK CIRCLE (no face)
    ctx.save();
    ctx.translate(0, headCenterY);
    ctx.rotate(tilt);
    ctx.beginPath();
    ctx.arc(0, 0, headRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }

  // ==========================================================
  // SHADOW: With Clipboard & Accusing Point (Scene 3)
  // ==========================================================
  private renderShadowWithClipboard(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    state: 'pulling_clipboard' | 'tapping' | 'accusing',
    tapPhase: number,
    config: StudioConfig
  ) {
    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = '#000000';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const hipY = -120;
    const shoulderY = -230;
    const headCenterY = shoulderY - 60;
    const headRadius = 48;

    // Feet/Legs
    ctx.beginPath();
    ctx.moveTo(0, hipY);
    ctx.lineTo(20, 0);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, hipY);
    ctx.lineTo(-15, 0);
    ctx.stroke();

    // Torso
    ctx.beginPath();
    ctx.moveTo(0, hipY);
    ctx.lineTo(0, shoulderY);
    ctx.stroke();

    // Head: Solid black
    ctx.beginPath();
    ctx.arc(0, headCenterY, headRadius, 0, Math.PI * 2);
    ctx.fill();

    // Left Arm holding clipboard
    const clipX = 70;
    const clipY = shoulderY + 50;

    ctx.beginPath();
    ctx.moveTo(0, shoulderY);
    ctx.lineTo(40, shoulderY + 45);
    ctx.lineTo(clipX - 10, clipY);
    ctx.stroke();

    // Draw Clipboard: crisp white rectangle with clean black outline + soft red clip accent
    ctx.save();
    ctx.translate(clipX, clipY);
    ctx.rotate(0.12);

    const boardW = 68;
    const boardH = 92;

    // Board background (pure white)
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;
    ctx.fillRect(-boardW / 2, -boardH / 2, boardW, boardH);
    ctx.strokeRect(-boardW / 2, -boardH / 2, boardW, boardH);

    // Subtle blank lines on paper
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-boardW / 2 + 10, -boardH / 2 + 30);
    ctx.lineTo(boardW / 2 - 10, -boardH / 2 + 30);
    ctx.moveTo(-boardW / 2 + 10, -boardH / 2 + 48);
    ctx.lineTo(boardW / 2 - 10, -boardH / 2 + 48);
    ctx.moveTo(-boardW / 2 + 10, -boardH / 2 + 66);
    ctx.lineTo(boardW / 2 - 15, -boardH / 2 + 66);
    ctx.stroke();

    // Single muted soft-red accent on clip!
    ctx.fillStyle = config.accentColor || '#e11d48';
    ctx.fillRect(-18, -boardH / 2 - 8, 36, 12);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.strokeRect(-18, -boardH / 2 - 8, 36, 12);

    ctx.restore();

    // Right Arm action: tapping or accusing
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 14;

    if (state === 'accusing') {
      // Extended straight accusing pointing arm toward stick figure (rightward)
      ctx.beginPath();
      ctx.moveTo(0, shoulderY);
      ctx.lineTo(70, shoulderY - 10);
      ctx.lineTo(155, shoulderY - 20); // direct pointing finger
      ctx.stroke();

      // Sharp pointed finger tip
      ctx.beginPath();
      ctx.arc(155, shoulderY - 20, 6, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Tapping on clipboard
      const tapDip = tapPhase * 18;
      ctx.beginPath();
      ctx.moveTo(0, shoulderY);
      ctx.lineTo(35, shoulderY + 15);
      ctx.lineTo(clipX + 5, clipY - 10 + tapDip);
      ctx.stroke();

      // Tap ripple indicator when finger strikes paper
      if (tapPhase > 0.6) {
        ctx.strokeStyle = config.accentColor || '#e11d48';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(clipX + 8, clipY - 8 + tapDip, 14 * tapPhase, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  // ==========================================================
  // SHADOW: Sitting Cross-Legged with Folded Arms (Scene 4)
  // ==========================================================
  private renderShadowSittingCrossLegged(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    headShake: number
  ) {
    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = '#000000';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const sitHipY = -40;
    const sitShoulderY = -150;
    const sitHeadY = sitShoulderY - 55;
    const headRadius = 48;

    // Cross-legged base
    ctx.beginPath();
    ctx.moveTo(-50, 0);
    ctx.lineTo(0, sitHipY);
    ctx.lineTo(50, 0);
    ctx.stroke();

    // Crossed knees horizontal loop
    ctx.beginPath();
    ctx.moveTo(-60, -12);
    ctx.quadraticCurveTo(0, sitHipY + 10, 60, -12);
    ctx.stroke();

    // Torso leaning slightly back, stubborn posture
    ctx.beginPath();
    ctx.moveTo(0, sitHipY);
    ctx.lineTo(-8, sitShoulderY);
    ctx.stroke();

    // Folded arms tightly across chest
    ctx.beginPath();
    ctx.moveTo(-8, sitShoulderY);
    ctx.lineTo(25, sitShoulderY + 35);
    ctx.lineTo(-30, sitShoulderY + 45);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-8, sitShoulderY);
    ctx.lineTo(-35, sitShoulderY + 35);
    ctx.lineTo(25, sitShoulderY + 45);
    ctx.stroke();

    // Head: Solid black with exaggerated slow head shake
    ctx.save();
    ctx.translate(-8, sitHeadY);
    ctx.rotate(headShake);
    ctx.beginPath();
    ctx.arc(0, 0, headRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }

  // ==========================================================
  // SHADOW: Thumbs Down Gesture (Scene 5)
  // ==========================================================
  private renderShadowThumbsDown(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    t: number
  ) {
    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = '#000000';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const hipY = -120;
    const shoulderY = -230;
    const headCenterY = shoulderY - 60;
    const headRadius = 48;

    // Facing forward toward camera/viewer
    // Legs
    ctx.beginPath();
    ctx.moveTo(0, hipY);
    ctx.lineTo(-25, 0);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, hipY);
    ctx.lineTo(25, 0);
    ctx.stroke();

    // Torso
    ctx.beginPath();
    ctx.moveTo(0, hipY);
    ctx.lineTo(0, shoulderY);
    ctx.stroke();

    // Head: solid black circle, deadpan facing viewer
    ctx.beginPath();
    ctx.arc(0, headCenterY, headRadius, 0, Math.PI * 2);
    ctx.fill();

    // Left arm resting by side
    ctx.beginPath();
    ctx.moveTo(0, shoulderY);
    ctx.lineTo(-25, shoulderY + 80);
    ctx.stroke();

    // Right arm: extended directly toward camera with unmistakable THUMBS-DOWN
    const armProg = Math.min(1.0, (t - 8.0) / 0.5);
    const handX = 75 * armProg;
    const handY = (shoulderY + 10) * armProg + (shoulderY + 60) * (1 - armProg);

    ctx.beginPath();
    ctx.moveTo(0, shoulderY);
    ctx.lineTo(handX * 0.5, handY - 15);
    ctx.lineTo(handX, handY);
    ctx.stroke();

    // Thumbs-down fist silhouette
    ctx.save();
    ctx.translate(handX, handY);
    // Closed fist
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fill();
    // Exaggerated thumb pointing downward
    ctx.beginPath();
    ctx.moveTo(0, 8);
    ctx.lineTo(0, 38);
    ctx.lineWidth = 10;
    ctx.stroke();
    // Thumb tip rounded cap
    ctx.beginPath();
    ctx.arc(0, 38, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }

  // ==========================================================
  // SHADOW: Walking away out of frame (Scene 5 end)
  // ==========================================================
  private renderShadowWalkingAway(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    walkCycle: number
  ) {
    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = '#000000';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const hipY = -120;
    const shoulderY = -230;
    const headCenterY = shoulderY - 60;
    const headRadius = 48;

    // Striding decisively to the left (-facing)
    const legSpread = walkCycle * 40;
    ctx.beginPath();
    ctx.moveTo(0, hipY);
    ctx.lineTo(-legSpread, 0);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, hipY);
    ctx.lineTo(legSpread, 0);
    ctx.stroke();

    // Torso
    ctx.beginPath();
    ctx.moveTo(0, hipY);
    ctx.lineTo(0, shoulderY);
    ctx.stroke();

    // Arms swinging with stride
    ctx.beginPath();
    ctx.moveTo(0, shoulderY);
    ctx.lineTo(-legSpread * 1.2, shoulderY + 70);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, shoulderY);
    ctx.lineTo(legSpread * 1.2, shoulderY + 70);
    ctx.stroke();

    // Head
    ctx.beginPath();
    ctx.arc(0, headCenterY, headRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // ==========================================================
  // CAPTIONS OVERLAY (Crisp, mobile-safe typography)
  // ==========================================================
  private renderCaptions(ctx: CanvasRenderingContext2D, t: number, config: StudioConfig) {
    let captionText = '';
    let isEndCard = false;

    if (t < 2.0) {
      captionText = config.customVO1 || 'WHAT IF YOUR SHADOW QUIT?';
    } else if (t >= 8.4) {
      captionText = config.customEndCaption || 'YOUR SHADOW HAS RIGHTS.';
      isEndCard = true;
    }

    if (!captionText) return;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (isEndCard) {
      // Big bold punchline typography in safe zone
      const cardY = 560;
      ctx.font = '800 52px "Plus Jakarta Sans", sans-serif';

      // Clean background pill-free high contrast backing
      const metrics = ctx.measureText(captionText);
      const textW = metrics.width + 60;
      const textH = 76;

      ctx.fillStyle = '#000000';
      ctx.fillRect(this.width / 2 - textW / 2, cardY - textH / 2, textW, textH);

      // Soft red accent strip on top of punchline card
      ctx.fillStyle = config.accentColor || '#e11d48';
      ctx.fillRect(this.width / 2 - textW / 2, cardY - textH / 2, textW, 6);

      ctx.fillStyle = '#ffffff';
      ctx.fillText(captionText, this.width / 2, cardY + 2);
    } else {
      // Opening caption at top safe area
      const textY = 480;
      ctx.font = '800 44px "Plus Jakarta Sans", sans-serif';

      const metrics = ctx.measureText(captionText);
      const textW = metrics.width + 50;
      const textH = 68;

      ctx.fillStyle = '#000000';
      ctx.fillRect(this.width / 2 - textW / 2, textY - textH / 2, textW, textH);

      ctx.fillStyle = '#ffffff';
      ctx.fillText(captionText, this.width / 2, textY + 2);
    }

    ctx.restore();
  }

  // ==========================================================
  // MOBILE SAFE ZONES (9:16 vertical video guidelines)
  // ==========================================================
  private renderSafeZones(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.strokeStyle = 'rgba(225, 29, 72, 0.45)';
    ctx.lineWidth = 3;
    ctx.setLineDash([12, 8]);

    // Top safe margin (header & status bar: ~220px)
    ctx.strokeRect(60, 220, this.width - 120, this.height - 560);

    // Right interaction rail (TikTok / Shorts side buttons)
    ctx.fillStyle = 'rgba(225, 29, 72, 0.08)';
    ctx.fillRect(this.width - 160, 400, 120, 900);

    // Bottom safe area (caption & sound pill: ~340px)
    ctx.fillRect(60, this.height - 340, this.width - 120, 260);

    ctx.fillStyle = '#e11d48';
    ctx.font = '600 24px "JetBrains Mono", monospace';
    ctx.fillText('9:16 MOBILE SAFE BOUNDS (1080 × 1920)', 80, 200);
    ctx.fillText('SIDE INTERACTION RAIL', this.width - 320, 380);
    ctx.fillText('BOTTOM PLATFORM OVERLAYS', 80, this.height - 360);

    ctx.restore();
  }
}
