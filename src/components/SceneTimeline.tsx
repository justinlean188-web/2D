import React from 'react';
import { Play, Clock, Sparkles } from 'lucide-react';
import { ProjectId, PROJECTS, SceneDef } from '../types';

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
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Scene Timeline & Shot Breakdown</h2>
          <p className="text-sm text-slate-400 mt-1">
            Total Duration: 10.0 seconds · 240 frames @ 24 fps · 5 distinct narrative beats
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
                  ? 'bg-slate-900/90 border-rose-500 shadow-lg shadow-rose-950/20'
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Dot on the vertical timeline track */}
              <div
                className={`absolute -left-[31px] top-7 w-3.5 h-3.5 rounded-full border-2 transition-all ${
                  isActive
                    ? 'bg-rose-500 border-white ring-4 ring-rose-500/20'
                    : 'bg-slate-900 border-slate-700 group-hover:border-rose-400'
                }`}
              />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-rose-400">
                    <Clock className="w-3.5 h-3.5" />
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
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Jump To Scene</span>
                </button>
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 text-xs">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/60 space-y-1.5">
                  <div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    Main Character (Stickman)
                  </div>
                  <div className="text-slate-200 leading-relaxed">{scene.characterAction}</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/60 space-y-1.5">
                  <div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    {activeProject === 'paper-ball' ? 'Prop & Physics Action' : 'Shadow Silhouette'}
                  </div>
                  <div className="text-slate-200 leading-relaxed">
                    {activeProject === 'paper-ball' ? scene.propAction : scene.shadowAction}
                  </div>
                </div>
              </div>

              {/* Sound & Punchline banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-800/40 text-xs">
                <div className="text-slate-400">
                  <span className="text-slate-500 font-medium">Audio: </span>
                  <span className="text-slate-300">{scene.soundDesc}</span>
                </div>
                <div className="flex items-center gap-1.5 text-rose-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="font-medium">{scene.punchline}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
