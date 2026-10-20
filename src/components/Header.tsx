import React from 'react';
import { Video, Sparkles, Download, Volume2, VolumeX } from 'lucide-react';

interface HeaderProps {
  activeTab: 'player' | 'timeline' | 'prompts' | 'audio';
  setActiveTab: (tab: 'player' | 'timeline' | 'prompts' | 'audio') => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  onExportVideo: () => void;
  isExporting: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isMuted,
  setIsMuted,
  onExportVideo,
  isExporting,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-4 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
          SQ
        </div>
        <span className="text-base font-bold tracking-tight text-white whitespace-nowrap shrink-0">
          Shadow Quit Studio
        </span>
      </div>

      {/* Zone 2: 4 clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
        <button
          onClick={() => setActiveTab('player')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'player' ? 'text-white font-semibold' : ''
          }`}
        >
          Animation Player
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'timeline' ? 'text-white font-semibold' : ''
          }`}
        >
          Scene Timeline
        </button>
        <button
          onClick={() => setActiveTab('prompts')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'prompts' ? 'text-white font-semibold' : ''
          }`}
        >
          AI Video Prompts
        </button>
        <button
          onClick={() => setActiveTab('audio')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'audio' ? 'text-white font-semibold' : ''
          }`}
        >
          Sound & Voice Design
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => setIsMuted(!isMuted)}
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>
        <button
          onClick={onExportVideo}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:bg-slate-700 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {isExporting ? (
            <>
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Rendering 10s MP4...</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5" />
              <span>Export 10s Video</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
