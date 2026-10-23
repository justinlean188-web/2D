import { StudioConfig } from '../types';

/**
 * MindTrapsRenderer
 *
 * "ANGRY STICKMAN: MIND TRAPS & THE RED CAGE"
 * A 30-second minimalist monochrome explainer short.
 *
 * "A few lines can explain a big idea. On a pure-white or pure-black canvas,
 * characters, props, and accent colors do the storytelling.
 * Up to three vivid accent colors distinguish emotions, risks, or actions.
 * Turn anxiety into a cage or attention into a progress bar."
 *
 * Scene 1 (0-5s):   ANXIETY IS A CAGE.        (Style 1B: White on Black, 3D red cage constricting)
 * Scene 2 (5-10s):  ATTENTION OVERLOAD!       (Overhead vivid red HUD progress bar fills to 100%)
 * Scene 3 (10-16s): DECISIVE ACTION.          (Style 1A: Black on White, giant red gavel slams pillars)
 * Scene 4 (16-21s): FIND THE VECTOR.          (Minimalist maze, trajectory vector calculated)
 * Scene 5 (21-26s): SHATTER THE TRAP!         (Gavel smashes the red cage into 40+ flying shards)
 * Scene 6 (26-30s): FEW LINES. BIG IDEA.      (Clean posture, 100% Clarity gauge, confident thumbs-up)
 */

interface CameraKey {
  t: number;
  x: number;
  y: number;
  zoom: number;
}

const TAU = Math.PI * 2;
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const easeOut = (u: number) => 1 - Math.pow(1 - clamp(u, 0, 1), 2);

const CAPTIONS: { text: string; from: number; to: number }[] = [
  { text: 'ANXIETY IS A CAGE.', from: 0.5, to: 4.6 },
  { text: 'ATTENTION OVERLOAD!', from: 5.4, to: 9.6 },
  { text: 'DECISIVE ACTION.', from: 10.4, to: 15.6 },
  { text: 'FIND THE VECTOR.', from: 16.4, to: 20.6 },
  { text: 'SHATTER THE TRAP!', from: 21.4, to: 25.6 },
  { text: 'FEW LINES. BIG IDEA.', from: 26.4, to: 29.8 },
];

export class MindTrapsRenderer {
  public readonly width = 1080;
  public readonly height = 1920;

  private readonly cameraKeys: CameraKey[] = [
    { t: 0.0, x: 540, y: 960, zoom: 1.0 },
    { t: 4.8, x: 540, y: 960, zoom: 1.0 },
    { t: 5.1, x: 540, y: 880, zoom: 1.15 },
    { t: 9.8, x: 540, y: 880, zoom: 1.15 },
    { t: 10.1, x: 540, y: 960, zoom: 1.0 },
    { t: 15.8, x: 540, y: 960, zoom: 1.0 },
    { t: 16.1, x: 540, y: 980, zoom: 1.1 },
    { t: 20.8, x: 540, y: 980, zoom: 1.1 },
    { t: 21.1, x: 540, y: 960, zoom: 1.05 },
    { t: 25.8, x: 540, y: 960, zoom: 1.05 },
    { t: 26.1, x: 540, y: 960, zoom: 1.0 },
    { t: 30.0, x: 540, y: 960, zoom: 1.0 },
  ];

  public render(ctx: CanvasRenderingContext2D, t: number, config: StudioConfig) {
    const defaultAccent = config.vividAccent || '#ef4444'; // Vivid Red as seen in reference image
    const userTheme = config.canvasTheme || 'black-on-white';

    // In Mind Traps, Scenes 1 & 2 showcase Style 1B (White on Black),
    // Scene 3 showcases Style 1A (Black on White) matching the user reference image,
    // while honoring the user's explicit canvasTheme override if set.
    let isBlackCanvas = false;
    if (userTheme === 'white-on-black') {
      isBlackCanvas = true;
    } else if (userTheme === 'black-on-white') {
      // Scene 1, 2, and 5 utilize dark tension backgrounds, Scene 3 and 6 utilize clean white
      isBlackCanvas = (t >= 0 && t < 10) || (t >= 21 && t < 26);
    }

    const bg = isBlackCanvas ? '#000000' : '#ffffff';
    const figureColor = isBlackCanvas ? '#ffffff' : '#000000';
    const gridColor = isBlackCanvas ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';

    // Fill Canvas Base
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.save();
    this.applyCamera(ctx, t);

    // Subtle Minimalist Guide Grid
    this.renderMinimalistGrid(ctx, gridColor);

    // Render Scene-specific visual metaphors
    if (t < 5.0) {
      this.renderScene1AnxietyCage(ctx, t, figureColor, defaultAccent);
    } else if (t < 10.0) {
      this.renderScene2AttentionBar(ctx, t, figureColor, defaultAccent);
    } else if (t < 16.0) {
      this.renderScene3GavelPillars(ctx, t, figureColor, defaultAccent);
    } else if (t < 21.0) {
      this.renderScene4CognitiveMaze(ctx, t, figureColor, defaultAccent);
    } else if (t < 26.0) {
      this.renderScene5ShatterTrap(ctx, t, figureColor, defaultAccent);
    } else {
      this.renderScene6ClarityMastery(ctx, t, figureColor, defaultAccent);
    }

    ctx.restore();

    // Burned-in Minimalist Monochrome Captions
    this.renderCaption(ctx, t, isBlackCanvas, defaultAccent);

    // Safe zone guides (if enabled)
    if (config.showSafeZones) {
      this.renderSafeZones(ctx, isBlackCanvas);
    }
  }

  // -------------------------------------------------------------
  // CAMERA
  // -------------------------------------------------------------
  private applyCamera(ctx: CanvasRenderingContext2D, t: number) {
    let cam = this.cameraKeys[0];
    for (let i = 0; i < this.cameraKeys.length - 1; i++) {
      const k1 = this.cameraKeys[i];
      const k2 = this.cameraKeys[i + 1];
      if (t >= k1.t && t <= k2.t) {
        const u = easeOut((t - k1.t) / (k2.t - k1.t));
        cam = {
          t,
          x: lerp(k1.x, k2.x, u),
          y: lerp(k1.y, k2.y, u),
          zoom: lerp(k1.zoom, k2.zoom, u),
        };
        break;
      }
    }

    // Screen Shake on Gavel Slam (t: 12.8s) & Cage Shatter (t: 23.2s)
    let shakeX = 0;
    let shakeY = 0;
    if (t >= 12.8 && t < 13.5) {
      const decay = 1 - (t - 12.8) / 0.7;
      shakeX = Math.sin((t - 12.8) * 80) * 22 * decay;
      shakeY = Math.cos((t - 12.8) * 90) * 18 * decay;
    } else if (t >= 23.2 && t < 24.0) {
      const decay = 1 - (t - 23.2) / 0.8;
      shakeX = Math.sin((t - 23.2) * 75) * 26 * decay;
      shakeY = Math.cos((t - 23.2) * 85) * 20 * decay;
    }

    ctx.translate(this.width / 2 + shakeX, this.height / 2 + shakeY);
    ctx.scale(cam.zoom, cam.zoom);
    ctx.translate(-cam.x, -cam.y);
  }

  private renderMinimalistGrid(ctx: CanvasRenderingContext2D, stroke: string) {
    ctx.save();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1;
    // Floor guideline
    ctx.beginPath();
    ctx.moveTo(0, 1460);
    ctx.lineTo(this.width, 1460);
    ctx.stroke();
    ctx.restore();
  }

  // -------------------------------------------------------------
  // SCENE 1: THE ANXIETY CAGE (Style 1B: White on Black)
  // -------------------------------------------------------------
  private renderScene1AnxietyCage(
    ctx: CanvasRenderingContext2D,
    t: number,
    figureColor: string,
    accent: string
  ) {
    const pulse = Math.sin(t * 5) * 8;
    const constrict = clamp((t - 0.5) / 3.8, 0, 1);
    const cageWidth = 540 - constrict * 110 + pulse;
    const cageHeight = 680 - constrict * 120 + pulse;

    // Draw Stickman clutching head in distress (White stickman on black canvas)
    const stickY = 1140;
    this.drawStickman(ctx, 540, stickY, figureColor, {
      headRadius: 65,
      pose: 'clutch-head',
      time: t,
      eyebrows: 'anxious',
    });

    // Draw the 3D Perspective Wireframe Red Cage (Matching Style 1B in user image)
    this.drawRedCage(ctx, 540, 1080, cageWidth, cageHeight, accent, constrict, t);
  }

  private drawRedCage(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    w: number,
    h: number,
    accent: string,
    constrict: number,
    t: number
  ) {
    ctx.save();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const halfW = w / 2;
    const halfH = h / 2;

    // Outer Cage Frame (bowed inward slightly to convey constriction)
    ctx.beginPath();
    ctx.moveTo(cx - halfW, cy - halfH);
    ctx.quadraticCurveTo(cx - halfW + 30 * constrict, cy, cx - halfW, cy + halfH);
    ctx.lineTo(cx + halfW, cy + halfH);
    ctx.quadraticCurveTo(cx + halfW - 30 * constrict, cy, cx + halfW, cy - halfH);
    ctx.closePath();
    ctx.stroke();

    // Inner 3D perspective depth box
    const innerW = halfW * 0.42;
    const innerH = halfH * 0.45;
    ctx.lineWidth = 9;
    ctx.strokeRect(cx - innerW, cy - innerH, innerW * 2, innerH * 2);

    // Corner Connecting Struts (Creating the 3D tunnel depth)
    ctx.beginPath();
    ctx.moveTo(cx - halfW, cy - halfH);
    ctx.lineTo(cx - innerW, cy - innerH);
    ctx.moveTo(cx + halfW, cy - halfH);
    ctx.lineTo(cx + innerW, cy - innerH);
    ctx.moveTo(cx - halfW, cy + halfH);
    ctx.lineTo(cx - innerW, cy + innerH);
    ctx.moveTo(cx + halfW, cy + halfH);
    ctx.lineTo(cx + innerW, cy + innerH);
    ctx.stroke();

    // Curved Vertical Cage Bars (constricting & bending inwards towards center)
    const barCount = 7;
    ctx.lineWidth = 11;
    for (let i = 1; i < barCount; i++) {
      const u = i / barCount;
      const xTop = cx - halfW + w * u;
      const xMid = cx - halfW + w * u + (cx - (cx - halfW + w * u)) * (0.35 * constrict);
      ctx.beginPath();
      ctx.moveTo(xTop, cy - halfH);
      ctx.quadraticCurveTo(xMid, cy, xTop, cy + halfH);
      ctx.stroke();
    }

    // Horizontal Rib Bars
    const hBarCount = 5;
    for (let i = 1; i < hBarCount; i++) {
      const v = i / hBarCount;
      const yL = cy - halfH + h * v;
      const yMid = cy - halfH + h * v + (cy - (cy - halfH + h * v)) * (0.28 * constrict);
      ctx.beginPath();
      ctx.moveTo(cx - halfW, yL);
      ctx.quadraticCurveTo(cx, yMid, cx + halfW, yL);
      ctx.stroke();
    }

    // Anxiety aura particles
    const particleAlpha = 0.4 + 0.3 * Math.sin(t * 8);
    ctx.globalAlpha = particleAlpha;
    ctx.fillStyle = accent;
    for (let p = 0; p < 8; p++) {
      const angle = (p / 8) * TAU + t * 2;
      const r = halfW + 30 + Math.sin(t * 6 + p) * 20;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(angle) * r, cy + Math.sin(angle) * (r * 0.9), 6, 0, TAU);
      ctx.fill();
    }

    ctx.restore();
  }

  // -------------------------------------------------------------
  // SCENE 2: ATTENTION OVERLOAD (Progress Bar Metaphor)
  // -------------------------------------------------------------
  private renderScene2AttentionBar(
    ctx: CanvasRenderingContext2D,
    t: number,
    figureColor: string,
    accent: string
  ) {
    const sceneT = t - 5.0; // 0 to 5s
    const progress = clamp(sceneT / 4.2, 0, 1);
    const pct = Math.min(100, Math.floor(progress * 105));

    // Stickman staring upward in tension
    const stickY = 1200;
    this.drawStickman(ctx, 540, stickY, figureColor, {
      headRadius: 65,
      pose: 'attention-overload',
      time: t,
      eyebrows: sceneT > 2.5 ? 'angry' : 'neutral',
    });

    // Comic anger mark 💢 beside head on overload
    if (sceneT > 2.8) {
      this.drawAngerVein(ctx, 625, stickY - 210, accent, t);
    }

    // Steam puffs venting out of ears
    if (sceneT > 3.0) {
      this.drawSteamPuffs(ctx, 540, stickY - 200, figureColor, t);
    }

    // Floating Overhead HUD Progress Bar
    const barX = 180;
    const barY = 580;
    const barW = 720;
    const barH = 54;

    ctx.save();
    // Frame Box
    ctx.strokeStyle = figureColor;
    ctx.lineWidth = 6;
    ctx.strokeRect(barX, barY, barW, barH);

    // Progress Bar Fill (Vivid Accent Red)
    const fillW = Math.min(barW - 12, (barW - 12) * (pct / 100));
    ctx.fillStyle = accent;
    ctx.fillRect(barX + 6, barY + 6, fillW, barH - 12);

    // Hazard Stripes if over 85%
    if (pct > 85) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      for (let s = 0; s < fillW; s += 28) {
        ctx.beginPath();
        ctx.moveTo(barX + 6 + s, barY + barH - 6);
        ctx.lineTo(barX + 6 + s + 14, barY + 6);
        ctx.lineTo(barX + 6 + s + 24, barY + 6);
        ctx.lineTo(barX + 6 + s + 10, barY + barH - 6);
        ctx.fill();
      }
    }

    // Label Above Bar
    ctx.fillStyle = figureColor;
    ctx.font = '900 36px "Arial Black", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('MENTAL ATTENTION LOAD', barX, barY - 22);

    // Percentage Readout Right
    ctx.textAlign = 'right';
    ctx.fillStyle = pct >= 100 ? accent : figureColor;
    ctx.fillText(pct >= 100 ? 'OVERFLOW!' : `${pct}%`, barX + barW, barY - 22);

    // Warning alert box when overflow hits
    if (pct >= 95) {
      const flash = Math.sin(t * 18) > 0;
      if (flash) {
        ctx.strokeStyle = accent;
        ctx.lineWidth = 4;
        ctx.strokeRect(barX - 16, barY - 70, barW + 32, barH + 96);
      }
    }

    ctx.restore();
  }

  // -------------------------------------------------------------
  // SCENE 3: THE RED GAVEL & BROKEN PILLARS (Style 1A: Black on White)
  // -------------------------------------------------------------
  private renderScene3GavelPillars(
    ctx: CanvasRenderingContext2D,
    t: number,
    figureColor: string,
    accent: string
  ) {
    const sceneT = t - 10.0; // 0 to 6s
    const isImpacted = sceneT >= 2.8;

    // Draw the massive Cracked Architectural Columns on Left and Right (Matching user image 1A)
    this.drawBrokenColumns(ctx, isImpacted, sceneT, figureColor);

    // Ground cracks spreading outwards from impact point (540, 1460)
    if (isImpacted) {
      const crackProg = clamp((sceneT - 2.8) / 0.8, 0, 1);
      this.drawFloorCracks(ctx, 540, 1460, crackProg, figureColor);
    }

    // Stickman wielding the Giant Vivid Red Gavel
    const stickY = 1460;
    this.drawStickmanWieldingGavel(ctx, 540, stickY, figureColor, accent, sceneT);
  }

  private drawBrokenColumns(
    ctx: CanvasRenderingContext2D,
    impacted: boolean,
    sceneT: number,
    colColor: string
  ) {
    ctx.save();
    ctx.fillStyle = colColor;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.lineJoin = 'miter';

    // Left Column Group
    const leftShift = impacted ? Math.min(25, (sceneT - 2.8) * 40) : 0;
    const leftRot = impacted ? Math.min(0.08, (sceneT - 2.8) * 0.1) : 0;

    ctx.save();
    ctx.translate(140 - leftShift, 800);
    ctx.rotate(-leftRot);
    // Base block
    ctx.fillRect(-80, 520, 160, 140);
    ctx.strokeRect(-80, 520, 160, 140);
    // Main column shaft
    ctx.fillRect(-65, -340, 130, 860);
    ctx.strokeRect(-65, -340, 130, 860);
    // Capital
    ctx.fillRect(-85, -420, 170, 80);
    ctx.strokeRect(-85, -420, 170, 80);

    // Inner cracking fracture lines
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-65, 120);
    ctx.lineTo(-20, 180);
    ctx.lineTo(25, 140);
    ctx.lineTo(65, 260);
    ctx.stroke();

    ctx.restore();

    // Right Column Group (Buckling inward as in reference image)
    const rightShift = impacted ? Math.min(25, (sceneT - 2.8) * 40) : 0;
    const rightRot = impacted ? Math.min(0.09, (sceneT - 2.8) * 0.12) : 0;

    ctx.save();
    ctx.translate(940 + rightShift, 800);
    ctx.rotate(rightRot);
    // Base block
    ctx.fillRect(-80, 520, 160, 140);
    ctx.strokeRect(-80, 520, 160, 140);
    // Main column shaft
    ctx.fillRect(-65, -340, 130, 860);
    ctx.strokeRect(-65, -340, 130, 860);
    // Capital
    ctx.fillRect(-85, -420, 170, 80);
    ctx.strokeRect(-85, -420, 170, 80);

    // Inner zigzag crack
    ctx.beginPath();
    ctx.moveTo(65, -40);
    ctx.lineTo(10, 40);
    ctx.lineTo(-30, 10);
    ctx.lineTo(-65, 120);
    ctx.stroke();

    ctx.restore();

    ctx.restore();
  }

  private drawFloorCracks(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    prog: number,
    stroke: string
  ) {
    ctx.save();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const maxDist = 440 * prog;
    const crackBranches = [
      [[-20, -5], [-90, -35], [-180, -20], [-290, -70], [-390, -60]],
      [[-10, 10], [-80, 25], [-170, 15], [-270, 35], [-380, 20]],
      [[25, -10], [105, -40], [210, -25], [315, -60], [420, -50]],
      [[15, 15], [95, 30], [185, 20], [285, 45], [400, 30]],
      [[0, -25], [-40, -110], [-70, -220], [-120, -340]],
      [[10, -30], [50, -125], [85, -230], [130, -360]],
    ];

    for (const branch of crackBranches) {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      for (const [dx, dy] of branch) {
        const d = Math.hypot(dx, dy);
        if (d > maxDist) break;
        ctx.lineTo(cx + dx, cy + dy);
      }
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawStickmanWieldingGavel(
    ctx: CanvasRenderingContext2D,
    cx: number,
    floorY: number,
    figureColor: string,
    accent: string,
    sceneT: number
  ) {
    const isImpacted = sceneT >= 2.8;

    // Gavel Angle and Stickman Pose interpolation
    let gavelAngle = -0.3; // Ready overhead
    let hipY = floorY - 320;
    let headX = cx;
    let headY = hipY - 140;

    if (sceneT < 2.0) {
      // Breathing, holding giant gavel proudly overhead (Matching Style 1A image)
      gavelAngle = -0.35 + Math.sin(sceneT * 4) * 0.05;
    } else if (sceneT < 2.7) {
      // Wind-up high
      const u = (sceneT - 2.0) / 0.7;
      gavelAngle = lerp(-0.35, -1.1, u);
      hipY = floorY - 320 - u * 60; // Little jump
      headY = hipY - 140;
    } else if (sceneT < 2.85) {
      // Smash down!
      const u = (sceneT - 2.7) / 0.15;
      gavelAngle = lerp(-1.1, 0.95, u);
      hipY = floorY - 260; // Crouched impact
      headY = hipY - 120;
    } else {
      // Hold impact pose
      gavelAngle = 0.95;
      hipY = floorY - 260;
      headY = hipY - 120;
    }

    ctx.save();
    ctx.strokeStyle = figureColor;
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Head
    ctx.fillStyle = figureColor;
    ctx.beginPath();
    ctx.arc(headX, headY, 58, 0, TAU);
    ctx.fill();

    // Angry eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(headX + 16, headY - 6, 7, 12, 0.3, 0, TAU);
    ctx.fill();

    // Angry brow slash
    ctx.strokeStyle = accent;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(headX + 4, headY - 24);
    ctx.lineTo(headX + 32, headY - 12);
    ctx.stroke();

    // Spine
    ctx.strokeStyle = figureColor;
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(headX, headY + 58);
    ctx.lineTo(cx, hipY);
    ctx.stroke();

    // Legs
    if (!isImpacted) {
      ctx.beginPath();
      ctx.moveTo(cx, hipY);
      ctx.lineTo(cx - 50, hipY + 160);
      ctx.lineTo(cx - 60, floorY);
      ctx.moveTo(cx, hipY);
      ctx.lineTo(cx + 50, hipY + 160);
      ctx.lineTo(cx + 60, floorY);
      ctx.stroke();
    } else {
      // Squatting impact pose
      ctx.beginPath();
      ctx.moveTo(cx, hipY);
      ctx.lineTo(cx - 90, hipY + 120);
      ctx.lineTo(cx - 100, floorY);
      ctx.moveTo(cx, hipY);
      ctx.lineTo(cx + 90, hipY + 120);
      ctx.lineTo(cx + 100, floorY);
      ctx.stroke();
    }

    // Hands reaching up to grip the gavel handle
    const handleGripX = cx + Math.sin(gavelAngle) * 90;
    const handleGripY = hipY - 160 - Math.cos(gavelAngle) * 90;

    ctx.beginPath();
    ctx.moveTo(headX - 30, headY + 80);
    ctx.lineTo(handleGripX - 10, handleGripY);
    ctx.moveTo(headX + 30, headY + 80);
    ctx.lineTo(handleGripX + 10, handleGripY);
    ctx.stroke();

    // Giant Vivid Red Gavel
    this.drawGiantGavel(ctx, handleGripX, handleGripY, gavelAngle, accent, isImpacted);

    ctx.restore();
  }

  private drawGiantGavel(
    ctx: CanvasRenderingContext2D,
    pivotX: number,
    pivotY: number,
    angle: number,
    accent: string,
    isImpacted: boolean
  ) {
    ctx.save();
    ctx.translate(pivotX, pivotY);
    ctx.rotate(angle);

    // Gavel Handle (Long sturdy wooden shaft)
    ctx.fillStyle = '#111111';
    ctx.fillRect(-14, -220, 28, 440);
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 3;
    ctx.strokeRect(-14, -220, 28, 440);

    // Massive Gavel Head (Vivid Accent Red as shown in user reference image)
    const headW = 260;
    const headH = 140;
    const headY = -270;

    ctx.fillStyle = accent;
    ctx.fillRect(-headW / 2, headY - headH / 2, headW, headH);

    // Beveled cylindrical rings & highlights
    ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.fillRect(-headW / 2, headY - headH / 2, headW, 26);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(-headW / 2, headY + headH / 2 - 28, headW, 28);

    // Side striking face rings
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect(-headW / 2, headY - headH / 2, headW, headH);

    ctx.restore();

    // Impact shockwave ring
    if (isImpacted) {
      ctx.save();
      ctx.strokeStyle = accent;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.ellipse(pivotX + 80, 1460, 120, 28, 0, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }
  }

  // -------------------------------------------------------------
  // SCENE 4: THE COGNITIVE MAZE & VECTOR TRAJECTORY
  // -------------------------------------------------------------
  private renderScene4CognitiveMaze(
    ctx: CanvasRenderingContext2D,
    t: number,
    figureColor: string,
    accent: string
  ) {
    const sceneT = t - 16.0; // 0 to 5s

    // Draw Minimalist Labyrinth Walls
    ctx.save();
    ctx.strokeStyle = figureColor;
    ctx.lineWidth = 8;
    ctx.lineCap = 'square';

    // Maze Blocks
    ctx.strokeRect(200, 1100, 180, 360);
    ctx.strokeRect(700, 1100, 180, 360);

    // Red Obstacle Barrier in center
    ctx.fillStyle = accent;
    ctx.fillRect(480, 1260, 120, 200);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.strokeRect(480, 1260, 120, 200);

    ctx.restore();

    // Stickman calculating trajectory & jumping over
    let stickX = 350;
    let stickY = 1460;
    let pose: 'walk' | 'jump' = 'walk';

    if (sceneT < 1.6) {
      stickX = 350 + sceneT * 50;
      stickY = 1460;
      pose = 'walk';
    } else {
      // Athletic leap over the red obstacle!
      const u = clamp((sceneT - 1.6) / 2.5, 0, 1);
      stickX = lerp(430, 680, u);
      stickY = 1460 - Math.sin(u * Math.PI) * 320;
      pose = 'jump';
    }

    // Trajectory dashed vector curve in vivid accent
    ctx.save();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 6;
    ctx.setLineDash([16, 12]);
    ctx.beginPath();
    ctx.moveTo(380, 1400);
    ctx.quadraticCurveTo(540, 960, 700, 1400);
    ctx.stroke();
    ctx.restore();

    this.drawStickman(ctx, stickX, stickY, figureColor, {
      headRadius: 58,
      pose: pose === 'jump' ? 'athletic-leap' : 'determined-walk',
      time: t,
      eyebrows: 'determined',
    });
  }

  // -------------------------------------------------------------
  // SCENE 5: SHATTERING THE TRAP (Gavel destroys Red Cage)
  // -------------------------------------------------------------
  private renderScene5ShatterTrap(
    ctx: CanvasRenderingContext2D,
    t: number,
    figureColor: string,
    accent: string
  ) {
    const sceneT = t - 21.0; // 0 to 5s
    const isShattered = sceneT >= 2.2;

    if (!isShattered) {
      // Cage standing in front of stickman
      this.drawRedCage(ctx, 540, 1150, 480, 620, accent, 0.4, t);
      // Stickman swinging gavel forward
      this.drawStickman(ctx, 320, 1460, figureColor, {
        headRadius: 62,
        pose: 'wind-up-smash',
        time: t,
        eyebrows: 'angry',
      });
    } else {
      // 40+ Exploding Cage Shards shooting outward
      const explodeT = sceneT - 2.2;
      this.drawExplodingShards(ctx, 540, 1150, explodeT, accent);

      // Triumphant landing stickman
      this.drawStickman(ctx, 540, 1460, figureColor, {
        headRadius: 62,
        pose: 'shatter-followthrough',
        time: t,
        eyebrows: 'determined',
      });
    }
  }

  private drawExplodingShards(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    explodeT: number,
    accent: string
  ) {
    ctx.save();
    ctx.fillStyle = accent;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;

    const shardCount = 36;
    for (let i = 0; i < shardCount; i++) {
      const angle = (i / shardCount) * TAU + (i % 3) * 0.4;
      const speed = 320 + (i % 7) * 90;
      const dist = speed * explodeT;
      const gravity = explodeT * explodeT * 380;
      const px = cx + Math.cos(angle) * dist;
      const py = cy + Math.sin(angle) * dist + gravity;
      const rot = explodeT * (5 + (i % 5));

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(rot);
      // Sharp geometric polygon shard
      ctx.beginPath();
      ctx.moveTo(-18, -8);
      ctx.lineTo(24, -16);
      ctx.lineTo(12, 18);
      ctx.lineTo(-22, 14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  // -------------------------------------------------------------
  // SCENE 6: MASTERY & CLARITY (100% Clarity HUD & Confident Stance)
  // -------------------------------------------------------------
  private renderScene6ClarityMastery(
    ctx: CanvasRenderingContext2D,
    t: number,
    figureColor: string,
    accent: string
  ) {
    const sceneT = t - 26.0;

    // Centered calm Stickman giving a thumbs-up
    this.drawStickman(ctx, 540, 1460, figureColor, {
      headRadius: 65,
      pose: 'confident-mastery',
      time: t,
      eyebrows: 'happy',
    });

    // Clean Minimalist Clarity HUD Bar
    const barX = 240;
    const barY = 620;
    const barW = 600;
    const barH = 46;

    ctx.save();
    ctx.strokeStyle = figureColor;
    ctx.lineWidth = 5;
    ctx.strokeRect(barX, barY, barW, barH);

    // Full 100% filled clean bar
    ctx.fillStyle = figureColor;
    ctx.fillRect(barX + 5, barY + 5, barW - 10, barH - 10);

    ctx.font = '900 32px "Arial Black", sans-serif';
    ctx.fillStyle = figureColor;
    ctx.textAlign = 'left';
    ctx.fillText('CLARITY LEVEL', barX, barY - 18);

    ctx.textAlign = 'right';
    ctx.fillText('100% BALANCED', barX + barW, barY - 18);

    // Sparkle near thumbs up
    if (sceneT > 1.2) {
      const sparkleAlpha = 0.5 + 0.5 * Math.sin(t * 12);
      ctx.globalAlpha = sparkleAlpha;
      ctx.fillStyle = accent;
      this.drawSparkle(ctx, 640, 1260, 18);
    }

    ctx.restore();
  }

  // -------------------------------------------------------------
  // SHARED STICKMAN RIG
  // -------------------------------------------------------------
  private drawStickman(
    ctx: CanvasRenderingContext2D,
    x: number,
    floorY: number,
    color: string,
    opts: {
      headRadius: number;
      pose: string;
      time: number;
      eyebrows: 'anxious' | 'neutral' | 'angry' | 'determined' | 'happy';
    }
  ) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const r = opts.headRadius;
    let hipY = floorY - 320;
    let headY = hipY - 140;

    if (opts.pose === 'clutch-head') {
      // Crouched clutching head in distress
      hipY = floorY - 240;
      headY = hipY - 120;

      // Head
      ctx.beginPath();
      ctx.arc(x, headY, r, 0, TAU);
      ctx.fill();

      // Spine
      ctx.beginPath();
      ctx.moveTo(x, headY + r);
      ctx.lineTo(x, hipY);
      ctx.stroke();

      // Legs bent
      ctx.beginPath();
      ctx.moveTo(x, hipY);
      ctx.lineTo(x - 60, hipY + 110);
      ctx.lineTo(x - 70, floorY);
      ctx.moveTo(x, hipY);
      ctx.lineTo(x + 60, hipY + 110);
      ctx.lineTo(x + 70, floorY);
      ctx.stroke();

      // Arms up clutching head
      ctx.beginPath();
      ctx.moveTo(x - 20, headY + r + 20);
      ctx.lineTo(x - r - 20, headY);
      ctx.lineTo(x - r + 10, headY - 10);
      ctx.moveTo(x + 20, headY + r + 20);
      ctx.lineTo(x + r + 20, headY);
      ctx.lineTo(x + r - 10, headY - 10);
      ctx.stroke();
    } else if (opts.pose === 'athletic-leap') {
      // Leap across maze
      hipY = floorY - 200;
      headY = hipY - 130;

      ctx.beginPath();
      ctx.arc(x, headY, r, 0, TAU);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(x, headY + r);
      ctx.lineTo(x - 20, hipY);
      ctx.stroke();

      // Dynamic leap legs
      ctx.beginPath();
      ctx.moveTo(x - 20, hipY);
      ctx.lineTo(x - 110, hipY + 60);
      ctx.lineTo(x - 140, hipY + 20);
      ctx.moveTo(x - 20, hipY);
      ctx.lineTo(x + 80, hipY + 70);
      ctx.lineTo(x + 120, hipY + 140);
      ctx.stroke();

      // Reach arms
      ctx.beginPath();
      ctx.moveTo(x, headY + r + 20);
      ctx.lineTo(x + 110, headY + 30);
      ctx.moveTo(x, headY + r + 20);
      ctx.lineTo(x - 90, headY + 60);
      ctx.stroke();
    } else if (opts.pose === 'confident-mastery') {
      // Standing tall, thumbs-up
      ctx.beginPath();
      ctx.arc(x, headY, r, 0, TAU);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(x, headY + r);
      ctx.lineTo(x, hipY);
      ctx.stroke();

      // Relaxed legs
      ctx.beginPath();
      ctx.moveTo(x, hipY);
      ctx.lineTo(x - 45, hipY + 160);
      ctx.lineTo(x - 45, floorY);
      ctx.moveTo(x, hipY);
      ctx.lineTo(x + 45, hipY + 160);
      ctx.lineTo(x + 45, floorY);
      ctx.stroke();

      // Left hand on hip, right hand giving thumbs-up
      ctx.beginPath();
      ctx.moveTo(x - 15, headY + r + 20);
      ctx.lineTo(x - 70, headY + r + 70);
      ctx.lineTo(x - 30, hipY);
      ctx.moveTo(x + 15, headY + r + 20);
      ctx.lineTo(x + 75, headY + r + 60);
      ctx.lineTo(x + 85, headY + r + 20);
      ctx.stroke();

      // Thumbs-up icon
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(x + 85, headY + r + 20);
      ctx.lineTo(x + 85, headY + r - 15);
      ctx.stroke();
    } else {
      // Standard standing / attention pose
      ctx.beginPath();
      ctx.arc(x, headY, r, 0, TAU);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(x, headY + r);
      ctx.lineTo(x, hipY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x, hipY);
      ctx.lineTo(x - 40, hipY + 160);
      ctx.lineTo(x - 40, floorY);
      ctx.moveTo(x, hipY);
      ctx.lineTo(x + 40, hipY + 160);
      ctx.lineTo(x + 40, floorY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x - 15, headY + r + 20);
      ctx.lineTo(x - 60, hipY);
      ctx.moveTo(x + 15, headY + r + 20);
      ctx.lineTo(x + 60, hipY);
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawAngerVein(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    accent: string,
    t: number
  ) {
    ctx.save();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    const s = 14 + Math.sin(t * 15) * 3;

    ctx.beginPath();
    ctx.arc(x - s, y - s, s, 0, Math.PI / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + s, y - s, s, Math.PI / 2, Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + s, y + s, s, Math.PI, (3 * Math.PI) / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x - s, y + s, s, (3 * Math.PI) / 2, TAU);
    ctx.stroke();
    ctx.restore();
  }

  private drawSteamPuffs(
    ctx: CanvasRenderingContext2D,
    cx: number,
    headY: number,
    stroke: string,
    t: number
  ) {
    ctx.save();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';

    for (const dir of [-1, 1]) {
      const startX = cx + dir * 65;
      const puffT = (t * 4) % 1;
      const px = startX + dir * (puffT * 45);
      const py = headY - 10 - puffT * 35;
      ctx.beginPath();
      ctx.arc(px, py, 10 + puffT * 12, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawSparkle(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, cy - size);
    ctx.lineTo(cx + size * 0.25, cy - size * 0.25);
    ctx.lineTo(cx + size, cy);
    ctx.lineTo(cx + size * 0.25, cy + size * 0.25);
    ctx.lineTo(cx, cy + size);
    ctx.lineTo(cx - size * 0.25, cy + size * 0.25);
    ctx.lineTo(cx - size, cy);
    ctx.lineTo(cx - size * 0.25, cy - size * 0.25);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // -------------------------------------------------------------
  // CAPTIONS
  // -------------------------------------------------------------
  private renderCaption(
    ctx: CanvasRenderingContext2D,
    t: number,
    isBlackCanvas: boolean,
    accent: string
  ) {
    for (const caption of CAPTIONS) {
      if (t < caption.from || t > caption.to) continue;
      const fadeIn = Math.min(1, (t - caption.from) / 0.18);
      const fadeOut = Math.min(1, (caption.to - t) / 0.18);
      const alpha = Math.max(0, Math.min(fadeIn, fadeOut));
      const pop = 1 + 0.08 * Math.exp(-Math.max(0, t - caption.from) * 22);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(this.width / 2, 1720);
      ctx.scale(pop, pop);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '900 72px "Arial Black", "Helvetica Neue", Arial, sans-serif';
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      // Thick contrasting outline
      ctx.strokeStyle = isBlackCanvas ? '#000000' : '#000000';
      ctx.lineWidth = 18;
      ctx.strokeText(caption.text, 0, 0);

      // Clean white text with subtle accent touch
      ctx.fillStyle = '#ffffff';
      ctx.fillText(caption.text, 0, 0);

      ctx.restore();
    }
  }

  private renderSafeZones(ctx: CanvasRenderingContext2D, isBlackCanvas: boolean) {
    ctx.save();
    ctx.strokeStyle = isBlackCanvas ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)';
    ctx.setLineDash([14, 12]);
    ctx.lineWidth = 3;
    ctx.strokeRect(48, 120, this.width - 96, this.height - 240);
    ctx.restore();
  }
}
