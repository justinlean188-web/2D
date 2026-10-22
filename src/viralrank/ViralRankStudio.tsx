import React, { useEffect, useRef, useState } from 'react';
import { LeftPanel } from './components/LeftPanel';
import { CenterPreview } from './components/CenterPreview';
import { RightInspector } from './components/RightInspector';
import { MultitrackTimeline } from './components/MultitrackTimeline';
import { ExportModal } from './components/ExportModal';
import {
  ActiveTab,
  AISoundSuggestion,
  EffectType,
  RankingItem,
  ViralRankProject,
} from './types';
import { DEFAULT_VIRALRANK_PROJECT, generateAISuggestions, SFX_CATALOG } from './presets';
import { viralAudio } from './audioEngine';

export const ViralRankStudio: React.FC = () => {
  const [project, setProject] = useState<ViralRankProject>(DEFAULT_VIRALRANK_PROJECT);
  const [activeTab, setActiveTab] = useState<ActiveTab>('media');
  const [selectedClipId, setSelectedClipId] = useState<string | null>(
    DEFAULT_VIRALRANK_PROJECT.items[0]?.id || null
  );
  const [currentTime, setCurrentTime] = useState<number>(0.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISoundSuggestion[]>(() =>
    generateAISuggestions(DEFAULT_VIRALRANK_PROJECT.items)
  );

  const firedCuesRef = useRef<Set<string>>(new Set());
  const lastTimeRef = useRef<number>(performance.now());
  const rafRef = useRef<number | null>(null);

  const totalDuration = project.items.reduce((acc, it) => acc + it.duration, 0);

  // Playhead animation loop & audio cue triggering
  useEffect(() => {
    const loop = (now: number) => {
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      if (isPlaying) {
        setCurrentTime((prev) => {
          const next = prev + dt;
          if (next >= totalDuration) {
            firedCuesRef.current.clear();
            return 0.0;
          }

          // Trigger sound effects whose timeline timestamps match currentTime
          let currentClipOffset = 0;
          for (const item of project.items) {
            const clipStart = currentClipOffset;
            const clipEnd = clipStart + item.duration;

            if (next >= clipStart && next < clipEnd) {
              for (const sfx of item.soundEffects) {
                if (!sfx.enabled) continue;
                const absoluteTime = clipStart + sfx.clipOffset;
                const cueKey = `${item.id}-${sfx.id}-${Math.floor(absoluteTime * 10)}`;

                if (
                  next >= absoluteTime &&
                  next <= absoluteTime + 0.15 &&
                  !firedCuesRef.current.has(cueKey)
                ) {
                  firedCuesRef.current.add(cueKey);
                  viralAudio.playEffect(sfx.effectType, {
                    gain: sfx.gain,
                    playbackRate: sfx.playbackRate,
                  });
                }
              }
            }
            currentClipOffset += item.duration;
          }

          return next;
        });
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    lastTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, project, totalDuration]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setCurrentTime((t) => Math.max(0, t - 1 / project.fps));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setCurrentTime((t) => Math.min(totalDuration, t + 1 / project.fps));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [project.fps, totalDuration]);

  const handleSeek = (t: number) => {
    setCurrentTime(t);
    firedCuesRef.current.clear();
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    viralAudio.setMuted(nextMuted);
  };

  const handleAddEffectToClip = (clipId: string, effectType: EffectType) => {
    const sfxDef = SFX_CATALOG.find((s) => s.type === effectType);
    const newEffect = {
      id: `sfx-${Date.now()}`,
      clipId,
      effectType,
      label: sfxDef?.name || 'Sound Effect',
      timelineStart: 0.2,
      clipOffset: 0.2,
      duration: sfxDef?.duration || 0.4,
      gain: 1.0,
      fadeIn: 0.05,
      fadeOut: 0.1,
      playbackRate: 1.0,
      enabled: true,
    };

    setProject((prev) => ({
      ...prev,
      items: prev.items.map((it) =>
        it.id === clipId
          ? {
              ...it,
              soundEffects: [...it.soundEffects, newEffect],
            }
          : it
      ),
    }));
  };

  const handleGenerateAISuggestions = () => {
    const newSugs = generateAISuggestions(project.items);
    setAiSuggestions(newSugs);
    setActiveTab('ai');
  };

  const handleApplyAISuggestion = (suggestionId: string) => {
    const sug = aiSuggestions.find((s) => s.id === suggestionId);
    if (!sug) return;

    handleAddEffectToClip(sug.clipId, sug.effectType);

    // Mark as approved
    setAiSuggestions((prev) =>
      prev.map((s) => (s.id === suggestionId ? { ...s, approved: true } : s))
    );
  };

  const handleSplitClip = () => {
    if (!selectedClipId) return;
    const clipIndex = project.items.findIndex((it) => it.id === selectedClipId);
    if (clipIndex === -1) return;

    const clip = project.items[clipIndex];
    if (clip.duration <= 1.5) return;

    const half = clip.duration / 2;
    const part1: RankingItem = {
      ...clip,
      duration: half,
    };
    const part2: RankingItem = {
      ...clip,
      id: `clip-${Date.now()}`,
      title: `${clip.title} (Part 2)`,
      duration: half,
      soundEffects: [],
    };

    setProject((prev) => {
      const items = [...prev.items];
      items.splice(clipIndex, 1, part1, part2);
      return { ...prev, items };
    });
  };

  const handleDuplicateClip = () => {
    if (!selectedClipId) return;
    const clip = project.items.find((it) => it.id === selectedClipId);
    if (!clip) return;

    const dup: RankingItem = {
      ...clip,
      id: `clip-${Date.now()}`,
      title: `${clip.title} (Copy)`,
      soundEffects: clip.soundEffects.map((s) => ({
        ...s,
        id: `sfx-${Date.now()}-${Math.random()}`,
      })),
    };

    setProject((prev) => ({
      ...prev,
      items: [...prev.items, dup],
    }));
  };

  const handleDeleteClip = () => {
    if (!selectedClipId || project.items.length <= 1) return;
    setProject((prev) => {
      const filtered = prev.items.filter((it) => it.id !== selectedClipId);
      const renumbered = filtered.map((it, idx) => ({
        ...it,
        rank: prev.orderMode === 'countdown' ? filtered.length - idx : idx + 1,
      }));
      return {
        ...prev,
        items: renumbered,
        rankingCount: renumbered.length,
      };
    });
    setSelectedClipId(project.items[0]?.id || null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full overflow-hidden bg-slate-950 font-sans select-none">
      {/* Upper 3-Panel Editor Workspace */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Library & Assets Panel */}
        <LeftPanel
          project={project}
          setProject={setProject}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedClipId={selectedClipId}
          onAddEffectToClip={handleAddEffectToClip}
          onGenerateAISuggestions={handleGenerateAISuggestions}
          onApplyAISuggestion={handleApplyAISuggestion}
        />

        {/* Center 9:16 Video Canvas Viewport */}
        <CenterPreview
          project={project}
          currentTime={currentTime}
          totalDuration={totalDuration}
          isPlaying={isPlaying}
          isMuted={isMuted}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          onSeek={handleSeek}
          onToggleMute={handleToggleMute}
          onOpenExport={() => setIsExportOpen(true)}
        />

        {/* Right Properties & SFX Inspector */}
        <RightInspector
          project={project}
          setProject={setProject}
          selectedClipId={selectedClipId}
          suggestions={aiSuggestions}
          onApplyAISuggestion={handleApplyAISuggestion}
        />
      </div>

      {/* Bottom Multitrack Timeline Engine */}
      <MultitrackTimeline
        project={project}
        setProject={setProject}
        currentTime={currentTime}
        totalDuration={totalDuration}
        isPlaying={isPlaying}
        selectedClipId={selectedClipId}
        onSelectClip={(id) => setSelectedClipId(id)}
        onSeek={handleSeek}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onSplitClip={handleSplitClip}
        onDuplicateClip={handleDuplicateClip}
        onDeleteClip={handleDeleteClip}
      />

      {/* Export Studio Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        project={project}
        totalDuration={totalDuration}
      />
    </div>
  );
};
