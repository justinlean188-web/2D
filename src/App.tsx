import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { PlayerView } from './components/PlayerView';
import { SceneTimeline } from './components/SceneTimeline';
import { PromptHub } from './components/PromptHub';
import { AudioLab } from './components/AudioLab';
import { ReelStudio } from './components/ReelStudio';
import { StudioConfig, DEFAULT_CONFIG, PROJECTS, ProjectId, SceneDef } from './types';
import { soundEngine, stopVoiceOver } from './audio/soundEngine';
import { ExportModal } from './components/ExportModal';
import { Clapperboard, Trophy } from 'lucide-react';

type Section = 'studio' | 'reels';

const getInitialProject = (): ProjectId => {
  const requested = new URLSearchParams(window.location.search).get('project');
  return requested && requested in PROJECTS
    ? (requested as ProjectId)
    : DEFAULT_CONFIG.activeProject;
};

const REEL_ALIASES = ['reels', 'reel', 'clone-reels', 'clone', 'ranking'];

const getSectionFromUrl = (): Section => {
  const params = new URLSearchParams(window.location.search);
  const requested = (
    params.get('section') ??
    params.get('view') ??
    params.get('tab') ??
    params.get('mode') ??
    ''
  ).toLowerCase();
  if (REEL_ALIASES.includes(requested)) return 'reels';
  if (params.get('reels') === '1' || params.get('reels') === 'true') return 'reels';
  return 'studio';
};

const getInitialSection = (): Section => getSectionFromUrl();

export default function App() {
  const [section, setSection] = useState<Section>(getInitialSection);
  const [activeTab, setActiveTab] = useState<'player' | 'timeline' | 'prompts' | 'audio'>('player');
  const [config, setConfig] = useState<StudioConfig>(() => ({
    ...DEFAULT_CONFIG,
    activeProject: getInitialProject(),
  }));
  const [currentTime, setCurrentTime] = useState<number>(() => {
    const raw = Number(new URLSearchParams(window.location.search).get('t'));
    const duration = PROJECTS[getInitialProject()].duration;
    return Number.isFinite(raw) ? Math.min(duration, Math.max(0, raw)) : 0.0;
  });
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isServerStale, setIsServerStale] = useState<boolean>(false);

  useEffect(() => {
    document.title =
      section === 'reels'
        ? 'Clone Reels — 2D Animation Studio'
        : `${PROJECTS[config.activeProject].title} — 2D Animation Studio`;
  }, [config.activeProject, section]);

  // Write the section into the address bar so the view can be shared or reloaded.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (section === 'reels') {
      url.searchParams.set('section', 'reels');
    } else {
      url.searchParams.delete('section');
    }
    window.history.replaceState({}, '', url.toString());
  }, [section]);

  // A link typed into the address bar, or the back button, switches the section.
  useEffect(() => {
    const sync = () => setSection(getSectionFromUrl());
    window.addEventListener('popstate', sync);
    window.addEventListener('hashchange', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('hashchange', sync);
    };
  }, []);

  // The dev server restarts when the plugin or the config changes. An open
  // tab then keeps the previous bundle, so it is told to reload.
  useEffect(() => {
    let first = true;
    let stamp = '';

    const check = async () => {
      try {
        const response = await fetch('/__reel-ping', { cache: 'no-store' });
        if (!response.ok) return;
        const body = (await response.json()) as { stamp?: string };
        if (!body.stamp) return;

        if (first) {
          first = false;
          stamp = body.stamp;
          return;
        }

        if (body.stamp !== stamp) {
          stamp = body.stamp;
          setIsServerStale(true);
        }
      } catch {
        // The dev server is not running; the page is fine on its own.
      }
    };

    const timer = window.setInterval(check, 4000);
    void check();
    return () => window.clearInterval(timer);
  }, []);

  const handleMuteToggle = (muted: boolean) => {
    setIsMuted(muted);
    soundEngine.setMuted(muted);
    if (muted) {
      stopVoiceOver();
    }
  };

  const handleSelectScene = (scene: SceneDef) => {
    setCurrentTime(scene.timeRange[0]);
    setActiveTab('player');
    setIsPlaying(true);
  };

  const handleOpenExport = () => {
    setIsPlaying(false);
    setIsExportModalOpen(true);
  };

  const handleSectionChange = (next: Section) => {
    setSection(next);
    setIsPlaying(false);
    stopVoiceOver();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      {/* ---------------- Sidebar ---------------- */}
      <aside className="w-60 shrink-0 border-r border-slate-800 bg-slate-900/70 flex flex-col sticky top-0 h-screen">
        <div className="px-5 py-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              2D
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-white leading-tight truncate">
                Animation Studio
              </div>
              <div className="text-[11px] text-slate-400">Vertical short-form tools</div>
            </div>
          </div>
        </div>

        <nav className="p-3 space-y-1">
          <SidebarButton
            active={section === 'studio'}
            onClick={() => handleSectionChange('studio')}
            icon={<Clapperboard className="w-4 h-4" />}
            label="2D Stickman"
            hint="Canvas animation studio"
          />
          <SidebarButton
            active={section === 'reels'}
            onClick={() => handleSectionChange('reels')}
            icon={<Trophy className="w-4 h-4" />}
            label="Clone Reels"
            hint="Ranking countdown reels"
          />
        </nav>

        <div className="mt-auto p-4 border-t border-slate-800 text-[11px] text-slate-500 leading-relaxed">
          <div className="text-slate-400 font-semibold mb-1">How this works</div>
          {section === 'studio'
            ? 'Design a stickman short, then export it at 24 / 30 / 60 fps.'
            : 'Download source videos, trim and rank them, then export the reel with narration.'}
        </div>
      </aside>

      {/* ---------------- Main ---------------- */}
      <div className="flex-1 min-w-0 flex flex-col">
        {isServerStale && (
          <div className="flex items-center justify-between gap-3 px-4 py-2 bg-amber-500/15 border-b border-amber-500/40 text-[12px] text-amber-200">
            <span>
              The dev server restarted, so this tab still runs the previous code. Reload to get
              the latest version.
            </span>
            <button
              onClick={() => window.location.reload()}
              className="px-2.5 py-1 rounded bg-amber-500/25 hover:bg-amber-500/40 text-amber-100 font-semibold transition-colors cursor-pointer"
            >
              Reload
            </button>
          </div>
        )}
        {section === 'studio' ? (
          <>
            {/* Top Bar Navigation (Strict 3-zone contract) */}
            <Header
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              activeProject={config.activeProject}
              setActiveProject={(p) => {
                setIsPlaying(false);
                setCurrentTime(0);
                setConfig({ ...config, activeProject: p });
              }}
              isMuted={isMuted}
              setIsMuted={handleMuteToggle}
              onExportVideo={handleOpenExport}
              isExporting={isExportModalOpen}
            />

            {/* Main Content Area */}
            <main className="flex-1 pb-16">
              {activeTab === 'player' && (
                <PlayerView
                  config={config}
                  setConfig={setConfig}
                  currentTime={currentTime}
                  setCurrentTime={setCurrentTime}
                  isPlaying={isPlaying}
                  setIsPlaying={setIsPlaying}
                  onOpenExport={handleOpenExport}
                />
              )}

              {activeTab === 'timeline' && (
                <SceneTimeline
                  activeProject={config.activeProject}
                  currentTime={currentTime}
                  onSelectScene={handleSelectScene}
                />
              )}

              {activeTab === 'prompts' && <PromptHub activeProject={config.activeProject} />}

              {activeTab === 'audio' && (
                <AudioLab config={config} setConfig={setConfig} />
              )}
            </main>

            {/* Interactive Export Studio Modal with Speed, Format & Preview */}
            <ExportModal
              isOpen={isExportModalOpen}
              onClose={() => setIsExportModalOpen(false)}
              config={config}
            />
          </>
        ) : (
          <>
            <header className="flex items-center justify-between gap-6 px-6 py-4 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 shrink-0">
                  <Trophy className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-sm font-bold text-white truncate">Clone Reels</h1>
                  <p className="text-[11px] text-slate-400 truncate">
                    Ranking countdown reels · 1080×1920 · burned-in captions · spoken narration
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => handleMuteToggle(!isMuted)}
                  title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  {isMuted ? (
                    <svg
                      className="w-4 h-4 text-rose-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M11 5 6 9H2v6h4l5 4z" />
                      <path d="m22 9-6 6M16 9l6 6" />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 text-emerald-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M11 5 6 9H2v6h4l5 4z" />
                      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                      <path d="M18.5 5.5a9 9 0 0 1 0 13" />
                    </svg>
                  )}
                </button>
              </div>
            </header>

            <main className="flex-1 min-h-0">
              <ReelStudio />
            </main>
          </>
        )}

        {/* Clean, Non-slop Footer */}
        <footer className="border-t border-slate-800 py-6 px-6 text-center text-xs text-slate-500">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>
              {section === 'reels'
                ? 'Clone Reels · Ranking Countdown Reels · 1080×1920 (9:16)'
                : config.activeProject !== 'shadow-quit'
                ? `${PROJECTS[config.activeProject].title} · Minimalist 2D Vector Stickman Comedy · 1080×1920 (9:16)`
                : 'What If Your Shadow Quit? · 2D Minimalist Comedy Animation Studio · 9:16 Vertical Safe'}
            </p>
            <div className="flex items-center gap-4 text-slate-400">
              <span>24 fps</span>
              <span>·</span>
              <span>Pure Black & White Vector Art</span>
              <span>·</span>
              <span>Exaggerated Cartoon Physics</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

const SidebarButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  hint: string;
}> = ({ active, onClick, icon, label, hint }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors cursor-pointer ${
      active
        ? 'bg-rose-950/70 text-white ring-1 ring-rose-500/60'
        : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
    }`}
  >
    <span className={active ? 'text-rose-400' : 'text-slate-500'}>{icon}</span>
    <span className="min-w-0">
      <span className="block text-sm font-semibold truncate">{label}</span>
      <span className="block text-[11px] text-slate-500 truncate">{hint}</span>
    </span>
  </button>
);
