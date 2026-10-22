import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Scissors, SkipBack, SkipForward, Crosshair, AlertTriangle } from 'lucide-react';
import { RankingVideoClip, RankingItem } from '../reels/rankingData';
import { isLocalFile, isPageUrl, looksLikeMedia } from '../reels/videoSources';

interface ClipEditorProps {
  item: RankingItem;
  clip: RankingVideoClip;
  onChange: (clip: RankingVideoClip) => void;
  /** Jump the main preview to where this clip plays in the reel. */
  onPlayInReel?: () => void;
}

type LoadState = 'loading' | 'ok' | 'nocors' | 'failed';

const fmt = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00.0';
  const m = Math.floor(seconds / 60);
  const s = seconds - m * 60;
  return `${m}:${s.toFixed(1).padStart(4, '0')}`;
};

/**
 * A trimmer for one merged clip: it previews the video straight from the URL
 * and lets the in point, the out point and the on-screen length be set by
 * hand.
 *
 * Cross-origin clips are tried with `crossOrigin` first so they can be drawn
 * into the canvas and captured by the export. If the host refuses the request
 * the clip is retried without it: the video still plays in the preview, but the
 * renderer has to fall back to a placeholder for that clip.
 */
export const ClipEditor: React.FC<ClipEditorProps> = ({
  item,
  clip,
  onChange,
  onPlayInReel,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [state, setState] = useState<LoadState>('loading');
  const retriedRef = useRef(false);

  // A URL without protocol or leading slash is normalized to local /source-videos/
  const normalizedUrl = React.useMemo(() => {
    const raw = (clip.url || '').trim();
    if (!raw) return '';
    if (
      raw.startsWith('http://') ||
      raw.startsWith('https://') ||
      raw.startsWith('blob:') ||
      raw.startsWith('data:') ||
      raw.startsWith('/')
    ) {
      return raw;
    }
    return `/source-videos/${raw}`;
  }, [clip.url]);

  // A new URL reloads the element from the top.
  useEffect(() => {
    setTime(0);
    setPlaying(false);
    setState('loading');
    retriedRef.current = false;
    const el = videoRef.current;
    if (el) {
      el.pause();
      el.currentTime = 0;
      el.setAttribute('crossorigin', 'anonymous');
      if (normalizedUrl) {
        el.src = normalizedUrl;
        el.load();
      }
    }
  }, [normalizedUrl]);

  // The trim range is clamped to the source.
  useEffect(() => {
    if (!duration) return;
    const start = Math.min(clip.start, Math.max(0, duration - 0.1));
    const end = Math.min(Math.max(clip.end, start + 0.1), duration);
    if (start !== clip.start || end !== clip.end) {
      onChange({ ...clip, start, end });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  const handleError = () => {
    const el = videoRef.current;
    if (el && el.getAttribute('crossorigin') === 'anonymous' && !retriedRef.current) {
      // The host did not allow the cross-origin read. Play it anyway.
      retriedRef.current = true;
      el.removeAttribute('crossorigin');
      el.load();
      setState('nocors');
      return;
    }
    setState('failed');
  };

  const toggle = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      el.play().catch(() => setState('failed'));
      setPlaying(true);
    } else {
      el.pause();
      setPlaying(false);
    }
  };

  const seek = (value: number) => {
    const el = videoRef.current;
    const clamped = Math.max(0, Math.min(duration || 0, value));
    setTime(clamped);
    if (el) el.currentTime = clamped;
  };

  const setStart = () => onChange({ ...clip, start: Number(time.toFixed(2)) });
  const setEnd = () => onChange({ ...clip, end: Number(time.toFixed(2)) });
  const setLength = (value: number) =>
    onChange({ ...clip, length: Math.max(0.2, Number(value.toFixed(2))) });

  const rangeStart = duration ? (clip.start / duration) * 100 : 0;
  const rangeEnd = duration ? (clip.end / duration) * 100 : 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button
          onClick={toggle}
          disabled={state === 'failed'}
          className="w-8 h-8 shrink-0 rounded-full bg-sky-500 hover:bg-sky-400 disabled:bg-slate-700 text-slate-950 flex items-center justify-center transition-colors cursor-pointer"
          title={playing ? 'Pause' : 'Play'}
        >
          {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
        </button>
        <button
          onClick={() => seek(clip.start)}
          disabled={state === 'failed'}
          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
          title="Jump to the in point"
        >
          <SkipBack className="w-4 h-4" />
        </button>
        <button
          onClick={() => seek(clip.end)}
          disabled={state === 'failed'}
          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
          title="Jump to the out point"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        <input
          type="range"
          min={0}
          max={duration || 1}
          step={0.05}
          value={Math.min(time, duration || 1)}
          onChange={(e) => seek(Number(e.target.value))}
          disabled={state === 'failed'}
          className="flex-1 accent-sky-500 disabled:opacity-40"
        />
        <span className="text-[11px] font-mono text-slate-300 whitespace-nowrap w-28 text-right">
          {state === 'failed' ? '--:--' : `${fmt(time)} / ${fmt(duration)}`}
        </span>
      </div>

      {/* The trim range over the source. */}
      <div className="relative h-2 rounded-full bg-slate-800 overflow-hidden">
        <div
          className="absolute inset-y-0 bg-sky-500/40"
          style={{ left: `${rangeStart}%`, width: `${Math.max(0, rangeEnd - rangeStart)}%` }}
        />
        <div className="absolute inset-y-0 w-0.5 bg-sky-300" style={{ left: `${rangeStart}%` }} />
        <div className="absolute inset-y-0 w-0.5 bg-sky-300" style={{ left: `${rangeEnd}%` }} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={setStart}
          disabled={state === 'failed'}
          className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-md transition-colors cursor-pointer"
        >
          <Scissors className="w-3 h-3" />
          <span>Set start ({fmt(clip.start)})</span>
        </button>
        <button
          onClick={setEnd}
          disabled={state === 'failed'}
          className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-md transition-colors cursor-pointer"
        >
          <Scissors className="w-3 h-3" />
          <span>Set end ({fmt(clip.end)})</span>
        </button>
        <label className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <Crosshair className="w-3 h-3" />
          On screen
          <input
            type="number"
            min={0.2}
            step={0.1}
            value={clip.length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-16 px-2 py-1 text-[11px] bg-slate-950 border border-slate-700 rounded-md text-white focus:outline-none focus:border-sky-500 font-mono"
          />
          s
        </label>
        {onPlayInReel && (
          <button
            onClick={onPlayInReel}
            className="px-2.5 py-1 text-[11px] font-semibold text-slate-950 bg-sky-500 hover:bg-sky-400 rounded-md transition-colors cursor-pointer"
          >
            Play in reel
          </button>
        )}
        {isLocalFile(clip.url) && (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-950/50 border border-emerald-900/60 rounded px-1.5 py-0.5">
            Local file
          </span>
        )}
        <span className="text-[11px] text-slate-500 truncate">
          #{String(item.rank).padStart(2, '0')} · {item.video?.title?.trim() || item.name}
        </span>
      </div>

      {state === 'failed' && (
        <p className="flex items-start gap-2 text-[11px] text-rose-300">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-px" />
          <span>
            {isPageUrl(clip.url) ? (
              <>
                Page links like this cannot be merged. The reel has to draw the clip onto the
                canvas and the export has to capture that canvas, and a video page will not hand
                over its pixels. Either download the clip and pick it with <strong>Choose a
                file</strong>, or use a direct <span className="font-mono">.mp4</span> /{' '}
                <span className="font-mono">.webm</span> link from a host that allows
                cross-origin reads.
              </>
            ) : (
              <>
                This URL could not be played. It has to be a direct video file (…/clip.mp4), not a
                page link — open the page, copy the file address, and paste that. A local file is
                checked when you pick it, so a file that reaches this point is usually a broken
                link rather than a bad file.
              </>
            )}
          </span>
        </p>
      )}

      {state === 'nocors' && (
        <p className="flex items-start gap-2 text-[11px] text-amber-300">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-px" />
          <span>
            The host does not allow cross-origin reads, so this clip plays here but cannot be
            drawn into the canvas — the export will use a placeholder frame for it. Download the
            file into <span className="font-mono">public/samples/</span> (or any CORS-enabled host)
            to include the real footage.
          </span>
        </p>
      )}

      {state === 'loading' && normalizedUrl && !looksLikeMedia(normalizedUrl) && (
        <p className="text-[11px] text-slate-500">
          That looks like a page link rather than a direct video file. Use a link that ends in
          .mp4 / .webm (or a signed media URL).
        </p>
      )}

      <video
        ref={videoRef}
        src={normalizedUrl}
        crossOrigin="anonymous"
        muted
        playsInline
        preload="metadata"
        className="hidden"
        onLoadedMetadata={(e) => {
          setDuration(e.currentTarget.duration || 0);
          setState((s) => (s === 'loading' ? 'ok' : s));
        }}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onError={handleError}
        onEnded={() => setPlaying(false)}
      />
    </div>
  );
};
