import React, { useState } from 'react';
import { Header } from './components/Header';
import { PlayerView } from './components/PlayerView';
import { SceneTimeline } from './components/SceneTimeline';
import { PromptHub } from './components/PromptHub';
import { AudioLab } from './components/AudioLab';
import { StudioConfig, DEFAULT_CONFIG, SCENES, SceneDef } from './types';
import { soundEngine, stopVoiceOver } from './audio/soundEngine';
import { ExportModal } from './components/ExportModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'player' | 'timeline' | 'prompts' | 'audio'>('player');
  const [config, setConfig] = useState<StudioConfig>(DEFAULT_CONFIG);
  const [currentTime, setCurrentTime] = useState<number>(0.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
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

      {/* Clean, Non-slop Footer */}
      <footer className="border-t border-slate-800 py-6 px-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            {config.activeProject === 'paper-ball'
              ? 'The Paper Ball Ricochet · Minimalist 2D Vector Stickman Comedy · 1080×1920 (9:16)'
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
  );
}
