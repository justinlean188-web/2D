import React, { useState } from 'react';
import { Copy, Check, Film, Mic, Volume2 } from 'lucide-react';
import { ProjectId, PROJECTS } from '../types';

interface PromptHubProps {
  activeProject: ProjectId;
}

export const PromptHub: React.FC<PromptHubProps> = ({ activeProject }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedMaster, setCopiedMaster] = useState(false);

  const currentProject = PROJECTS[activeProject];
  const scenes = currentProject.scenes;
  const masterPrompt = currentProject.masterPrompt;

  const copyToClipboard = (text: string, index?: number) => {
    navigator.clipboard.writeText(text);
    if (index !== undefined) {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } else {
      setCopiedMaster(true);
      setTimeout(() => setCopiedMaster(false), 2000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Intro */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono text-rose-400">
          <span>Active Project</span>
          <span>·</span>
          <span>{currentProject.title}</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          AI Video Generation Prompts & Production Deck
        </h2>
        <p className="text-sm text-slate-400 max-w-3xl">
          Engineered for generative video models (OpenAI Sora, Runway Gen-3 Alpha, Kling AI, Luma Dream Machine, and Minimax).
          Copy either the single master prompt for unified continuity or the scene-by-scene prompts for shot-by-shot generation.
        </p>
      </div>

      {/* Master Style Prompt Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-rose-500" />
            <h3 className="text-lg font-semibold text-white">Master Prompt & Constraints</h3>
          </div>
          <button
            onClick={() => copyToClipboard(masterPrompt)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            {copiedMaster ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied Full Prompt</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Master Prompt</span>
              </>
            )}
          </button>
        </div>

        <pre className="p-4 bg-slate-950 border border-slate-800/80 rounded-lg text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto">
          {masterPrompt}
        </pre>
      </div>

      {/* Scene by Scene Prompts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Scene-by-Scene Shot Prompts (0.0s – 10.0s)</h3>
          <span className="text-xs text-slate-500">5 individual shots with exact camera & timing</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {scenes.map((scene, idx) => (
            <div key={scene.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-rose-400 font-mono">
                    <span>{scene.name}</span>
                    <span>·</span>
                    <span>{scene.timeRange[0].toFixed(1)}s – {scene.timeRange[1].toFixed(1)}s</span>
                  </div>
                  <h4 className="text-base font-semibold text-white mt-0.5">{scene.title}</h4>
                </div>
                <button
                  onClick={() => copyToClipboard(scene.videoPrompt, idx)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Shot Prompt</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800/60 rounded-lg text-xs font-mono text-slate-300 leading-relaxed">
                {scene.videoPrompt}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
                <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/40">
                  <div className="text-slate-400 font-medium mb-1">Character Action</div>
                  <div className="text-slate-300">{scene.characterAction}</div>
                </div>
                <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/40">
                  <div className="text-slate-400 font-medium mb-1">
                    {activeProject === 'paper-ball' ? 'Prop & Physics Action' : 'Shadow Action'}
                  </div>
                  <div className="text-slate-300">
                    {activeProject === 'paper-ball' ? scene.propAction : scene.shadowAction}
                  </div>
                </div>
                <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/40">
                  <div className="text-slate-400 font-medium mb-1">Sound Cue & Punchline</div>
                  <div className="text-slate-300">{scene.soundDesc} · {scene.punchline}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editing & Sound Specs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {activeProject === 'paper-ball' ? (
          <>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-rose-500" />
                <h4 className="text-sm font-semibold text-white">Visual & Animation Constraints</h4>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
                <li><strong className="text-white">Strict rule:</strong> No dialogue, no captions, no text, no watermark.</li>
                <li><strong className="text-white">Colors:</strong> Flat colors only, no gradients, no realistic textures, no 3D rendering.</li>
                <li><strong className="text-white">Props:</strong> Crumpled white paper ball, small black trash can, table lamp, ceiling fan.</li>
                <li><strong className="text-white">Physics:</strong> Exaggerated cartoon physics, snappy timing, elastic motion, fast ball tracking, satisfying ricochets, deadpan comedic expressions.</li>
              </ul>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-rose-500" />
                <h4 className="text-sm font-semibold text-white">Acoustic Cartoon Timing</h4>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
                <li><strong className="text-white">2.2s:</strong> Snappy toss release whoosh.</li>
                <li><strong className="text-white">3.8s:</strong> Metallic trash can rim clink.</li>
                <li><strong className="text-white">4.6s:</strong> Resonant brass table lamp ding.</li>
                <li><strong className="text-white">6.0s:</strong> Violent ceiling fan blade WHACK.</li>
                <li><strong className="text-white">7.7s:</strong> Classic hollow forehead cartoon bonk (*dook*).</li>
                <li><strong className="text-white">8.1s–10.0s:</strong> Soft desk plop followed by total deadpan silence.</li>
              </ul>
            </div>
          </>
        ) : (
          <>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-rose-500" />
                <h4 className="text-sm font-semibold text-white">Voice-Over Direction</h4>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
                <li><strong className="text-white">0.0–2.0s:</strong> "What if your shadow quit?"</li>
                <li><strong className="text-white">8.0–9.5s:</strong> "HR has been notified."</li>
                <li><strong className="text-white">Voice:</strong> Neutral adult voice, calm documentary delivery, slightly bored, deadpan.</li>
              </ul>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-rose-500" />
                <h4 className="text-sm font-semibold text-white">Audio & Editing Design</h4>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
                <li><strong className="text-white">Footstep pops:</strong> Two soft pops + one cheerful skip blip.</li>
                <li><strong className="text-white">Record scratch:</strong> Sharp comedic needle rip at 2.0s.</li>
                <li><strong className="text-white">Sad trombone:</strong> Mournful wah-wah-wah-waaah during thumbs-down.</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

