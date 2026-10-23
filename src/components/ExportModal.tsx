import React, { useEffect, useState, useRef } from 'react';
import { X, Download, CheckCircle, Film, Sparkles, Volume2, Gauge, AlertCircle, Repeat, Frame } from 'lucide-react';
import { PROJECTS, StudioConfig } from '../types';
import {
  exportVideo,
  ExportResult,
  ExportFps,
  ExportTimelineRenderer,
  EXPORT_FPS_OPTIONS,
  canRecordMp4WithAudio,
} from '../utils/exportVideo';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: StudioConfig;
  /** Renders a custom timeline instead of the active project. */
  renderer?: ExportTimelineRenderer;
  /** Duration of the custom timeline in seconds. */
  duration?: number;
  /** Spoken lines with the moment they are read. */
  narration?: { time: number; text: string }[];
  /** File name prefix for the download. */
  filePrefix?: string;
  /** Title shown in the modal header. */
  title?: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  config,
  renderer,
  duration,
  narration,
  filePrefix,
  title,
}) => {
  const mp4Available = canRecordMp4WithAudio();
  const baseDuration = duration ?? PROJECTS[config.activeProject].duration;
  const projectTitle = title ?? PROJECTS[config.activeProject].title;
  const [loopCount, setLoopCount] = useState<number>(1);
  const [exportSpeed, setExportSpeed] = useState<number>(1.0);
  const [exportFps, setExportFps] = useState<ExportFps>(24);
  const [exportFormat, setExportFormat] = useState<'mp4' | 'webm'>(
    mp4Available ? 'mp4' : 'webm'
  );
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [currentSec, setCurrentSec] = useState<number>(0);
  const [totalSec, setTotalSec] = useState<number>(baseDuration);
  const [result, setResult] = useState<ExportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const outputDuration = (baseDuration * loopCount) / exportSpeed;
  const outputSecondsLabel = outputDuration.toFixed(1).replace(/\.0$/, '');
  const outputFrameCount = Math.round(outputDuration * exportFps);

  useEffect(() => {
    setLoopCount(1);
    setExportFps(24);
    setResult(null);
    setError(null);
    setTotalSec(baseDuration);
  }, [config.activeProject, baseDuration]);

  if (!isOpen) return null;

  const handleStartExport = async () => {
    setIsExporting(true);
    setProgress(0);
    setCurrentSec(0);
    setTotalSec(outputDuration);
    setError(null);
    setResult(null);

    // Give React time to mount the preview canvas in the DOM
    await new Promise((r) => setTimeout(r, 60));

    try {
      const res = await exportVideo({
        config,
        exportSpeed,
        loopCount,
        fps: exportFps,
        format: exportFormat,
        previewCanvas: previewCanvasRef.current,
        renderer,
        duration,
        narration,
        filePrefix,
        onProgress: (p, cSec, tSec) => {
          setProgress(p);
          setCurrentSec(cSec);
          setTotalSec(tSec);
        },
      });

      setResult(res);

      // Auto-trigger browser download
      const a = document.createElement('a');
      a.href = res.url;
      a.download = res.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Export failed:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Export failed. Try the WebM format and keep this tab visible while recording.'
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadAgain = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result.url;
    a.download = result.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-zinc-950 font-black">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Export 1080×1920 (9:16) Video
              </h2>
              <p className="text-xs text-zinc-400">{projectTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isExporting}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Options view when not yet exported or configuring */}
          {!result && !isExporting && (
            <div className="space-y-6">
              {/* Video Length / Loops */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-3">
                  <label className="text-sm font-semibold text-white flex items-center gap-2">
                    <Repeat className="w-4 h-4 text-zinc-300" />
                    <span>Video Length</span>
                  </label>
                  <span className="text-xs text-zinc-300 font-mono text-right">
                    {outputSecondsLabel}s · {loopCount} {loopCount === 1 ? 'play' : 'plays'} · {exportFps}fps
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((loops) => {
                    const baseSeconds = loops * baseDuration;
                    return (
                      <button
                        key={loops}
                        onClick={() => setLoopCount(loops)}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                          loopCount === loops
                            ? 'bg-zinc-800 border-white text-white ring-1 ring-white/20'
                            : 'bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-sm">
                          <span>{baseSeconds}s</span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {loops === 1 ? '1 play' : `${loops} loops`}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-snug">
                          {loops === 1
                            ? `One complete play of the ${baseDuration}-second film.`
                            : `${loops} full plays of the film with sound cues re-triggered each loop.`}
                        </p>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-500">
                  Length is before pacing. A slower pace extends the final duration shown above.
                </p>
              </div>

              {/* Speed / Pacing Option */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-white flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-zinc-300" />
                    <span>Animation Pacing & Speed</span>
                  </label>
                  <span className="text-xs text-slate-400 font-mono">
                    Applies to every loop
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      val: 1.0,
                      label: '1.0x Normal',
                      desc: 'Classic snappy cartoon comedic timing',
                    },
                    {
                      val: 0.75,
                      label: '0.75x Relaxed',
                      desc: 'Smoother, extra-readable arcs & reactions',
                    },
                    {
                      val: 0.5,
                      label: '0.5x Slow-Mo',
                      desc: 'Ultra deliberate pantomime comedy',
                    },
                  ].map((item) => {
                    const itemDuration = (baseDuration * loopCount) / item.val;
                    return (
                      <button
                        key={item.val}
                        onClick={() => setExportSpeed(item.val)}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                          exportSpeed === item.val
                            ? 'bg-zinc-800 border-white text-white ring-1 ring-white'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-sm">
                          <span>{item.label}</span>
                          <span className="text-xs font-mono text-slate-400">
                            {itemDuration.toFixed(1)}s
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-snug">
                          {item.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
                {exportSpeed !== 1.0 && (
                  <p className="text-xs text-zinc-300 bg-zinc-900 border border-zinc-700 rounded-lg p-2.5">
                    Slows down the ball physics and character reactions proportionally so the downloaded video is easy to follow!
                  </p>
                )}
              </div>

              {/* Frame Rate Option */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-3">
                  <label className="text-sm font-semibold text-white flex items-center gap-2">
                    <Frame className="w-4 h-4 text-zinc-300" />
                    <span>Frame Rate</span>
                  </label>
                  <span className="text-xs text-slate-400 font-mono text-right">
                    {exportFps}fps · {outputFrameCount.toLocaleString()} frames
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {EXPORT_FPS_OPTIONS.map((fps) => {
                    const frameCount = Math.round(outputDuration * fps);
                    const meta = {
                      24: { label: 'Cinematic', desc: 'Authored cartoon cadence with snappy 24fps timing.' },
                      30: { label: 'Smooth', desc: 'Extra frames for web and social playback.' },
                      60: { label: 'Ultra Smooth', desc: 'Maximum smoothness; largest file size.' },
                    }[fps];
                    return (
                      <button
                        key={fps}
                        onClick={() => setExportFps(fps)}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                          exportFps === fps
                            ? 'bg-zinc-800 border-white text-white ring-1 ring-white'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-sm">
                          <span>{fps} fps</span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {meta.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-snug">
                          {meta.desc}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1 font-mono">
                          {frameCount.toLocaleString()} frames
                        </p>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-500">
                  Every rate renders the same {outputSecondsLabel}s film, so the sound cues land at the
                  exact same moments. Higher rates just sample the motion more often.
                </p>
              </div>

              {/* Format selection */}
              <div className="space-y-2.5">
                <label className="text-sm font-semibold text-white">
                  Video Container & Codec
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {mp4Available ? (
                    <button
                      onClick={() => setExportFormat('mp4')}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        exportFormat === 'mp4'
                          ? 'bg-zinc-800 border-white text-white ring-1 ring-white'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-sm">
                        <span>MP4 (H.264 + AAC)</span>
                        <span className="text-[10px] bg-white text-zinc-950 font-bold px-1.5 py-0.5 rounded font-mono">
                          QuickTime
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Best for QuickTime, iOS, and social uploads. Available in Safari.
                      </p>
                    </button>
                  ) : (
                    <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/40 text-left">
                      <div className="flex items-center justify-between font-bold text-sm text-slate-400">
                        <span>MP4 (H.264 + AAC)</span>
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                          Safari only
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Chrome and Edge cannot mux the synthesized audio track into MP4. Use WebM with sound instead.
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => setExportFormat('webm')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      exportFormat === 'webm'
                        ? 'bg-zinc-800 border-white text-white ring-1 ring-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-sm">
                      <span>WebM (VP9 + Opus)</span>
                      {!mp4Available && (
                        <span className="text-[10px] bg-white text-zinc-950 font-bold px-1.5 py-0.5 rounded font-mono">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      VP9 video + Opus audio with a patched duration header. Works in Chrome, Edge, Firefox, and VLC.
                    </p>
                  </button>
                </div>
              </div>

              {/* Audio check indicator */}
              <div className="flex items-center gap-3 p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-300">
                <Volume2 className="w-4 h-4 text-zinc-300 shrink-0" />
                <span>
                  Synchronized cartoon sound effects are mixed directly into the audio track.
                </span>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 p-3 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-200">
                  <AlertCircle className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          )}

          {/* Rendering Progress View */}
          {isExporting && (
            <div className="space-y-5 text-center py-4">
              <div className="relative mx-auto w-36 aspect-[9/16] bg-white rounded-xl shadow-lg border-2 border-slate-700 overflow-hidden">
                <canvas
                  ref={previewCanvasRef}
                  width={270}
                  height={480}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Rendering Video Stream...</span>
                  <span className="text-white font-bold">{progress}%</span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-100 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-slate-500">
                  <span>{currentSec.toFixed(1)}s / {totalSec.toFixed(1)}s</span>
                  <span>1080 × 1920 @ {exportFps}fps</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 animate-pulse">
                Recording synchronized audio & video frames in 1:1 real-time lockstep...
              </p>
            </div>
          )}

          {/* Export Complete / Instant In-App Video Preview */}
          {result && (
            <div className="space-y-5 text-center py-2">
              <div className="flex items-center justify-center gap-2 text-white text-sm font-semibold">
                <CheckCircle className="w-5 h-5 text-zinc-200" />
                <span>Video Generated & Downloaded Successfully!</span>
              </div>

              {/* Video Player to verify audio and speed inside the modal */}
              <div className="relative mx-auto w-48 aspect-[9/16] bg-black rounded-2xl shadow-2xl border-2 border-zinc-700 overflow-hidden">
                <video
                  src={result.url}
                  controls
                  autoPlay
                  loop
                  playsInline
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 max-w-md mx-auto space-y-1">
                <div className="text-white font-semibold">{result.filename}</div>
                <div className="text-slate-400">
                  Duration: {result.duration.toFixed(1)}s · Format: {result.format.toUpperCase()} · {result.fps}fps · 1080×1920
                </div>
              </div>

              {result.silent && (
                <p className="text-xs text-amber-400">
                  The browser blocked the audio, so this file has no sound. Click the page
                  once and export again to get the sound with it.
                </p>
              )}

              <p className="text-xs text-slate-400">
                You can test playback above to confirm the exact speed and loud cartoon sound effects.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/70">
          {!result && !isExporting ? (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleStartExport}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-zinc-950 bg-white hover:bg-zinc-200 rounded-xl shadow-lg transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Render & Download {outputSecondsLabel}s Video</span>
              </button>
            </>
          ) : result ? (
            <>
              <button
                onClick={() => {
                  if (result) URL.revokeObjectURL(result.url);
                  setResult(null);
                  setError(null);
                }}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Change Settings & Re-export
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownloadAgain}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-zinc-950 bg-white hover:bg-zinc-200 rounded-xl shadow-lg transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Again</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </>
          ) : (
            <div className="w-full text-center text-xs text-slate-500">
              Keep this tab in the foreground while recording — browsers throttle background tabs and
              that shows up as frozen frames in the download.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
