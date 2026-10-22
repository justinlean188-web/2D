import React, { useState } from 'react';
import {
  FileVideo,
  Volume2,
  Music,
  Type,
  Sparkles,
  LayoutTemplate,
  Plus,
  Play,
  VolumeX,
  Upload,
  Link2,
  Trash2,
  Check,
  Flame,
  Search,
} from 'lucide-react';
import {
  ActiveTab,
  CaptionPreset,
  CropMode,
  EffectType,
  RankingItem,
  SourceMedia,
  ViralRankProject,
} from '../types';
import { CAPTION_PRESETS, MUSIC_PRESETS, SFX_CATALOG } from '../presets';
import { viralAudio } from '../audioEngine';

interface LeftPanelProps {
  project: ViralRankProject;
  setProject: React.Dispatch<React.SetStateAction<ViralRankProject>>;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedClipId: string | null;
  onAddEffectToClip: (clipId: string, effectType: EffectType) => void;
  onGenerateAISuggestions: () => void;
  onApplyAISuggestion: (suggestionId: string) => void;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({
  project,
  setProject,
  activeTab,
  setActiveTab,
  selectedClipId,
  onAddEffectToClip,
  onGenerateAISuggestions,
}) => {
  const [sfxSearch, setSfxSearch] = useState('');
  const [sfxCategory, setSfxCategory] = useState<string>('all');
  const [urlInput, setUrlInput] = useState('');
  const [urlNameInput, setUrlNameInput] = useState('');

  const filteredSfx = SFX_CATALOG.filter((item) => {
    const matchesCat = sfxCategory === 'all' || item.category === sfxCategory;
    const matchesSearch =
      !sfxSearch ||
      item.name.toLowerCase().includes(sfxSearch.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(sfxSearch.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const objectUrl = URL.createObjectURL(file);

    const newMedia: SourceMedia = {
      id: `media-${Date.now()}`,
      name: file.name.replace(/\.[^/.]+$/, ''),
      url: objectUrl,
      duration: 5.0,
      type: file.type.startsWith('audio') ? 'audio' : 'video',
      width: 1080,
      height: 1920,
    };

    setProject((prev) => ({
      ...prev,
      sourceLibrary: [newMedia, ...prev.sourceLibrary],
    }));
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    const newMedia: SourceMedia = {
      id: `media-${Date.now()}`,
      name: urlNameInput.trim() || 'Imported Video Stream',
      url: urlInput.trim(),
      duration: 5.0,
      type: 'video',
      width: 1080,
      height: 1920,
    };

    setProject((prev) => ({
      ...prev,
      sourceLibrary: [newMedia, ...prev.sourceLibrary],
    }));
    setUrlInput('');
    setUrlNameInput('');
  };

  const handleApplyCaptionPreset = (presetKey: string) => {
    const style = CAPTION_PRESETS[presetKey];
    if (!style) return;
    setProject((prev) => ({
      ...prev,
      captionStyle: style,
    }));
  };

  const handleSetRankingCount = (count: number) => {
    setProject((prev) => {
      let items = [...prev.items];
      if (count > items.length) {
        // Add more items
        const needed = count - items.length;
        for (let i = 0; i < needed; i++) {
          const rank = items.length + 1;
          const source = prev.sourceLibrary[i % prev.sourceLibrary.length];
          const newItem: RankingItem = {
            id: `clip-${Date.now()}-${i}`,
            rank: rank,
            title: `Epic Clip #${rank}`,
            description: `Dynamic highlight moment ranked at #${rank}`,
            sourceMediaId: source.id,
            sourceUrl: source.url,
            sourceStart: 0,
            sourceEnd: 5.0,
            duration: 5.0,
            speed: 1.0,
            volume: 1.0,
            muted: false,
            cropMode: 'fit' as CropMode,
            transition: 'fade',
            narrationText: `At number ${rank}, this highlight is incredible.`,
            soundEffects: [
              {
                id: `sfx-new-${Date.now()}-${i}`,
                clipId: `clip-${Date.now()}-${i}`,
                effectType: 'whoosh',
                label: 'Reveal Whoosh',
                timelineStart: 0.1,
                clipOffset: 0.1,
                duration: 0.35,
                gain: 1.0,
                fadeIn: 0.05,
                fadeOut: 0.1,
                playbackRate: 1.0,
                enabled: true,
              },
            ],
          };
          items.push(newItem);
        }
      } else if (count < items.length) {
        items = items.slice(0, count);
      }

      // Re-assign rank numbers in sequence
      const renumbered = items.map((it, idx) => ({
        ...it,
        rank: prev.orderMode === 'countdown' ? items.length - idx : idx + 1,
      }));

      return {
        ...prev,
        rankingCount: count,
        items: renumbered,
      };
    });
  };

  return (
    <div className="w-80 shrink-0 border-r border-slate-800 bg-slate-900/95 flex flex-col h-full text-slate-200 select-none">
      {/* Tab Switcher Icons */}
      <div className="grid grid-cols-6 border-b border-slate-800 bg-slate-950/70 p-1 gap-1">
        {[
          { id: 'media', label: 'Media', icon: <FileVideo className="w-4 h-4" /> },
          { id: 'sfx', label: 'SFX', icon: <Volume2 className="w-4 h-4" /> },
          { id: 'music', label: 'Music', icon: <Music className="w-4 h-4" /> },
          { id: 'captions', label: 'Text', icon: <Type className="w-4 h-4" /> },
          { id: 'ai', label: 'AI', icon: <Sparkles className="w-4 h-4" /> },
          { id: 'templates', label: 'Presets', icon: <LayoutTemplate className="w-4 h-4" /> },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as ActiveTab)}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
              activeTab === t.id
                ? 'bg-rose-600 text-white shadow-sm ring-1 ring-rose-400/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title={t.label}
          >
            {t.icon}
            <span className="mt-1">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* 1. MEDIA TAB */}
        {activeTab === 'media' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-white flex items-center gap-2">
                <FileVideo className="w-4 h-4 text-rose-500" />
                Media Library
              </span>
              <span className="text-[11px] text-slate-400">
                {project.sourceLibrary.length} clips
              </span>
            </div>

            {/* Upload Button */}
            <label className="flex items-center justify-center gap-2 w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 border border-dashed border-slate-600 hover:border-rose-500 rounded-xl cursor-pointer text-slate-200 font-semibold transition-colors">
              <Upload className="w-4 h-4 text-rose-400" />
              <span>Upload Video / Audio</span>
              <input
                type="file"
                accept="video/*,audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {/* URL Import */}
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
              <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Import Video URL</span>
              </div>
              <input
                type="text"
                placeholder="Clip Title (e.g. Crazy Buzzer Beater)"
                value={urlNameInput}
                onChange={(e) => setUrlNameInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="https://... video.mp4"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
                <button
                  onClick={handleAddUrl}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold text-xs cursor-pointer shrink-0"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Media list */}
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Available Stock & Uploads
              </div>
              {project.sourceLibrary.map((media) => (
                <div
                  key={media.id}
                  className="p-2.5 bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center justify-between gap-2 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
                      {media.thumbnail ? (
                        <img
                          src={media.thumbnail}
                          alt={media.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FileVideo className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-white truncate text-xs">
                        {media.name}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {media.duration.toFixed(1)}s · {media.type}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (selectedClipId) {
                        setProject((prev) => ({
                          ...prev,
                          items: prev.items.map((it) =>
                            it.id === selectedClipId
                              ? {
                                  ...it,
                                  sourceMediaId: media.id,
                                  sourceUrl: media.url,
                                  title: media.name,
                                }
                              : it
                          ),
                        }));
                      }
                    }}
                    className="p-1.5 bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer shrink-0"
                    title={
                      selectedClipId
                        ? 'Assign to selected clip'
                        : 'Select a clip on timeline first'
                    }
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. SFX TAB (Core Feature) */}
        {activeTab === 'sfx' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-white flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                Sound Effects Library
              </span>
              <span className="text-[11px] text-emerald-400 font-mono">18 Pro SFX</span>
            </div>

            {/* Search and Category Filter */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search whoosh, impact, punch, bell..."
                  value={sfxSearch}
                  onChange={(e) => setSfxSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Category Pills */}
              <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
                {['all', 'impact', 'foley', 'cinematic', 'reaction', 'musical'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSfxCategory(cat)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider cursor-pointer whitespace-nowrap transition-colors ${
                      sfxCategory === cat
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Clip Banner */}
            <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Target Clip:</span>
              <span className="font-bold text-rose-400 truncate max-w-[150px]">
                {selectedClipId
                  ? project.items.find((it) => it.id === selectedClipId)?.title ??
                    'None selected'
                  : 'Select clip on timeline'}
              </span>
            </div>

            {/* SFX Cards List */}
            <div className="space-y-2">
              {filteredSfx.map((sfx) => (
                <div
                  key={sfx.type}
                  className="p-2.5 bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center justify-between gap-2 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white text-xs">{sfx.name}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 uppercase font-mono">
                        {sfx.duration}s
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {sfx.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {/* Live Preview Button */}
                    <button
                      onClick={() => viralAudio.playEffect(sfx.type, { gain: 1.2 })}
                      className="p-1.5 bg-slate-800 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                      title="Preview sound effect"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>

                    {/* Add to Selected Clip Button */}
                    <button
                      onClick={() => {
                        const targetId = selectedClipId || project.items[0]?.id;
                        if (targetId) {
                          onAddEffectToClip(targetId, sfx.type);
                        }
                      }}
                      className="flex items-center gap-1 px-2 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold text-[10px] transition-colors cursor-pointer"
                      title="Add to current clip"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. MUSIC TAB */}
        {activeTab === 'music' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-white flex items-center gap-2">
                <Music className="w-4 h-4 text-cyan-400" />
                Background Music
              </span>
              <button
                onClick={() =>
                  setProject((prev) => ({
                    ...prev,
                    music: { ...prev.music, enabled: !prev.music.enabled },
                  }))
                }
                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                  project.music.enabled
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {project.music.enabled ? 'ACTIVE' : 'MUTED'}
              </button>
            </div>

            {/* Volume & Ducking */}
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Music Volume:</span>
                <span className="font-mono text-cyan-400">
                  {Math.round(project.music.volume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={project.music.volume}
                onChange={(e) =>
                  setProject((prev) => ({
                    ...prev,
                    music: { ...prev.music, volume: parseFloat(e.target.value) },
                  }))
                }
                className="w-full accent-cyan-500 cursor-pointer"
              />

              <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                <label className="text-[11px] text-slate-300 flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={project.music.duckingEnabled}
                    onChange={(e) =>
                      setProject((prev) => ({
                        ...prev,
                        music: { ...prev.music, duckingEnabled: e.target.checked },
                      }))
                    }
                    className="accent-cyan-500"
                  />
                  <span>Auto-Duck during voiceover</span>
                </label>
              </div>
            </div>

            {/* Preset tracks */}
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Soundtrack Presets
              </div>
              {MUSIC_PRESETS.map((m) => {
                const isSelected = project.music.genre === m.genre;
                return (
                  <button
                    key={m.id}
                    onClick={() =>
                      setProject((prev) => ({
                        ...prev,
                        music: {
                          ...prev.music,
                          trackName: m.trackName,
                          genre: m.genre,
                          volume: m.volume,
                          enabled: true,
                        },
                      }))
                    }
                    className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500 text-white ring-1 ring-cyan-500/50'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs">{m.trackName}</div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">
                        Genre: {m.genre} · Looping
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. CAPTIONS & TEXT TAB */}
        {activeTab === 'captions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-white flex items-center gap-2">
                <Type className="w-4 h-4 text-yellow-400" />
                Captions & Text Styles
              </span>
            </div>

            {/* Style Presets */}
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Shorts & Reels Presets
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'mrbeast', name: 'MrBeast Bold', color: 'bg-yellow-500 text-black' },
                  { key: 'tiktok-karaoke', name: 'TikTok Karaoke', color: 'bg-white text-black' },
                  { key: 'neon', name: 'Neon Glow', color: 'bg-cyan-500 text-black' },
                  { key: 'badge', name: 'Crimson Badge', color: 'bg-rose-600 text-white' },
                  { key: 'minimal', name: 'Minimal White', color: 'bg-slate-800 text-white' },
                ].map((p) => (
                  <button
                    key={p.key}
                    onClick={() => handleApplyCaptionPreset(p.key)}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                      project.captionStyle.preset === p.key
                        ? 'border-yellow-400 bg-yellow-950/30 text-yellow-300 ring-1 ring-yellow-400/50'
                        : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`py-1 px-1.5 rounded text-[10px] uppercase tracking-wider mb-1 ${p.color}`}
                    >
                      Sample Text
                    </div>
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom font and position settings */}
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Font Size:</span>
                <span className="font-mono text-yellow-400">
                  {project.captionStyle.fontSize}px
                </span>
              </div>
              <input
                type="range"
                min="32"
                max="72"
                value={project.captionStyle.fontSize}
                onChange={(e) =>
                  setProject((prev) => ({
                    ...prev,
                    captionStyle: {
                      ...prev.captionStyle,
                      fontSize: parseInt(e.target.value),
                    },
                  }))
                }
                className="w-full accent-yellow-400 cursor-pointer"
              />

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                <span className="text-slate-400">Vertical Position (Y):</span>
                <span className="font-mono text-yellow-400">
                  {project.captionStyle.yPos}%
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="90"
                value={project.captionStyle.yPos}
                onChange={(e) =>
                  setProject((prev) => ({
                    ...prev,
                    captionStyle: {
                      ...prev.captionStyle,
                      yPos: parseInt(e.target.value),
                    },
                  }))
                }
                className="w-full accent-yellow-400 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* 5. AI ASSISTANT TAB */}
        {activeTab === 'ai' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                AI Sound & Script Assistant
              </span>
            </div>

            {/* AI Generator CTA */}
            <div className="p-3.5 bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 border border-purple-500/30 rounded-xl space-y-2.5">
              <div className="font-bold text-xs text-purple-200 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400" />
                Auto-Suggest Sound Effects
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Analyze all clip titles, actions, and narration to suggest exact whooshes, risers,
                impacts, and cheers placed precisely on the timeline.
              </p>
              <button
                onClick={onGenerateAISuggestions}
                className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Smart Sound Effects</span>
              </button>
            </div>

            {/* Voiceover Script generator */}
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
              <div className="text-[11px] font-semibold text-slate-300">
                AI Voiceover & Spoken Hooks
              </div>
              <p className="text-[10px] text-slate-400">
                Generates high-retention narration phrases for every ranking position.
              </p>
              <button
                onClick={() => {
                  setProject((prev) => ({
                    ...prev,
                    items: prev.items.map((it) => ({
                      ...it,
                      narrationText: `At number ${it.rank}, watch how this incredible ${it.title} completely defies expectations!`,
                    })),
                  }));
                }}
                className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Regenerate Viral Spoken Hooks
              </button>
            </div>
          </div>
        )}

        {/* 6. TEMPLATES & RANKING COUNT TAB */}
        {activeTab === 'templates' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-white flex items-center gap-2">
                <LayoutTemplate className="w-4 h-4 text-rose-500" />
                Ranking Configuration
              </span>
            </div>

            {/* Dynamic Ranking Count Buttons */}
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Select Countdown Length
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[3, 5, 10, 20].map((cnt) => (
                  <button
                    key={cnt}
                    onClick={() => handleSetRankingCount(cnt)}
                    className={`py-2 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                      project.rankingCount === cnt
                        ? 'bg-rose-600 border-rose-500 text-white ring-2 ring-rose-400/50 shadow-md'
                        : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    Top {cnt}
                  </button>
                ))}
              </div>
            </div>

            {/* Countdown Order */}
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
              <div className="text-[11px] font-semibold text-slate-300">Countdown Order</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() =>
                    setProject((prev) => ({
                      ...prev,
                      orderMode: 'countdown',
                      items: prev.items.map((it, idx) => ({
                        ...it,
                        rank: prev.items.length - idx,
                      })),
                    }))
                  }
                  className={`py-2 px-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                    project.orderMode === 'countdown'
                      ? 'bg-rose-950/60 border-rose-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  #{project.rankingCount} to #1 (Countdown)
                </button>
                <button
                  onClick={() =>
                    setProject((prev) => ({
                      ...prev,
                      orderMode: 'best-first',
                      items: prev.items.map((it, idx) => ({
                        ...it,
                        rank: idx + 1,
                      })),
                    }))
                  }
                  className={`py-2 px-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                    project.orderMode === 'best-first'
                      ? 'bg-rose-950/60 border-rose-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  #1 to #{project.rankingCount} (Best-first)
                </button>
              </div>
            </div>

            {/* Badge Theme */}
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
              <div className="text-[11px] font-semibold text-slate-300">Ranking Badge Theme</div>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'gold', name: 'Gold', color: 'bg-amber-500' },
                  { id: 'neon-cyan', name: 'Cyber Cyan', color: 'bg-cyan-500' },
                  { id: 'crimson', name: 'Crimson', color: 'bg-rose-600' },
                  { id: 'emerald', name: 'Emerald', color: 'bg-emerald-500' },
                  { id: 'amber', name: 'Neon Amber', color: 'bg-orange-500' },
                ].map((th) => (
                  <button
                    key={th.id}
                    onClick={() =>
                      setProject((prev) => ({
                        ...prev,
                        badgeTheme: th.id as any,
                      }))
                    }
                    className={`flex items-center gap-1.5 p-2 rounded-lg border text-left cursor-pointer transition-colors ${
                      project.badgeTheme === th.id
                        ? 'border-white bg-slate-800 text-white'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${th.color}`} />
                    <span className="text-[10px] font-semibold truncate">{th.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
