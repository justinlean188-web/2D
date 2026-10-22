import React, { useState } from 'react';
import {
  Sliders,
  Volume2,
  Trash2,
  Copy,
  Plus,
  Play,
  Sparkles,
  Type,
  Clock,
  Gauge,
  Video,
  ChevronRight,
  Flame,
} from 'lucide-react';
import {
  AISoundSuggestion,
  CropMode,
  EffectType,
  RankingItem,
  TransitionType,
  ViralRankProject,
} from '../types';
import { SFX_CATALOG } from '../presets';
import { viralAudio } from '../audioEngine';

interface RightInspectorProps {
  project: ViralRankProject;
  setProject: React.Dispatch<React.SetStateAction<ViralRankProject>>;
  selectedClipId: string | null;
  suggestions: AISoundSuggestion[];
  onApplyAISuggestion: (suggestionId: string) => void;
}

export const RightInspector: React.FC<RightInspectorProps> = ({
  project,
  setProject,
  selectedClipId,
  suggestions,
  onApplyAISuggestion,
}) => {
  const [selectedEffectId, setSelectedEffectId] = useState<string | null>(null);

  const selectedClip =
    project.items.find((it) => it.id === selectedClipId) || project.items[0];

  if (!selectedClip) {
    return (
      <div className="w-80 shrink-0 border-l border-slate-800 bg-slate-900/95 p-4 text-xs text-slate-400 select-none">
        Select a clip on the timeline to inspect its properties.
      </div>
    );
  }

  const clipSuggestions = suggestions.filter((s) => s.clipId === selectedClip.id);

  const handleUpdateClip = (fields: Partial<RankingItem>) => {
    setProject((prev) => ({
      ...prev,
      items: prev.items.map((it) => (it.id === selectedClip.id ? { ...it, ...fields } : it)),
    }));
  };

  const handleUpdateEffect = (effectId: string, fields: any) => {
    setProject((prev) => ({
      ...prev,
      items: prev.items.map((it) =>
        it.id === selectedClip.id
          ? {
              ...it,
              soundEffects: it.soundEffects.map((s) =>
                s.id === effectId ? { ...s, ...fields } : s
              ),
            }
          : it
      ),
    }));
  };

  const handleDeleteEffect = (effectId: string) => {
    setProject((prev) => ({
      ...prev,
      items: prev.items.map((it) =>
        it.id === selectedClip.id
          ? {
              ...it,
              soundEffects: it.soundEffects.filter((s) => s.id !== effectId),
            }
          : it
      ),
    }));
  };

  const handleAddQuickEffect = (type: EffectType) => {
    const sfxDef = SFX_CATALOG.find((s) => s.type === type);
    const newEffect = {
      id: `sfx-${Date.now()}`,
      clipId: selectedClip.id,
      effectType: type,
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
        it.id === selectedClip.id
          ? {
              ...it,
              soundEffects: [...it.soundEffects, newEffect],
            }
          : it
      ),
    }));
  };

  return (
    <div className="w-84 shrink-0 border-l border-slate-800 bg-slate-900/95 flex flex-col h-full text-slate-200 select-none overflow-y-auto">
      {/* Header Banner */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-rose-500" />
          <span className="font-bold text-sm text-white">Clip Inspector</span>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-rose-600/20 text-rose-300 border border-rose-500/30 font-bold text-[10px]">
          RANK #{selectedClip.rank}
        </span>
      </div>

      <div className="p-4 space-y-5 text-xs">
        {/* 1. Basic Metadata */}
        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              Clip Title
            </label>
            <input
              type="text"
              value={selectedClip.title}
              onChange={(e) => handleUpdateClip({ title: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500 font-semibold"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              Description / Notes
            </label>
            <textarea
              rows={2}
              value={selectedClip.description || ''}
              onChange={(e) => handleUpdateClip({ description: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-rose-500 resize-none"
            />
          </div>
        </div>

        {/* 2. Timing & Speed */}
        <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
          <div className="font-bold text-xs text-white flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Clip Timing & Playback</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block">Duration</span>
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="30"
                  value={selectedClip.duration}
                  onChange={(e) =>
                    handleUpdateClip({ duration: Math.max(1, parseFloat(e.target.value) || 1) })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-xs text-white font-mono"
                />
                <span className="text-slate-400">sec</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 block">Speed</span>
              <select
                value={selectedClip.speed}
                onChange={(e) => handleUpdateClip({ speed: parseFloat(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-xs text-white mt-1 cursor-pointer"
              >
                <option value={0.5}>0.5x (Slow-Mo)</option>
                <option value={0.75}>0.75x (Relaxed)</option>
                <option value={1.0}>1.0x (Normal)</option>
                <option value={1.25}>1.25x (Fast)</option>
                <option value={1.5}>1.5x (High Speed)</option>
                <option value={2.0}>2.0x (Hyper)</option>
              </select>
            </div>
          </div>

          {/* Transition */}
          <div>
            <span className="text-[10px] text-slate-400 block mb-1">Entrance Transition</span>
            <div className="grid grid-cols-3 gap-1">
              {(['none', 'fade', 'slide-left', 'slide-up', 'zoom', 'flash'] as TransitionType[]).map(
                (tr) => (
                  <button
                    key={tr}
                    onClick={() => handleUpdateClip({ transition: tr })}
                    className={`py-1 px-1 rounded text-[10px] uppercase font-semibold border cursor-pointer transition-colors ${
                      selectedClip.transition === tr
                        ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {tr}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* 3. INDIVIDUAL SOUND EFFECTS (Core Feature) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-white flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span>Assigned Sound Effects ({selectedClip.soundEffects.length})</span>
            </span>
          </div>

          <div className="space-y-2">
            {selectedClip.soundEffects.map((sfx) => (
              <div
                key={sfx.id}
                className="p-3 bg-slate-950 border border-slate-800 hover:border-emerald-500/50 rounded-xl space-y-2.5 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-600/40 uppercase font-mono text-[9px] font-bold">
                      {sfx.effectType}
                    </span>
                    <span className="font-bold text-white text-xs truncate">
                      {sfx.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() =>
                        viralAudio.playEffect(sfx.effectType, {
                          gain: sfx.gain,
                          playbackRate: sfx.playbackRate,
                        })
                      }
                      className="p-1 bg-slate-800 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-md transition-colors cursor-pointer"
                      title="Test SFX"
                    >
                      <Play className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteEffect(sfx.id)}
                      className="p-1 bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white rounded-md transition-colors cursor-pointer"
                      title="Remove SFX"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Offset & Gain Sliders */}
                <div className="space-y-2 pt-1 border-t border-slate-900 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Trigger Offset:</span>
                    <span className="font-mono text-emerald-400">
                      +{sfx.clipOffset.toFixed(2)}s
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={selectedClip.duration}
                    step="0.05"
                    value={sfx.clipOffset}
                    onChange={(e) =>
                      handleUpdateEffect(sfx.id, {
                        clipOffset: parseFloat(e.target.value),
                        timelineStart: parseFloat(e.target.value),
                      })
                    }
                    className="w-full accent-emerald-500 cursor-pointer"
                  />

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Volume Gain (0-200%):</span>
                    <span className="font-mono text-emerald-400">
                      {Math.round(sfx.gain * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2.0"
                    step="0.1"
                    value={sfx.gain}
                    onChange={(e) =>
                      handleUpdateEffect(sfx.id, { gain: parseFloat(e.target.value) })
                    }
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>
            ))}

            {selectedClip.soundEffects.length === 0 && (
              <div className="p-3 bg-slate-950/40 border border-dashed border-slate-800 rounded-xl text-center text-slate-500 text-[11px]">
                No sound effects attached to this clip yet.
              </div>
            )}

            {/* Quick Add SFX buttons */}
            <div className="pt-1">
              <span className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase">
                Quick Add Effect
              </span>
              <div className="grid grid-cols-3 gap-1">
                {(['whoosh', 'impact', 'punch', 'ding', 'riser', 'crowd-cheer'] as EffectType[]).map(
                  (typ) => (
                    <button
                      key={typ}
                      onClick={() => handleAddQuickEffect(typ)}
                      className="py-1 px-1.5 bg-slate-950 hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-500 text-slate-300 hover:text-emerald-300 rounded-md text-[10px] font-semibold cursor-pointer transition-colors"
                    >
                      + {typ}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 4. AI SUGGESTED SOUND EFFECTS FOR THIS CLIP */}
        {clipSuggestions.length > 0 && (
          <div className="p-3 bg-purple-950/20 border border-purple-500/30 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-xs text-purple-300">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>AI Recommended SFX ({clipSuggestions.length})</span>
            </div>
            <div className="space-y-1.5">
              {clipSuggestions.map((sug) => (
                <div
                  key={sug.id}
                  className="p-2 bg-slate-950/80 border border-slate-800 rounded-lg flex items-center justify-between gap-2 text-[11px]"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-white truncate">{sug.label}</div>
                    <div className="text-[10px] text-slate-400 truncate">{sug.reason}</div>
                  </div>
                  <button
                    onClick={() => onApplyAISuggestion(sug.id)}
                    className="px-2 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded font-bold text-[10px] cursor-pointer shrink-0 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Narration Script for this Item */}
        <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-yellow-400" />
              <span>Spoken Narration Script</span>
            </span>
            <button
              onClick={() =>
                viralAudio.speak(selectedClip.narrationText, {
                  rate: project.voiceover.speed,
                  pitch: project.voiceover.pitch,
                })
              }
              className="text-[10px] font-bold text-yellow-400 hover:text-yellow-300 flex items-center gap-1 cursor-pointer"
            >
              <Play className="w-3 h-3" />
              <span>Test Voice</span>
            </button>
          </div>
          <textarea
            rows={2}
            value={selectedClip.narrationText}
            onChange={(e) => handleUpdateClip({ narrationText: e.target.value })}
            placeholder="e.g. At number five, this bottle flip looks impossible..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-yellow-400 resize-none font-medium"
          />
        </div>
      </div>
    </div>
  );
};
