import React from 'react';
import { Volume2, Play, Mic, Sliders } from 'lucide-react';
import { soundEngine, speakVoiceOver, stopVoiceOver } from '../audio/soundEngine';
import { StudioConfig } from '../types';

interface AudioLabProps {
  config: StudioConfig;
  setConfig: React.Dispatch<React.SetStateAction<StudioConfig>>;
}

export const AudioLab: React.FC<AudioLabProps> = ({ config, setConfig }) => {
  const soundEffects = [
    {
      name: 'Footstep Pop',
      time: 'Scene 1 (0.4s, 0.8s)',
      desc: 'Soft damped frequency drop (310Hz -> 90Hz) mimicking rubber cartoon shoe contact.',
      trigger: () => soundEngine.playFootstep(false),
    },
    {
      name: 'Cheerful Skip Pop',
      time: 'Scene 1 (1.2s)',
      desc: 'Bright triangle blip (580Hz -> 280Hz) on the mid-air skip hop.',
      trigger: () => soundEngine.playFootstep(true),
    },
    {
      name: 'Record Scratch',
      time: 'Scene 2 (2.0s)',
      desc: 'Sharp comedic vinyl needle rip as the shadow stops dead in its tracks.',
      trigger: () => soundEngine.playRecordScratch(),
    },
    {
      name: 'Clipboard Paper Slap',
      time: 'Scene 3 (4.5s)',
      desc: 'Filtered high-frequency friction burst as the shadow pulls the clipboard.',
      trigger: () => soundEngine.playPaperSlap(),
    },
    {
      name: 'Clipboard Double Tap',
      time: 'Scene 3 (5.05s, 5.25s)',
      desc: 'Two dry, bureaucratic finger taps (1350Hz click) on the grievance page.',
      trigger: () => {
        soundEngine.playClipboardTap();
        setTimeout(() => soundEngine.playClipboardTap(), 180);
      },
    },
    {
      name: 'Floor Contact Thump',
      time: 'Scene 4 (6.1s)',
      desc: 'Low dull contact pop (140Hz -> 38Hz) as shadow drops cross-legged.',
      trigger: () => soundEngine.playFloorThump(),
    },
    {
      name: 'Arm Cross Squeak',
      time: 'Scene 4 (6.3s)',
      desc: 'High pitch bend (750Hz -> 980Hz) conveying stubborn refusal.',
      trigger: () => soundEngine.playArmCrossSqueak(),
    },
    {
      name: 'Sad Trombone (Wah-wah-waaah)',
      time: 'Scene 5 (8.0s - 9.2s)',
      desc: 'Iconic 4-note mournful brass glide (Eb3 -> D3 -> Db3 -> C3 drooping to B2) during thumbs down.',
      trigger: () => soundEngine.playSadTrombone(),
    },
  ];

  const testVoiceLine = (line: string) => {
    stopVoiceOver();
    speakVoiceOver(line, {
      rate: config.voiceRate,
      pitch: config.voicePitch,
      volume: config.voiceVolume,
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Sound & Voice Design Studio
        </h2>
        <p className="text-sm text-slate-400 max-w-2xl mt-1">
          Minimal, carefully synchronized cartoon sound effects synthesized entirely in real-time via the Web Audio API.
          No external MP3 files required.
        </p>
      </div>

      {/* Voice-Over Synthesis Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-rose-500" />
            <h3 className="text-lg font-semibold text-white">Voice-Over Synthesizer</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Calm · Monotone · Deadpan</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cue 1 */}
          <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-rose-400">Opening Hook (0.0s – 2.0s)</span>
              <button
                onClick={() => testVoiceLine(config.customVO1)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-md transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Play Voice</span>
              </button>
            </div>
            <input
              type="text"
              value={config.customVO1}
              onChange={(e) => setConfig({ ...config, customVO1: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:border-rose-500"
            />
            <p className="text-xs text-slate-500">
              Delivery: Neutral tone, slight documentary curiosity, no exaggerated emotion.
            </p>
          </div>

          {/* Cue 2 */}
          <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-rose-400">Punchline (8.0s – 9.5s)</span>
              <button
                onClick={() => testVoiceLine(config.customVO2)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-md transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Play Voice</span>
              </button>
            </div>
            <input
              type="text"
              value={config.customVO2}
              onChange={(e) => setConfig({ ...config, customVO2: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:border-rose-500"
            />
            <p className="text-xs text-slate-500">
              Delivery: Completely serious, bureaucratic finality.
            </p>
          </div>
        </div>

        {/* Sliders for Speech Synthesis */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-slate-800">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Speech Rate (Speed)</span>
              <span className="font-mono text-white">{config.voiceRate.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.6"
              max="1.2"
              step="0.02"
              value={config.voiceRate}
              onChange={(e) => setConfig({ ...config, voiceRate: parseFloat(e.target.value) })}
              className="w-full accent-rose-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>Slow & Dry</span>
              <span>Fast</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Pitch (Monotone Depth)</span>
              <span className="font-mono text-white">{config.voicePitch.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.3"
              step="0.02"
              value={config.voicePitch}
              onChange={(e) => setConfig({ ...config, voicePitch: parseFloat(e.target.value) })}
              className="w-full accent-rose-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>Lower / Deadpan</span>
              <span>Higher</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Master Sound Volume</span>
              <span className="font-mono text-white">{Math.round(config.voiceVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.voiceVolume}
              onChange={(e) => {
                const vol = parseFloat(e.target.value);
                setConfig({ ...config, voiceVolume: vol });
                soundEngine.setVolume(vol);
              }}
              className="w-full accent-rose-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>Mute</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Procedural Sound Effects Matrix */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-rose-500" />
            <h3 className="text-lg font-semibold text-white">Procedural Cartoon SFX Triggers</h3>
          </div>
          <span className="text-xs text-slate-400">Click to preview individual synchronized effects</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {soundEffects.map((sfx, idx) => (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col justify-between space-y-3 transition-colors"
            >
              <div>
                <div className="text-[11px] font-mono text-rose-400">{sfx.time}</div>
                <h4 className="text-sm font-semibold text-white mt-0.5">{sfx.name}</h4>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{sfx.desc}</p>
              </div>
              <button
                onClick={sfx.trigger}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg border border-slate-700 transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Test FX</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
