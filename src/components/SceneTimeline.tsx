import React from 'react';
import { Play, Clock, Sparkles } from 'lucide-react';
import { ProjectId, PROJECTS, SceneDef, isPaperBallProject } from '../types';

interface SceneTimelineProps {
  activeProject: ProjectId;
  currentTime: number;
  onSelectScene: (scene: SceneDef) => void;
}

export const SceneTimeline: React.FC<SceneTimelineProps> = ({
  activeProject,
  currentTime,
  onSelectScene,
}) => {
  const currentProject = PROJECTS[activeProject];
  const scenes = currentProject.scenes;
  const duration = currentProject.duration;
  const frameCount = Math.round(duration * 24);
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Scene Timeline & Shot Breakdown</h2>
          <p className="text-sm text-slate-400 mt-1">
            Total Duration: {duration.toFixed(1)} seconds · {frameCount} frames @ 24 fps · {scenes.length} distinct narrative beats
          </p>
        </div>
      </div>

      <div className="relative border-l border-slate-800 ml-4 pl-6 space-y-8">
        {scenes.map((scene) => {
          const isActive =
            currentTime >= scene.timeRange[0] && currentTime < scene.timeRange[1];

          return (
            <div
              key={scene.id}
              className={`relative group p-6 rounded-xl border transition-all ${
                isActive
                  ? 'bg-zinc-900 border-white shadow-lg shadow-black/40 ring-1 ring-white/10'
                  : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {/* Dot on the vertical timeline track */}
              <div
                className={`absolute -left-[31px] top-7 w-3.5 h-3.5 rounded-full border-2 transition-all ${
                  isActive
                    ? 'bg-white border-zinc-950 ring-4 ring-white/20'
                    : 'bg-zinc-900 border-zinc-700 group-hover:border-zinc-400'
                }`}
              />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                    <Clock className="w-3.5 h-3.5 text-zinc-300" />
                    <span>
                      {scene.timeRange[0].toFixed(1)}s – {scene.timeRange[1].toFixed(1)}s
                    </span>
                    <span>·</span>
                    <span>Frame {Math.round(scene.timeRange[0] * 24)} – {Math.round(scene.timeRange[1] * 24)}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">
                    {scene.name}: {scene.title}
                  </h3>
                </div>

                <button
                  onClick={() => onSelectScene(scene)}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-white text-zinc-950 shadow-sm hover:bg-zinc-200'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                  }`}
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Jump To Scene</span>
                </button>
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 text-xs">
                <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800/60 space-y-1.5">
                  <div className="text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                    Main Character (Stickman)
                  </div>
                  <div className="text-zinc-200 leading-relaxed">{scene.characterAction}</div>
                </div>

                <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800/60 space-y-1.5">
                  <div className="text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                    {isPaperBallProject(activeProject) ? 'Prop & Physics Action' : 'Shadow Silhouette'}
                  </div>
                  <div className="text-zinc-200 leading-relaxed">
                    {isPaperBallProject(activeProject) ? scene.propAction : scene.shadowAction}
                  </div>
                </div>
              </div>

              {/* Sound & Punchline banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-4 pt-3 border-t border-zinc-800/40 text-xs">
                <div className="text-zinc-400">
                  <span className="text-zinc-500 font-medium">Audio: </span>
                  <span className="text-zinc-300">{scene.soundDesc}</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                  <span className="font-semibold">{scene.punchline}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
