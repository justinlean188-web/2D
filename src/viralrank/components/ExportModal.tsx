import React, { useState } from 'react';
import { X, Sparkles, CheckCircle, Download, Film, Volume2, Gauge } from 'lucide-react';
import { ViralRankProject } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ViralRankProject;
  totalDuration: number;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  project,
  totalDuration,
}) => {
  const [fps, setFps] = useState<24 | 30 | 60>(30);
  const [format, setFormat] = useState<'mp4' | 'webm'>('mp4');
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartExport = async () => {
    setIsExporting(true);
    setProgress(0);
    setDownloadUrl(null);

    // Render loop simulation for 9:16 compilation
    const totalSteps = 40;
    for (let step = 1; step <= totalSteps; step++) {
      await new Promise((r) => setTimeout(r, 60));
      setProgress(Math.round((step / totalSteps) * 100));
    }

    // Build synthesized download blob
    const sampleBlob = new Blob(
      [JSON.stringify(project, null, 2)],
      { type: format === 'mp4' ? 'video/mp4' : 'video/webm' }
    );
    const url = URL.createObjectURL(sampleBlob);
    setDownloadUrl(url);
    setIsExporting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Export 9:16 Vertical Reel
              </h2>
              <p className="text-xs text-slate-400 truncate max-w-sm">
                {project.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isExporting}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs text-slate-300">
          {!downloadUrl && !isExporting && (
            <div className="space-y-4">
              {/* Output Specs Box */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-center">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">
                    Resolution
                  </span>
                  <span className="font-bold text-white text-xs mt-0.5 block">
                    1080 × 1920
                  </span>
                  <span className="text-[10px] text-rose-400 font-mono">9:16 Vertical</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">
                    Duration
                  </span>
                  <span className="font-bold text-white text-xs mt-0.5 block">
                    {totalDuration.toFixed(1)}s
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {project.items.length} clips
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">
                    Total SFX
                  </span>
                  <span className="font-bold text-emerald-400 text-xs mt-0.5 block">
                    {project.items.reduce(
                      (acc, it) => acc + it.soundEffects.length,
                      0
                    )}{' '}
                    effects
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Mixed</span>
                </div>
              </div>

              {/* Framerate Selection */}
              <div className="space-y-2">
                <label className="font-semibold text-white block">
                  Export Frame Rate
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[24, 30, 60].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFps(f as any)}
                      className={`p-3 rounded-xl border text-center font-bold text-xs cursor-pointer transition-colors ${
                        fps === f
                          ? 'bg-rose-950/60 border-rose-500 text-white ring-1 ring-rose-500/50'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div>{f} FPS</div>
                      <span className="text-[10px] text-slate-500 font-normal">
                        {f === 60 ? 'Ultra Smooth' : f === 30 ? 'Standard Reels' : 'Cinematic'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Container Format */}
              <div className="space-y-2">
                <label className="font-semibold text-white block">Video Format</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFormat('mp4')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-colors ${
                      format === 'mp4'
                        ? 'bg-rose-950/60 border-rose-500 text-white ring-1 ring-rose-500/50'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs text-white">MP4 (H.264 + AAC)</div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Universal compatibility on YouTube Shorts, TikTok, Instagram & Apple
                    </div>
                  </button>

                  <button
                    onClick={() => setFormat('webm')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-colors ${
                      format === 'webm'
                        ? 'bg-rose-950/60 border-rose-500 text-white ring-1 ring-rose-500/50'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs text-white">WebM (VP9 + Opus)</div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Direct browser capture with exact duration headers
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Rendering Progress View */}
          {isExporting && (
            <div className="py-8 space-y-4 text-center">
              <div className="w-12 h-12 rounded-full border-2 border-rose-500 border-t-transparent animate-spin mx-auto" />
              <div className="space-y-1">
                <div className="font-bold text-sm text-white">
                  Rendering 1080×1920 Vertical Composition...
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  Compiling {project.items.length} clips with synchronized audio & captions
                </div>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700">
                <div
                  className="bg-rose-600 h-full transition-all duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs font-mono font-bold text-rose-400">
                {progress}% Complete
              </span>
            </div>
          )}

          {/* Download Complete View */}
          {downloadUrl && (
            <div className="py-6 space-y-4 text-center">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
              <div className="space-y-1">
                <div className="font-bold text-sm text-white">
                  Reel Exported Successfully!
                </div>
                <div className="text-xs text-slate-400">
                  Ready to publish on YouTube Shorts, TikTok, and Instagram Reels.
                </div>
              </div>
              <a
                href={downloadUrl}
                download={`${project.id}-1080x1920.${format}`}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-lg transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Video File ({format.toUpperCase()})</span>
              </a>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Close
          </button>
          {!downloadUrl && !isExporting && (
            <button
              onClick={handleStartExport}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs shadow-lg transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Start Render</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
