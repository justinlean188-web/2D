import React, { useState, useRef } from 'react';
import { X, Download, Play, CheckCircle, Film, Sparkles, Volume2, Gauge } from 'lucide-react';
import { StudioConfig } from '../types';
import { exportVideo, ExportResult } from '../utils/exportVideo';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: StudioConfig;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  config,
}) => {
  const [exportSpeed, setExportSpeed] = useState<number>(1.0);
  const [exportFormat, setExportFormat] = useState<'mp4' | 'webm'>('mp4');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [currentSec, setCurrentSec] = useState<number>(0);
  const [totalSec, setTotalSec] = useState<number>(10);
  const [result, setResult] = useState<ExportResult | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  if (!isOpen) return null;

  const handleStartExport = async () => {
    setIsExporting(true);
    setProgress(0);
    setResult(null);

    // Give React time to mount the preview canvas in the DOM
    await new Promise((r) => setTimeout(r, 60));

    try {
      const res = await exportVideo({
        config,
        exportSpeed,
        format: exportFormat,
        previewCanvas: previewCanvasRef.current,
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
            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Export 1080×1920 (9:16) Video
              </h2>
              <p className="text-xs text-slate-400">
                {config.activeProject === 'paper-ball'
                  ? 'The Paper Ball Ricochet'
                  : 'What If Your Shadow Quit?'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isExporting}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Options view when not yet exported or configuring */}
          {!result && !isExporting && (
            <div className="space-y-6">
              {/* Speed / Pacing Option */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-white flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-rose-400" />
                    <span>Animation Pacing & Speed</span>
                  </label>
                  <span className="text-xs text-rose-400 font-mono">
                    Output: {(10 / exportSpeed).toFixed(1)}s duration
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      val: 1.0,
                      label: '1.0x Normal',
                      dur: '10.0s',
                      desc: 'Classic snappy cartoon comedic timing',
                    },
                    {
                      val: 0.75,
                      label: '0.75x Relaxed',
                      dur: '13.3s',
                      desc: 'Smoother, extra-readable arcs & reactions',
                    },
                    {
                      val: 0.5,
                      label: '0.5x Slow-Mo',
                      dur: '20.0s',
                      desc: 'Ultra deliberate pantomime comedy',
                    },
                  ].map((item) => (
                    <button
                      key={item.val}
                      onClick={() => setExportSpeed(item.val)}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        exportSpeed === item.val
                          ? 'bg-rose-950/60 border-rose-500 text-white ring-1 ring-rose-500'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-sm">
                        <span>{item.label}</span>
                        <span className="text-xs font-mono text-slate-400">
                          {item.dur}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-snug">
                        {item.desc}
                      </p>
                    </button>
                  ))}
                </div>
                {exportSpeed !== 1.0 && (
                  <p className="text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 rounded-lg p-2.5">
                    Slows down the ball physics and character reactions proportionally so the downloaded video is easy to follow!
                  </p>
                )}
              </div>

              {/* Format selection */}
              <div className="space-y-2.5">
                <label className="text-sm font-semibold text-white">
                  Video Container & Codec
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setExportFormat('mp4')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      exportFormat === 'mp4'
                        ? 'bg-rose-950/60 border-rose-500 text-white ring-1 ring-rose-500'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-sm">
                      <span>MP4 (Recommended)</span>
                      <span className="text-[10px] bg-rose-600 text-white px-1.5 py-0.5 rounded font-mono">
                        Universal
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Exact 1:1 playback speed and loud audio on Windows Media Player, QuickTime, iOS, Android, and social media.
                    </p>
                  </button>

                  <button
                    onClick={() => setExportFormat('webm')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      exportFormat === 'webm'
                        ? 'bg-rose-950/60 border-rose-500 text-white ring-1 ring-rose-500'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-sm">WebM (VP9 + Opus)</div>
                    <p className="text-xs text-slate-400 mt-1">
                      Patched EBML duration header for web platforms and browser playback.
                    </p>
                  </button>
                </div>
              </div>

              {/* Audio check indicator */}
              <div className="flex items-center gap-3 p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-300">
                <Volume2 className="w-4 h-4 text-rose-400 shrink-0" />
                <span>
                  Synchronized cartoon sound effects are mixed directly into the audio track.
                </span>
              </div>
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
                  <span className="text-rose-400 font-bold">{progress}%</span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                  <div
                    className="h-full bg-rose-600 rounded-full transition-all duration-100 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-slate-500">
                  <span>{currentSec.toFixed(1)}s / {totalSec.toFixed(1)}s</span>
                  <span>1080 × 1920 @ 24fps</span>
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
              <div className="flex items-center justify-center gap-2 text-emerald-400 text-sm font-semibold">
                <CheckCircle className="w-5 h-5" />
                <span>Video Generated & Downloaded Successfully!</span>
              </div>

              {/* Video Player to verify audio and speed inside the modal */}
              <div className="relative mx-auto w-48 aspect-[9/16] bg-black rounded-2xl shadow-2xl border-2 border-rose-500/50 overflow-hidden">
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
                  Duration: {result.duration.toFixed(1)}s · Format: {result.format.toUpperCase()} · 1080×1920
                </div>
              </div>

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
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Render & Download Video</span>
              </button>
            </>
          ) : result ? (
            <>
              <button
                onClick={() => {
                  setResult(null);
                }}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Change Settings & Re-export
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownloadAgain}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg transition-colors cursor-pointer"
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
              Please keep this tab open while recording frames...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
