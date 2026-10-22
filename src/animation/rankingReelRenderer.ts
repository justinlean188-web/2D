import { StudioConfig } from '../types';
import {
  ReelBeat,
  RankingItem,
  RankingVideoData,
  getReelBeats,
  getRankingDuration,
} from '../reels/rankingData';
import { getRankingStyle, CATEGORY_LABELS } from '../reels/categoryStyles';

/**
 * RankingReelRenderer
 *
 * The "Clone Reels" side of the studio: a vertical ranking countdown built
 * with the same visual language as the original Remotion ranking-reel
 * generator (drifting accent glow, grid overlay, rank header, character art,
 * power-index bar, caption panel and progress rail), but rendered with the
 * studio's own canvas pipeline so it previews and exports in the browser.
 */

const BG = '#080b14';
const WHITE = '#f8fafc';
const INTRO_ACCENT = '#ff3d57';
const OUTRO_ACCENT = '#facc15';

/** The bright cyan the headline uses for its second line. */
const HEADLINE = '#25e0f5';
/** A rank that has not been reached yet sits back in grey. */
const HIDDEN_RANK = '#8a8f98';

const TAU = Math.PI * 2;

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;

/** Remotion-compatible damped spring, so the port keeps the same timing. */
const spring = (
  frame: number,
  fps: number,
  damping: number,
  stiffness: number,
  mass = 1
): number => {
  const w0 = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  const t = frame / fps;
  if (zeta < 1) {
    const wd = w0 * Math.sqrt(1 - zeta * zeta);
    const envelope = Math.exp(-zeta * w0 * t);
    return 1 - envelope * (Math.cos(wd * t) + ((zeta * w0) / wd) * Math.sin(wd * t));
  }
  return 1 - Math.exp(-w0 * t) * (1 + w0 * t);
};

const interpolate = (
  frame: number,
  input: [number, number],
  output: [number, number],
  clampEnd = true
): number => {
  const u = clamp((frame - input[0]) / Math.max(0.0001, input[1] - input[0]), 0, 1);
  const value = lerp(output[0], output[1], u);
  if (!clampEnd) return value;
  return clamp(value, Math.min(output[0], output[1]), Math.max(output[0], output[1]));
};

export interface ReelRenderer {
  render(ctx: CanvasRenderingContext2D, time: number, config: StudioConfig): void;
}

export class RankingReelRenderer implements ReelRenderer {
  public readonly width = 1080;
  public readonly height = 1920;

  private data: RankingVideoData;
  private readonly images = new Map<string, HTMLImageElement>();
  private videos = new Map<string, HTMLVideoElement>();
  private playing = false;

  constructor(data: RankingVideoData) {
    this.data = data;
    this.preload();
  }

  /** Swap in edited ranking content (the studio editor calls this on change). */
  public setData(data: RankingVideoData) {
    this.data = data;
    this.preload();
  }

  /** Register the <video> elements used by the entries that have a clip. */
  public setVideos(videos: Map<string, HTMLVideoElement>) {
    this.videos = videos;
  }

  /** Play or pause every clip so they follow the transport. */
  public setPlayback(playing: boolean) {
    this.playing = playing;
    if (!playing) {
      this.videos.forEach((video) => video.pause());
    }
  }

  public getDuration(): number {
    return getRankingDuration(this.data);
  }

  private preload() {
    if (typeof window === 'undefined') return;
    const paths = new Set<string>();
    this.data.items.forEach((item) => paths.add(item.image));
    paths.forEach((path) => {
      if (this.images.has(path)) return;
      const img = new Image();
      img.decoding = 'async';
      img.onerror = () => {
        if (img.src.endsWith('/characters/original-hero.svg')) return;
        img.src = '/characters/original-hero.svg';
      };
      img.src = `/${path}`;
      this.images.set(path, img);
    });
  }

  public render(ctx: CanvasRenderingContext2D, time: number, config: StudioConfig) {
    const fps = 30;
    const duration = this.getDuration();
    const t = clamp(time, 0, duration);

    ctx.save();
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, this.width, this.height);

    const beats = getReelBeats(this.data);
    const beat = this.findBeat(beats, t);
    const localFrame = (t - beat.start) * fps;

    if (beat.kind === 'intro') {
      this.drawIntro(ctx, localFrame, fps, config);
    } else if (beat.kind === 'title') {
      this.drawTitleCard(ctx, beat, localFrame, fps);
    } else if (beat.kind === 'item') {
      this.drawItem(ctx, beat, localFrame, fps, config);
    } else {
      this.drawOutro(ctx, localFrame, fps, config);
    }

    ctx.restore();

    if (config.showSafeZones) {
      this.drawSafeZones(ctx);
    }
  }

  /** The beat that covers a moment in time. */
  private findBeat(beats: ReelBeat[], t: number): ReelBeat {
    for (let i = beats.length - 1; i >= 0; i--) {
      if (t >= beats[i].start) return beats[i];
    }
    return beats[0];
  }

  // ==========================================================
  // SCENES
  // ==========================================================

  private drawIntro(
    ctx: CanvasRenderingContext2D,
    frame: number,
    fps: number,
    config: StudioConfig
  ) {
    const enter = spring(frame, fps, 12, 90);
    this.drawBackground(ctx, frame, INTRO_ACCENT);
    this.drawHeader(ctx, this.data.title, this.data.subtitle, INTRO_ACCENT);

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';

    const scale = lerp(0.72, 1, enter);
    ctx.translate(this.width / 2, 300);
    ctx.scale(scale, scale);
    ctx.globalAlpha = enter;

    ctx.font = '1000 176px Arial, Helvetica, sans-serif';
    ctx.fillStyle = WHITE;
    ctx.shadowColor = '#ff3d5766';
    ctx.shadowBlur = 55;
    ctx.fillText('TOP', 0, 176);
    ctx.shadowBlur = 65;
    ctx.fillStyle = INTRO_ACCENT;
    ctx.font = '1000 230px Arial, Helvetica, sans-serif';
    ctx.fillText('10', 0, 400);
    ctx.shadowBlur = 0;

    ctx.font = '700 27px Arial, Helvetica, sans-serif';
    ctx.letterSpacing = '8px';
    ctx.fillStyle = '#e4e8f0';
    ctx.fillText('THE COUNTDOWN STARTS NOW', 0, 456);
    ctx.letterSpacing = '0px';
    ctx.restore();

    if (config.showCaptions) {
      this.drawCaption(ctx, this.data.introCaption, INTRO_ACCENT, frame, fps, 14, 170);
    }
    this.drawProgress(ctx, interpolate(frame, [0, 90], [0, 10]), INTRO_ACCENT);
  }

  private drawItem(
    ctx: CanvasRenderingContext2D,
    beat: ReelBeat,
    frame: number,
    fps: number,
    config: StudioConfig
  ) {
    const item = beat.item as RankingItem;
    const index = beat.index;
    const total = this.data.items.length;
    const enter = spring(frame, fps, 13, 115);

    // The frame is a black canvas and the clip sits on it, letterboxed.
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, this.width, this.height);

    const video = item.video ? this.videos.get(item.id) : undefined;

    if (video && video.readyState >= 2) {
      this.syncVideo(video, item, frame / fps);
      ctx.save();
      ctx.globalAlpha = enter;
      const vw = video.videoWidth || this.width;
      const vh = video.videoHeight || this.height;
      // Fit the width, so a clip that is not vertical leaves black bands.
      const scale = this.width / vw;
      const dw = vw * scale;
      const dh = vh * scale;
      try {
        ctx.drawImage(video, (this.width - dw) / 2, (this.height - dh) / 2, dw, dh);
      } catch {
        // The host blocked the cross-origin read, so the frame cannot be drawn.
        this.drawClipPlaceholder(ctx, item, 0, (this.height - dh) / 2, this.width, dh);
      }
      ctx.restore();
    } else {
      this.drawBackground(ctx, frame, item.accent);
      const img = this.images.get(item.image);
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.globalAlpha = enter;
        const zoom = interpolate(frame, [0, 120], [1, 1.06]);
        const boxX = 90;
        const boxY = 430;
        const boxW = this.width - 180;
        const boxH = 980;
        ctx.translate(boxX + boxW / 2, boxY + boxH / 2);
        ctx.scale(zoom, zoom);
        ctx.translate(-(boxX + boxW / 2), -(boxY + boxH / 2));
        ctx.shadowColor = `${item.accent}66`;
        ctx.shadowBlur = 60;
        const ratio = Math.min(boxW / img.naturalWidth, boxH / img.naturalHeight);
        const dw = img.naturalWidth * ratio;
        const dh = img.naturalHeight * ratio;
        ctx.drawImage(
          img,
          boxX + (boxW - dw) / 2,
          boxY + (boxH - dh) / 2,
          dw,
          dh
        );
        ctx.restore();
      }
    }

    // The headline sits on top of the clip.
    this.drawHeader(ctx, this.data.title, this.data.subtitle, item.accent);

    // The rank column runs down the left over the clip.
    this.drawRankColumn(ctx, index, item.accent);

    if (config.showCaptions) {
      this.drawCaption(ctx, item.caption, item.accent, frame, fps, 14, 170);
    }
    this.drawProgress(ctx, ((index + 1) / total) * 100, item.accent);
  }

  /** Stands in for a clip the browser refuses to draw (no CORS). */
  private drawClipPlaceholder(
    ctx: CanvasRenderingContext2D,
    item: RankingItem,
    x: number,
    y: number,
    w: number,
    h: number
  ) {
    ctx.save();
    ctx.fillStyle = '#111827';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = `${item.accent}66`;
    ctx.lineWidth = 3;
    ctx.strokeRect(x + 8, y + 8, w - 16, h - 16);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '1000 92px Arial, Helvetica, sans-serif';
    ctx.fillStyle = item.accent;
    ctx.fillText('#' + String(item.rank).padStart(2, '0'), x + w / 2, y + h / 2 - 30);

    ctx.font = '800 26px Arial, Helvetica, sans-serif';
    ctx.fillStyle = '#8f9bb5';
    const title = (item.video?.title?.trim() || item.name).toUpperCase();
    ctx.fillText(title.slice(0, 26), x + w / 2, y + h / 2 + 40);
    ctx.restore();
  }

  /**
   * Keeps a clip in sync with the timeline: it plays while the reel plays and
   * jumps when the playhead is scrubbed.
   */
  private syncVideo(
    video: HTMLVideoElement,
    item: RankingItem,
    localTime: number
  ) {
    // Only the clip that is on screen runs. The others would decode for
    // nothing, and the export pays for every one of them.
    this.videos.forEach((other, id) => {
      if (id !== item.id && !other.paused) other.pause();
    });

    const clip = item.video;
    if (!clip) return;
    const target = clip.start + Math.max(0, localTime);
    const drift = target - video.currentTime;

    if (drift < -0.18 || drift > 0.4) {
      try {
        video.currentTime = target;
      } catch {
        /* the metadata may not be ready yet */
      }
    }

    if (this.playing && video.paused) {
      video.play().catch(() => {});
    } else if (!this.playing && !video.paused) {
      video.pause();
    }
  }

  /**
   * The rank column down the left. Every entry gets a row: the number in the
   * style colour with a black outline, and the title once the countdown has
   * reached that rank. The rows run from number one at the top down to the
   * lowest rank, and the ranks the countdown has already passed show their
   * title while the ones still to come stay grey.
   */
  private drawRankColumn(ctx: CanvasRenderingContext2D, activeIndex: number, accent: string) {
    const items = this.data.items;
    if (!items.length) return;

    // The ranking style owns the badge colour; a clip keeps its own accent.
    const style = getRankingStyle(this.data.category);
    const badgeColor = style.accentColor || accent;

    // Number one sits at the top, the lowest rank at the bottom.
    const rows = [...items].sort((a, b) => a.rank - b.rank);
    const activeRank = items[activeIndex]?.rank;

    const x = 74;
    const top = 420;
    const bottom = 1520;
    const rowH = (bottom - top) / rows.length;

    ctx.save();
    ctx.textBaseline = 'middle';

    rows.forEach((item, rowIndex) => {
      const y = top + rowH * rowIndex + rowH / 2;
      const isActive = item.rank === activeRank;
      // A rank is revealed once the countdown has reached it.
      const revealed = activeRank === undefined ? false : item.rank >= activeRank;

      const number = `${item.rank}.`;
      const numberSize = isActive ? 66 : 58;
      ctx.font = `1000 ${numberSize}px Arial, Helvetica, sans-serif`;

      this.outlinedText(
        ctx,
        number,
        x,
        y,
        revealed ? badgeColor : HIDDEN_RANK,
        '#000000',
        isActive ? 16 : 13,
        'left'
      );

      if (!revealed) return;

      const title = (item.video?.title?.trim() || item.name).toUpperCase();
      if (!title) return;

      const numberWidth = ctx.measureText(number).width;
      ctx.font = `900 ${isActive ? 36 : 32}px Arial, Helvetica, sans-serif`;
      const maxWidth = this.width - x - numberWidth - 40;
      let size = isActive ? 36 : 32;
      while (size > 20 && ctx.measureText(title).width > maxWidth) {
        size -= 2;
        ctx.font = `900 ${size}px Arial, Helvetica, sans-serif`;
      }

      this.outlinedText(
        ctx,
        title,
        x + numberWidth + 18,
        y + 2,
        isActive ? WHITE : '#e7ebf3',
        '#000000',
        isActive ? 11 : 9,
        'left'
      );
    });

    ctx.restore();
  }

  /**
   * Text with a heavy black outline, the way the reference reels set their
   * numbers and titles: the stroke goes down first, the colour on top.
   */
  private outlinedText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    fill: string,
    stroke: string,
    width: number,
    align: CanvasTextAlign = 'left'
  ) {
    ctx.save();
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.lineWidth = width;
    ctx.strokeStyle = stroke;
    ctx.strokeText(text, x, y);
    ctx.fillStyle = fill;
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  /**
   * The title card that plays between two merged videos: the manual title and
   * the rank number that belongs to it.
   */
  private drawTitleCard(
    ctx: CanvasRenderingContext2D,
    beat: ReelBeat,
    frame: number,
    fps: number
  ) {
    const item = beat.item as RankingItem;
    const enter = spring(frame, fps, 12, 100);
    const out = interpolate(frame, [fps * 0.75, fps], [1, 0]);
    const style = getRankingStyle(this.data.category);

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, this.width, this.height);

    this.drawHeader(ctx, this.data.title, this.data.subtitle, item.accent);
    this.drawRankColumn(ctx, beat.index, item.accent);

    ctx.save();
    ctx.globalAlpha = Math.min(enter, out);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const cx = this.width / 2;
    const cy = 900;

    // The rank number, big and in the style colour.
    const rank = String(item.rank);
    ctx.font = '1000 260px Arial, Helvetica, sans-serif';
    this.outlinedText(
      ctx,
      rank,
      cx,
      cy,
      style.accentColor,
      '#000000',
      30,
      'center'
    );

    // The manual title, wrapped and scaled so it always fits the frame.
    const title = item.video?.title?.trim() || item.name;
    let titleSize = 72;
    ctx.font = `1000 ${titleSize}px Arial, Helvetica, sans-serif`;
    let lines = this.wrap(ctx, title.toUpperCase(), this.width - 200, 2);
    while (
      titleSize > 30 &&
      Math.max(...lines.map((l) => ctx.measureText(l).width)) > this.width - 220
    ) {
      titleSize -= 3;
      ctx.font = `1000 ${titleSize}px Arial, Helvetica, sans-serif`;
      lines = this.wrap(ctx, title.toUpperCase(), this.width - 200, 2);
    }

    lines.forEach((line, i) => {
      this.outlinedText(
        ctx,
        line,
        cx,
        cy + 190 + i * (titleSize + 14),
        style.titleColor,
        '#000000',
        16,
        'center'
      );
    });

    // The category, in the headline colour.
    const category = (item.category || 'RANKED ENTRY').toUpperCase();
    ctx.font = '900 34px Arial, Helvetica, sans-serif';
    this.outlinedText(ctx, category, cx, cy - 200, HEADLINE, '#000000', 12, 'center');

    ctx.restore();
  }

  /** Wraps a string into at most `maxLines` lines. */
  private wrap(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
    maxLines: number
  ): string[] {
    const words = text.split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let current = '';
    words.forEach((word) => {
      const test = current ? `${current} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    });
    if (current) lines.push(current);
    if (lines.length <= maxLines) return lines;
    const clipped = lines.slice(0, maxLines);
    clipped[maxLines - 1] = clipped[maxLines - 1].replace(/\s+\S*$/, '') + '...';
    return clipped;
  }

  private drawOutro(
    ctx: CanvasRenderingContext2D,
    frame: number,
    fps: number,
    config: StudioConfig
  ) {
    const enter = spring(frame, fps, 12, 100);
    this.drawBackground(ctx, frame, OUTRO_ACCENT);
    this.drawHeader(ctx, this.data.title, 'FINAL RESULT', OUTRO_ACCENT);

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    const scale = lerp(0.7, 1, enter);
    ctx.translate(this.width / 2, 330);
    ctx.scale(scale, scale);
    ctx.globalAlpha = enter;

    ctx.font = '900 25px Arial, Helvetica, sans-serif';
    ctx.letterSpacing = '8px';
    ctx.fillStyle = OUTRO_ACCENT;
    ctx.fillText('NUMBER ONE', 0, 25);
    ctx.letterSpacing = '0px';

    ctx.font = '1000 86px Arial, Helvetica, sans-serif';
    ctx.fillStyle = WHITE;
    ctx.fillText('THE CHAMPION', 0, 135);

    ctx.font = '700 25px Arial, Helvetica, sans-serif';
    ctx.fillStyle = '#d7deeb';
    ctx.fillText('YOUR RANKING. YOUR RULES.', 0, 195);
    ctx.restore();

    if (config.showCaptions) {
      this.drawCaption(ctx, this.data.outroCaption, OUTRO_ACCENT, frame, fps, 14, 170);
    }
    this.drawProgress(ctx, 100, OUTRO_ACCENT);
  }

  // ==========================================================
  // SHARED CHROME
  // ==========================================================

  private drawBackground(ctx: CanvasRenderingContext2D, frame: number, accent: string) {
    const drift = interpolate(frame, [0, 120], [0, 80]);
    const style = getRankingStyle(this.data.category);

    const radial = ctx.createRadialGradient(
      ((35 + drift / 10) / 100) * this.width,
      0.25 * this.height,
      0,
      ((35 + drift / 10) / 100) * this.width,
      0.25 * this.height,
      this.width * 0.62
    );
    radial.addColorStop(0, `${accent}30`);
    radial.addColorStop(0.42, `${accent}00`);
    radial.addColorStop(1, `${accent}00`);

    const linear = ctx.createLinearGradient(0, 0, this.width, this.height);
    linear.addColorStop(0, style.backgroundColor);
    linear.addColorStop(0.55, style.backgroundColor);
    linear.addColorStop(1, style.backgroundColor);

    ctx.fillStyle = linear;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, this.width, this.height);

    // The grid overlay.
    ctx.save();
    ctx.strokeStyle = '#ffffff12';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= this.width; x += 52) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
    }
    for (let y = 0; y <= this.height; y += 52) {
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
    }
    ctx.stroke();
    ctx.restore();

    // The big accent ring.
    ctx.save();
    ctx.strokeStyle = `${accent}30`;
    ctx.lineWidth = 2;
    ctx.shadowColor = `${accent}18`;
    ctx.shadowBlur = 90;
    ctx.beginPath();
    ctx.arc(-160 + 260, this.height - 120 - 260, 260, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  /**
   * The headline at the top of the frame: two centred lines, each in two
   * colours, with a black outline so it reads over any clip.
   *
   * Line one is "Ranking" plus the ranking style, line two is the title plus
   * the subtitle.
   */
  private drawHeader(
    ctx: CanvasRenderingContext2D,
    title: string,
    subtitle: string,
    accent: string
  ) {
    const style = getRankingStyle(this.data.category);
    const label = CATEGORY_LABELS[this.data.category] ?? 'The Best';

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const maxWidth = this.width - 120;

    // Line one: "Ranking" in white, the style in the accent colour.
    const first = 'Ranking ';
    ctx.font = `1000 64px Arial, Helvetica, sans-serif`;
    const firstWidth = ctx.measureText(first).width;
    let labelSize = 64;
    while (labelSize > 40 && firstWidth + ctx.measureText(label).width > maxWidth) {
      labelSize -= 2;
      ctx.font = `1000 ${labelSize}px Arial, Helvetica, sans-serif`;
    }

    const lineOneWidth = firstWidth + ctx.measureText(label).width;
    let start = (this.width - lineOneWidth) / 2;
    this.outlinedText(ctx, first, start, 148, WHITE, '#000000', 14, 'left');
    this.outlinedText(
      ctx,
      label,
      start + firstWidth,
      148,
      style.accentColor || accent,
      '#000000',
      14,
      'left'
    );

    // Line two: the title in the headline colour, the subtitle in white.
    // The subtitle is dropped when the two together would squeeze the line.
    const cleanTitle = title.trim();
    let cleanSubtitle = subtitle.trim();

    const measure = (size: number) => {
      ctx.font = `1000 ${size}px Arial, Helvetica, sans-serif`;
      const titleWidth = ctx.measureText(cleanTitle).width;
      ctx.font = `900 ${size}px Arial, Helvetica, sans-serif`;
      const subtitleWidth = cleanSubtitle ? ctx.measureText(cleanSubtitle).width : 0;
      return { titleWidth, subtitleWidth, total: titleWidth + subtitleWidth };
    };

    let size = 58;
    let { titleWidth, subtitleWidth, total } = measure(size);
    if (total > maxWidth) {
      const titleOnly = measure(size).titleWidth;
      if (titleOnly <= maxWidth) {
        // The title fits on its own, so the subtitle goes.
        cleanSubtitle = '';
        subtitleWidth = 0;
        total = titleOnly;
      }
    }
    while (size > 34 && total > maxWidth) {
      size -= 2;
      ({ titleWidth, subtitleWidth, total } = measure(size));
    }

    const lineTwoWidth = titleWidth + subtitleWidth;
    start = (this.width - lineTwoWidth) / 2;
    this.outlinedText(ctx, cleanTitle, start, 232, HEADLINE, '#000000', 13, 'left');
    if (cleanSubtitle) {
      this.outlinedText(
        ctx,
        ' ' + cleanSubtitle,
        start + titleWidth,
        232,
        WHITE,
        '#000000',
        13,
        'left'
      );
    }

    ctx.restore();
  }

  private drawCaption(
    ctx: CanvasRenderingContext2D,
    text: string,
    accent: string,
    frame: number,
    fps: number,
    bottom: number,
    springFrame: number
  ) {
    const pop = spring(frame, fps, 14, 170);
    ctx.save();
    ctx.globalAlpha = pop;
    ctx.translate(0, lerp(22, 0, pop));

    const x = 58;
    const w = this.width - 116;
    const h = 104;
    const y = this.height - bottom - h;

    ctx.fillStyle = 'rgba(7,10,18,0.88)';
    ctx.strokeStyle = `${accent}80`;
    ctx.lineWidth = 1;
    ctx.shadowColor = `${accent}18`;
    ctx.shadowBlur = 50;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 22);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 31px Arial, Helvetica, sans-serif';
    ctx.letterSpacing = '0.4px';
    ctx.fillStyle = WHITE;
    ctx.shadowColor = `${accent}55`;
    ctx.shadowBlur = 20;

    // Wrap long captions onto two lines.
    const maxWidth = w - 56;
    const words = text.split(' ');
    const lines: string[] = [];
    let current = '';
    words.forEach((word) => {
      const test = current ? `${current} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    });
    if (current) lines.push(current);

    const lineHeight = 37;
    const startY = y + h / 2 - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((line, i) => {
      ctx.fillText(line, this.width / 2, startY + i * lineHeight);
    });
    ctx.letterSpacing = '0px';
    ctx.restore();
    void springFrame;
  }

  private drawProgress(ctx: CanvasRenderingContext2D, progress: number, accent: string) {
    const x = 58;
    const w = this.width - 116;
    const y = this.height - 130;
    ctx.save();
    ctx.fillStyle = '#ffffff20';
    ctx.beginPath();
    ctx.roundRect(x, y, w, 8, 99);
    ctx.fill();

    const pct = clamp(progress, 0, 100);
    if (pct > 0) {
      ctx.fillStyle = accent;
      ctx.shadowColor = accent;
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.roundRect(x, y, (w * pct) / 100, 8, 99);
      ctx.fill();
    }
    ctx.restore();
  }

  private drawSafeZones(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.strokeStyle = 'rgba(225, 29, 72, 0.45)';
    ctx.lineWidth = 3;
    ctx.setLineDash([12, 8]);
    ctx.strokeRect(60, 220, this.width - 120, this.height - 560);
    ctx.fillStyle = 'rgba(225, 29, 72, 0.08)';
    ctx.fillRect(this.width - 160, 400, 120, 900);
    ctx.fillRect(60, this.height - 340, this.width - 120, 260);
    ctx.fillStyle = '#e11d48';
    ctx.font = '600 24px "JetBrains Mono", monospace';
    // The label sits above the headline, so the guides never hide the title.
    ctx.fillText('9:16 MOBILE SAFE BOUNDS (1080 × 1920)', 80, 64);
    ctx.restore();
  }
}
