import React, { useState } from 'react';
import { Copy, Check, Youtube, Hash, Image } from 'lucide-react';
import { ProjectDef, getProjectYouTubeMeta } from '../types';

interface YouTubeMetaCardProps {
  project: ProjectDef;
  compact?: boolean;
}

type CopyField = 'title' | 'thumbnail' | 'hashtags' | 'all';

export const YouTubeMetaCard: React.FC<YouTubeMetaCardProps> = ({ project, compact = false }) => {
  const [copiedField, setCopiedField] = useState<CopyField | null>(null);
  const meta = getProjectYouTubeMeta(project);

  const copyText = async (text: string, field: CopyField) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopiedField(field);
    window.setTimeout(() => {
      setCopiedField((prev) => (prev === field ? null : prev));
    }, 1800);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
            <Youtube className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white leading-tight">
              YouTube Title & Shorts Copy
            </h4>
            <p className="text-[11px] text-zinc-400">
              One-click copy for uploading this short
            </p>
          </div>
        </div>

        <button
          onClick={() => copyText(`${meta.title}\n\n${meta.hashtags}`, 'all')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 transition-colors cursor-pointer shrink-0"
        >
          {copiedField === 'all' ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700">Copied Title + Tags</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Title + Tags</span>
            </>
          )}
        </button>
      </div>

      {/* Title Row */}
      <div className="flex items-center justify-between gap-3 p-3 bg-zinc-950 rounded-lg border border-zinc-800/80">
        <div className="min-w-0">
          <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
            YouTube Title
          </div>
          <div className="text-sm font-bold text-white truncate mt-0.5">{meta.title}</div>
        </div>
        <button
          onClick={() => copyText(meta.title, 'title')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-md transition-colors cursor-pointer shrink-0"
          title="Copy YouTube title"
        >
          {copiedField === 'title' ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Title</span>
            </>
          )}
        </button>
      </div>

      {/* Thumbnail & Hashtags */}
      <div className={`grid gap-3 ${compact ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2'}`}>
        <div className="flex items-center justify-between gap-2.5 p-2.5 bg-zinc-950 rounded-lg border border-zinc-800/80">
          <div className="min-w-0">
            <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              <Image className="w-3 h-3" />
              <span>Thumbnail Text</span>
            </div>
            <div className="text-xs font-bold text-amber-300 truncate mt-0.5">{meta.thumbnail}</div>
          </div>
          <button
            onClick={() => copyText(meta.thumbnail, 'thumbnail')}
            className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded transition-colors cursor-pointer shrink-0"
          >
            {copiedField === 'thumbnail' ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        <div className="flex items-center justify-between gap-2.5 p-2.5 bg-zinc-950 rounded-lg border border-zinc-800/80">
          <div className="min-w-0">
            <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              <Hash className="w-3 h-3" />
              <span>Hashtags</span>
            </div>
            <div className="text-xs font-mono text-zinc-300 truncate mt-0.5">{meta.hashtags}</div>
          </div>
          <button
            onClick={() => copyText(meta.hashtags, 'hashtags')}
            className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded transition-colors cursor-pointer shrink-0"
          >
            {copiedField === 'hashtags' ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
