import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Camera,
  Maximize2,
  Sliders,
  Grid,
  Volume2,
  VolumeX,
  Download,
} from 'lucide-react';
import { CanvasRenderer } from '../animation/canvasRenderer';
import { PaperBallRenderer } from '../animation/paperBallRenderer';
import { soundEngine, speakVoiceOver, stopVoiceOver } from '../audio/soundEngine';
import { StudioConfig, PROJECTS, SceneDef } from '../types';

interface PlayerViewProps {
  config: StudioConfig;
  setConfig: React.Dispatch<React.SetStateAction<StudioConfig>>;
  currentTime: number;
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>;
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  onOpenExport?: () => void;
}

export const PlayerView: React.FC<PlayerViewProps> = ({
  config,
  setConfig,
  currentTime,
  setCurrentTime,
  isPlaying,
  setIsPlaying,
  onOpenExport,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const shadowRendererRef = useRef<CanvasRenderer>(new CanvasRenderer());
  const paperBallRendererRef = useRef<PaperBallRenderer>(new PaperBallRenderer());
  const [speed, setSpeed] = useState<number>(1.0);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const lastTimeRef = useRef<number>(performance.now());
  const triggeredAudioCues = useRef<Set<string>>(new Set());

  const currentProject = PROJECTS[config.activeProject];
  const projectScenes = currentProject.scenes;

  // Current active scene
  const activeScene =
    projectScenes.find(
      (s) => currentTime >= s.timeRange[0] && currentTime < s.timeRange[1]
    ) || projectScenes[projectScenes.length - 1];

  // Reset audio cues when seeking or starting over
  const resetAudioCues = useCallback((toTime: number) => {
    const cues = triggeredAudioCues.current;
    if (config.activeProject === 'paper-ball') {
      if (toTime < 1.9) cues.delete('toss');
      if (toTime < 4.3) cues.delete('rim');
      if (toTime < 5.9) cues.delete('lamp');
      if (toTime < 7.4) cues.delete('fan');
      if (toTime < 8.5) cues.delete('wall');
      if (toTime < 9.3) cues.delete('bonk');
      if (toTime < 9.5) cues.delete('plop');
    } else {
      if (toTime < 0.3) cues.delete('step1');
      if (toTime < 0.7) cues.delete('step2');
      if (toTime < 1.1) cues.delete('skip');
      if (toTime < 1.9) cues.delete('scratch');
      if (toTime < 4.4) cues.delete('paper');
      if (toTime < 5.0) cues.delete('tap1');
      if (toTime < 5.2) cues.delete('tap2');
      if (toTime < 6.0) cues.delete('thump');
      if (toTime < 6.2) cues.delete('squeak');
      if (toTime < 7.9) cues.delete('trombone');
      if (toTime < 0.1) cues.delete('vo1');
      if (toTime < 7.9) cues.delete('vo2');
    }
  }, [config.activeProject]);

  // Audio triggering checks during playback
  const checkAudioTriggers = useCallback(
    (t: number) => {
      if (!config.enableSFX && !config.enableVoiceOver) return;
      const cues = triggeredAudioCues.current;

      if (config.activeProject === 'paper-ball') {
        if (!config.enableSFX) return;
        if (t >= 2.0 && !cues.has('toss')) {
          soundEngine.playWhoosh();
          cues.add('toss');
        }
        if (t >= 4.4 && !cues.has('rim')) {
          soundEngine.playRimClink();
          cues.add('rim');
        }
        if (t >= 6.0 && !cues.has('lamp')) {
          soundEngine.playLampDing();
          cues.add('lamp');
        }
        if (t >= 7.5 && !cues.has('fan')) {
          soundEngine.playFanWhack();
          cues.add('fan');
        }
        if (t >= 8.6 && !cues.has('wall')) {
          soundEngine.playWallBounce();
          cues.add('wall');
        }
        if (t >= 9.4 && !cues.has('bonk')) {
          soundEngine.playHeadBonk();
          cues.add('bonk');
        }
        if (t >= 9.6 && !cues.has('plop')) {
          soundEngine.playDeskPlop();
          cues.add('plop');
        }
        return;
      }

      // Shadow Quit project audio
      if (config.enableSFX) {
        if (t >= 0.4 && !cues.has('step1')) {
          soundEngine.playFootstep(false);
          cues.add('step1');
        }
        if (t >= 0.8 && !cues.has('step2')) {
          soundEngine.playFootstep(false);
          cues.add('step2');
        }
        if (t >= 1.2 && !cues.has('skip')) {
          soundEngine.playFootstep(true);
          cues.add('skip');
        }
        if (t >= 2.0 && !cues.has('scratch')) {
          soundEngine.playRecordScratch();
          cues.add('scratch');
        }
        if (t >= 4.5 && !cues.has('paper')) {
          soundEngine.playPaperSlap();
          cues.add('paper');
        }
        if (t >= 5.05 && !cues.has('tap1')) {
          soundEngine.playClipboardTap();
          cues.add('tap1');
        }
        if (t >= 5.25 && !cues.has('tap2')) {
          soundEngine.playClipboardTap();
          cues.add('tap2');
        }
        if (t >= 6.1 && !cues.has('thump')) {
          soundEngine.playFloorThump();
          cues.add('thump');
        }
        if (t >= 6.3 && !cues.has('squeak')) {
          soundEngine.playArmCrossSqueak();
          cues.add('squeak');
        }
        if (t >= 8.0 && !cues.has('trombone')) {
          soundEngine.playSadTrombone();
          cues.add('trombone');
        }
      }

      if (config.enableVoiceOver) {
        if (t >= 0.1 && t < 0.3 && !cues.has('vo1')) {
          speakVoiceOver(config.customVO1, {
            rate: config.voiceRate,
            pitch: config.voicePitch,
            volume: config.voiceVolume,
          });
          cues.add('vo1');
        }
        if (t >= 8.0 && t < 8.3 && !cues.has('vo2')) {
          speakVoiceOver(config.customVO2, {
            rate: config.voiceRate,
            pitch: config.voicePitch,
            volume: config.voiceVolume,
          });
          cues.add('vo2');
        }
      }
    },
    [config]
  );

  const currentTimeRef = useRef<number>(currentTime);
  currentTimeRef.current = currentTime;

  // Main animation render loop
  useEffect(() => {
    let animId: number;

    const renderLoop = (now: number) => {
      const delta = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      if (isPlaying) {
        const prev = currentTimeRef.current;
        let nextTime = prev + delta * speed;
        if (nextTime >= 10.0) {
          if (isLooping) {
            nextTime = 0.0;
            resetAudioCues(0.0);
          } else {
            nextTime = 10.0;
            setIsPlaying(false);
          }
        }
        currentTimeRef.current = nextTime;
        setCurrentTime(nextTime);
        checkAudioTriggers(nextTime);
      }

      // Render to canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const t = currentTimeRef.current;
          let renderTime = t;
          if (config.fpsMode === 24) {
            renderTime = Math.floor(t * 24) / 24;
          }

          if (config.activeProject === 'paper-ball') {
            paperBallRendererRef.current.render(ctx, renderTime, config);
          } else {
            shadowRendererRef.current.render(ctx, renderTime, config);
          }
        }
      }

      animId = requestAnimationFrame(renderLoop);
    };

    lastTimeRef.current = performance.now();
    animId = requestAnimationFrame(renderLoop);

    return () => cancelAnimationFrame(animId);
  }, [isPlaying, speed, isLooping, config, checkAudioTriggers, resetAudioCues, setCurrentTime, setIsPlaying]);

  // Spacebar toggle play/pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        seekRelative(-1 / 24);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        seekRelative(1 / 24);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsPlaying]);

  const seekRelative = (deltaSec: number) => {
    setCurrentTime((prev) => {
      const target = Math.max(0, Math.min(10.0, prev + deltaSec));
      resetAudioCues(target);
      return target;
    });
  };

  const jumpToScene = (scene: SceneDef) => {
    setCurrentTime(scene.timeRange[0]);
    resetAudioCues(scene.timeRange[0]);
  };

  const takeSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const prefix = config.activeProject === 'paper-ball' ? 'paper-ball' : 'shadow-quit';
    const link = document.createElement('a');
    link.download = `${prefix}-${currentTime.toFixed(2)}s.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const currentFrame = Math.floor(currentTime * 24);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-4">
        {/* Scene Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {projectScenes.map((s) => {
            const isCur = currentTime >= s.timeRange[0] && currentTime < s.timeRange[1];
            return (
              <button
                key={s.id}
                onClick={() => jumpToScene(s)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  isCur
                    ? 'bg-rose-600 text-white font-semibold shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {s.name}: {s.title}
              </button>
            );
          })}
        </div>

        {/* Studio Overlays & Snapshot */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setConfig({ ...config, showSafeZones: !config.showSafeZones })}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer ${
              config.showSafeZones
                ? 'bg-rose-950/60 text-rose-300 border-rose-500/80'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>9:16 Safe Areas</span>
          </button>

          <button
            onClick={() => setConfig({ ...config, fpsMode: config.fpsMode === 24 ? 60 : 24 })}
            className="px-3 py-1.5 text-xs font-mono bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            title="Toggle authentic 24fps cartoon step vs 60fps interpolation"
          >
            {config.fpsMode} FPS
          </button>

          <button
            onClick={takeSnapshot}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            title="Download 1080x1920 PNG snapshot of current frame"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Snapshot</span>
          </button>

          {onOpenExport && (
            <button
              onClick={onOpenExport}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-lg shadow-sm transition-colors cursor-pointer"
              title="Export 1080x1920 MP4/WebM with custom speed & synchronized audio"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Video</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Stage: Vertical 9:16 Frame + Director Details Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 9:16 Mobile Animation Screen */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="relative w-full max-w-[380px] aspect-[9/16] bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-slate-800 ring-1 ring-slate-700/50">
            {/* Top Phone Camera Notch indicator */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-900 rounded-full z-10 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-700 mr-2" />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
            </div>

            {/* High-Resolution HTML5 Canvas */}
            <canvas
              ref={canvasRef}
              width={1080}
              height={1920}
              className="w-full h-full object-contain select-none cursor-pointer"
              onClick={() => setIsPlaying((p) => !p)}
            />

            {/* In-Frame Pause Indicator overlay if stopped */}
            {!isPlaying && (
              <div
                onClick={() => setIsPlaying(true)}
                className="absolute inset-0 bg-black/10 flex items-center justify-center transition-opacity cursor-pointer group"
              >
                <div className="w-14 h-14 rounded-full bg-black/70 group-hover:bg-rose-600 flex items-center justify-center text-white shadow-lg transition-all transform group-hover:scale-110">
                  <Play className="w-7 h-7 ml-1" />
                </div>
              </div>
            )}
          </div>
          <span className="text-xs text-slate-400 mt-2 font-mono">1080 × 1920 (9:16 Vertical)</span>
        </div>

        {/* Right Column: Interactive Director Desk & Timeline */}
        <div className="lg:col-span-7 space-y-5">
          {/* Active Scene Monitor Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-rose-400">Current Scene Beat</span>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  {activeScene.name}: {activeScene.title}
                </h3>
              </div>
              <div className="text-right font-mono">
                <div className="text-lg font-bold text-rose-400">
                  {currentTime.toFixed(2)}s <span className="text-slate-400 text-xs">/ 10.00s</span>
                </div>
                <div className="text-xs text-slate-400">
                  Frame {currentFrame} <span className="text-slate-400 text-[10px]">/ 240</span>
                </div>
              </div>
            </div>

            {/* Animated Progress Track */}
            <div className="space-y-1.5">
              <input
                type="range"
                min="0"
                max="10"
                step="0.01"
                value={currentTime}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setCurrentTime(val);
                  resetAudioCues(val);
                }}
                className="w-full accent-rose-600 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />

              {/* Scene Cut Marker labels below progress bar */}
              <div className="flex justify-between text-[11px] font-mono text-slate-400 px-0.5">
                <span>0s (Start)</span>
                <span>2s (Quit)</span>
                <span>4s (Complaint)</span>
                <span>6s (Sit-In)</span>
                <span>8s (HR)</span>
                <span>10s</span>
              </div>
            </div>

            {/* Transport Button Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setCurrentTime(0);
                    resetAudioCues(0);
                    setIsPlaying(true);
                  }}
                  title="Restart"
                  className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => seekRelative(-1 / 24)}
                  title="Previous Frame (Left Arrow)"
                  className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Play</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => seekRelative(1 / 24)}
                  title="Next Frame (Right Arrow)"
                  className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsLooping(!isLooping)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                    isLooping
                      ? 'bg-rose-950/60 text-rose-300 border-rose-500/80'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  Loop
                </button>
              </div>

              {/* Playback speed selector */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                {[0.5, 0.75, 1.0, 1.25, 1.5].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`px-2.5 py-1 text-xs font-mono rounded transition-colors cursor-pointer ${
                      speed === s
                        ? 'bg-rose-600 text-white font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title={
                      s === 0.5
                        ? 'Slow-Mo Comedy (0.5x)'
                        : s === 0.75
                        ? 'Relaxed Comedy (0.75x)'
                        : `${s}x Speed`
                    }
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Prompt Sync Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white">Live Pantomime Description</span>
              <span className="text-rose-400 font-mono">Synced to current frame</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-lg border border-slate-800/80 font-mono text-xs">
              {activeScene.videoPrompt}
            </p>
            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/60">
                <div className="text-slate-400 font-medium">Stick Figure Reaction</div>
                <div className="text-slate-200 mt-0.5">{activeScene.characterAction}</div>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/60">
                <div className="text-slate-400 font-medium">
                  {config.activeProject === 'paper-ball' ? 'Prop & Physics Action' : 'Shadow Behavior'}
                </div>
                <div className="text-slate-200 mt-0.5">
                  {config.activeProject === 'paper-ball' ? activeScene.propAction : activeScene.shadowAction}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Audio & Caption Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => {
                if (currentProject.hasAudioDialogue) {
                  setConfig({ ...config, enableVoiceOver: !config.enableVoiceOver });
                }
              }}
              disabled={!currentProject.hasAudioDialogue}
              className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                !currentProject.hasAudioDialogue
                  ? 'bg-slate-950/50 border-slate-900 text-slate-600 cursor-not-allowed opacity-60'
                  : config.enableVoiceOver
                  ? 'bg-slate-900 border-slate-700 text-white cursor-pointer'
                  : 'bg-slate-950 border-slate-800 text-slate-500 cursor-pointer'
              }`}
            >
              <div className="text-left">
                <div className="text-xs font-semibold">Voice-Over</div>
                <div className="text-[11px] text-slate-400">
                  {currentProject.hasAudioDialogue ? 'Deadpan narrator' : 'No dialogue film'}
                </div>
              </div>
              <span
                className={`text-xs font-mono ${
                  !currentProject.hasAudioDialogue
                    ? 'text-slate-600'
                    : config.enableVoiceOver
                    ? 'text-emerald-400'
                    : 'text-slate-600'
                }`}
              >
                {!currentProject.hasAudioDialogue ? 'N/A' : config.enableVoiceOver ? 'ON' : 'OFF'}
              </span>
            </button>

            <button
              onClick={() => setConfig({ ...config, enableSFX: !config.enableSFX })}
              className={`p-3 rounded-xl border flex items-center justify-between transition-colors cursor-pointer ${
                config.enableSFX
                  ? 'bg-slate-900 border-slate-700 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}
            >
              <div className="text-left">
                <div className="text-xs font-semibold">Cartoon SFX</div>
                <div className="text-[11px] text-slate-400">
                  {config.activeProject === 'paper-ball' ? 'Whack, bonk, clink' : 'Scratch, taps, horn'}
                </div>
              </div>
              <span className={`text-xs font-mono ${config.enableSFX ? 'text-emerald-400' : 'text-slate-600'}`}>
                {config.enableSFX ? 'ON' : 'OFF'}
              </span>
            </button>

            <button
              onClick={() => {
                if (currentProject.hasCaptions) {
                  setConfig({ ...config, showCaptions: !config.showCaptions });
                }
              }}
              disabled={!currentProject.hasCaptions}
              className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                !currentProject.hasCaptions
                  ? 'bg-slate-950/50 border-slate-900 text-slate-600 cursor-not-allowed opacity-60'
                  : config.showCaptions
                  ? 'bg-slate-900 border-slate-700 text-white cursor-pointer'
                  : 'bg-slate-950 border-slate-800 text-slate-500 cursor-pointer'
              }`}
            >
              <div className="text-left">
                <div className="text-xs font-semibold">In-Video Captions</div>
                <div className="text-[11px] text-slate-400">
                  {currentProject.hasCaptions ? 'Opening & End-card' : 'No text constraint'}
                </div>
              </div>
              <span
                className={`text-xs font-mono ${
                  !currentProject.hasCaptions
                    ? 'text-slate-600'
                    : config.showCaptions
                    ? 'text-emerald-400'
                    : 'text-slate-600'
                }`}
              >
                {!currentProject.hasCaptions ? 'NONE' : config.showCaptions ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
