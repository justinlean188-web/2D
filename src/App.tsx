import React, { useState } from 'react';
import { Header } from './components/Header';
import { PlayerView } from './components/PlayerView';
import { SceneTimeline } from './components/SceneTimeline';
import { PromptHub } from './components/PromptHub';
import { AudioLab } from './components/AudioLab';
import { StudioConfig, DEFAULT_CONFIG, SCENES, SceneDef } from './types';
import { soundEngine, stopVoiceOver } from './audio/soundEngine';
import { exportVideo } from './utils/exportVideo';

export default function App() {
  const [activeTab, setActiveTab] = useState<'player' | 'timeline' | 'prompts' | 'audio'>('player');
  const [config, setConfig] = useState<StudioConfig>(DEFAULT_CONFIG);
  const [currentTime, setCurrentTime] = useState<number>(0.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);

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

  const handleExport = async () => {
    if (isExporting) return;
    setIsPlaying(false);
    setIsExporting(true);
    setExportProgress(0);

    try {
      await exportVideo(config, (progress) => {
        setExportProgress(progress);
      });
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar Navigation (Strict 3-zone contract) */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMuted={isMuted}
        setIsMuted={handleMuteToggle}
        onExportVideo={handleExport}
        isExporting={isExporting}
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
          />
        )}

        {activeTab === 'timeline' && (
          <SceneTimeline
            currentTime={currentTime}
            onSelectScene={handleSelectScene}
          />
        )}

        {activeTab === 'prompts' && <PromptHub />}

        {activeTab === 'audio' && (
          <AudioLab config={config} setConfig={setConfig} />
        )}
      </main>

      {/* Exporting Progress Toast */}
      {isExporting && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-rose-500 rounded-xl p-4 shadow-2xl flex items-center gap-4 max-w-sm">
          <div className="w-10 h-10 rounded-full bg-rose-950 flex items-center justify-center text-rose-400 font-mono text-xs font-bold shrink-0">
            {exportProgress}%
          </div>
          <div className="space-y-1">
            <div className="text-xs font-semibold text-white">Rendering 10s MP4 Animation</div>
            <div className="w-48 bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-rose-500 h-full transition-all duration-150"
                style={{ width: `${exportProgress}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400">1080 × 1920 · 240 frames @ 24 fps</div>
          </div>
        </div>
      )}

      {/* Clean, Non-slop Footer */}
      <footer className="border-t border-slate-800 py-6 px-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            What If Your Shadow Quit? · 2D Minimalist Comedy Animation Studio · 9:16 Vertical Safe
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>24 fps</span>
            <span>·</span>
            <span>Pure Black & White with Soft Red Accent</span>
            <span>·</span>
            <span>Absurd Workplace Comedy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
