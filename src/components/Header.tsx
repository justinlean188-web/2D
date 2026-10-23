import React from 'react';
import { Sparkles, Download, Volume2, VolumeX, ChevronDown } from 'lucide-react';
import { ProjectId, PROJECTS } from '../types';

interface HeaderProps {
  activeTab: 'player' | 'timeline' | 'prompts' | 'audio';
  setActiveTab: (tab: 'player' | 'timeline' | 'prompts' | 'audio') => void;
  activeProject: ProjectId;
  setActiveProject: (p: ProjectId) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  onExportVideo: () => void;
  isExporting: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  activeProject,
  setActiveProject,
  isMuted,
  setIsMuted,
  onExportVideo,
  isExporting,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-4 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 sticky top-0 z-50">
      {/* Zone 1: Single text element wordmark with clean project switch and monochrome badge */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-zinc-950 font-black text-sm shadow-sm">
          2D
        </div>
        <div className="relative">
          <select
            value={activeProject}
            onChange={(e) => setActiveProject(e.target.value as ProjectId)}
            className="appearance-none bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-sm pl-3 pr-8 py-1.5 rounded-lg border border-zinc-700 focus:outline-none focus:border-white cursor-pointer transition-colors"
          >
            {Object.values(PROJECTS).map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        <span className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono text-zinc-300 bg-zinc-900/90 border border-zinc-700/80 rounded-md">
          <span className="w-1.5 h-1.5 rounded-full bg-white" />
          Minimalist Monochrome
        </span>
      </div>

      {/* Zone 2: 4 clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
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
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-zinc-400" /> : <Volume2 className="w-4 h-4 text-white" />}
        </button>
        <button
          onClick={onExportVideo}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-zinc-950 bg-white hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-500 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {isExporting ? (
            <>
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Export Studio Open...</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5" />
              <span>Export Video</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
