import React, { useRef, useState } from 'react';
import {
  Play,
  Pause,
  Scissors,
  Copy,
  Trash2,
  ZoomIn,
  ZoomOut,
  Magnet,
  Maximize2,
  Volume2,
  Video,
  Type,
  Music,
  Mic,
  Sparkles,
} from 'lucide-react';
import { AudioEffect, RankingItem, ViralRankProject } from '../types';

interface MultitrackTimelineProps {
  project: ViralRankProject;
  setProject: React.Dispatch<React.SetStateAction<ViralRankProject>>;
  currentTime: number;
  totalDuration: number;
  isPlaying: boolean;
  selectedClipId: string | null;
  onSelectClip: (clipId: string) => void;
  onSeek: (time: number) => void;
  onTogglePlay: () => void;
  onSplitClip: () => void;
  onDuplicateClip: () => void;
  onDeleteClip: () => void;
}

export const MultitrackTimeline: React.FC<MultitrackTimelineProps> = ({
  project,
  setProject,
  currentTime,
  totalDuration,
  isPlaying,
  selectedClipId,
  onSelectClip,
  onSeek,
  onTogglePlay,
  onSplitClip,
  onDuplicateClip,
  onDeleteClip,
}) => {
  const [zoom, setZoom] = useState<number>(36); // Pixels per second
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);
  const timelineRef = useRef<HTMLDivElement | null>(null);

  // Compute accumulated timeline start for each ranking clip
  let currentOffset = 0;
  const clipPositions: { clip: RankingItem; start: number; end: number }[] = [];
  for (const item of project.items) {
    clipPositions.push({
      clip: item,
      start: currentOffset,
      end: currentOffset + item.duration,
    });
    currentOffset += item.duration;
  }

  const timelineWidth = Math.max(800, totalDuration * zoom + 120);

  // Timeline scrubber click / drag
  const handleTimelineMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left + timelineRef.current.scrollLeft;
    const seekT = Math.max(0, Math.min(totalDuration, clickX / zoom));
    onSeek(seekT);
    setIsDraggingPlayhead(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingPlayhead || !timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left + timelineRef.current.scrollLeft;
    const seekT = Math.max(0, Math.min(totalDuration, clickX / zoom));
    onSeek(seekT);
  };

  const handleMouseUp = () => {
    setIsDraggingPlayhead(false);
  };

  // Reorder clips on timeline (move left / right)
  const handleMoveClip = (index: number, direction: 'left' | 'right') => {
    const newIdx = direction === 'left' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= project.items.length) return;

    setProject((prev) => {
      const items = [...prev.items];
      const temp = items[index];
      items[index] = items[newIdx];
      items[newIdx] = temp;

      // Automatically recalculate rank numbers in sequence
      const renumbered = items.map((it, idx) => ({
        ...it,
        rank: prev.orderMode === 'countdown' ? items.length - idx : idx + 1,
      }));

      return {
        ...prev,
        items: renumbered,
      };
    });
  };

  // All attached SFX across the timeline
  const allTimelineSfx: { sfx: AudioEffect; absoluteStart: number; clipRank: number }[] = [];
  clipPositions.forEach(({ clip, start }) => {
    clip.soundEffects.forEach((s) => {
      allTimelineSfx.push({
        sfx: s,
        absoluteStart: start + s.clipOffset,
        clipRank: clip.rank,
      });
    });
  });

  return (
    <div
      className="h-72 border-t border-slate-800 bg-slate-900/98 flex flex-col select-none text-slate-200"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Timeline Action Header */}
      <div className="h-10 border-b border-slate-800 bg-slate-950/80 px-4 flex items-center justify-between text-xs">
        {/* Left Toolbar */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onTogglePlay}
            className="p-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-md transition-colors cursor-pointer"
            title="Play / Pause (Space)"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          <button
            onClick={onSplitClip}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-md transition-colors cursor-pointer"
            title="Split selected clip at playhead"
          >
            <Scissors className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onDuplicateClip}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-md transition-colors cursor-pointer"
            title="Duplicate selected clip"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onDeleteClip}
            className="p-1.5 bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white rounded-md transition-colors cursor-pointer"
            title="Delete selected clip"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          <span className="text-[11px] text-slate-400 font-medium">
            Clips: {project.items.length} · Total: {totalDuration.toFixed(1)}s
          </span>
        </div>

        {/* Right Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom((z) => Math.max(16, z - 8))}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <span className="font-mono text-[10px] text-slate-400 w-10 text-center">
            {zoom}px/s
          </span>

          <button
            onClick={() => setZoom((z) => Math.min(80, z + 8))}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Tracks Container (Scrollable) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Track Headers (Left Labels) */}
        <div className="w-40 shrink-0 border-r border-slate-800 bg-slate-950/90 flex flex-col text-[11px] font-semibold text-slate-400">
          <div className="h-6 border-b border-slate-800 px-3 flex items-center text-[10px] text-slate-500 font-mono">
            TRACKS
          </div>
          <div className="h-14 border-b border-slate-800 px-3 flex items-center gap-2 text-rose-300 bg-rose-950/10">
            <Video className="w-3.5 h-3.5 text-rose-500" />
            <span>Main Video</span>
          </div>
          <div className="h-10 border-b border-slate-800 px-3 flex items-center gap-2 text-purple-300 bg-purple-950/10">
            <Mic className="w-3.5 h-3.5 text-purple-400" />
            <span>AI Voiceover</span>
          </div>
          <div className="h-12 border-b border-slate-800 px-3 flex items-center gap-2 text-emerald-300 bg-emerald-950/10">
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sound FX</span>
          </div>
          <div className="h-9 border-b border-slate-800 px-3 flex items-center gap-2 text-cyan-300 bg-cyan-950/10">
            <Music className="w-3.5 h-3.5 text-cyan-400" />
            <span>Music (BGM)</span>
          </div>
          <div className="h-9 px-3 flex items-center gap-2 text-yellow-300 bg-yellow-950/10">
            <Type className="w-3.5 h-3.5 text-yellow-400" />
            <span>Captions</span>
          </div>
        </div>

        {/* Scrollable Tracks Body */}
        <div
          ref={timelineRef}
          onMouseDown={handleTimelineMouseDown}
          className="flex-1 overflow-x-auto overflow-y-hidden relative bg-slate-950/50"
        >
          <div style={{ width: `${timelineWidth}px` }} className="relative h-full">
            {/* 1. Time Ruler */}
            <div className="h-6 border-b border-slate-800 bg-slate-900/50 relative flex items-center">
              {Array.from({ length: Math.ceil(totalDuration) + 2 }).map((_, sec) => (
                <div
                  key={sec}
                  style={{ left: `${sec * zoom}px` }}
                  className="absolute top-0 bottom-0 border-l border-slate-800 text-[9px] font-mono text-slate-500 pl-1 pt-0.5"
                >
                  {sec}s
                </div>
              ))}
            </div>

            {/* Red Playhead Line */}
            <div
              style={{ left: `${currentTime * zoom}px` }}
              className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-30 pointer-events-none"
            >
              {/* Playhead Handle */}
              <div className="w-3 h-3 bg-rose-500 rounded-full -ml-[5px] -mt-1 shadow-lg border border-white" />
            </div>

            {/* TRACK 1: Main Video Clips */}
            <div className="h-14 border-b border-slate-800/80 relative flex items-center px-1 bg-slate-950/40">
              {clipPositions.map(({ clip, start, end }, idx) => {
                const isSelected = selectedClipId === clip.id;
                const widthPx = Math.max(30, clip.duration * zoom);
                return (
                  <div
                    key={clip.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectClip(clip.id);
                    }}
                    style={{
                      left: `${start * zoom}px`,
                      width: `${widthPx}px`,
                    }}
                    className={`absolute h-11 rounded-lg border flex items-center justify-between px-2.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-rose-950/80 border-rose-500 text-white ring-2 ring-rose-500/50 shadow-md z-10'
                        : 'bg-slate-900 border-slate-700 hover:border-slate-500 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-5 h-5 rounded bg-rose-600 text-white flex items-center justify-center font-black text-[10px] shrink-0">
                        #{clip.rank}
                      </span>
                      <span className="font-bold text-xs truncate max-w-[120px]">
                        {clip.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 text-[10px] text-slate-400 font-mono">
                      <span>{clip.duration.toFixed(1)}s</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* TRACK 2: AI Voiceover Speech Segments */}
            <div className="h-10 border-b border-slate-800/80 relative flex items-center px-1 bg-slate-950/30">
              {clipPositions.map(({ clip, start }) => {
                const widthPx = Math.max(30, (clip.duration * 0.75) * zoom);
                return (
                  <div
                    key={clip.id}
                    style={{
                      left: `${(start + 0.1) * zoom}px`,
                      width: `${widthPx}px`,
                    }}
                    className="absolute h-7 rounded-md bg-purple-950/70 border border-purple-500/40 text-purple-200 flex items-center px-2 text-[10px] truncate shadow-sm"
                  >
                    <span className="font-semibold truncate">
                      "{clip.narrationText.slice(0, 32)}..."
                    </span>
                  </div>
                );
              })}
            </div>

            {/* TRACK 3: Sound Effects (SFX) Track with individual pills */}
            <div className="h-12 border-b border-slate-800/80 relative flex items-center px-1 bg-slate-950/50">
              {allTimelineSfx.map(({ sfx, absoluteStart, clipRank }) => {
                const widthPx = Math.max(34, sfx.duration * zoom);
                return (
                  <div
                    key={sfx.id}
                    style={{
                      left: `${absoluteStart * zoom}px`,
                      width: `${widthPx}px`,
                    }}
                    className="absolute h-8 rounded-lg bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 flex items-center justify-between px-1.5 shadow-md cursor-pointer hover:border-emerald-400 transition-all z-10"
                    title={`#${clipRank} ${sfx.label} (${sfx.effectType})`}
                  >
                    <span className="font-bold text-[10px] truncate">{sfx.label}</span>
                    <span className="text-[8px] font-mono text-emerald-400">
                      {Math.round(sfx.gain * 100)}%
                    </span>
                  </div>
                );
              })}
            </div>

            {/* TRACK 4: Background Music */}
            <div className="h-9 border-b border-slate-800/80 relative flex items-center px-1 bg-slate-950/30">
              {project.music.enabled && (
                <div
                  style={{
                    left: `0px`,
                    width: `${totalDuration * zoom}px`,
                  }}
                  className="absolute h-6 rounded-md bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 flex items-center justify-between px-3 text-[10px] shadow-sm"
                >
                  <span className="font-semibold truncate">
                    BGM: {project.music.trackName} ({project.music.genre})
                  </span>
                  <span className="text-cyan-400 font-mono">
                    {Math.round(project.music.volume * 100)}% vol
                  </span>
                </div>
              )}
            </div>

            {/* TRACK 5: Captions */}
            <div className="h-9 relative flex items-center px-1 bg-slate-950/20">
              {project.captions.map((cap) => {
                const widthPx = Math.max(20, (cap.endTime - cap.startTime) * zoom);
                return (
                  <div
                    key={cap.id}
                    style={{
                      left: `${cap.startTime * zoom}px`,
                      width: `${widthPx}px`,
                    }}
                    className="absolute h-6 rounded-md bg-yellow-950/60 border border-yellow-500/40 text-yellow-200 flex items-center px-2 text-[10px] truncate shadow-sm font-semibold"
                  >
                    <span className="truncate">{cap.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
