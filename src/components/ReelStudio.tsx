import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Play,
  Pause,
  Download,
  Grid,
  Trophy,
  Sparkles,
  RotateCcw,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  Link2,
} from 'lucide-react';
import { RankingReelRenderer } from '../animation/rankingReelRenderer';
import { ExportModal } from './ExportModal';
import { ClipEditor } from './ClipEditor';
import { isLocalFile } from '../reels/videoSources';
import { CATEGORY_BLURBS, CATEGORY_LABELS, CLIP_CATEGORIES } from '../reels/categoryStyles';
import type { RankingCategory } from '../reels/categoryStyles';
import { DEFAULT_CONFIG, StudioConfig } from '../types';
import { speakVoiceOver, stopVoiceOver, soundEngine } from '../audio/soundEngine';
import {
  getCachedNarration,
  playNarrationClip,
  preloadNarration,
  prepareNarration,
} from '../viralrank/narration';
import {
  CHARACTER_ART,
  DEFAULT_RANKING_DATA,
  RANKING_CATEGORIES,
  RankingItem,
  RankingVideoClip,
  RankingVideoData,
  cloneRankingData,
  getRankingDuration,
  getRankingNarration,
  getReelBeats,
  normalizeRankingData,
} from '../reels/rankingData';
import { blueprintToRankingData, loadBlueprint } from '../reels/blueprint';

const REEL_FPS = 30;

export const ReelStudio: React.FC = () => {
  const [data, setData] = useState<RankingVideoData>(() =>
    cloneRankingData(DEFAULT_RANKING_DATA)
  );
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [referenceUrl, setReferenceUrl] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  /** The spoken narration can be switched off for the preview and the export. */
  const [isNarrationOn, setIsNarrationOn] = useState<boolean>(true);
  /** The 9:16 mobile safe bounds, the same guides the 2D studio shows. */
  const [showSafeZones, setShowSafeZones] = useState<boolean>(false);
  /** Progress of a local file that is being checked, shown next to the picker. */
  const [fileNote, setFileNote] = useState<{
    itemId: string;
    message: string;
    tone: 'info' | 'error';
  } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<RankingReelRenderer>(new RankingReelRenderer(data));
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number>(0);
  const spokenRef = useRef<Set<string>>(new Set());
  const activeNarrationRef = useRef<{ stop: (fadeSeconds?: number) => void } | null>(null);
  const configRef = useRef<StudioConfig>({
    ...DEFAULT_CONFIG,
    activeProject: 'pop-star',
    // The reel burns its captions in, and they follow the spoken narration.
    showCaptions: true,
  });
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  const duration = useMemo(() => getRankingDuration(data), [data]);
  const narration = useMemo(() => getRankingNarration(data), [data]);
  const mergedClips = useMemo(
    () => data.items.filter((item) => item.video?.url).length,
    [data.items]
  );
  const mergedSeconds = useMemo(
    () =>
      data.items.reduce(
        (total, item) => total + (item.video?.length ?? data.secondsPerItem),
        0
      ),
    [data.items, data.secondsPerItem]
  );

  useEffect(() => {
    rendererRef.current.setData(data);
  }, [data]);

  // Hand the clip elements to the renderer so it can draw and sync them.
  useEffect(() => {
    rendererRef.current.setVideos(videoRefs.current);
  }, [data.items.map((item) => item.id).join('|')]);

  // The clips follow the transport.
  useEffect(() => {
    rendererRef.current.setPlayback(isPlaying);
  }, [isPlaying]);

  useEffect(() => {
    if (currentTime > duration) setCurrentTime(0);
  }, [duration, currentTime]);

  // The preview transport.
  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }

    spokenRef.current = new Set();
    lastFrameRef.current = performance.now();

    const tick = (now: number) => {
      const delta = (now - lastFrameRef.current) / 1000;
      lastFrameRef.current = now;

      setCurrentTime((prev) => {
        const next = prev + delta;
        if (next >= duration) {
          setIsPlaying(false);
          return duration;
        }
        return next;
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [isPlaying, duration]);

  // The safe-area guides follow the toggle, the same way the 2D studio does.
  // The burned-in caption follows the spoken narration: no voice, no caption.
  useEffect(() => {
    configRef.current = {
      ...configRef.current,
      showSafeZones,
      showCaptions: isNarrationOn,
    };
  }, [showSafeZones, isNarrationOn]);

  // Draw the current frame.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    rendererRef.current.render(ctx, currentTime, configRef.current);
  }, [currentTime, data, showSafeZones, isNarrationOn]);

  // Speak the narration lines as the playhead crosses them.
  useEffect(() => {
    if (!isPlaying || isMuted || !isNarrationOn) return;
    narration.forEach((line) => {
      const key = `${line.time}`;
      if (currentTime >= line.time && !spokenRef.current.has(key)) {
        spokenRef.current.add(key);
        const buffer = getCachedNarration(line.text, 'us');
        activeNarrationRef.current?.stop();
        activeNarrationRef.current = buffer
          ? playNarrationClip({ time: line.time, buffer, rate: 1.02 })
          : null;
        if (!buffer) {
          speakVoiceOver(line.text, { rate: 1.02, pitch: 1, volume: 1 });
        }
      }
    });
  }, [currentTime, isPlaying, isMuted, isNarrationOn, narration]);

  // Prepare the narration takes while the reel is open: the export mixes the
  // same real speech the preview plays, never a synthetic vowel drone.
  useEffect(() => {
    if (!isNarrationOn) return;
    preloadNarration(narration, 'us');
  }, [narration, isNarrationOn]);

  const prepareReelNarration = useCallback(
    () =>
      isNarrationOn
        ? prepareNarration(narration, 'us')
        : Promise.resolve([]),
    [narration, isNarrationOn]
  );

  // Switching the spoken narration off stops whatever is being read.
  useEffect(() => {
    if (!isNarrationOn) {
      stopVoiceOver();
      activeNarrationRef.current?.stop();
      activeNarrationRef.current = null;
      spokenRef.current = new Set();
    }
  }, [isNarrationOn]);

  const togglePlay = useCallback(() => {
    stopVoiceOver();
    activeNarrationRef.current?.stop();
    activeNarrationRef.current = null;
    setIsPlaying((p) => !p);
  }, []);

  const handleToggleMute = useCallback(() => {
    setIsMuted((m) => {
      const next = !m;
      soundEngine.setMuted(next);
      if (next) {
        stopVoiceOver();
        activeNarrationRef.current?.stop();
        activeNarrationRef.current = null;
      }
      return next;
    });
  }, []);

  const update = useCallback((patch: Partial<RankingVideoData>) => {
    setData((prev) => normalizeRankingData({ ...prev, ...patch }));
  }, []);

  const updateItem = useCallback((id: string, patch: Partial<RankingItem>) => {
    setData((prev) =>
      normalizeRankingData({
        ...prev,
        items: prev.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
      })
    );
  }, []);

  /** Saves a file to the browser's downloads folder, like the export does. */
  const saveToDownloads = useCallback((href: string, filename: string) => {
    try {
      const anchor = document.createElement('a');
      anchor.href = href;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    } catch {
      // The clip is still in the editor even when the download is blocked.
    }
  }, []);

  /**
   * Sends a local file to the dev server, which checks it is a real video and
   * re-encodes it when the browser cannot decode the codec. The clip then
   * lives in public/source-videos, so it previews and exports normally.
   */
  const addLocalFile = useCallback(async (itemId: string, file: File) => {
    setBusy(true);
    const size = (file.size / 1024 / 1024).toFixed(1);
    setStatus(`Checking ${file.name}...`);
    setFileNote({
      itemId,
      message: `Uploading ${file.name} (${size} MB) and checking it. A long clip can take a minute while it is re-encoded.`,
      tone: 'info',
    });

    try {
      // Look at the first bytes before sending anything: a web page saved
      // with an .mp4 name starts with markup and can never play, so there is
      // no point in uploading it.
      const head = new TextDecoder('utf-8', { fatal: false })
        .decode(new Uint8Array(await file.slice(0, 512).arrayBuffer()))
        .trimStart()
        .toLowerCase();

      if (head.startsWith('<!doctype html') || head.startsWith('<html') || head.startsWith('<?xml')) {
        const kb = Math.round(file.size / 1024);
        const message = `That file is not a video - it is a saved web page (${kb} KB), so it can never play. Press Download video again to save a fresh copy of the clip, or pick the file from the studio's public/source-videos folder.`;
        setStatus(message);
        setFileNote({ itemId, message, tone: 'error' });
        return;
      }

      const response = await fetch('/__reel-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'x-file-name': encodeURIComponent(file.name),
        },
        body: file,
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        const kb = body.sizeBytes ? ` (${Math.round(body.sizeBytes / 1024)} KB)` : '';
        const message = `${body.error ?? 'That file could not be used.'}${kb} Pick the video file itself - a page saved with an .mp4 name, or a download that never finished, will not play.`;
        setStatus(message);
        setFileNote({ itemId, message, tone: 'error' });
        return;
      }

      const done = `Added ${body.filename}${body.transcoded ? ` (re-encoded from ${body.sourceCodec})` : ''} into the rank.`;
      setStatus(done);
      setFileNote({ itemId, message: done, tone: 'info' });
      saveToDownloads(body.filepath, body.filename);

      setData((prev) => {
        const duration = Number(body.durationSeconds ?? 0) || 4;
        const items = prev.items.map((item) =>
          item.id === itemId
            ? {
                ...item,
                video: {
                  url: body.filepath,
                  filename: body.filename,
                  start: 0,
                  end: Math.max(0.5, Math.min(duration, 10)),
                  length: Math.max(0.5, Math.min(duration, 4)),
                  title: item.video?.title ?? item.name,
                },
              }
            : item
        );
        return normalizeRankingData({ ...prev, items });
      });
    } catch (error) {
      const message = `Could not read that file: ${(error as Error).message}. The dev server has to be running for local files.`;
      setStatus(message);
      setFileNote({ itemId, message, tone: 'error' });
    } finally {
      setBusy(false);
    }
  }, [saveToDownloads]);

  /** Downloads a video URL and puts the clip into the next free rank. */
  const handleDownloadVideo = useCallback(async () => {
    const url = referenceUrl.trim();
    if (!url) {
      setStatus('Enter a video URL first.');
      return;
    }

    setBusy(true);
    setStatus('Downloading...');

    try {
      // A remote source is downloaded by the local dev server, which can run
      // yt-dlp. Same-origin files are fetched straight from the browser.
      const local = url.startsWith('/')
        ? null
        : await fetch(`/__reel-download?url=${encodeURIComponent(url)}`).then(
            async (res) => {
              if (res.status === 404) {
                throw new Error(
                  'the dev server has no downloader endpoint - restart "npm run dev" and reload the page'
                );
              }
              if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error ?? `HTTP ${res.status}`);
              }
              return res.json() as Promise<{
                filepath: string;
                filename: string;
                sizeBytes: number;
              }>;
            },
            () => {
              throw new Error(
                'the dev server is not reachable - restart "npm run dev" and reload the page'
              );
            }
          );

      if (local) {
        setStatus(
          `Downloaded ${local.filename} (${(local.sizeBytes / 1024 / 1024).toFixed(1)} MB) into the next rank.`
        );
        saveToDownloads(local.filepath, local.filename);
        setData((prev) => {
          const free = prev.items.findIndex((item) => !item.video);
          const target = free >= 0 ? free : 0;
          const items = prev.items.map((item, index) =>
            index === target
              ? {
                  ...item,
                  video: {
                    url: local.filepath,
                    filename: local.filename,
                    start: 0,
                    end: 8,
                    length: 4,
                    title: item.video?.title ?? item.name,
                  },
                }
              : item
          );
          return normalizeRankingData({ ...prev, items });
        });
        return;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const total = Number(response.headers.get('content-length') ?? 0);
      const blob = response.blob
        ? await response.blob()
        : await new Promise<Blob>((resolve, reject) => {
            const reader = response.body?.getReader();
            if (!reader) {
              reject(new Error('The browser could not read the response.'));
              return;
            }
            const chunks: Uint8Array[] = [];
            let received = 0;
            const read = async () => {
              const { done, value } = await reader.read();
              if (done) {
                resolve(new Blob(chunks as BlobPart[], { type: 'video/mp4' }));
                return;
              }
              if (value) {
                chunks.push(value);
                received += value.length;
                if (total > 0) {
                  setStatus(`Downloading ${((received / total) * 100).toFixed(0)}%`);
                }
              }
              await read();
            };
            read().catch(reject);
          });

      if (!blob.size) {
        throw new Error('The file was empty.');
      }

      const objectUrl = URL.createObjectURL(blob);
      const filename = url.split('/').pop()?.split('?')[0] || 'clip.mp4';

      // Read the real duration so the range is valid, and confirm the
      // response really is a video. A page link hands over its HTML, which
      // would otherwise be saved as a broken .mp4.
      const duration = await new Promise<number>((resolve, reject) => {
        const probe = document.createElement('video');
        probe.preload = 'metadata';
        probe.onloadedmetadata = () => {
          const value = probe.duration || 4;
          probe.removeAttribute('src');
          resolve(value);
        };
        probe.onerror = () =>
          reject(
            new Error(
              'the response was not a video file, it looks like a web page. Open the page, copy the file address of the video itself, and paste that.'
            )
          );
        probe.src = objectUrl;
      });

      saveToDownloads(objectUrl, filename);

      setData((prev) => {
        const free = prev.items.findIndex((item) => !item.video);
        const target = free >= 0 ? free : 0;
        const items = prev.items.map((item, index) =>
          index === target
            ? {
                ...item,
                video: {
                  url: objectUrl,
                  filename,
                  start: 0,
                  end: Math.max(0.5, Math.min(duration, 10)),
                  length: Math.max(0.5, Math.min(duration, 4)),
                  title: item.video?.title ?? item.name,
                },
              }
            : item
        );
        return normalizeRankingData({ ...prev, items });
      });

      setStatus(
        `Downloaded ${filename} (${(blob.size / 1024 / 1024).toFixed(1)} MB) into the next rank.`
      );
    } catch (error) {
      setStatus(
        `Could not download that URL: ${(error as Error).message}. Use Choose a file, or run node scripts/download-clips.ts clips.json.`
      );
    } finally {
      setBusy(false);
    }
  }, [referenceUrl, saveToDownloads]);

  const handleLoadBlueprint = useCallback(async () => {
    setBusy(true);
    setStatus(null);
    try {
      const blueprint = await loadBlueprint();
      if (!blueprint) {
        setStatus(
          'No downloaded blueprint found yet. Run: node scripts/download-clips.ts clips.json (or npm run reference -- --url "https://your-reel.mp4")'
        );
        return;
      }
      setData(normalizeRankingData(blueprintToRankingData(blueprint)));
      setCurrentTime(0);
      setStatus(
        `Loaded ${blueprint.items.length} entries from ${
          blueprint.source.url || 'the downloaded blueprint'
        }`
      );
    } finally {
      setBusy(false);
    }
  }, []);

  /** Fills the first three ranks with the bundled sample clips. */
  const loadSampleMerge = useCallback(() => {
    const samples = [
      { url: '/samples/clip-1.mp4', title: 'THE STREETBALL KING', start: 0, end: 4, length: 3 },
      { url: '/samples/clip-2.mp4', title: 'THE MIDNIGHT MAKER', start: 0, end: 4, length: 2.5 },
      { url: '/samples/clip-3.mp4', title: 'THE CROWD FAVOURITE', start: 0, end: 4, length: 3.5 },
    ];

    setData((prev) =>
      normalizeRankingData({
        ...prev,
        titleCardSeconds: prev.titleCardSeconds || 1.2,
        items: prev.items.map((item, index) => {
          const sample = samples[index];
          if (!sample) return { ...item, video: undefined };
          return {
            ...item,
            video: { ...sample },
          };
        }),
      })
    );
    setStatus('Sample merge loaded — three clips merged into the top ranks.');
  }, []);

  /** Reordering the clips renumbers the ranks automatically. */
  const moveClip = useCallback((index: number, direction: -1 | 1) => {
    setData((prev) => {
      const items = [...prev.items];
      const target = index + direction;
      if (target < 0 || target >= items.length) return prev;
      const [moved] = items.splice(index, 1);
      items.splice(target, 0, moved);
      return normalizeRankingData({ ...prev, items });
    });
  }, []);

  const reset = useCallback(() => {
    stopVoiceOver();
    setData(cloneRankingData(DEFAULT_RANKING_DATA));
    setCurrentTime(0);
    setIsPlaying(false);
  }, []);

  const scrub = (value: number) => {
    stopVoiceOver();
    spokenRef.current = new Set();
    setCurrentTime(value);
  };

  /** Jump the main preview to where a clip plays inside the reel. */
  const playInReel = useCallback(
    (itemId: string) => {
      const beats = getReelBeats(data);
      const beat = beats.find(
        (b) => b.kind === 'item' && b.item?.id === itemId
      );
      if (!beat) return;
      scrub(beat.start + 0.05);
    },
    [data]
  );

  const totalFrames = Math.round(duration * REEL_FPS);
  const currentFrame = Math.round(currentTime * REEL_FPS);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_420px] gap-6 p-6">
        {/* ---------------------------------------------- Editor */}
        <div className="space-y-5 min-w-0">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-slate-950">
                <Link2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Video Downloader</h2>
                <p className="text-xs text-slate-400">
                  Download a source video, trim the exact range, and merge it into the ranking.
                  Or point it at a reference reel and rebuild that beat structure with your own
                  characters and new visuals.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Source video URL
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  value={referenceUrl}
                  onChange={(e) => setReferenceUrl(e.target.value)}
                  placeholder="https://.../source-reel.mp4"
                  className="flex-1 px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-md text-white focus:outline-none focus:border-sky-500 font-mono"
                />
                <button
                  onClick={handleDownloadVideo}
                  disabled={busy}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-sky-500 hover:bg-sky-400 disabled:bg-slate-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{busy ? 'Downloading...' : 'Download video'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500 font-mono break-all">
                node scripts/download-clips.ts clips.json
              </p>
              <p className="text-[11px] text-slate-500 font-mono break-all">
                npm run reference -- --url &quot;{referenceUrl || 'https://your-reel.mp4'}&quot;
              </p>
            </div>

            {status && (
              <p className="text-xs text-sky-300 bg-sky-950/40 border border-sky-900/60 rounded-lg p-2.5">
                {status}
              </p>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-slate-950">
                  <Link2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Merge videos into the ranking</h2>
                  <p className="text-xs text-slate-400">
                    Paste a video URL per rank, set the manual range and length, and give it the
                    title that plays on its title card. The ranks are numbered automatically from
                    the number of merged videos and run from #{data.items.length} down to #1.
                  </p>
                </div>
              </div>
              <button
                onClick={loadSampleMerge}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-sky-500 hover:bg-sky-400 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load a sample merge</span>
              </button>
            </div>

            <div className="overflow-hidden rounded-lg border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/70 text-slate-400">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Rank</th>
                    <th className="px-3 py-2 font-semibold">Title card</th>
                    <th className="px-3 py-2 font-semibold">Video</th>
                    <th className="px-3 py-2 font-semibold">Range</th>
                    <th className="px-3 py-2 font-semibold">Length</th>
                    <th className="px-3 py-2 font-semibold">File</th>
                    <th className="px-3 py-2 font-semibold text-right">Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item, index) => (
                    <tr key={item.id} className="border-t border-slate-800/80">
                      <td className="px-3 py-2">
                        <span
                          className="inline-flex items-center justify-center w-8 h-7 rounded-md text-[11px] font-black text-slate-950"
                          style={{ backgroundColor: item.accent }}
                        >
                          #{String(item.rank).padStart(2, '0')}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-white font-semibold truncate max-w-[190px]">
                        {item.video?.title?.trim() || item.name}
                      </td>
                      <td className="px-3 py-2 font-mono text-slate-400 truncate max-w-[210px]">
                        {item.video?.url
                          ? isLocalFile(item.video.url)
                            ? 'local file'
                            : item.video.url
                          : '—'}
                      </td>
                      <td className="px-3 py-2 font-mono text-slate-400 whitespace-nowrap">
                        {item.video
                          ? `${item.video.start.toFixed(1)}s → ${item.video.end.toFixed(1)}s`
                          : '—'}
                      </td>
                      <td className="px-3 py-2 font-mono text-slate-300 whitespace-nowrap">
                        {(item.video?.length ?? data.secondsPerItem).toFixed(1)}s
                      </td>
                      <td className="px-3 py-2">
                        {item.video?.url ? (
                          <button
                            onClick={() =>
                              saveToDownloads(
                                item.video!.url,
                                item.video!.filename ||
                                  item.video!.url.split('/').pop() ||
                                  'clip.mp4'
                              )
                            }
                            title="Save this clip to your downloads"
                            className="px-1.5 py-0.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-slate-700">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => moveClip(index, -1)}
                            disabled={index === 0}
                            title="Move up (a lower rank)"
                            className="px-1.5 py-0.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => moveClip(index, 1)}
                            disabled={index === data.items.length - 1}
                            title="Move down (a better rank)"
                            className="px-1.5 py-0.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                          >
                            ↓
                          </button>
                          <button
                            onClick={() => {
                              setExpandedId(expandedId === item.id ? null : item.id);
                              setTimeout(() => {
                                document
                                  .getElementById(`rank-${item.id}`)
                                  ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              }, 60);
                            }}
                            className="text-[11px] font-semibold text-sky-300 hover:text-white transition-colors cursor-pointer"
                          >
                            {expandedId === item.id ? 'Close' : 'Edit'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-400">
              <span>
                <strong className="text-white">{mergedClips}</strong> of {data.items.length} ranks have
                a merged video
              </span>
              <span>
                <strong className="text-white">{mergedSeconds.toFixed(1)}s</strong> of clip time
              </span>
              <span>
                <strong className="text-white">{duration.toFixed(1)}s</strong> reel total
              </span>
              <span>
                Title cards: <strong className="text-white">{(data.titleCardSeconds ?? 0).toFixed(1)}s</strong>{' '}
                each
              </span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Clone Reels · Ranking Builder</h2>
                  <p className="text-xs text-slate-400">
                    Vertical ranking countdown · {duration.toFixed(0)}s · {REEL_FPS}fps ·{' '}
                    {data.items.length} entries
                  </p>
                </div>
              </div>
              <button
                onClick={reset}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Title">
                <input
                  value={data.title}
                  onChange={(e) => update({ title: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-md text-white focus:outline-none focus:border-amber-500"
                />
              </Field>
              <Field label="Subtitle">
                <input
                  value={data.subtitle}
                  onChange={(e) => update({ subtitle: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-md text-white focus:outline-none focus:border-amber-500"
                />
              </Field>
              <Field label="Ranking style / category">
                <select
                  value={data.category}
                  onChange={(e) => update({ category: e.target.value as RankingCategory })}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-md text-white focus:outline-none focus:border-amber-500"
                >
                  {(Object.keys(CATEGORY_LABELS) as RankingCategory[]).map((category) => (
                    <option key={category} value={category}>
                      {CATEGORY_LABELS[category]}
                    </option>
                  ))}
                </select>
                <span className="block text-[11px] text-slate-500 mt-1">
                  {CATEGORY_BLURBS[data.category]}
                </span>
              </Field>
              <Field label="Intro caption">
                <input
                  value={data.introCaption}
                  onChange={(e) => update({ introCaption: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-md text-white focus:outline-none focus:border-amber-500"
                />
              </Field>
              <Field label="Outro caption">
                <input
                  value={data.outroCaption}
                  onChange={(e) => update({ outroCaption: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-md text-white focus:outline-none focus:border-amber-500"
                />
              </Field>
              <Field label="Intro narration (spoken)">
                <textarea
                  value={data.introNarration}
                  rows={2}
                  onChange={(e) => update({ introNarration: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-md text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </Field>
              <Field label="Outro narration (spoken)">
                <textarea
                  value={data.outroNarration}
                  rows={2}
                  onChange={(e) => update({ outroNarration: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-md text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Field label="Intro seconds">
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={data.introSeconds}
                  onChange={(e) => update({ introSeconds: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-md text-white focus:outline-none focus:border-amber-500"
                />
              </Field>
              <Field label="Seconds per entry">
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={data.secondsPerItem}
                  onChange={(e) => update({ secondsPerItem: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-md text-white focus:outline-none focus:border-amber-500"
                />
              </Field>
              <Field label="Outro seconds">
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={data.outroSeconds}
                  onChange={(e) => update({ outroSeconds: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-md text-white focus:outline-none focus:border-amber-500"
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Title card seconds (between clips)">
                <input
                  type="number"
                  min={0}
                  max={4}
                  step={0.1}
                  value={data.titleCardSeconds ?? 0}
                  onChange={(e) => update({ titleCardSeconds: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-md text-white focus:outline-none focus:border-amber-500"
                />
              </Field>
              <div className="flex items-end">
                <p className="text-xs text-slate-400 leading-relaxed">
                  {mergedClips} of {data.items.length} ranks have a merged video clip ·{' '}
                  {mergedSeconds.toFixed(1)}s of clip time · {duration.toFixed(1)}s reel total.
                  Ranks run from #{data.items.length} down to #1.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">The Ranking</h3>
              <span className="text-xs text-slate-400 font-mono">
                {data.items.length} entries · {totalFrames.toLocaleString()} frames
              </span>
            </div>

            <div className="space-y-2">
              {data.items.map((item) => {
                const open = expandedId === item.id;
                return (
                  <div
                    key={item.id}
                    id={`rank-${item.id}`}
                    className="rounded-lg border border-slate-800 bg-slate-950/60 overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedId(open ? null : item.id)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-900/60 transition-colors cursor-pointer"
                    >
                      <span
                        className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center text-xs font-black text-slate-950"
                        style={{ backgroundColor: item.accent }}
                      >
                        {item.rank}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold text-white truncate">
                          {item.name}
                        </span>
                        <span className="block text-[11px] text-slate-400 truncate">
                          {item.category} · {item.score} / 100
                        </span>
                      </span>
                      {open ? (
                        <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                      )}
                    </button>

                    {open && (
                      <div className="px-3 pb-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Field label="Name">
                          <input
                            value={item.name}
                            onChange={(e) => updateItem(item.id, { name: e.target.value })}
                            className="w-full px-3 py-1.5 text-sm bg-slate-950 border border-slate-700 rounded-md text-white focus:outline-none focus:border-amber-500"
                          />
                        </Field>
                        <Field label="Category">
                          <input
                            list="clip-categories"
                            value={item.category}
                            onChange={(e) => updateItem(item.id, { category: e.target.value })}
                            className="w-full px-3 py-1.5 text-sm bg-slate-950 border border-slate-700 rounded-md text-white focus:outline-none focus:border-amber-500"
                          />
                        </Field>
                        <Field label="On-screen caption">
                          <input
                            value={item.caption}
                            onChange={(e) => updateItem(item.id, { caption: e.target.value })}
                            className="w-full px-3 py-1.5 text-sm bg-slate-950 border border-slate-700 rounded-md text-white focus:outline-none focus:border-amber-500"
                          />
                        </Field>
                        <Field label="Spoken narration">
                          <input
                            value={item.narration}
                            onChange={(e) => updateItem(item.id, { narration: e.target.value })}
                            className="w-full px-3 py-1.5 text-sm bg-slate-950 border border-slate-700 rounded-md text-white focus:outline-none focus:border-amber-500"
                          />
                        </Field>
                        <Field label="Character art">
                          <select
                            value={item.image}
                            onChange={(e) => updateItem(item.id, { image: e.target.value })}
                            className="w-full px-3 py-1.5 text-sm bg-slate-950 border border-slate-700 rounded-md text-white focus:outline-none focus:border-amber-500"
                          >
                            {CHARACTER_ART.map((art) => (
                              <option key={art.path} value={art.path}>
                                {art.label}
                              </option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Accent colour">
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={item.accent}
                              onChange={(e) => updateItem(item.id, { accent: e.target.value })}
                              className="w-9 h-8 bg-slate-950 border border-slate-700 rounded cursor-pointer"
                            />
                            <input
                              value={item.accent}
                              onChange={(e) => updateItem(item.id, { accent: e.target.value })}
                              className="flex-1 px-3 py-1.5 text-sm bg-slate-950 border border-slate-700 rounded-md text-white focus:outline-none focus:border-amber-500 font-mono"
                            />
                          </div>
                        </Field>
                        <Field label={`Power index — ${item.score} / 100`}>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={item.score}
                            onChange={(e) => updateItem(item.id, { score: Number(e.target.value) })}
                            className="w-full accent-amber-500"
                          />
                        </Field>

                        {/* The merged video clip for this rank. */}                      <div className="md:col-span-2 rounded-lg border border-sky-900/60 bg-sky-950/20 p-3 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-300">
                            Video clip (merged into this rank)
                          </span>
                          {item.video && (
                            <button
                              onClick={() => updateItem(item.id, { video: undefined })}
                              className="text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                            >
                              Remove clip
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Field label="Video URL or local file">
                            <div className="flex gap-2">
                            <input
                              value={item.video?.url ?? ''}
                              placeholder="https://.../clip.mp4"
                              onChange={(e) =>
                                updateItem(item.id, {
                                  video: {
                                    url: e.target.value,
                                    start: item.video?.start ?? 0,
                                    end: item.video?.end ?? 10,
                                    length: item.video?.length ?? 4,
                                    title: item.video?.title ?? item.name,
                                  },
                                })
                              }
                              className="flex-1 min-w-0 px-3 py-1.5 text-sm bg-slate-950 border border-slate-700 rounded-md text-white focus:outline-none focus:border-sky-500 font-mono"
                            />
                            <label className="shrink-0 px-2.5 py-1.5 text-[11px] font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors cursor-pointer whitespace-nowrap">
                              Choose a file
                              <input
                                type="file"
                                accept="video/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  void addLocalFile(item.id, file);
                                  e.target.value = '';
                                }}
                              />
                            </label>
                            </div>
                            {fileNote?.itemId === item.id && (
                              <p
                                className={`mt-2 text-[11px] leading-relaxed rounded-lg px-2.5 py-2 border ${
                                  fileNote.tone === 'error'
                                    ? 'text-rose-300 bg-rose-950/40 border-rose-900/60'
                                    : 'text-sky-300 bg-sky-950/40 border-sky-900/60'
                                }`}
                              >
                                {fileNote.message}
                              </p>
                            )}
                          </Field>
                          <Field label="Title card text">
                            <input
                              value={item.video?.title ?? ''}
                              placeholder={item.name}
                              onChange={(e) =>
                                updateItem(item.id, {
                                  video: {
                                    url: item.video?.url ?? '',
                                    start: item.video?.start ?? 0,
                                    end: item.video?.end ?? 10,
                                    length: item.video?.length ?? 4,
                                    title: e.target.value,
                                  },
                                })
                              }
                              className="w-full px-3 py-1.5 text-sm bg-slate-950 border border-slate-700 rounded-md text-white focus:outline-none focus:border-sky-500"
                            />
                          </Field>
                          <Field label="Trim start (s)">
                            <input
                              type="number"
                              min={0}
                              step={0.1}
                              value={item.video?.start ?? 0}
                              onChange={(e) =>
                                updateItem(item.id, {
                                  video: {
                                    url: item.video?.url ?? '',
                                    start: Number(e.target.value),
                                    end: item.video?.end ?? 10,
                                    length: item.video?.length ?? 4,
                                    title: item.video?.title ?? item.name,
                                  },
                                })
                              }
                              className="w-full px-3 py-1.5 text-sm bg-slate-950 border border-slate-700 rounded-md text-white focus:outline-none focus:border-sky-500"
                            />
                          </Field>
                          <Field label="Trim end (s)">
                            <input
                              type="number"
                              min={0}
                              step={0.1}
                              value={item.video?.end ?? 10}
                              onChange={(e) =>
                                updateItem(item.id, {
                                  video: {
                                    url: item.video?.url ?? '',
                                    start: item.video?.start ?? 0,
                                    end: Number(e.target.value),
                                    length: item.video?.length ?? 4,
                                    title: item.video?.title ?? item.name,
                                  },
                                })
                              }
                              className="w-full px-3 py-1.5 text-sm bg-slate-950 border border-slate-700 rounded-md text-white focus:outline-none focus:border-sky-500"
                            />
                          </Field>
                          <Field label={`Clip length on screen — ${(item.video?.length ?? data.secondsPerItem).toFixed(1)}s`}>
                            <input
                              type="number"
                              min={0.2}
                              step={0.1}
                              value={item.video?.length ?? data.secondsPerItem}
                              onChange={(e) =>
                                updateItem(item.id, {
                                  video: {
                                    url: item.video?.url ?? '',
                                    start: item.video?.start ?? 0,
                                    end: item.video?.end ?? 10,
                                    length: Number(e.target.value),
                                    title: item.video?.title ?? item.name,
                                  },
                                })
                              }
                              className="w-full px-3 py-1.5 text-sm bg-slate-950 border border-slate-700 rounded-md text-white focus:outline-none focus:border-sky-500"
                            />
                          </Field>
                        </div>
                        {item.video?.url && (
                          <ClipEditor
                            item={item}
                            clip={item.video}
                            onChange={(video) => updateItem(item.id, { video })}
                            onPlayInReel={() => playInReel(item.id)}
                          />
                        )}
                        <p className="text-[11px] text-slate-500">
                          Preview the clip straight from its URL, set the in and out points, then
                          give it the length it plays for. The clip runs between the title card and
                          the next rank. The video host must allow cross-origin reads, otherwise the
                          export cannot capture the frame.
                        </p>
                      </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ---------------------------------------------- Preview */}
        <div className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Preview</h3>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleToggleMute}
                  title={isMuted ? 'Unmute narration' : 'Mute narration'}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 text-rose-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                  )}
                </button>
                <button
                  onClick={() => setIsNarrationOn((on) => !on)}
                  title={
                    isNarrationOn
                      ? 'Turn the spoken narration off'
                      : 'Turn the spoken narration on'
                  }
                  className={`px-2 py-1.5 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                    isNarrationOn
                      ? 'bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/50'
                      : 'bg-slate-800 text-slate-500 ring-1 ring-slate-700'
                  }`}
                >
                  {isNarrationOn ? 'Spoken on' : 'Spoken off'}
                </button>
                <button
                  onClick={() => setShowSafeZones((on) => !on)}
                  title="Show the 9:16 mobile safe bounds, the same guides the 2D studio uses"
                  className={`flex items-center gap-1.5 px-2 py-1.5 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                    showSafeZones
                      ? 'bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/50'
                      : 'bg-slate-800 text-slate-500 ring-1 ring-slate-700'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" />
                  Safe areas
                </button>
                <button
                  onClick={() => setIsExportOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            <div className="relative mx-auto w-[280px] aspect-[9/16] bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl">
              <canvas
                ref={canvasRef}
                width={1080}
                height={1920}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="w-10 h-10 shrink-0 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center transition-colors cursor-pointer"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              <input
                type="range"
                min={0}
                max={Math.max(1, duration)}
                step={0.01}
                value={currentTime}
                onChange={(e) => scrub(Number(e.target.value))}
                className="flex-1 accent-amber-500"
              />
              <span className="text-xs font-mono text-slate-400 w-24 text-right">
                {currentTime.toFixed(1)}s / {duration.toFixed(0)}s
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>
                Frame {currentFrame.toLocaleString()} / {totalFrames.toLocaleString()} · narration
                uses the browser voice in preview and the studio synth in the export.
              </span>
            </div>
          </div>
        </div>
      </div>

      <datalist id="clip-categories">
        {CLIP_CATEGORIES.map((category) => (
          <option key={category} value={category} />
        ))}
      </datalist>

      {/* The merged clips. They are hidden because the canvas draws them. */}
      <div className="hidden">
        {data.items
          .filter((item) => item.video?.url)
          .map((item) => (
            <video
              key={item.id}
              ref={(el) => {
                if (el) videoRefs.current.set(item.id, el);
                else videoRefs.current.delete(item.id);
              }}
              src={item.video?.url}
              crossOrigin="anonymous"
              muted
              playsInline
              preload="auto"
            />
          ))}
      </div>

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        config={configRef.current}
        renderer={rendererRef.current}
        duration={duration}
        prepareNarration={prepareReelNarration}
        filePrefix="ranking-reel"
        title={data.title}
      />
    </div>
  );
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <label className="block space-y-1.5">
    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
      {label}
    </span>
    {children}
  </label>
);
