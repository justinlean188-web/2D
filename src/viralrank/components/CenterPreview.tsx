import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Grid,
  Volume2,
  VolumeX,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Sparkles,
} from 'lucide-react';
import { ViralRankProject } from '../types';

interface CenterPreviewProps {
  project: ViralRankProject;
  currentTime: number;
  totalDuration: number;
  isPlaying: boolean;
  isMuted: boolean;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onToggleMute: () => void;
  onOpenExport: () => void;
}

export const CenterPreview: React.FC<CenterPreviewProps> = ({
  project,
  currentTime,
  totalDuration,
  isPlaying,
  isMuted,
  onTogglePlay,
  onSeek,
  onToggleMute,
  onOpenExport,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [zoomLevel, setZoomLevel] = useState<'fit' | '50' | '75' | '100'>('fit');
  const [showSafeZones, setShowSafeZones] = useState<boolean>(project.showSafeZones);

  // Determine current active ranking item based on currentTime
  let accumulatedTime = 0;
  let activeItem = project.items[0];
  let clipProgress = 0;

  for (const item of project.items) {
    if (
      currentTime >= accumulatedTime &&
      currentTime < accumulatedTime + item.duration
    ) {
      activeItem = item;
      clipProgress = (currentTime - accumulatedTime) / item.duration;
      break;
    }
    accumulatedTime += item.duration;
  }
  if (!activeItem && project.items.length > 0) {
    activeItem = project.items[project.items.length - 1];
  }

  // Draw current frame on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1080;
    const height = 1920;

    // Background fill
    ctx.fillStyle = '#090D16';
    ctx.fillRect(0, 0, width, height);

    // Subtle modern grid pattern
    ctx.strokeStyle = '#1E293B33';
    ctx.lineWidth = 2;
    for (let x = 0; x < width; x += 120) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 120) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    if (activeItem) {
      // 1. Draw Simulated Video Box with dynamic animated action
      const padX = 60;
      const boxY = 460;
      const boxW = width - padX * 2;
      const boxH = 920;

      // Dark card container
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.roundRect(padX, boxY, boxW, boxH, 32);
      ctx.fill();

      // Border glow according to badgeTheme
      const themeColors: Record<string, string> = {
        gold: '#F59E0B',
        'neon-cyan': '#06B6D4',
        crimson: '#E11D48',
        emerald: '#10B981',
        amber: '#F97316',
      };
      const accentColor = themeColors[project.badgeTheme] || '#F59E0B';

      ctx.strokeStyle = `${accentColor}88`;
      ctx.lineWidth = 6;
      ctx.stroke();

      // Dynamic animated graphic representation of the trick shot / ranking clip
      const animT = (clipProgress * 10) % 1;
      const ballX = padX + 160 + clipProgress * (boxW - 320);
      const arcH = Math.sin(clipProgress * Math.PI) * 280;
      const ballY = boxY + boxH * 0.7 - arcH;

      // Motion streak
      ctx.strokeStyle = `${accentColor}55`;
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.moveTo(padX + 160, boxY + boxH * 0.7);
      ctx.quadraticCurveTo(padX + boxW * 0.5, boxY + boxH * 0.3 - 100, ballX, ballY);
      ctx.stroke();

      // Flying projectile / ball
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(ballX, ballY, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 6;
      ctx.stroke();

      // Target / Hoop / Goal on the right
      const targetX = padX + boxW - 140;
      const targetY = boxY + boxH * 0.45;
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 8;
      ctx.strokeRect(targetX - 40, targetY - 60, 80, 120);
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(targetX, targetY, 18, 0, Math.PI * 2);
      ctx.fill();

      // Sub-label inside video card
      ctx.font = 'bold 36px sans-serif';
      ctx.fillStyle = '#94A3B8';
      ctx.textAlign = 'center';
      ctx.fillText(activeItem.title, width / 2, boxY + boxH - 45);

      // 2. Ranking Badge Card at the Top
      const badgeY = 240;
      const rankText = `#${activeItem.rank}`;

      // Drop shadow for header badge
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 10;

      // Badge pill
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.roundRect(width / 2 - 200, badgeY, 400, 120, 60);
      ctx.fill();

      ctx.font = '900 72px sans-serif';
      ctx.fillStyle = '#0F172A';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`RANK ${rankText}`, width / 2, badgeY + 60);
      ctx.restore();

      // Video Clip Title Header
      ctx.font = '900 52px sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.fillText(activeItem.title.toUpperCase(), width / 2, badgeY + 180);

      // 3. Caption Overlay
      const activeCaption = project.captions.find(
        (c) => currentTime >= c.startTime && currentTime <= c.endTime
      );
      const captionText =
        activeCaption?.text || activeItem.narrationText || `TOP ${activeItem.rank} MOMENT`;

      const capY = (project.captionStyle.yPos / 100) * height;
      ctx.font = `900 ${project.captionStyle.fontSize}px sans-serif`;
      ctx.textAlign = 'center';

      // Caption Background Box if enabled
      if (project.captionStyle.bgColor) {
        ctx.fillStyle = project.captionStyle.bgColor;
        const textMetrics = ctx.measureText(captionText);
        const textW = textMetrics.width + 80;
        const textH = project.captionStyle.fontSize + 40;
        ctx.beginPath();
        ctx.roundRect(width / 2 - textW / 2, capY - textH / 2, textW, textH, 20);
        ctx.fill();
      }

      // Caption Stroke & Fill
      ctx.strokeStyle = project.captionStyle.outlineColor;
      ctx.lineWidth = 14;
      ctx.lineJoin = 'round';
      ctx.strokeText(captionText, width / 2, capY + project.captionStyle.fontSize * 0.35);

      ctx.fillStyle = project.captionStyle.primaryColor;
      ctx.fillText(captionText, width / 2, capY + project.captionStyle.fontSize * 0.35);

      // Sound Effect Trigger Indicator (pops up when an SFX fires)
      const firingSfx = activeItem.soundEffects.find(
        (s) => Math.abs(currentTime - s.timelineStart) < 0.4
      );
      if (firingSfx) {
        ctx.save();
        ctx.fillStyle = '#10B981';
        ctx.beginPath();
        ctx.roundRect(width / 2 - 160, capY - 140, 320, 64, 32);
        ctx.fill();

        ctx.font = 'bold 32px sans-serif';
        ctx.fillStyle = '#022C22';
        ctx.fillText(`SFX: ${firingSfx.label.toUpperCase()}`, width / 2, capY - 96);
        ctx.restore();
      }
    }

    // 4. Safe Zones Overlay
    if (showSafeZones) {
      ctx.strokeStyle = '#F43F5EAA';
      ctx.lineWidth = 4;
      ctx.setLineDash([12, 12]);

      // Top safe bound (header area)
      ctx.strokeRect(60, 180, width - 120, height - 540);

      // Right action icons boundary (TikTok / Reels like buttons)
      ctx.fillStyle = '#F43F5E22';
      ctx.fillRect(width - 160, 600, 120, 750);
      ctx.strokeRect(width - 160, 600, 120, 750);

      // Bottom caption / engagement zone
      ctx.fillRect(60, height - 360, width - 120, 300);
      ctx.strokeRect(60, height - 360, width - 120, 300);

      ctx.setLineDash([]);
      ctx.font = 'bold 28px sans-serif';
      ctx.fillStyle = '#FDA4AF';
      ctx.fillText('9:16 VERTICAL SAFE ZONE', width / 2, 140);
      ctx.fillText('BOTTOM CAPTION & AUDIO ZONE', width / 2, height - 80);
    }
  }, [currentTime, activeItem, project, showSafeZones, clipProgress]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = (secs % 60).toFixed(1);
    return `${m.toString().padStart(2, '0')}:${s.padStart(4, '0')}`;
  };

  return (
    <div className="flex-1 bg-slate-950 flex flex-col min-w-0 h-full border-r border-slate-800">
      {/* Viewport Toolbar */}
      <div className="h-11 border-b border-slate-800 bg-slate-900/80 px-4 flex items-center justify-between gap-4 text-xs select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-white">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>9:16 Vertical Preview</span>
          </div>
          <span className="text-slate-500">|</span>
          <span className="font-mono text-slate-300">
            {formatTime(currentTime)} / {formatTime(totalDuration)}
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
            FRAME {Math.floor(currentTime * project.fps)}
          </span>
        </div>

        {/* Viewport Controls */}
        <div className="flex items-center gap-2">
          {/* Safe Zones Toggle */}
          <button
            onClick={() => setShowSafeZones(!showSafeZones)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs cursor-pointer transition-colors ${
              showSafeZones
                ? 'bg-rose-950/60 border-rose-500 text-rose-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Toggle TikTok / Shorts Safe Area Guides"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Safe Area</span>
          </button>

          {/* Zoom Level */}
          <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-lg p-0.5 text-[11px]">
            {(['fit', '50', '75', '100'] as const).map((z) => (
              <button
                key={z}
                onClick={() => setZoomLevel(z)}
                className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                  zoomLevel === z
                    ? 'bg-rose-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {z === 'fit' ? 'Fit' : `${z}%`}
              </button>
            ))}
          </div>

          {/* Export Button */}
          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs shadow-md transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Export 9:16</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport Area */}
      <div className="flex-1 overflow-hidden flex items-center justify-center p-4 bg-slate-950 relative">
        <div
          className={`relative aspect-[9/16] bg-black shadow-2xl rounded-2xl overflow-hidden border border-slate-800 transition-all ${
            zoomLevel === 'fit'
              ? 'h-full max-h-[85vh]'
              : zoomLevel === '50'
              ? 'h-[50%]'
              : zoomLevel === '75'
              ? 'h-[75%]'
              : 'h-[100%]'
          }`}
        >
          <canvas
            ref={canvasRef}
            width={1080}
            height={1920}
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Transport Control Bar */}
      <div className="h-14 border-t border-slate-800 bg-slate-900 px-6 flex items-center justify-between gap-4 select-none">
        <div className="flex items-center gap-2">
          {/* Seek to Start */}
          <button
            onClick={() => onSeek(0)}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            title="Rewind to start"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Prev Frame */}
          <button
            onClick={() => onSeek(Math.max(0, currentTime - 1 / project.fps))}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            title="Step backward 1 frame"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Big Play / Pause */}
          <button
            onClick={onTogglePlay}
            className="flex items-center justify-center px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 mr-1.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-1.5" />
                <span>Play</span>
              </>
            )}
          </button>

          {/* Next Frame */}
          <button
            onClick={() => onSeek(Math.min(totalDuration, currentTime + 1 / project.fps))}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            title="Step forward 1 frame"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Current Active Item Pill */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Current Scene:</span>
          <span className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-bold text-rose-400 truncate max-w-xs">
            #{activeItem?.rank} {activeItem?.title}
          </span>
        </div>

        {/* Mute and Master Audio */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleMute}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
