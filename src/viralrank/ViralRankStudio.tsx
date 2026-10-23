import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Play,
  Pause,
  Download,
  Volume2,
  VolumeX,
  Sparkles,
  RotateCcw,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Music,
  Video,
  Mic,
  Sliders,
  Type,
  Copy,
  Layers,
  Upload,
  Scissors,
  Check,
} from 'lucide-react';
import { ExportModal } from '../components/ExportModal';
import { ClipEditor } from '../components/ClipEditor';
import { StudioConfig, DEFAULT_CONFIG } from '../types';
import {
  AudioEffect,
  EffectType,
  NarrationVoice,
  OrderMode,
  RankingItem,
  ViralRankProject,
} from './types';
import {
  CAPTION_PRESETS,
  DEFAULT_VIRALRANK_PROJECT,
  generateAISuggestions,
  SFX_CATALOG,
  STOCK_SOURCES,
} from './presets';
import { viralAudio } from './audioEngine';
import {
  NARRATION_VOICES,
  getCachedNarration,
  getNarrationBuffer,
  normalizeNarrationVoice,
  playNarrationClip,
  preloadNarration,
  prepareNarration,
} from './narration';
import { ViralRankRenderer } from './viralRankRenderer';

/**
 * A rank can be filled either from a link (YouTube, TikTok, a direct MP4) or
 * from a file that already lives in `public/source-videos`. Only the link has
 * to be downloaded; a local path is ready to play.
 */
function isRemoteVideoUrl(url?: string): boolean {
  return !!url && /^https?:\/\//i.test(url.trim());
}

export const ViralRankStudio: React.FC = () => {
  const [project, setProject] = useState<ViralRankProject>(() => {
    // Deep clone default project
    return JSON.parse(JSON.stringify(DEFAULT_VIRALRANK_PROJECT));
  });

  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showSafeZones, setShowSafeZones] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [activeItemDropdown, setActiveItemDropdown] = useState<string | null>(null);
  const [expandedTrimmerId, setExpandedTrimmerId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [downloadedVideos, setDownloadedVideos] = useState<
    { filename: string; filepath: string; sizeBytes: number }[]
  >([]);
  const [downloadingItemId, setDownloadingItemId] = useState<string | null>(null);

  const refreshDownloadedVideos = useCallback(() => {
    fetch('/__source-videos-list')
      .then((res) => (res.ok ? res.json() : { files: [] }))
      .then((data) => {
        if (Array.isArray(data.files)) {
          setDownloadedVideos(data.files);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    refreshDownloadedVideos();
  }, [refreshDownloadedVideos]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<ViralRankRenderer>(new ViralRankRenderer(project));
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const firedCuesRef = useRef<Set<string>>(new Set());
  const spokenVoiceRef = useRef<Set<string>>(new Set());
  const activeNarrationRef = useRef<{ stop: (fadeSeconds?: number) => void } | null>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  const totalDuration = useMemo(() => {
    return project.items.reduce((acc, it) => acc + (it.duration || 4.0), 0);
  }, [project.items]);

  const narrationVoice = normalizeNarrationVoice(project.narrationVoice);

  // Rough length of a spoken line, used to warn when a script is longer than
  // the clip it belongs to (two narrators at once are never wanted).
  const estimateSpokenSeconds = (text: string, rate = 1) => {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    if (!words) return 0;
    return (words * 0.42) / Math.max(0.5, rate);
  };

  // Keep renderer updated
  useEffect(() => {
    rendererRef.current.setProject(project);
  }, [project]);

  // Pass video elements
  useEffect(() => {
    rendererRef.current.setVideos(videoRefs.current);
  }, [project.items]);

  useEffect(() => {
    rendererRef.current.setPlayback(isPlaying);
  }, [isPlaying]);

  // Auto-clear status message after 4s
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  // Sync active video playback and audio mute/unmute
  useEffect(() => {
    const beat = rendererRef.current.getCurrentBeat(currentTime);
    if (!beat) return;

    project.items.forEach((item) => {
      const el = videoRefs.current.get(item.id);
      if (!el) return;

      const isCurrentItem = item.id === beat.item.id;
      if (isCurrentItem) {
        // Set volume & mute for this clip
        el.muted = isMuted || !!item.muted;
        el.volume = Math.max(0, Math.min(1, item.volume ?? 1.0));

        // Sync playback time within trim range
        const targetTime = (item.sourceStart || 0) + beat.clipLocalTime;
        if (Math.abs(el.currentTime - targetTime) > 0.3) {
          el.currentTime = targetTime;
        }

        if (isPlaying) {
          if (el.paused) el.play().catch(() => {});
        } else {
          if (!el.paused) el.pause();
        }
      } else {
        // Inactive clips: mute and pause
        el.muted = true;
        if (!el.paused) el.pause();
      }
    });
  }, [currentTime, isPlaying, isMuted, project.items]);

  // Main playback animation & audio engine integration
  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      viralAudio.stopMusic();
      viralAudio.stopSpeech();
      activeNarrationRef.current?.stop();
      activeNarrationRef.current = null;
      return;
    }

    // Start background music loop if enabled
    if (project.music.enabled && !isMuted) {
      viralAudio.playMusicBeat(project.music.genre, project.music.volume);
    }

    lastTimeRef.current = performance.now();

    const loop = (now: number) => {
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      setCurrentTime((prev) => {
        const next = prev + dt;
        if (next >= totalDuration) {
          setIsPlaying(false);
          firedCuesRef.current.clear();
          spokenVoiceRef.current.clear();
          viralAudio.stopMusic();
          return 0;
        }

        // Spoken Voice Intro Hook (Spoken right at start over video without visual intro delay)
        if (project.voiceIntro && !isMuted) {
          const introKey = 'voice-intro';
          if (next >= 0.05 && next <= 0.4 && !spokenVoiceRef.current.has(introKey)) {
            spokenVoiceRef.current.add(introKey);
            const introBuffer = getCachedNarration(project.voiceIntro, narrationVoice);
            activeNarrationRef.current?.stop();
            activeNarrationRef.current = introBuffer
              ? playNarrationClip({
                  time: 0,
                  buffer: introBuffer,
                  rate: project.voiceIntroSpeed ?? 1.05,
                })
              : null;
            if (!introBuffer) {
              viralAudio.speak(project.voiceIntro, {
                rate: project.voiceIntroSpeed ?? 1.05,
              });
            }
          }
        }

        // Trigger SFX & Voiceover when playhead passes their timestamps
        let clipOffset = 0;
        for (let i = 0; i < project.items.length; i++) {
          const item = project.items[i];
          const clipStart = clipOffset;
          const clipEnd = clipStart + item.duration;

          // Check if playhead is within clip
          if (next >= clipStart && next <= clipEnd) {
            // Check Narration
            if (item.narrationText && item.narrationEnabled !== false && !isMuted) {
              const voiceKey = `voice-${item.id}`;
              const triggerTime =
                i === 0 && project.voiceIntro ? clipStart + 2.0 : clipStart + 0.1;
              if (
                next >= triggerTime &&
                next <= triggerTime + 0.3 &&
                !spokenVoiceRef.current.has(voiceKey)
              ) {
                spokenVoiceRef.current.add(voiceKey);
                const clipBuffer = getCachedNarration(item.narrationText, narrationVoice);
                activeNarrationRef.current?.stop();
                activeNarrationRef.current = clipBuffer
                  ? playNarrationClip({
                      time: 0,
                      buffer: clipBuffer,
                      rate: item.narrationSpeed ?? 1.05,
                    })
                  : null;
                if (!clipBuffer) {
                  viralAudio.speak(item.narrationText, {
                    rate: item.narrationSpeed ?? 1.05,
                  });
                }
              }
            }

            // Check Sound Effects
            for (const sfx of item.soundEffects) {
              if (!sfx.enabled) continue;
              const absTime = clipStart + sfx.clipOffset;
              const cueKey = `sfx-${sfx.id}-${Math.floor(absTime * 10)}`;

              if (
                next >= absTime &&
                next <= absTime + 0.16 &&
                !firedCuesRef.current.has(cueKey)
              ) {
                firedCuesRef.current.add(cueKey);
                if (!isMuted) {
                  viralAudio.playEffect(sfx.effectType, {
                    gain: sfx.gain,
                    playbackRate: sfx.playbackRate,
                  });
                }
              }
            }
          }

          clipOffset += item.duration;
        }

        return next;
      });

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [isPlaying, isMuted, project, totalDuration]);

  // Redraw canvas whenever currentTime or project changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    rendererRef.current.render(ctx, currentTime, { showSafeZones });
  }, [currentTime, project, showSafeZones]);

  // Recalculate rank numbers automatically (starts from Top N down to Top 1 for countdown)
  const renumberItems = useCallback((items: RankingItem[], mode: OrderMode): RankingItem[] => {
    const count = items.length;
    return items.map((it, idx) => {
      const calculatedRank = mode === 'countdown' ? count - idx : idx + 1;
      return {
        ...it,
        rank: calculatedRank,
      };
    });
  }, []);

  // Update whole project patch
  const updateProject = useCallback((patch: Partial<ViralRankProject>) => {
    setProject((prev) => ({ ...prev, ...patch }));
  }, []);

  // Change ranking count (Top 3, Top 5, Top 6, Top 10)
  const handleSetRankingCount = useCallback(
    (targetCount: number) => {
      setProject((prev) => {
        let items = [...prev.items];
        if (items.length < targetCount) {
          // Add more items
          const stockSources = STOCK_SOURCES;
          while (items.length < targetCount) {
            const idx = items.length;
            const stock = stockSources[idx % stockSources.length];
            const newItem: RankingItem = {
              id: `clip-${Date.now()}-${idx}`,
              rank: 1, // will be renumbered
              title: stock ? stock.name : `Viral Moment #${idx + 1}`,
              description: 'Crazy viral stunt',
              sourceMediaId: stock ? stock.id : `stock-${idx}`,
              sourceUrl: stock ? stock.url : '',
              sourceStart: 0,
              sourceEnd: 5.0,
              duration: 3.5,
              speed: 1.0,
              volume: 1.0,
              muted: false,
              cropMode: 'fit',
              transition: 'none',
              narrationText: `And check out this fail at number ${idx + 1}!`,
              narrationEnabled: false,
              narrationSpeed: 1.05,
              soundEffects: [
                {
                  id: `sfx-${Date.now()}-1`,
                  clipId: `clip-${Date.now()}-${idx}`,
                  effectType: 'whoosh',
                  label: 'Reveal Whoosh',
                  timelineStart: 0.1,
                  clipOffset: 0.1,
                  duration: 0.35,
                  gain: 1.0,
                  fadeIn: 0,
                  fadeOut: 0.05,
                  playbackRate: 1.0,
                  enabled: true,
                },
                {
                  id: `sfx-${Date.now()}-2`,
                  clipId: `clip-${Date.now()}-${idx}`,
                  effectType: 'punch',
                  label: 'Trick Impact',
                  timelineStart: 2.2,
                  clipOffset: 2.2,
                  duration: 0.45,
                  gain: 1.3,
                  fadeIn: 0,
                  fadeOut: 0.1,
                  playbackRate: 1.0,
                  enabled: true,
                },
              ],
            };
            items.push(newItem);
          }
        } else if (items.length > targetCount) {
          items = items.slice(0, targetCount);
        }

        items = renumberItems(items, prev.orderMode);
        return {
          ...prev,
          rankingCount: targetCount,
          items,
        };
      });
      setStatusMessage(`Updated countdown to Top ${targetCount}`);
    },
    [renumberItems]
  );

  // Toggle order mode (Countdown #6->#1 vs Best-First #1->#6)
  const handleToggleOrderMode = useCallback(
    (mode: OrderMode) => {
      setProject((prev) => {
        const items = renumberItems(prev.items, mode);
        return {
          ...prev,
          orderMode: mode,
          items,
        };
      });
      setStatusMessage(
        mode === 'countdown'
          ? 'Countdown mode: Plays from Top 6 to Top 1 (large to small)'
          : 'Best-first mode: Plays from Top 1 to Top 6'
      );
    },
    [renumberItems]
  );

  // Update individual ranking item
  const updateItem = useCallback((id: string, patch: Partial<RankingItem>) => {
    setProject((prev) => ({
      ...prev,
      items: prev.items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    }));
  }, []);

  // Upload or select local video from PC (like Clone Reels)
  const addLocalFile = useCallback(
    async (itemId: string, file: File) => {
      setStatusMessage(`Checking ${file.name}...`);
      try {
        const response = await fetch('/__reel-upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/octet-stream',
            'x-file-name': encodeURIComponent(file.name),
          },
          body: file,
        });

        if (response.ok) {
          const body = await response.json();
          const duration = Number(body.durationSeconds ?? 0) || 4;
          updateItem(itemId, {
            sourceUrl: body.filepath,
            sourceMediaId: `local-${Date.now()}`,
            sourceStart: 0,
            sourceEnd: Math.min(duration, 10),
            duration: Math.max(1, Math.min(duration, 4.0)),
          });
          setExpandedTrimmerId(itemId);
          setStatusMessage(`Added ${body.filename} from PC!`);
          return;
        }
      } catch {}

      // Fallback: direct browser Object URL (works instantly in any environment)
      const objUrl = URL.createObjectURL(file);
      const tempVideo = document.createElement('video');
      tempVideo.src = objUrl;
      tempVideo.onloadedmetadata = () => {
        const dur = tempVideo.duration || 4.0;
        updateItem(itemId, {
          sourceUrl: objUrl,
          sourceMediaId: `local-${Date.now()}`,
          sourceStart: 0,
          sourceEnd: Math.min(dur, 10),
          duration: Math.max(1, Math.min(dur, 4.0)),
        });
        setExpandedTrimmerId(itemId);
        setStatusMessage(`Loaded ${file.name} (${dur.toFixed(1)}s) from PC!`);
      };
    },
    [updateItem]
  );

  // Download a clip for one rank from a link (YouTube, TikTok, direct MP4).
  // The dev server does the fetching because the browser cannot read those
  // sources, and the file it returns is served from public/source-videos.
  const handleDownloadRankClip = useCallback(
    async (item: RankingItem) => {
      const url = (item.sourceUrl ?? '').trim();
      if (!isRemoteVideoUrl(url)) {
        setStatusMessage('Paste a YouTube, TikTok or video link in the field first.');
        return;
      }

      setDownloadingItemId(item.id);
      setStatusMessage(`Downloading ${url}...`);

      try {
        const response = await fetch(`/__reel-download?url=${encodeURIComponent(url)}`);
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.error ?? `HTTP ${response.status}`);
        }
        const body = (await response.json()) as {
          filepath: string;
          filename: string;
          sizeBytes: number;
        };

        // The downloader does not probe the length, so the clip is measured
        // exactly the way a file picked from the PC is.
        updateItem(item.id, {
          sourceUrl: body.filepath,
          sourceMediaId: `download-${Date.now()}`,
          sourceStart: 0,
        });
        const probe = document.createElement('video');
        probe.preload = 'metadata';
        probe.onloadedmetadata = () => {
          const duration =
            Number.isFinite(probe.duration) && probe.duration > 0 ? probe.duration : 4;
          updateItem(item.id, {
            sourceEnd: Math.min(duration, 10),
            duration: Math.max(1, Math.min(duration, 4.0)),
          });
        };
        probe.src = body.filepath;

        refreshDownloadedVideos();
        setExpandedTrimmerId(item.id);
        setStatusMessage(
          `Downloaded ${body.filename} (${(body.sizeBytes / 1024 / 1024).toFixed(1)} MB) — ready to trim.`
        );
      } catch (error) {
        setStatusMessage(
          `Download failed: ${error instanceof Error ? error.message : 'unknown error'}`
        );
      } finally {
        setDownloadingItemId(null);
      }
    },
    [refreshDownloadedVideos, updateItem]
  );

  // Move clip up / down in ranking list
  const moveItem = useCallback(
    (index: number, direction: -1 | 1) => {
      setProject((prev) => {
        const target = index + direction;
        if (target < 0 || target >= prev.items.length) return prev;
        const items = [...prev.items];
        const [removed] = items.splice(index, 1);
        items.splice(target, 0, removed);
        const renumbered = renumberItems(items, prev.orderMode);
        return {
          ...prev,
          items: renumbered,
        };
      });
    },
    [renumberItems]
  );

  // Delete clip from ranking
  const deleteItem = useCallback(
    (id: string) => {
      setProject((prev) => {
        if (prev.items.length <= 1) return prev;
        const filtered = prev.items.filter((it) => it.id !== id);
        return {
          ...prev,
          items: renumberItems(filtered, prev.orderMode),
        };
      });
      setStatusMessage('Clip removed from ranking');
    },
    [renumberItems]
  );

  // Duplicate clip
  const duplicateItem = useCallback(
    (item: RankingItem) => {
      setProject((prev) => {
        const newItem: RankingItem = {
          ...item,
          id: `clip-${Date.now()}`,
          title: `${item.title} (Copy)`,
          soundEffects: item.soundEffects.map((s) => ({
            ...s,
            id: `sfx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          })),
        };
        const items = [...prev.items, newItem];
        return {
          ...prev,
          items: renumberItems(items, prev.orderMode),
        };
      });
      setStatusMessage('Clip duplicated');
    },
    [renumberItems]
  );

  // Add sound effect to clip
  const addSoundEffectToClip = useCallback((clipId: string, effectType: EffectType) => {
    const catalogItem = SFX_CATALOG.find((s) => s.type === effectType);
    const newSfx: AudioEffect = {
      id: `sfx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      clipId,
      effectType,
      label: catalogItem ? catalogItem.name : effectType.toUpperCase(),
      timelineStart: 0,
      clipOffset: 1.0,
      duration: catalogItem ? catalogItem.duration : 0.4,
      gain: 1.1,
      fadeIn: 0,
      fadeOut: 0.1,
      playbackRate: 1.0,
      enabled: true,
    };

    setProject((prev) => ({
      ...prev,
      items: prev.items.map((it) =>
        it.id === clipId ? { ...it, soundEffects: [...it.soundEffects, newSfx] } : it
      ),
    }));

    // Play a preview of the effect
    viralAudio.playEffect(effectType, { gain: 1.1 });
    setActiveItemDropdown(null);
    setStatusMessage(`Added ${newSfx.label} sound effect`);
  }, []);

  // Remove sound effect from clip
  const removeSoundEffect = useCallback((clipId: string, sfxId: string) => {
    setProject((prev) => ({
      ...prev,
      items: prev.items.map((it) =>
        it.id === clipId
          ? { ...it, soundEffects: it.soundEffects.filter((s) => s.id !== sfxId) }
          : it
      ),
    }));
  }, []);

  // 1-Click AI Auto-Suggest SFX for ALL clips
  const handleAutoSuggestAllSFX = useCallback(() => {
    const suggestions = generateAISuggestions(project.items);
    setProject((prev) => {
      const items = prev.items.map((it) => {
        const itemSuggestions = suggestions.filter((s) => s.clipId === it.id);
        const newEffects = itemSuggestions.map((s) => ({
          id: `sfx-ai-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          clipId: it.id,
          effectType: s.effectType,
          label: s.label,
          timelineStart: 0,
          clipOffset: Number(s.offsetSec.toFixed(2)),
          duration: 0.45,
          gain: s.volume,
          fadeIn: 0,
          fadeOut: 0.1,
          playbackRate: 1.0,
          enabled: true,
        }));
        return {
          ...it,
          soundEffects: newEffects,
        };
      });
      return { ...prev, items };
    });
    viralAudio.playEffect('success', { gain: 1.2 });
    setStatusMessage('✨ AI auto-suggested sound effects for all clips!');
  }, [project.items]);

  // Reset to default sample
  const handleResetSample = useCallback(() => {
    setProject(JSON.parse(JSON.stringify(DEFAULT_VIRALRANK_PROJECT)));
    setCurrentTime(0);
    setIsPlaying(false);
    viralAudio.stopMusic();
    viralAudio.stopSpeech();
    activeNarrationRef.current?.stop();
    activeNarrationRef.current = null;
    setStatusMessage('Reset to Ranking Best Pool Fails (Top 6 to Top 1)');
  }, []);

  // Scrubber control
  const handleScrub = (time: number) => {
    setCurrentTime(time);
    firedCuesRef.current.clear();
    spokenVoiceRef.current.clear();
    viralAudio.stopSpeech();
    activeNarrationRef.current?.stop();
    activeNarrationRef.current = null;
  };

  // Jump preview to clip
  const handleJumpToClip = useCallback(
    (clipId: string) => {
      let offset = 0;
      for (const it of project.items) {
        if (it.id === clipId) {
          handleScrub(offset + 0.05);
          return;
        }
        offset += it.duration;
      }
    },
    [project.items]
  );

  // Every spoken line, with the moment it starts and the speed it is read at.
  const exportNarration = useMemo(() => {
    let offset = 0;
    const list: { time: number; text: string; rate: number }[] = [];
    if (project.voiceIntro) {
      list.push({
        time: 0.05,
        text: project.voiceIntro,
        rate: project.voiceIntroSpeed ?? 1.05,
      });
    }
    for (let i = 0; i < project.items.length; i++) {
      const it = project.items[i];
      if (it.narrationText && it.narrationEnabled !== false) {
        const startTime =
          i === 0 && project.voiceIntro ? Math.max(offset + 0.1, 2.0) : offset + 0.1;
        list.push({
          time: startTime,
          text: it.narrationText,
          rate: it.narrationSpeed ?? 1.05,
        });
      }
      offset += it.duration;
    }
    return list;
  }, [
    project.items,
    project.voiceIntro,
    project.voiceIntroSpeed,
  ]);

  // Every script line is preloaded, including the ones that are switched off,
  // so flipping a clip's Voice switch on plays instantly instead of falling
  // back to the browser voice while the take downloads.
  const allNarrationLines = useMemo(() => {
    const list: { time: number; text: string; rate: number }[] = [];
    if (project.voiceIntro) {
      list.push({
        time: 0.05,
        text: project.voiceIntro,
        rate: project.voiceIntroSpeed ?? 1.05,
      });
    }
    for (const it of project.items) {
      if (it.narrationText.trim()) {
        list.push({ time: 0, text: it.narrationText, rate: it.narrationSpeed ?? 1.05 });
      }
    }
    return list;
  }, [project.items, project.voiceIntro, project.voiceIntroSpeed]);

  // Warm the narration cache while the editor is open, so the preview plays
  // instantly and the export does not have to fetch anything mid-recording.
  useEffect(() => {
    preloadNarration(allNarrationLines, narrationVoice);
  }, [allNarrationLines, narrationVoice]);

  // Decodes every line before the recorder starts; the export mixes the exact
  // takes that were just previewed.
  const prepareNarrationForExport = useCallback(
    () => prepareNarration(exportNarration, narrationVoice),
    [exportNarration, narrationVoice]
  );

  // Plays a line in the editor. Uses the same decoded take as the export;
  // falls back to the browser voice only when the speech endpoint is down.
  const previewNarrationLine = useCallback(
    async (text: string, rate: number) => {
      if (!text.trim()) return;
      const buffer = await getNarrationBuffer(text, narrationVoice);
      if (buffer) {
        viralAudio.stopSpeech();
        playNarrationClip({ time: 0, buffer, rate });
        return;
      }
      viralAudio.speak(text, { rate });
    },
    [narrationVoice]
  );

  const studioConfig: StudioConfig = {
    ...DEFAULT_CONFIG,
    activeProject: 'pop-star',
    showSafeZones,
  };

  const frames = Math.round(currentTime * 30);
  const totalFrames = Math.round(totalDuration * 30);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-950 text-slate-100">
      {/* Hidden video elements to decode local/stock clips for the canvas */}
      <div className="hidden">
        {project.items.map((it) => {
          if (!it.sourceUrl) return null;
          return (
            <video
              key={it.id}
              ref={(el) => {
                if (el) videoRefs.current.set(it.id, el);
                else videoRefs.current.delete(it.id);
              }}
              src={it.sourceUrl}
              crossOrigin="anonymous"
              playsInline
              muted={isMuted || !!it.muted}
              loop
            />
          );
        })}
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_430px] gap-6 p-6 overflow-y-auto">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Clean Card-Based Editor (Matching Section Clone UX)           */}
        {/* ========================================================================= */}
        <div className="space-y-6 min-w-0">
          {/* Card 1: Reel Master Settings, Audio Mix & AI Actions */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center text-white font-black text-xs shadow-md shadow-rose-950">
                  VR
                </div>
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">ViralRank Studio</h2>
                  <p className="text-xs text-slate-400">
                    Ranking countdown reels from Top {project.items.length} to Top 1 with individual SFX and video trimmer.
                  </p>
                </div>
              </div>

              {/* Quick AI & Reset actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAutoSuggestAllSFX}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-rose-400 hover:from-amber-300 hover:to-rose-300 rounded-lg shadow transition cursor-pointer"
                  title="Generate whooshes, impacts and cheers based on clip titles"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Auto-Suggest SFX</span>
                </button>
                <button
                  onClick={handleResetSample}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Sample</span>
                </button>
              </div>
            </div>

            {statusMessage && (
              <div className="text-xs text-emerald-300 bg-emerald-950/50 border border-emerald-800/80 rounded-lg px-3 py-2 flex items-center gap-2 animate-in fade-in">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}

            {/* Two-Tone Top Headline Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 border-t border-slate-800/70">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Title Prefix (White)
                </label>
                <input
                  type="text"
                  value={project.titlePrefix ?? 'Ranking Best'}
                  onChange={(e) => {
                    const prefix = e.target.value;
                    const accent = project.titleAccent || 'Pool Fails';
                    updateProject({
                      titlePrefix: prefix,
                      title: `${prefix} ${accent}`.trim(),
                    });
                  }}
                  placeholder="e.g. Ranking Best"
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-rose-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
                  <span>Accent Topic (Color)</span>
                  <div className="flex items-center gap-1.5">
                    {[
                      { hex: '#ef4444', label: 'Red' },
                      { hex: '#f59e0b', label: 'Gold' },
                      { hex: '#06b6d4', label: 'Cyan' },
                      { hex: '#10b981', label: 'Green' },
                    ].map((col) => (
                      <button
                        key={col.hex}
                        onClick={() => updateProject({ accentColor: col.hex })}
                        title={col.label}
                        className={`w-3.5 h-3.5 rounded-full transition cursor-pointer border ${
                          (project.accentColor || '#ef4444') === col.hex
                            ? 'border-white scale-125 ring-2 ring-white/30'
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: col.hex }}
                      />
                    ))}
                  </div>
                </label>
                <input
                  type="text"
                  value={project.titleAccent ?? 'Pool Fails'}
                  onChange={(e) => {
                    const accent = e.target.value;
                    const prefix = project.titlePrefix || 'Ranking Best';
                    updateProject({
                      titleAccent: accent,
                      title: `${prefix} ${accent}`.trim(),
                    });
                  }}
                  placeholder="e.g. Pool Fails"
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-lg font-bold focus:outline-none focus:border-rose-500"
                  style={{ color: project.accentColor || '#ef4444' }}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Ranking Length & Order
                </label>
                <div className="flex items-center gap-1 flex-wrap">
                  {[3, 5, 6, 10].map((count) => (
                    <button
                      key={count}
                      onClick={() => handleSetRankingCount(count)}
                      className={`px-2.5 py-2 text-xs font-bold rounded-lg border transition cursor-pointer ${
                        project.items.length === count
                          ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                          : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
                      }`}
                    >
                      Top {count}
                    </button>
                  ))}

                  <button
                    onClick={() =>
                      handleToggleOrderMode(
                        project.orderMode === 'countdown' ? 'best-first' : 'countdown'
                      )
                    }
                    className="ml-auto px-2 py-2 text-xs font-bold rounded-lg bg-slate-950 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 transition cursor-pointer flex items-center gap-1"
                    title="Toggle countdown order"
                  >
                    <span>{project.orderMode === 'countdown' ? '▼ #6→#1' : '▲ #1→#6'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Voice Intro Hook (Spoken at 0s over video without visual intro delay) */}
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-rose-400" />
                  <span>Voice Intro Hook (Spoken at 0s over video)</span>
                </label>
                <button
                  onClick={() =>
                    void previewNarrationLine(
                      project.voiceIntro || 'Top 6 Ranking best pool fails',
                      project.voiceIntroSpeed ?? 1.05
                    )
                  }
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer flex items-center gap-1"
                >
                  <span>🔊 Test voice intro</span>
                </button>
              </div>
              <input
                type="text"
                value={project.voiceIntro ?? 'Top 6 Ranking best pool fails'}
                onChange={(e) => updateProject({ voiceIntro: e.target.value })}
                placeholder="e.g. Top 6 Ranking best pool fails"
                className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-rose-500 font-medium"
              />
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs text-slate-300 shrink-0">
                  <span>Speed</span>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.05"
                    value={project.voiceIntroSpeed ?? 1.05}
                    onChange={(e) => updateProject({ voiceIntroSpeed: Number(e.target.value) })}
                    className="w-24 accent-rose-500 h-1.5 cursor-pointer"
                  />
                  <span className="text-[11px] font-mono text-rose-300 w-7 text-right">
                    {(project.voiceIntroSpeed ?? 1.05).toFixed(2)}x
                  </span>
                </label>
              </div>
              <p className="text-[10px] text-slate-500">
                Spoken immediately at the start of the video — no visual intro delay, matching viral TikTok reels.
              </p>

              {/* Narrator voice */}
              <div className="pt-2 border-t border-slate-800/60 space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Narrator Voice
                </label>
                <select
                  value={narrationVoice}
                  onChange={(e) =>
                    updateProject({ narrationVoice: e.target.value as NarrationVoice })
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-rose-500"
                >
                  {NARRATION_VOICES.map((voice) => (
                    <option key={voice.id} value={voice.id}>
                      {voice.label}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  Used for the intro hook and every clip. Each line is spoken once and decoded, so
                  the downloaded video sounds exactly like the preview.
                </p>
              </div>
            </div>

            {/* Background Music & Caption Preset Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/70">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-rose-400" />
                  <span>Background Music</span>
                </label>
                <div className="space-y-2">
                  <select
                    value={project.music.enabled ? project.music.genre : 'off'}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'off') {
                        updateProject({
                          music: { ...project.music, enabled: false },
                        });
                        viralAudio.stopMusic();
                      } else {
                        updateProject({
                          music: {
                            ...project.music,
                            enabled: true,
                            genre: val as any,
                          },
                        });
                        if (isPlaying && !isMuted) {
                          viralAudio.playMusicBeat(val as any, project.music.volume);
                        }
                      }
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="off">None (No BGM track)</option>
                    <option value="comedy">Upbeat Slapstick Bounce</option>
                    <option value="energetic">High-Octane Countdown Beat</option>
                    <option value="action">808 Action Drill Trap</option>
                    <option value="suspense">Dark Tension Pulse</option>
                    <option value="cinematic">Epic Orchestral Theme</option>
                  </select>

                  {project.music.enabled && (
                    <div className="flex items-center gap-3 bg-slate-950/70 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
                      <span className="text-slate-400 text-[11px]">Vol</span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={project.music.volume}
                        onChange={(e) =>
                          updateProject({
                            music: { ...project.music, volume: Number(e.target.value) },
                          })
                        }
                        className="flex-1 accent-rose-500 h-1.5 cursor-pointer"
                      />
                      <span className="text-[11px] font-mono text-slate-300 w-8 text-right">
                        {Math.round(project.music.volume * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-rose-400" />
                  <span>Subtitle Caption Preset</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      { id: 'mrbeast', label: '🔥 MrBeast Pop' },
                      { id: 'tiktok-karaoke', label: '🎵 TikTok Karaoke' },
                      { id: 'neon', label: '✨ Neon Glow' },
                      { id: 'badge', label: '🏷️ Crimson Badge' },
                    ] as const
                  ).map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() =>
                        updateProject({
                          captionStyle: CAPTION_PRESETS[preset.id],
                        })
                      }
                      className={`px-2.5 py-2 text-xs font-bold rounded-lg border text-left transition cursor-pointer truncate ${
                        project.captionStyle.preset === preset.id
                          ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                          : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Ranking Items List & Per-Clip Video / Audio Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-rose-400" />
                  <span>Ranking Clips ({project.items.length})</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Preview ladder is sorted 1 to {project.items.length} (small to large). Playback counts down from #{project.items[0]?.rank} down to #{project.items[project.items.length - 1]?.rank} (large to small).
                </p>
              </div>

              <button
                onClick={() => handleSetRankingCount(project.items.length + 1)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-rose-400" />
                <span>Add Rank</span>
              </button>
            </div>

            {/* List of ranking cards */}
            <div className="space-y-4">
              {project.items.map((item, index) => {
                const isDropdownOpen = activeItemDropdown === item.id;
                const isTrimmerOpen = expandedTrimmerId === item.id;
                const voiceOn = item.narrationEnabled !== false;

                return (
                  <div
                    key={item.id}
                    className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3.5 transition hover:border-slate-700"
                  >
                    {/* Item Card Header */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        {/* Rank Badge */}
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm shrink-0 shadow-md ${
                            item.rank === 1
                              ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300/60'
                              : item.rank === 6
                              ? 'bg-rose-600 text-white'
                              : 'bg-rose-500 text-white'
                          }`}
                        >
                          #{item.rank}
                        </div>

                        {/* Title Input */}
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => updateItem(item.id, { title: e.target.value })}
                          className="flex-1 px-3 py-1.5 text-sm font-bold bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-rose-500 truncate"
                          placeholder="Clip Title / Reaction"
                        />

                        {/* Play Order Badge */}
                        <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-800 shrink-0">
                          Plays #{index + 1}
                        </span>
                      </div>

                      {/* Video Audio Mute & Volume Quick Control */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => updateItem(item.id, { muted: !item.muted })}
                          title={item.muted ? 'Unmute original video audio' : 'Mute original video audio'}
                          className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg border transition cursor-pointer ${
                            item.muted
                              ? 'bg-rose-950/50 border-rose-800 text-rose-300'
                              : 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
                          }`}
                        >
                          {item.muted ? (
                            <>
                              <VolumeX className="w-3.5 h-3.5" />
                              <span>Muted</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>Audio ON</span>
                            </>
                          )}
                        </button>

                        {!item.muted && (
                          <div className="hidden sm:flex items-center gap-1 bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg text-[11px]">
                            <span className="text-slate-400">Vol</span>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.05"
                              value={item.volume ?? 1.0}
                              onChange={(e) =>
                                updateItem(item.id, { volume: Number(e.target.value) })
                              }
                              className="w-14 accent-emerald-500 h-1 cursor-pointer"
                            />
                            <span className="text-slate-300 font-mono w-7 text-right">
                              {Math.round((item.volume ?? 1.0) * 100)}%
                            </span>
                          </div>
                        )}

                        {/* Reorder and Card Actions */}
                        <button
                          onClick={() => moveItem(index, -1)}
                          disabled={index === 0}
                          title="Move up"
                          className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded-md hover:bg-slate-800 transition cursor-pointer"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => moveItem(index, 1)}
                          disabled={index === project.items.length - 1}
                          title="Move down"
                          className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded-md hover:bg-slate-800 transition cursor-pointer"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => duplicateItem(item)}
                          title="Duplicate rank"
                          className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          disabled={project.items.length <= 1}
                          title="Remove clip"
                          className="p-1.5 text-slate-400 hover:text-rose-400 disabled:opacity-30 rounded-md hover:bg-slate-800 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Video Source: Upload from PC / Stock Selector & Trimmer Controls */}
                    <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg space-y-2.5">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Video className="w-4 h-4 text-slate-400 shrink-0" />
                          <input
                            type="text"
                            value={item.sourceUrl || ''}
                            onChange={(e) => updateItem(item.id, { sourceUrl: e.target.value })}
                            placeholder="Video URL or pick file from PC..."
                            className="flex-1 px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-rose-500 font-mono truncate"
                          />
                        </div>

                        {/* Choose Video from PC button (Like Clone Reels) */}
                        <div className="flex items-center gap-2 shrink-0">
                          <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition cursor-pointer whitespace-nowrap shadow-sm">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Choose video from PC</span>
                            <input
                              type="file"
                              accept="video/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  void addLocalFile(item.id, file);
                                  e.target.value = '';
                                }
                              }}
                            />
                          </label>

                          {/* Download the link in the field into public/source-videos */}
                          <button
                            onClick={() => void handleDownloadRankClip(item)}
                            disabled={
                              !isRemoteVideoUrl(item.sourceUrl) || downloadingItemId !== null
                            }
                            title="Download this link into public/source-videos"
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-slate-200 bg-slate-800 border border-slate-700 hover:border-rose-500 hover:text-white rounded-lg transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                          >
                            <Download
                              className={`w-3.5 h-3.5 ${
                                downloadingItemId === item.id ? 'animate-bounce' : ''
                              }`}
                            />
                            <span>
                              {downloadingItemId === item.id ? 'Downloading...' : 'Download'}
                            </span>
                          </button>

                          {item.sourceUrl && (
                            <button
                              onClick={() =>
                                setExpandedTrimmerId(isTrimmerOpen ? null : item.id)
                              }
                              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition cursor-pointer ${
                                isTrimmerOpen
                                  ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                              }`}
                            >
                              <Scissors className="w-3.5 h-3.5" />
                              <span>{isTrimmerOpen ? 'Close Trimmer' : 'Trim Video'}</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Video Trim Timing Inputs (Like Clone Reels) */}
                      <div className="grid grid-cols-3 gap-3 pt-1 border-t border-slate-800/60 text-xs">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                            Trim Start (s)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.1"
                            value={item.sourceStart ?? 0}
                            onChange={(e) =>
                              updateItem(item.id, { sourceStart: Math.max(0, Number(e.target.value)) })
                            }
                            className="w-full px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-md font-mono text-white text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                            Trim End (s)
                          </label>
                          <input
                            type="number"
                            min="0.1"
                            step="0.1"
                            value={item.sourceEnd ?? 10}
                            onChange={(e) =>
                              updateItem(item.id, { sourceEnd: Math.max(0.1, Number(e.target.value)) })
                            }
                            className="w-full px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-md font-mono text-white text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-rose-400 mb-1">
                            Clip Length on screen (s)
                          </label>
                          <input
                            type="number"
                            min="0.5"
                            max="30"
                            step="0.1"
                            value={item.duration ?? 4.0}
                            onChange={(e) =>
                              updateItem(item.id, { duration: Math.max(0.5, Number(e.target.value)) })
                            }
                            className="w-full px-2.5 py-1 bg-slate-950 border border-rose-500/60 rounded-md font-mono text-white text-xs font-bold"
                          />
                        </div>
                      </div>

                      {/* Interactive Visual Clip Trimmer (from ClipEditor) */}
                      {isTrimmerOpen && item.sourceUrl && (
                        <div className="pt-2 border-t border-slate-800 animate-in fade-in">
                          <ClipEditor
                            item={item as any}
                            clip={{
                              url: item.sourceUrl,
                              start: item.sourceStart ?? 0,
                              end: item.sourceEnd ?? 10,
                              length: item.duration ?? 4.0,
                              title: item.title,
                            }}
                            onChange={(updatedClip) => {
                              updateItem(item.id, {
                                sourceUrl: updatedClip.url,
                                sourceStart: updatedClip.start,
                                sourceEnd: updatedClip.end,
                                duration: updatedClip.length,
                              });
                            }}
                            onPlayInReel={() => handleJumpToClip(item.id)}
                          />
                        </div>
                      )}
                    </div>

                    {/* Spoken Narration Script */}
                    <div
                      className={`space-y-1 rounded-lg border p-2.5 transition ${
                        voiceOn
                          ? 'border-slate-800 bg-slate-900/40'
                          : 'border-slate-800/60 bg-slate-900/20'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400">
                        <span className="flex min-w-0 items-center gap-1.5">
                          <Mic
                            className={`h-3.5 w-3.5 shrink-0 ${
                              voiceOn ? 'text-rose-400' : 'text-slate-500'
                            }`}
                          />
                          <span className="truncate">Voiceover for Rank #{item.rank}</span>
                        </span>
                        <button
                          onClick={() => updateItem(item.id, { narrationEnabled: !voiceOn })}
                          role="switch"
                          aria-checked={voiceOn}
                          title={
                            voiceOn
                              ? "Turn this clip's voiceover off"
                              : "Turn this clip's voiceover on"
                          }
                          className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-wide transition ${
                            voiceOn
                              ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-300'
                              : 'border-slate-700 bg-slate-950 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <span
                            className={`relative inline-flex h-3.5 w-6 rounded-full transition ${
                              voiceOn ? 'bg-emerald-500' : 'bg-slate-600'
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 h-2.5 w-2.5 rounded-full bg-white transition-all ${
                                voiceOn ? 'left-3' : 'left-0.5'
                              }`}
                            />
                          </span>
                          <span>{voiceOn ? 'Voice ON' : 'Voice OFF'}</span>
                        </button>
                      </div>

                      <input
                        type="text"
                        value={item.narrationText}
                        onChange={(e) => updateItem(item.id, { narrationText: e.target.value })}
                        placeholder="Narration read by AI when this rank appears..."
                        className={`w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:border-rose-500 focus:outline-none ${
                          voiceOn ? '' : 'opacity-60'
                        }`}
                      />

                      <div className="flex items-center justify-between gap-2">
                        {voiceOn ? (
                          (() => {
                            const seconds = estimateSpokenSeconds(
                              item.narrationText,
                              item.narrationSpeed ?? 1.05
                            );
                            if (!seconds) return <span />;
                            const over = seconds > item.duration - 0.2;
                            return (
                              <p
                                className={`text-[10px] ${
                                  over ? 'text-amber-400' : 'text-slate-500'
                                }`}
                              >
                                ≈ {seconds.toFixed(1)}s spoken · clip is{' '}
                                {item.duration.toFixed(1)}s
                                {over ? ' — it will run into the next clip' : ''}
                              </p>
                            );
                          })()
                        ) : (
                          <p className="text-[10px] text-slate-500">
                            Off — this line is skipped in the preview and the downloaded video.
                          </p>
                        )}
                        <button
                          onClick={() =>
                            void previewNarrationLine(
                              item.narrationText,
                              item.narrationSpeed ?? 1.05
                            )
                          }
                          className="shrink-0 cursor-pointer font-semibold text-rose-400 hover:text-rose-300"
                        >
                          🔊 Test
                        </button>
                      </div>
                    </div>

                    {/* Individual Sound Effects Bar */}
                    <div className="pt-2 border-t border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5 text-amber-400" />
                          <span>Sound Effects ({item.soundEffects.length})</span>
                        </span>

                        {/* Add SFX Dropdown */}
                        <div className="relative">
                          <button
                            onClick={() =>
                              setActiveItemDropdown(isDropdownOpen ? null : item.id)
                            }
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-amber-300 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-800/80 rounded-lg transition cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add SFX</span>
                          </button>

                          {isDropdownOpen && (
                            <div className="absolute right-0 top-8 z-30 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 space-y-1 max-h-64 overflow-y-auto animate-in fade-in zoom-in-95">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                                Choose Sound Effect
                              </p>
                              {SFX_CATALOG.map((s) => (
                                <button
                                  key={s.type}
                                  onClick={() => addSoundEffectToClip(item.id, s.type)}
                                  className="w-full text-left px-2.5 py-1.5 text-xs rounded-lg text-slate-200 hover:bg-slate-800 hover:text-white flex items-center justify-between transition cursor-pointer"
                                >
                                  <span className="font-medium">{s.name}</span>
                                  <span className="text-[10px] font-mono text-slate-400">
                                    {s.duration}s
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Active SFX Badges List */}
                      {item.soundEffects.length === 0 ? (
                        <p className="text-[11px] text-slate-500 italic">
                          No sound effects on this clip. Click &quot;Add SFX&quot; or &quot;Auto-Suggest SFX&quot; above.
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {item.soundEffects.map((sfx) => (
                            <div
                              key={sfx.id}
                              className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 flex items-center gap-2 text-xs text-slate-200"
                            >
                              <span className="font-bold text-amber-300">
                                {sfx.label || sfx.effectType}
                              </span>

                              {/* Time Offset Editor */}
                              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                                <span>at</span>
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  max={item.duration}
                                  value={sfx.clipOffset}
                                  onChange={(e) => {
                                    const val = Math.max(0, Number(e.target.value));
                                    updateItem(item.id, {
                                      soundEffects: item.soundEffects.map((s) =>
                                        s.id === sfx.id ? { ...s, clipOffset: val } : s
                                      ),
                                    });
                                  }}
                                  className="w-10 bg-slate-950 px-1 py-0.5 rounded border border-slate-800 text-center font-mono text-white text-[11px]"
                                />
                                <span>s</span>
                              </div>

                              {/* Preview Sound */}
                              <button
                                onClick={() =>
                                  viralAudio.playEffect(sfx.effectType, {
                                    gain: sfx.gain,
                                    playbackRate: sfx.playbackRate,
                                  })
                                }
                                title="Preview this sound effect"
                                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition cursor-pointer"
                              >
                                <Play className="w-3 h-3 fill-current" />
                              </button>

                              {/* Remove SFX */}
                              <button
                                onClick={() => removeSoundEffect(item.id, sfx.id)}
                                title="Remove effect"
                                className="p-1 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800 transition cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Sticky 9:16 Preview Player & Export (Matching Clone UX)    */}
        {/* ========================================================================= */}
        <div className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
            {/* Preview Header & Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Reel Preview</h3>
                <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  9:16
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSafeZones((prev) => !prev)}
                  title="Toggle TikTok / Shorts 9:16 safe areas"
                  className={`px-2 py-1 text-[11px] font-bold rounded-lg border transition cursor-pointer ${
                    showSafeZones
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  Safe zones
                </button>

                <button
                  onClick={() => {
                    const next = !isMuted;
                    setIsMuted(next);
                    viralAudio.setMuted(next);
                    if (next) viralAudio.stopMusic();
                    else if (isPlaying && project.music.enabled) {
                      viralAudio.playMusicBeat(project.music.genre, project.music.volume);
                    }
                  }}
                  title={isMuted ? 'Unmute all audio' : 'Mute all audio'}
                  className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition cursor-pointer"
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 text-rose-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                  )}
                </button>
              </div>
            </div>

            {/* 9:16 Vertical Video Canvas Frame */}
            <div className="relative aspect-[9/16] w-full max-h-[540px] mx-auto bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={1080}
                height={1920}
                className="w-full h-full object-contain"
              />

              {/* Big Play Overlay button when paused */}
              {!isPlaying && (
                <button
                  onClick={() => setIsPlaying(true)}
                  className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-rose-500/90 hover:bg-rose-500 text-white flex items-center justify-center shadow-2xl transition hover:scale-105 cursor-pointer backdrop-blur-sm"
                  title="Play"
                >
                  <Play className="w-7 h-7 fill-white translate-x-0.5" />
                </button>
              )}
            </div>

            {/* Transport & Scrub Bar */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="text-white font-bold">
                  {currentTime.toFixed(1)}s / {totalDuration.toFixed(1)}s
                </span>
                <span>
                  Frame {frames} / {totalFrames}
                </span>
              </div>

              {/* Scrubber slider */}
              <input
                type="range"
                min="0"
                max={totalDuration}
                step="0.05"
                value={currentTime}
                onChange={(e) => handleScrub(Number(e.target.value))}
                className="w-full accent-rose-500 h-1.5 cursor-pointer bg-slate-800 rounded-lg"
              />

              {/* Transport Buttons */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaying((p) => !p)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-rose-500 hover:bg-rose-400 rounded-lg shadow transition cursor-pointer"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Play</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleScrub(0)}
                    title="Rewind to start"
                    className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <span className="text-[11px] text-slate-400 font-medium">
                  #{project.items[0]?.rank} → #{project.items[project.items.length - 1]?.rank} ({project.orderMode})
                </span>
              </div>
            </div>

            {/* Big Prominent Export Reel Button */}
            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsExportOpen(true)}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-amber-400 via-rose-400 to-rose-500 hover:from-amber-300 hover:to-rose-400 shadow-lg shadow-rose-950/50 flex items-center justify-center gap-2 transition hover:scale-[1.01] cursor-pointer"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Export 9:16 Video (Reel / Shorts)</span>
              </button>
              <p className="text-[11px] text-slate-500 text-center mt-1.5">
                Renders 1080×1920 vertical video with synced video audio, SFX & voice.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal with full custom renderer, duration, and audio */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        config={studioConfig}
        renderer={rendererRef.current}
        duration={totalDuration}
        prepareNarration={prepareNarrationForExport}
        filePrefix={`viralrank-top${project.items.length}`}
        title={`Export ${project.title}`}
      />
    </div>
  );
};
