import { StudioConfig } from '../types';
import { ExportTimelineRenderer } from '../utils/exportVideo';
import { RankingItem, ViralRankProject } from './types';

const TAU = Math.PI * 2;

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export class ViralRankRenderer implements ExportTimelineRenderer {
  public readonly width = 1080;
  public readonly height = 1920;

  private project: ViralRankProject;
  private videos = new Map<string, HTMLVideoElement>();
  private playing = false;

  constructor(project: ViralRankProject) {
    this.project = project;
  }

  public setProject(project: ViralRankProject) {
    this.project = project;
  }

  public setVideos(videos: Map<string, HTMLVideoElement>) {
    this.videos = videos;
  }

  public setPlayback(playing: boolean) {
    this.playing = playing;
    if (!playing) {
      this.videos.forEach((v) => v.pause());
    }
  }

  public getCurrentBeat(time: number): {
    item: RankingItem;
    itemIndex: number;
    clipLocalTime: number;
    clipStartTime: number;
    clipEndTime: number;
  } | null {
    let offset = 0;
    for (let i = 0; i < this.project.items.length; i++) {
      const item = this.project.items[i];
      const start = offset;
      const end = offset + (item.duration || 4.0);
      if (time >= start && time < end) {
        return {
          item,
          itemIndex: i,
          clipLocalTime: time - start,
          clipStartTime: start,
          clipEndTime: end,
        };
      }
      offset = end;
    }

    if (this.project.items.length > 0) {
      const last = this.project.items[this.project.items.length - 1];
      const lastIndex = this.project.items.length - 1;
      const dur = last.duration || 4.0;
      return {
        item: last,
        itemIndex: lastIndex,
        clipLocalTime: dur,
        clipStartTime: Math.max(0, offset - dur),
        clipEndTime: offset,
      };
    }

    return null;
  }

  public render(
    ctx: CanvasRenderingContext2D,
    time: number,
    config?: Partial<StudioConfig>
  ): void {
    const W = this.width;
    const H = this.height;
    const showSafeZones = config?.showSafeZones ?? this.project.showSafeZones ?? false;

    const beat = this.getCurrentBeat(time);
    const totalDuration =
      this.project.items.reduce((acc, it) => acc + (it.duration || 4.0), 0) || 1;
    const overallProgress = clamp(time / totalDuration, 0, 1);

    // 1. Draw Background: Either real Video element or Procedural Pool Reference Scene
    let videoDrawn = false;
    if (beat) {
      const videoElem = this.videos.get(beat.item.id);
      if (videoElem && videoElem.readyState >= 2 && !videoElem.error) {
        try {
          ctx.save();
          const vw = videoElem.videoWidth || 1080;
          const vh = videoElem.videoHeight || 1920;
          const vAspect = vw / vh;
          const targetAspect = W / H;

          let dw = W;
          let dh = H;
          let dx = 0;
          let dy = 0;

          if (vAspect > targetAspect) {
            dh = H;
            dw = H * vAspect;
            dx = (W - dw) / 2;
          } else {
            dw = W;
            dh = W / vAspect;
            dy = (H - dh) / 2;
          }

          ctx.drawImage(videoElem, dx, dy, dw, dh);
          ctx.restore();
          videoDrawn = true;
        } catch {
          videoDrawn = false;
        }
      }
    }

    if (!videoDrawn) {
      // Procedural Viral Pool Scene (Matching user screenshot: backyard, blue pool, tube, flipping diver)
      this.drawPoolScene(ctx, W, H, beat ? beat.clipLocalTime : time, beat?.itemIndex ?? 0);
    }

    // 2. Subtle top vignette for crystal clear text readability
    const topVignette = ctx.createLinearGradient(0, 0, 0, 260);
    topVignette.addColorStop(0, '#000000a6');
    topVignette.addColorStop(0.65, '#00000044');
    topVignette.addColorStop(1, 'transparent');
    ctx.fillStyle = topVignette;
    ctx.fillRect(0, 0, W, 260);

    // 3. Top Progress Line
    ctx.fillStyle = '#ffffff33';
    ctx.fillRect(0, 0, W, 8);
    ctx.fillStyle = this.project.accentColor || '#ef4444';
    ctx.fillRect(0, 0, W * overallProgress, 8);

    // 4. TOP HEADLINE (e.g. "Ranking Best Pool Fails" with "Ranking Best" in white and "Pool Fails" in red)
    this.drawTopHeadline(ctx, W);

    // 5. LEFT-BOTTOM RANKINGS COLUMN (1., 2., 3. Aaaah💀, 4., 5., 6.)
    //    Hidden entirely when the preview's Ranks switch is off.
    if (beat && this.project.showRankingNumbers !== false) {
      this.drawRankingLadder(ctx, beat.itemIndex, beat.clipLocalTime);
    }

    // 6. SAFE ZONES (if enabled)
    if (showSafeZones) {
      this.drawSafeZones(ctx, W, H);
    }
  }

  /**
   * Renders the two-tone top headline matching the reference screenshot:
   * "Ranking Best" (White) + "Pool Fails" (Red) with heavy black stroke and shadow
   */
  private drawTopHeadline(ctx: CanvasRenderingContext2D, W: number) {
    ctx.save();
    const topY = 135;

    const prefix = (this.project.titlePrefix || 'Ranking Best').trim();
    const accent = (this.project.titleAccent || 'Pool Fails').trim();
    const accentColor = this.project.accentColor || '#ef4444';

    ctx.font = '900 58px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    const prefixWidth = ctx.measureText(prefix + ' ').width;
    const accentWidth = ctx.measureText(accent).width;
    const totalWidth = prefixWidth + accentWidth;
    const startX = (W - totalWidth) / 2;

    // Heavy drop shadow
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 4;

    // Draw "Ranking Best " (White with 11px black outline)
    this.drawStrokedText(
      ctx,
      prefix + ' ',
      startX,
      topY,
      '#ffffff',
      '#000000',
      11
    );

    // Draw "Pool Fails" (Vibrant Red with 11px black outline)
    this.drawStrokedText(
      ctx,
      accent,
      startX + prefixWidth,
      topY,
      accentColor,
      '#000000',
      11
    );

    ctx.restore();
  }

  /**
   * Renders the vertical ranking numbers column in the left-bottom of the
   * safe area: the last rank sits just above the caption band and the column
   * grows upwards, so the active rank is always readable over the video.
   * Visually sorted from small to large (1. at top down to 6. at bottom),
   * while the playback processes from large to small (6 down to 1)!
   */
  private drawRankingLadder(
    ctx: CanvasRenderingContext2D,
    activeIdx: number,
    clipTime: number
  ) {
    const items = this.project.items;
    if (items.length === 0) return;

    // Sort visually from small to large: 1, 2, 3, 4, 5, 6
    const sortedByRank = [...items].sort((a, b) => a.rank - b.rank);
    const activeItem = items[activeIdx];

    ctx.save();
    const leftX = 64;
    const totalSlots = Math.max(sortedByRank.length, 6);
    // Dynamic row spacing based on total slots
    const rowGap = Math.min(105, 780 / totalSlots);
    // Anchor the column to the bottom-left of the safe area. The caption band
    // starts at H - 380, so the last row stops just above it.
    const bottomY = this.height - 430;
    const startY = bottomY - (sortedByRank.length - 1) * rowGap;

    sortedByRank.forEach((item, slotIdx) => {
      const y = startY + slotIdx * rowGap;
      const isCurrent = activeItem && item.id === activeItem.id;

      // Color scheme matching reference screenshot:
      // Active = Warm Gold (#f59e0b)
      // Rank 1 = Yellow/Gold (#facc15)
      // Bottom Rank (e.g. 6) = Red (#ef4444)
      // Others = White (#ffffff)
      let numColor = '#ffffff';
      if (isCurrent) {
        numColor = '#f59e0b'; // Vibrant gold/amber for active playing rank
      } else if (item.rank === 1) {
        numColor = '#facc15'; // Gold for rank 1
      } else if (item.rank === 6 || slotIdx === sortedByRank.length - 1) {
        numColor = '#ef4444'; // Red for bottom rank (like in reference screenshot)
      }

      ctx.save();

      // Number label: e.g. "1.", "2.", "3.", etc.
      const numLabel = `${item.rank}.`;
      ctx.font = '900 68px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';

      // Drop shadow for crisp contrast over any video frame
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 14;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 4;

      if (isCurrent) {
        // Entrance spring scale on the active rank
        const scale =
          clipTime < 0.35 ? 0.8 + 0.25 * Math.sin((clipTime / 0.35) * Math.PI * 0.5) : 1.0;
        ctx.translate(leftX, y);
        ctx.scale(scale, scale);

        // Draw active number (Golden)
        this.drawStrokedText(ctx, numLabel, 0, 0, numColor, '#000000', 12);

        // Draw title right next to the active number (e.g. "3. Aaaah💀")
        const numWidth = ctx.measureText(numLabel).width + 16;
        const titleText = item.title;
        ctx.font = '900 52px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        this.drawStrokedText(ctx, titleText, numWidth, 0, '#ffffff', '#000000', 10);
      } else {
        // Non-active rank: just the number (1., 2., 4., 5., 6.)
        this.drawStrokedText(ctx, numLabel, leftX, y, numColor, '#000000', 12);
      }

      ctx.restore();
    });

    ctx.restore();
  }

  /**
   * Procedural Pool Scene that closely mimics the user's reference image:
   * Backyard with grass and trees, blue swimming pool, above-ground white coping rim,
   * inflatable floating ring, and diver in blue shorts tumbling in mid-air!
   */
  private drawPoolScene(
    ctx: CanvasRenderingContext2D,
    W: number,
    H: number,
    t: number,
    itemIdx: number
  ) {
    ctx.save();

    // 1. Backyard background: Grass lawn & summer sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 480);
    skyGrad.addColorStop(0, '#5390c5');
    skyGrad.addColorStop(0.6, '#7bb3de');
    skyGrad.addColorStop(1, '#a6d0ef');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, 480);

    // Green trees and fence background
    ctx.fillStyle = '#2d5a27';
    ctx.beginPath();
    ctx.arc(280, 240, 220, 0, TAU);
    ctx.arc(520, 220, 190, 0, TAU);
    ctx.arc(880, 260, 260, 0, TAU);
    ctx.fill();

    // Backyard fence
    ctx.fillStyle = '#1e3820';
    ctx.fillRect(0, 310, W, 110);
    ctx.strokeStyle = '#2b4d2e';
    ctx.lineWidth = 3;
    for (let fx = 15; fx < W; fx += 25) {
      ctx.beginPath();
      ctx.moveTo(fx, 310);
      ctx.lineTo(fx, 420);
      ctx.stroke();
    }

    // 2. Pool Water (Vibrant Turquoise / Azure Blue with shimmering caustics)
    const poolTopY = 410;
    const poolGrad = ctx.createLinearGradient(0, poolTopY, 0, H);
    poolGrad.addColorStop(0, '#38bdf8');
    poolGrad.addColorStop(0.3, '#0284c7');
    poolGrad.addColorStop(0.7, '#0369a1');
    poolGrad.addColorStop(1, '#075985');
    ctx.fillStyle = poolGrad;
    ctx.fillRect(0, poolTopY, W, H - poolTopY);

    // Animated water caustics / surface waves
    ctx.save();
    ctx.strokeStyle = '#e0f2fe55';
    ctx.lineWidth = 4;
    for (let i = 0; i < 7; i++) {
      const wy = poolTopY + 50 + i * 85 + Math.sin(t * 2 + i) * 8;
      ctx.beginPath();
      ctx.moveTo(0, wy);
      for (let wx = 0; wx <= W; wx += 80) {
        const c1 = wy + Math.sin((wx + t * 60) * 0.03 + i) * 12;
        ctx.lineTo(wx, c1);
      }
      ctx.stroke();
    }
    ctx.restore();

    // 3. Inflatable Float Ring floating in pool (purple/pink flower pattern like in screenshot)
    const tubeX = 640 + Math.sin(t * 1.2) * 15;
    const tubeY = 440 + Math.cos(t * 1.5) * 8;
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(tubeX, tubeY, 95, 45, 0, 0, TAU);
    ctx.fillStyle = '#f3e8ff';
    ctx.fill();
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 8;
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(tubeX, tubeY - 10, 45, 20, 0, 0, TAU);
    ctx.fillStyle = '#0284c7';
    ctx.fill();
    ctx.restore();

    // 4. White Pool Coping & Wall at the bottom
    const copingY = 700;
    ctx.save();
    // Curved white rim
    ctx.beginPath();
    ctx.ellipse(W / 2, copingY, W * 0.58, 75, 0, 0, Math.PI);
    ctx.fillStyle = '#f1f5f9';
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 6;
    ctx.stroke();

    // Lower pool exterior wall panels
    const wallGrad = ctx.createLinearGradient(0, copingY + 30, 0, H);
    wallGrad.addColorStop(0, '#94a3b8');
    wallGrad.addColorStop(0.3, '#cbd5e1');
    wallGrad.addColorStop(1, '#64748b');
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, copingY + 30, W, 140);

    // Concrete patio / ground below pool
    const patioGrad = ctx.createLinearGradient(0, copingY + 170, 0, H);
    patioGrad.addColorStop(0, '#78716c');
    patioGrad.addColorStop(1, '#57534e');
    ctx.fillStyle = patioGrad;
    ctx.fillRect(0, copingY + 170, W, H - (copingY + 170));
    ctx.restore();

    // 5. Diver Performing Backflip in Mid-Air (Matching the screenshot person in blue shorts)
    ctx.save();
    // Cycle flip animation
    const flipCycle = (t * 0.9) % 2.5;
    const diverX = 410 + Math.sin(flipCycle * 2) * 60;
    const diverY = 170 + Math.pow(flipCycle - 1.25, 2) * 120;
    const flipAngle = flipCycle * Math.PI * 2;

    ctx.translate(diverX, diverY);
    ctx.rotate(flipAngle);

    // Blue shorts
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.roundRect(-40, -20, 80, 55, 12);
    ctx.fill();

    // Torso (skin)
    ctx.fillStyle = '#fbcfe8';
    ctx.beginPath();
    ctx.roundRect(-30, -75, 60, 60, 14);
    ctx.fill();

    // Head
    ctx.fillStyle = '#1e293b'; // dark hair
    ctx.beginPath();
    ctx.arc(0, -95, 24, 0, TAU);
    ctx.fill();

    // Legs flailing
    ctx.strokeStyle = '#fbcfe8';
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';

    // Left leg
    ctx.beginPath();
    ctx.moveTo(-20, 30);
    ctx.lineTo(-45, 80);
    ctx.lineTo(-55, 120);
    ctx.stroke();

    // Right leg
    ctx.beginPath();
    ctx.moveTo(20, 30);
    ctx.lineTo(40, 75);
    ctx.lineTo(50, 115);
    ctx.stroke();

    // Arms extended
    ctx.beginPath();
    ctx.moveTo(-25, -55);
    ctx.lineTo(-65, -85);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(25, -55);
    ctx.lineTo(70, -75);
    ctx.stroke();

    ctx.restore();

    ctx.restore();
  }

  private drawSafeZones(ctx: CanvasRenderingContext2D, W: number, H: number) {
    ctx.save();
    ctx.strokeStyle = '#f43f5e99';
    ctx.lineWidth = 3;
    ctx.setLineDash([12, 10]);

    // Top Header Safe Zone (200px)
    ctx.strokeRect(40, 40, W - 80, 160);

    // Right interaction bar zone
    ctx.strokeRect(W - 140, 400, 100, 700);

    // Bottom caption zone
    ctx.strokeRect(40, H - 380, W - 80, 340);

    ctx.setLineDash([]);
    ctx.fillStyle = '#f43f5e';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('9:16 SAFE AREAS (TIKTOK / REELS / SHORTS)', 54, 68);
    ctx.restore();
  }

  private drawStrokedText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    fill: string,
    stroke: string,
    lineWidth: number
  ) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.strokeText(text, x, y);
    ctx.fillStyle = fill;
    ctx.fillText(text, x, y);
  }
}
