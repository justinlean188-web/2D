import React, { useState } from 'react';
import { Copy, Check, Film, Mic, Volume2 } from 'lucide-react';
import { ProjectId, PROJECTS, isPaperBallProject } from '../types';

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
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
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
            <Film className="w-5 h-5 text-zinc-300" />
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
          <h3 className="text-lg font-semibold text-white">
            Scene-by-Scene Shot Prompts (0.0s – {currentProject.duration.toFixed(1)}s)
          </h3>
          <span className="text-xs text-slate-500">
            {scenes.length} individual shots with exact camera & timing
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {scenes.map((scene, idx) => (
            <div key={scene.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
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
                    {isPaperBallProject(activeProject) || activeProject === 'dart-shot' || activeProject === 'coin-flip'
                      ? 'Prop & Physics Action'
                      : 'Shadow Action'}
                  </div>
                  <div className="text-slate-300">
                    {isPaperBallProject(activeProject) || activeProject === 'dart-shot' || activeProject === 'coin-flip'
                      ? scene.propAction
                      : scene.shadowAction}
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
        {activeProject === 'coin-flip' ? (
          <>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-zinc-300" />
                <h4 className="text-sm font-semibold text-white">Coin-Flip Continuity Constraints</h4>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
                <li><strong className="text-white">Strict rule:</strong> One white room, one gold coin, one clear glass of water, one table, three books, one ruler, one spoon, one wall clock, one table lamp and one chair. No extra characters, no second stickman, no cutaways.</li>
                <li><strong className="text-white">Format:</strong> 30 seconds, 1080×1920 vertical 9:16, 24 fps, pure white room with a soft grey ground shadow.</li>
                <li><strong className="text-white">Colour:</strong> Black and white only, plus the flat gold coin, the pale blue water and the gold halo on the captions.</li>
                <li><strong className="text-white">Camera:</strong> Medium-wide shots, quick punch-in zooms on the face and the glass, a short low-angle stomp and brief impact shakes.</li>
                <li><strong className="text-white">The glass:</strong> Upright on the table, one-third full, until 26.5s. It wobbles, hops and tips over his head at 27.1s, dumps the water, then lies on its side on the table. The coin must be visibly inside it after the 23.45s splash.</li>
                <li><strong className="text-white">The coin:</strong> Exactly one. Held, flicked, returned, dropped, launched, flicked again, ricocheted and finally landed on his head. It is never duplicated.</li>
                <li><strong className="text-white">Captions:</strong> Six bold white captions with a heavy black outline and a gold halo, burned in at the bottom of the frame.</li>
                <li><strong className="text-white">Ending:</strong> The last half-second is a motionless still, then a real black frame at 29.75s.</li>
              </ul>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-zinc-300" />
                <h4 className="text-sm font-semibold text-white">Coin-Flip SFX Map</h4>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
                <li><strong className="text-white">0.0s - 4.1s:</strong> Confident whistle, a sparkle, a smug strut score and a flick whoosh.</li>
                <li><strong className="text-white">4.12s - 7.5s:</strong> The coin returns, a metallic rim ting, a cartoon BONK, a coin drop, half a beat of dead silence, a twitch squeak and a footstep.</li>
                <li><strong className="text-white">8.4s - 14.1s:</strong> Three book thumps, a ruler tap, two mechanical clicks, the coin pick, the rubber-band pull, the launch, the loop whoosh, a soft shoe plop and the launcher clatter.</li>
                <li><strong className="text-white">14.1s - 19.3s:</strong> A low rumble, three stomping footsteps, a growl, a heavy foot stomp, a deep breath, a huge wind-up whoosh and the final throw.</li>
                <li><strong className="text-white">19.5s - 25.0s:</strong> Clock bounce, lamp ding, lamp-loop whoosh, the book bounce, a water splash and a DING on the winning drop, then a gasp.</li>
                <li><strong className="text-white">25.0s - 30.0s:</strong> Victory fanfare and a cheer, the wobbling glass, a big water splash on his head, a tiny coin ting, a record scratch and a low rumble under the final still.</li>
              </ul>
            </div>
          </>
        ) : activeProject === 'dart-shot' ? (
          <>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-zinc-300" />
                <h4 className="text-sm font-semibold text-white">Dart-Shot Continuity Constraints</h4>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
                <li><strong className="text-white">Strict rule:</strong> One white room, one dartboard, three darts, three books, one ruler, one spoon, one wall clock, one table lamp, one table and one chair. No extra characters, no second stickman, no cutaways.</li>
                <li><strong className="text-white">Format:</strong> 30 seconds, 1080×1920 vertical 9:16, 24 fps, pure white room with a soft grey ground shadow.</li>
                <li><strong className="text-white">Camera:</strong> Medium-wide shots, quick punch-in zooms on the face, a short low-angle wind-up and brief impact shakes. The board and the character stay readable in every shot.</li>
                <li><strong className="text-white">The board:</strong> Fixed on the right wall until 26.45s, when the mount gives way and it drops over his head like a helmet. Its bullseye dart is plucked out at 25.55s.</li>
                <li><strong className="text-white">The darts:</strong> Exactly three, each with a red flight. Dart one sticks in the noticeboard, dart two sticks in his own head, dart three lands in the bullseye and is the one he plucks and flicks away.</li>
                <li><strong className="text-white">Captions:</strong> Six bold white captions with a heavy black outline and a red halo, burned in at the bottom of the frame.</li>
                <li><strong className="text-white">Ending:</strong> The last half-second is a motionless still, then a real black frame at 29.75s.</li>
              </ul>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-zinc-300" />
                <h4 className="text-sm font-semibold text-white">Dart-Shot SFX Map</h4>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
                <li><strong className="text-white">0.0s - 4.1s:</strong> Confident whistle, a tiny sparkle, a smug pizzicato bed and one confident ding.</li>
                <li><strong className="text-white">4.2s - 7.5s:</strong> Throw whoosh, a soft cork THUNK, half a beat of dead silence, one eyebrow-tick squeak, then the tension starts.</li>
                <li><strong className="text-white">8.4s - 13.9s:</strong> Three book thumps, a ruler tap, mechanical clicks, a rubber-band twang, a launch whoosh, the loop whistle, a tiny head impact, a plop and the clatter of the launcher.</li>
                <li><strong className="text-white">14.1s - 19.3s:</strong> Low growl and rising tension, a heavy stomp, a deep breath, a huge wind-up whoosh and a dramatic throw.</li>
                <li><strong className="text-white">19.35s - 25.0s:</strong> Clock bounce, lamp ding, chair plop, three fast boings through the ricochet, a slow-motion shimmer, a DING on the bullseye and a gasp.</li>
                <li><strong className="text-white">25.0s - 30.0s:</strong> Victory fanfare and a cheer, the creak of the mount, a heavy cartoon BONK, a footstep, a chair thump, a record scratch and a low rumble under the final still.</li>
              </ul>
            </div>
          </>
        ) : activeProject === 'ping-pong-revenge' ? (
          <>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-zinc-300" />
                <h4 className="text-sm font-semibold text-white">One-Room Continuity Constraints</h4>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
                <li><strong className="text-white">Strict rule:</strong> One room, one table, one cup, one ball, three books, one lamp. No extra props, no second ball, no cutaways.</li>
                <li><strong className="text-white">Format:</strong> 30 seconds, 1080×1920 vertical 9:16, 24 fps, pure white room with a subtle grey ground shadow.</li>
                <li><strong className="text-white">Camera:</strong> Mostly locked-off medium-wide. Only quick punch-in zooms on his face and the cup, plus very short impact shakes — the character and the props must stay visible.</li>
                <li><strong className="text-white">The cup:</strong> It lands upright on his head in scene five and stays there through the celebration, then slips down over his face like a helmet for the final gag.</li>
                <li><strong className="text-white">The ball:</strong> The drop into the cup must be clearly visible, and in the last shot the same ball rolls slowly across the floor.</li>
                <li><strong className="text-white">Captions:</strong> Six bold orange captions with a heavy black outline, burned in at the bottom of the frame.</li>
              </ul>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-zinc-300" />
                <h4 className="text-sm font-semibold text-white">Ping-Pong SFX Map</h4>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
                <li><strong className="text-white">0.0s - 3.9s:</strong> Smug comedy score, a confident ding, a cup sparkle and one light table bounce.</li>
                <li><strong className="text-white">4.05s - 8.0s:</strong> Throw whoosh, hard wall bounce, forehead bonk, half a second of dead silence, then a squeaky accusation.</li>
                <li><strong className="text-white">8.35s - 13.0s:</strong> Three book thumps, three measuring beeps, the proud click, a launch whoosh, the top-book bounce and a pained squeak.</li>
                <li><strong className="text-white">13.0s - 18.0s:</strong> Books clatter, a rumble builds under the tremble, a heavy table slam, a spring launch and a rising whistle.</li>
                <li><strong className="text-white">18.3s - 25.0s:</strong> Tick-tock ricochet score, four rapid boings, the lamp ding, a porcelain clink as the cup lands, a soft plop and a magic sparkle.</li>
                <li><strong className="text-white">25.0s - 30.0s:</strong> Victory fanfare, a tiny pop, the second forehead bonk, a cup squeak, a record scratch and a low angry rumble.</li>
              </ul>
            </div>
          </>
        ) : activeProject === 'trick-shot-champion' ? (
          <>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-zinc-300" />
                <h4 className="text-sm font-semibold text-white">Championship Continuity Constraints</h4>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
                <li><strong className="text-white">Strict rule:</strong> No dialogue, no subtitles, no on-screen text, no logos, no watermark.</li>
                <li><strong className="text-white">Format:</strong> 60 seconds, 1080×1920 vertical 9:16, 24 fps, clean white background.</li>
                <li><strong className="text-white">Characters:</strong> The same black stickman with a round white head and thin black limbs as the previous basketball episodes, plus a referee in a black-and-white striped shirt. Keep both identical in every shot.</li>
                <li><strong className="text-white">Palette:</strong> Black line art on white, one flat orange for the basketball and the cones, gold for the trophy. No gradients, no 3D.</li>
                <li><strong className="text-white">Music:</strong> One original modern pop instrumental that gradually becomes epic during the championship shot, with no copyrighted songs.</li>
                <li><strong className="text-white">Pacing:</strong> Quick comedic timing, a readable pause before every punchline, dramatic slow motion on the rim spin, and a hard cut to black on the final musical beat.</li>
              </ul>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-zinc-300" />
                <h4 className="text-sm font-semibold text-white">Trick-Shot SFX Map</h4>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
                <li><strong className="text-white">0.2s - 5.65s:</strong> Hoop crash, the impact thud, the rim clink and the forehead bonk.</li>
                <li><strong className="text-white">7.3s - 15.1s:</strong> Throw whooshes, wall and pole clanks, a rolling ball and frustrated stomps.</li>
                <li><strong className="text-white">16.0s - 25.3s:</strong> The pop beat kicks in: wall bounces, a slip, the calendar click and a practice swish.</li>
                <li><strong className="text-white">26.0s - 35.0s:</strong> Referee whistle, a dramatic rumble, the finger-spin squeak and the deep breath.</li>
                <li><strong className="text-white">37.4s - 46.05s:</strong> The impossible throw, wall crack, floor bounce, backboard clank, two rim rattles and the swish.</li>
                <li><strong className="text-white">46.15s - 59.55s:</strong> The crowd erupts, the trophy ding, confetti sparkle, the kiss chime, the ball plopping into the cup and the final fanfare.</li>
              </ul>
            </div>
          </>
        ) : activeProject === 'pop-star' ? (
          <>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-zinc-300" />
                <h4 className="text-sm font-semibold text-white">Shorts Continuity Constraints</h4>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
                <li><strong className="text-white">Strict rule:</strong> Only the seven large captions below. No dialogue, no subtitles, no logos, no watermark.</li>
                <li><strong className="text-white">Format:</strong> 58 seconds, 1080×1920 vertical 9:16, 24 fps, vibrant concert stage.</li>
                <li><strong className="text-white">Characters:</strong> Max in a shiny purple jacket, Rex in a flashy blue jacket, Beep a small white robot with blue glowing eyes, tiny wheels and a cleaning brush. Keep them identical in every shot.</li>
                <li><strong className="text-white">Palette:</strong> Purple, blue, pink and cyan stage light on a deep violet stage, plus one flat orange accent for the robot's eyes.</li>
                <li><strong className="text-white">Music:</strong> One original upbeat pop instrumental, no copyrighted songs, timed so the beat lands on the robot's dance.</li>
                <li><strong className="text-white">Pacing:</strong> A readable pause before every punchline, quick cuts in the montage, and a strong musical button on the last frame.</li>
              </ul>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-zinc-300" />
                <h4 className="text-sm font-semibold text-white">Pop Star SFX Map</h4>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
                <li><strong className="text-white">0.0s:</strong> The original pop instrumental starts and never stops.</li>
                <li><strong className="text-white">0.7s / 3.0s / 5.1s:</strong> Crowd cheer, superstar sparkle, hairbrush snap.</li>
                <li><strong className="text-white">7.2s / 9.0s / 12.4s:</strong> Mic sparkle, a deflating groan, a dramatic downbeat.</li>
                <li><strong className="text-white">14.2s - 21.3s:</strong> Dance whoosh, backflip thud, Rex spin, mic kick.</li>
                <li><strong className="text-white">23.2s / 26.0s / 28.6s:</strong> Robot bleep, brush sweep, the mic plug click.</li>
                <li><strong className="text-white">32.0s / 39.0s / 44.2s:</strong> Dance-mode bleep, the crowd erupts, applause.</li>
                <li><strong className="text-white">47.6s - 57.6s:</strong> Flat fall, cushion boing, crown sparkle, crown clink, final hit.</li>
              </ul>
            </div>
          </>
        ) : activeProject === 'paper-ball-part4' ? (
          <>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-zinc-300" />
                <h4 className="text-sm font-semibold text-white">Shorts Continuity Constraints</h4>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
                <li><strong className="text-white">Strict rule:</strong> No dialogue, subtitles, on-screen text, logos, or watermark.</li>
                <li><strong className="text-white">Format:</strong> 30 seconds, 1080×1920 vertical 9:16, 24 fps, clean white background.</li>
                <li><strong className="text-white">Series:</strong> Same Angry Stickman — round white head, thick black outlines, thin black limbs, exaggerated angry reactions.</li>
                <li><strong className="text-white">Order matters:</strong> The hoop falls on his head first, then he over-prepares, chases the runaway balls, lands one accidental trick shot, and celebrates on a podium of basketballs.</li>
                <li><strong className="text-white">The net:</strong> The hoop's net stays tangled on his head from the first gag to the last, and it is what snags on the fallen support at the end.</li>
                <li><strong className="text-white">Ending:</strong> He ends up hanging upside down by the net, arms dangling, kicking one last ball while he stares furiously into the camera.</li>
              </ul>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-zinc-300" />
                <h4 className="text-sm font-semibold text-white">Episode 4 SFX Map</h4>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
                <li><strong className="text-white">0.15s / 1.2s / 2.6s:</strong> Opening swish, the metal creak, the hoop bonk.</li>
                <li><strong className="text-white">4.4s / 5.6s:</strong> The shove-off, gathering the pile of basketballs.</li>
                <li><strong className="text-white">7.5s – 14.4s:</strong> The foot bonk, the scatter, a squeaky chase, a slip, a catch and a spinning landing.</li>
                <li><strong className="text-white">15.2s – 20.4s:</strong> A deep inhale, the throw, a support clink, two boings and the swish.</li>
                <li><strong className="text-white">21.0s / 21.8s:</strong> Championship fanfare and crowd cheer.</li>
                <li><strong className="text-white">26.3s – 29.8s:</strong> The podium collapsing, the net creaking, a final bounce and the sad trombone.</li>
              </ul>
            </div>
          </>
        ) : activeProject === 'paper-ball-part3' ? (
          <>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-zinc-300" />
                <h4 className="text-sm font-semibold text-white">Series Continuity Constraints</h4>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
                <li><strong className="text-white">Strict rule:</strong> No dialogue, captions, text, logo, or watermark in the rendered frame.</li>
                <li><strong className="text-white">Format:</strong> 30 seconds, 1080×1920 vertical 9:16, 24 fps, pure white background.</li>
                <li><strong className="text-white">Series:</strong> Part 3 of the Angry Stickman series — same round white head, bold black outlines, thin black limbs, expressive eyes.</li>
                <li><strong className="text-white">Callback:</strong> A book falls onto his head in the first beat and rides on his head all the way to the court.</li>
                <li><strong className="text-white">New props:</strong> One orange basketball and one basketball hoop on a minimalist outdoor court that starts far away.</li>
                <li><strong className="text-white">Structure:</strong> The walk to the court happens before any throw, then repeated failures, one slow-motion make, and a final bonk.</li>
                <li><strong className="text-white">Camera:</strong> A slow-motion track on the perfect shot, a close-up on the rim, and a final push-in before the cut to black.</li>
              </ul>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-zinc-300" />
                <h4 className="text-sm font-semibold text-white">Part 3 SFX Map</h4>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
                <li><strong className="text-white">0.05s / 0.62s / 1.4s:</strong> Dramatic rumble, the book bonk, a hard fist clench.</li>
                <li><strong className="text-white">2.0s – 6.4s:</strong> March, three squeaky shoe steps, heavy panting, an annoyed sigh.</li>
                <li><strong className="text-white">7.4s / 8.2s:</strong> The book thumping down, the ball pickup.</li>
                <li><strong className="text-white">9.2s – 11.8s:</strong> Two throw whooshes, a rim clink, a backboard bonk, two face bonks, a stumble.</li>
                <li><strong className="text-white">14.1s – 19.0s:</strong> The montage: whooshes, rim clinks, more bonks, a comic womp, a wail.</li>
                <li><strong className="text-white">19.4s / 19.9s / 20.4s:</strong> Rage rumble, a deep inhale, a calming chime.</li>
                <li><strong className="text-white">21.0s – 24.5s:</strong> Release whoosh, a slow-motion swoosh, two rim rattles, the swish.</li>
                <li><strong className="text-white">25.0s / 25.6s / 28.45s / 28.9s:</strong> Fanfare, crowd cheer, the backboard bonking his head, sad trombone.</li>
              </ul>
            </div>
          </>
        ) : activeProject === 'paper-ball-sequel' ? (
          <>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-zinc-300" />
                <h4 className="text-sm font-semibold text-white">Sequel Continuity Constraints</h4>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
                <li><strong className="text-white">Strict rule:</strong> No dialogue, captions, text, logo, or watermark in the rendered frame.</li>
                <li><strong className="text-white">Format:</strong> 30 seconds, 1080×1920 vertical 9:16, 24 fps, pure white background.</li>
                <li><strong className="text-white">Continuity:</strong> Opens on the previous episode’s exact aftermath — same stickman, same room, overturned trash can, scattered crumpled paper balls.</li>
                <li><strong className="text-white">Palette:</strong> Flat black line art and white fills only. No gradients, textures, 3D, or realism.</li>
                <li><strong className="text-white">New props:</strong> Ruler, rubber-band launcher, and a stack of books — all drawn in the same flat vector language.</li>
                <li><strong className="text-white">Camera:</strong> Track the returning ball, punch in for the launcher, and hold deadpan on the final freeze-frame.</li>
              </ul>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-zinc-300" />
                <h4 className="text-sm font-semibold text-white">Episode 2 SFX Map</h4>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
                <li><strong className="text-white">0.1s–2.15s:</strong> Dramatic rumble under the stare, hard fist clench.</li>
                <li><strong className="text-white">3.85s–6.35s:</strong> Can thunk, ruler tap, five mechanical clicks, knuckle cracks.</li>
                <li><strong className="text-white">7.3s–10.25s:</strong> Five throw whooshes, ceiling bonk, foot bonk, wall bounce.</li>
                <li><strong className="text-white">11.35s–14.55s:</strong> Rage rumble, two stomp thuds, deep inhale, calming chime.</li>
                <li><strong className="text-white">15.55s–18.2s:</strong> Assembly clicks, rubber-band twang, smug confidence ding.</li>
                <li><strong className="text-white">19.0s–22.2s:</strong> Launch blast, lamp ding, fan whack, two ricochet whooshes.</li>
                <li><strong className="text-white">24.0s–25.0s:</strong> Trash-can plop into a triumphant victory fanfare.</li>
                <li><strong className="text-white">27.6s–30.0s:</strong> Launcher crash, hollow book bonk, sad trombone.</li>
              </ul>
            </div>
          </>
        ) : activeProject === 'paper-ball-30' ? (
          <>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-zinc-300" />
                <h4 className="text-sm font-semibold text-white">Visual & Continuity Constraints</h4>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
                <li><strong className="text-white">Strict rule:</strong> No dialogue, captions, text, logo, or watermark in the rendered frame.</li>
                <li><strong className="text-white">Format:</strong> 30 seconds, 1080×1920 vertical 9:16, 24 fps, pure white background.</li>
                <li><strong className="text-white">Palette:</strong> Flat black line art and white fills only. No gradients, textures, 3D, or realism.</li>
                <li><strong className="text-white">Continuity:</strong> Same stickman proportions, room layout, table, lamp, fan, trash can, and crumpled paper ball in all eight scenes.</li>
                <li><strong className="text-white">Camera:</strong> Fast tracking pans in the ricochet, a slow-motion close-up over the trash can, then a final deadpan hold.</li>
              </ul>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-zinc-300" />
                <h4 className="text-sm font-semibold text-white">30-Second SFX Map</h4>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
                <li><strong className="text-white">0.8s / 1.8s:</strong> Toss whoosh, wall thud.</li>
                <li><strong className="text-white">4.1s–6.7s:</strong> Ruler tap, calculator beeps, confident ding.</li>
                <li><strong className="text-white">8.5s–9.6s:</strong> Hard throw, wall rebound, forehead bonk.</li>
                <li><strong className="text-white">11.2s–14.2s:</strong> Training music, squat thumps, arm whoosh, flex squeak.</li>
                <li><strong className="text-white">15.6s–17.7s:</strong> Throw, lamp ding, table thump, fan whack.</li>
                <li><strong className="text-white">19.3s–22.2s:</strong> Four suspense heartbeats.</li>
                <li><strong className="text-white">23.0s–26.9s:</strong> Trash plop into victory fanfare.</li>
                <li><strong className="text-white">27.0s–30.0s:</strong> Crash, instant music cutoff, sad trombone.</li>
              </ul>
            </div>
          </>
        ) : activeProject === 'paper-ball' ? (
          <>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-zinc-300" />
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
                <Volume2 className="w-4 h-4 text-zinc-300" />
                <h4 className="text-sm font-semibold text-white">Acoustic Cartoon Timing</h4>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
                <li><strong className="text-white">2.0s:</strong> Snappy toss release whoosh.</li>
                <li><strong className="text-white">4.4s:</strong> Metallic trash can rim clink.</li>
                <li><strong className="text-white">6.0s:</strong> Resonant brass table lamp ding.</li>
                <li><strong className="text-white">7.5s:</strong> Violent ceiling fan blade WHACK.</li>
                <li><strong className="text-white">8.6s:</strong> Elastic bounce off the right wall.</li>
                <li><strong className="text-white">9.4s:</strong> Classic hollow forehead cartoon bonk (*dook*).</li>
                <li><strong className="text-white">9.6s–10.0s:</strong> Soft desk plop followed by total deadpan silence.</li>
              </ul>
            </div>
          </>
        ) : (
          <>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-zinc-300" />
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
                <Volume2 className="w-4 h-4 text-zinc-300" />
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

