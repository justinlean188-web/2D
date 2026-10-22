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
    <header className="flex items-center justify-between gap-8 px-6 py-4 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      {/* Zone 1: Single text element wordmark with clean project switch */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
          2D
        </div>
        <div className="relative">
          <select
            value={activeProject}
            onChange={(e) => setActiveProject(e.target.value as ProjectId)}
            className="appearance-none bg-slate-950 hover:bg-slate-800 text-white font-bold text-sm pl-3 pr-8 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-rose-500 cursor-pointer transition-colors"
          >
            {Object.values(PROJECTS).map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
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
