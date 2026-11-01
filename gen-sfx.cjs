const fs = require('fs');

const FILE = 'src/audio/soundEngine.ts';

/** layer helpers */
const t = (f, d, g, w = 'sine', f2, at = 0) => ({ k: 't', f, f2, d, g, w, t: at });
const n = (f, d, g, ft = 'lowpass', f2, at = 0, q) => ({ k: 'n', f, f2, d, g, ft, t: at, q });

const specs = {
  playAirPuff: [n(900, 0.4, 0.2, 'lowpass', 260)],
  playAirRelease: [n(1400, 0.5, 0.16, 'highpass', 420), t(620, 0.4, 0.07, 'triangle', 200)],
  playAlarmSiren: [
    t(700, 0.45, 0.1, 'square', 1150, 0),
    t(1150, 0.45, 0.1, 'square', 700, 0.45),
    t(700, 0.45, 0.1, 'square', 1150, 0.9),
  ],
  playAngelicChoir: [
    t(523.25, 1.6, 0.07, 'sine', undefined, 0),
    t(659.25, 1.6, 0.06, 'sine', undefined, 0.05),
    t(783.99, 1.6, 0.055, 'sine', undefined, 0.1),
    t(1046.5, 1.6, 0.04, 'sine', undefined, 0.15),
  ],
  playAngrySting: [t(220, 0.5, 0.16, 'sawtooth', 110), t(164.81, 0.65, 0.14, 'sawtooth', 82, 0.08)],
  playArcadeAlarm: [
    t(880, 0.15, 0.09, 'square', undefined, 0),
    t(659.25, 0.15, 0.09, 'square', undefined, 0.15),
    t(880, 0.15, 0.09, 'square', undefined, 0.3),
    t(659.25, 0.15, 0.09, 'square', undefined, 0.45),
  ],
  playArcadeChime: [
    t(987.77, 0.12, 0.1, 'triangle', undefined, 0),
    t(1318.5, 0.12, 0.09, 'triangle', undefined, 0.1),
    t(1567.98, 0.22, 0.09, 'triangle', undefined, 0.2),
  ],
  playArcadeWinJingle: [
    t(783.99, 0.14, 0.1, 'square', undefined, 0),
    t(987.77, 0.14, 0.1, 'square', undefined, 0.14),
    t(1174.66, 0.14, 0.1, 'square', undefined, 0.28),
    t(1567.98, 0.4, 0.11, 'square', undefined, 0.42),
  ],
  playAwkwardCough: [n(420, 0.2, 0.2, 'bandpass', 300, 0, 3), t(190, 0.18, 0.12, 'sawtooth', 90, 0.02)],
  playBagRip: [n(2600, 0.3, 0.2, 'highpass', 700)],
  playBalloonSqueak: [t(900, 0.1, 0.09, 'sine', 1500), t(1400, 0.12, 0.08, 'sine', 700, 0.1)],
  playBalloonStretch: [t(200, 0.6, 0.08, 'sawtooth', 900), n(1200, 0.5, 0.05, 'bandpass', 2200, 0, 2)],
  playBigImpact: [t(70, 0.8, 0.5, 'sine', 30), n(900, 0.3, 0.22, 'lowpass', 200)],
  playBinThunk: [t(180, 0.25, 0.3, 'sine', 60), n(1400, 0.1, 0.12, 'bandpass', 900, 0, 2)],
  playBroomScrape: [n(1500, 0.35, 0.13, 'bandpass', 600, 0, 3)],
  playButtonClick: [t(1200, 0.05, 0.2, 'square'), n(3000, 0.03, 0.1, 'highpass')],
  playCameraClick: [n(3200, 0.05, 0.28, 'highpass', 1800), t(2000, 0.04, 0.12, 'square')],
  playCartoonBoing: [t(200, 0.35, 0.18, 'sine', 620), t(620, 0.25, 0.12, 'sine', 220, 0.32)],
  playCartoonCrash: [t(500, 0.8, 0.24, 'sawtooth', 60), n(1600, 0.3, 0.16, 'highpass', 800)],
  playCaseOpen: [t(300, 0.3, 0.1, 'triangle', 600), n(1800, 0.18, 0.07, 'bandpass', 1200, 0.05, 2)],
  playClawMotor: [t(90, 0.8, 0.1, 'sawtooth', 110), t(140, 0.8, 0.05, 'square', 120, 0.02)],
  playCoinClink: [t(1800, 0.08, 0.16, 'triangle'), t(2400, 0.12, 0.12, 'triangle', undefined, 0.05)],
  playConfettiPop: [n(2200, 0.25, 0.24, 'highpass', 900), t(900, 0.22, 0.12, 'triangle', 300)],
  playCountBeep: [t(880, 0.12, 0.18, 'square')],
  playCounterBump: [t(120, 0.2, 0.3, 'sine', 50), n(600, 0.08, 0.1, 'lowpass', 300)],
  playCupClunk: [t(400, 0.15, 0.22, 'triangle', 150), n(1600, 0.08, 0.1, 'bandpass', 1000, 0, 2)],
  playCupPing: [t(1500, 0.5, 0.22, 'sine', 800)],
  playCupSlide: [n(900, 0.3, 0.1, 'bandpass', 700, 0, 2.5)],
  playCupWobbleCreak: [
    t(180, 0.14, 0.1, 'square', 220, 0),
    t(200, 0.14, 0.09, 'square', 240, 0.15),
    t(220, 0.14, 0.085, 'square', 250, 0.3),
    t(240, 0.14, 0.08, 'square', 270, 0.45),
  ],
  playDiamondChime: [
    t(2093, 0.5, 0.07, 'sine'),
    t(2637, 0.55, 0.06, 'sine', undefined, 0.06),
    t(3136, 0.6, 0.05, 'sine', undefined, 0.12),
  ],
  playDramaticBoom: [t(80, 1.5, 0.42, 'sine', 30), n(400, 0.5, 0.1, 'lowpass', 120)],
  playFanTink: [t(2400, 0.12, 0.14, 'triangle', 1800), n(4000, 0.05, 0.08, 'highpass')],
  playFreezeSting: [t(1200, 0.8, 0.14, 'sawtooth', 200), n(2400, 0.5, 0.1, 'highpass', 400)],
  playGlassClunk: [t(900, 0.12, 0.18, 'sine', 500), t(1800, 0.18, 0.09, 'sine', 1500, 0.04)],
  playHardFlick: [t(400, 0.3, 0.24, 'sawtooth', 150), n(1800, 0.12, 0.12, 'bandpass', 900, 0, 2)],
  playHollowBonk: [t(120, 0.5, 0.34, 'sine', 60), t(240, 0.4, 0.14, 'sine', 120, 0.02)],
  playIdeaDing: [t(1567.98, 0.45, 0.16, 'sine', undefined, 0), t(2093, 0.5, 0.1, 'sine', undefined, 0.02)],
  playKnotSnap: [n(2000, 0.2, 0.18, 'bandpass', 400, 0, 3), t(300, 0.18, 0.1, 'triangle', 120, 0.02)],
  playLaserZap: [t(1800, 0.4, 0.14, 'sawtooth', 200), t(900, 0.35, 0.08, 'square', 120, 0.02)],
  playMagicSparkle: [
    t(2093, 0.14, 0.07, 'sine', undefined, 0),
    t(2637, 0.14, 0.065, 'sine', undefined, 0.07),
    t(3136, 0.14, 0.06, 'sine', undefined, 0.14),
    t(2349, 0.14, 0.055, 'sine', undefined, 0.21),
    t(2794, 0.2, 0.05, 'sine', undefined, 0.28),
  ],
  playNeedlePoke: [t(2000, 0.06, 0.1, 'sine', 1200), n(5000, 0.03, 0.06, 'highpass')],
  playPancakeSlide: [n(700, 0.3, 0.1, 'bandpass', 420, 0, 2)],
  playPancakeSplat: [n(600, 0.25, 0.3, 'lowpass', 260), t(200, 0.2, 0.16, 'sine', 60, 0.01)],
  playPaperCrumple: [n(2500, 0.4, 0.16, 'bandpass', 900, 0, 1.5)],
  playPlateClink: [t(2600, 0.2, 0.12, 'sine', 2200), t(3400, 0.25, 0.08, 'sine', 3000, 0.04)],
  playPlushAvalanche: [n(800, 1.2, 0.2, 'lowpass', 300), n(2000, 1.0, 0.08, 'bandpass', 900, 0.1, 1.5)],
  playPreciseTap: [t(1200, 0.08, 0.16, 'sine', 900)],
  playRelievedSigh: [n(800, 0.8, 0.14, 'highpass', 300)],
  playRisingMusicSwelling: [
    t(261.63, 0.5, 0.08, 'sine', undefined, 0),
    t(293.66, 0.5, 0.08, 'sine', undefined, 0.5),
    t(329.63, 0.5, 0.09, 'sine', undefined, 1.0),
    t(349.23, 0.5, 0.09, 'sine', undefined, 1.5),
    t(392.0, 0.6, 0.1, 'sine', undefined, 2.0),
    t(440.0, 0.6, 0.1, 'sine', undefined, 2.6),
    t(493.88, 0.7, 0.11, 'sine', undefined, 3.2),
    t(523.25, 0.9, 0.12, 'sine', undefined, 3.8),
  ],
  playRisingWhistle: [t(400, 1.0, 0.1, 'sine', 1800), n(2000, 1.0, 0.05, 'highpass', 800)],
  playScoop: [n(1200, 0.2, 0.12, 'bandpass', 600, 0, 2)],
  playSlideWhistle: [t(1200, 0.5, 0.14, 'sine', 300), n(1500, 0.4, 0.05, 'highpass', 600)],
  playSoftFlick: [t(600, 0.2, 0.12, 'triangle', 300), n(2200, 0.08, 0.05, 'highpass')],
  playSpiralWhirr: [t(300, 1.0, 0.08, 'sawtooth', 900), t(450, 1.0, 0.05, 'triangle', 1200, 0.05)],
  playSpoonDraw: [n(1800, 0.25, 0.12, 'bandpass', 900, 0, 2.5)],
  playStrainedTug: [t(150, 0.5, 0.12, 'sawtooth', 170), t(150, 0.5, 0.06, 'square', 140, 0.02)],
  playTinyChipTink: [t(1800, 0.1, 0.14, 'triangle', 1400), t(2400, 0.08, 0.08, 'sine', 2000, 0.04)],
  playTinyPlop: [t(200, 0.15, 0.14, 'sine', 80)],
  playTrayPing: [t(1400, 0.3, 0.16, 'triangle', 1000), t(2100, 0.25, 0.07, 'sine', 1600, 0.03)],
  playVendingRattle: [n(600, 0.4, 0.14, 'bandpass', 900, 0, 1.6), t(260, 0.12, 0.1, 'square', 200, 0.05)],
  playVendingThud: [t(90, 0.3, 0.32, 'sine', 40), n(700, 0.15, 0.14, 'lowpass', 260)],
  playVictoryFanfareShort: [
    t(523.25, 0.15, 0.12, 'square', undefined, 0),
    t(659.25, 0.15, 0.12, 'square', undefined, 0.15),
    t(783.99, 0.15, 0.12, 'square', undefined, 0.3),
    t(1046.5, 0.4, 0.13, 'square', undefined, 0.45),
  ],
  playWallBoing: [t(300, 0.4, 0.18, 'sine', 700), t(700, 0.25, 0.1, 'sine', 320, 0.38)],
  playWetSplat: [n(1200, 0.3, 0.2, 'lowpass', 300), t(160, 0.2, 0.1, 'sine', 70, 0.02)],
  playWindGust: [n(600, 1.2, 0.18, 'lowpass', 900), n(400, 1.0, 0.1, 'bandpass', 800, 0.1, 1.2)],
  playWindowKnock: [t(400, 0.08, 0.22, 'triangle', 300), t(400, 0.08, 0.2, 'triangle', 300, 0.14)],
  playWoodClack: [n(1500, 0.06, 0.18, 'bandpass', 1100, 0, 3), t(600, 0.06, 0.12, 'triangle', 400)],
};

/** methods with a duration parameter */
const durMethods = {
  playBallRoll: { dur: 1.0, layers: [n(500, 1.0, 0.07, 'bandpass', 320, 0, 2), t(220, 1.0, 0.03, 'triangle', 140)] },
  playDominoClatter: { dur: 3.0, layers: [n(1800, 3.0, 0.05, 'bandpass', 800, 0, 2)] },
  playTickingCountdown: { dur: 3.0, layers: [t(1200, 0.05, 0.1, 'square')] },
  playDrumRoll: { dur: 1.0, layers: [n(1800, 1.0, 0.1, 'bandpass', 900, 0, 1.5)] },
};

/** multi-hit patterns generated with repeat loops */
const repeatMethods = {
  playBallRoll: null,
};

function layerSrc(l) {
  const parts = [`k: '${l.k}'`, `f: ${l.f}`, `d: ${l.d}`, `g: ${l.g}`];
  if (l.f2) parts.push(`f2: ${l.f2}`);
  if (l.k === 't' && l.w) parts.push(`w: '${l.w}'`);
  if (l.k === 'n' && l.ft) parts.push(`ft: '${l.ft}'`);
  if (l.k === 'n' && l.q) parts.push(`q: ${l.q}`);
  if (l.t) parts.push(`t: ${l.t}`);
  return `{ ${parts.join(', ')} }`;
}

let out = '\n  // ===== EXTRA PROCEDURAL SFX (all projects) =====\n';

/** methods the cue maps call with a second (duration-ish) argument */
const scaleMethods = {
  playAirRelease: 0.5,
  playAlarmSiren: 1.35,
  playClawMotor: 0.8,
  playCupSlide: 0.3,
  playPancakeSlide: 0.3,
  playRisingWhistle: 1.0,
  playVendingRattle: 0.4,
  playWindGust: 1.2,
};

for (const [name, layers] of Object.entries(specs)) {
  if (name === 'playCountBeep') continue;
  const base = scaleMethods[name];
  const sig = base ? `(dest?: AudioNode, duration?: number)` : `(dest?: AudioNode)`;
  out += `\n  public ${name}${sig} {\n    this.sfx(dest, [\n`;
  for (const l of layers) out += `      ${layerSrc(l)},\n`;
  out += `    ]${base ? `, duration ? duration / ${base} : 1` : ''});\n  }\n`;
}

// Beeps repeat across the requested window instead of stretching one blip.
out += `\n  public playCountBeep(dest?: AudioNode, duration?: number) {\n`;
out += `    const total = duration && duration > 0 ? duration : 0.12;\n`;
out += `    const layers: SfxLayer[] = [];\n`;
out += `    for (let at = 0; at < total; at += 0.5) {\n`;
out += `      layers.push({ k: 't', f: 880, d: 0.12, g: 0.18, w: 'square', t: at });\n`;
out += `    }\n`;
out += `    this.sfx(dest, layers);\n  }\n`;

// Duration-based one-shots are hand-written below (they loop over time).

const manual = `
  // ---- shared helpers for the extra SFX above ----
  private sfx(dest: AudioNode | undefined, layers: SfxLayer[], scale = 1) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      for (const l of layers) {
        const at = now + (l.t ?? 0) * scale;
        const dur = Math.max(0.03, l.d * scale);
        const head = Math.max(0.0002, l.g * this.volume);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, at);
        gain.gain.exponentialRampToValueAtTime(head, at + Math.min(0.02, dur * 0.4));
        gain.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        this.routeOutput(gain, dest);

        if (l.k === 't') {
          const osc = ctx.createOscillator();
          osc.type = l.w ?? 'sine';
          osc.frequency.setValueAtTime(l.f, at);
          if (l.f2) osc.frequency.exponentialRampToValueAtTime(Math.max(1, l.f2), at + dur);
          osc.connect(gain);
          osc.start(at);
          osc.stop(at + dur + 0.03);
        } else {
          const len = Math.max(1, Math.floor(ctx.sampleRate * Math.max(0.02, dur)));
          const buf = ctx.createBuffer(1, len, ctx.sampleRate);
          const data = buf.getChannelData(0);
          for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
          const src = ctx.createBufferSource();
          src.buffer = buf;
          const filt = ctx.createBiquadFilter();
          filt.type = l.ft ?? 'lowpass';
          filt.frequency.setValueAtTime(Math.max(60, l.f), at);
          if (l.f2) filt.frequency.exponentialRampToValueAtTime(Math.max(60, l.f2), at + dur);
          if (l.q) filt.Q.setValueAtTime(l.q, at);
          src.connect(filt);
          filt.connect(gain);
          src.start(at);
        }
      }
    } catch {}
  }

  // ---- looping one-shots ----
  public playBallRoll(dest?: AudioNode, duration: number = 1.0) {
    const layers: SfxLayer[] = [];
    for (let at = 0; at < duration; at += 0.12) {
      layers.push({ k: 'n', f: 520, f2: 300, d: 0.1, g: 0.05, ft: 'bandpass', q: 2, t: at });
      layers.push({ k: 't', f: 210, f2: 150, d: 0.1, g: 0.025, w: 'triangle', t: at });
    }
    this.sfx(dest, layers);
  }

  public playDominoClatter(dest?: AudioNode, duration: number = 3.0) {
    const layers: SfxLayer[] = [];
    for (let at = 0; at < duration; at += 0.1) {
      layers.push({ k: 'n', f: 1900, f2: 900, d: 0.045, g: 0.05, ft: 'bandpass', q: 2, t: at + Math.random() * 0.04 });
      layers.push({ k: 't', f: 1000 + Math.random() * 400, f2: 600, d: 0.05, g: 0.03, w: 'triangle', t: at + Math.random() * 0.04 });
    }
    this.sfx(dest, layers);
  }

  public playTickingCountdown(dest?: AudioNode, duration: number = 3.0) {
    const layers: SfxLayer[] = [];
    for (let at = 0; at < duration; at += 0.5) {
      layers.push({ k: 't', f: 1200, d: 0.05, g: 0.1, w: 'square', t: at });
      layers.push({ k: 'n', f: 4000, d: 0.02, g: 0.04, ft: 'highpass', t: at });
    }
    this.sfx(dest, layers);
  }

  public playDrumRoll(dest?: AudioNode, duration: number = 1.0) {
    const layers: SfxLayer[] = [];
    for (let at = 0; at < duration; at += 0.045) {
      const swell = 0.04 + 0.06 * (at / Math.max(0.2, duration));
      layers.push({ k: 'n', f: 1800, f2: 900, d: 0.05, g: swell, ft: 'bandpass', q: 1.5, t: at });
    }
    this.sfx(dest, layers);
  }

  // ---- shared helper for the 30s comedy scores ----
  private scoreSlice(
    dest: AudioNode | undefined,
    start: number,
    end: number,
    opts: { bpm: number; wave: OscillatorType; chords: number[][]; level?: number }
  ) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const beat = 60 / opts.bpm;
      const bar = beat * 4;
      const base = ctx.currentTime + 0.06 - start;
      const total = Math.max(0, end - start);
      const level = (opts.level ?? 0.5) * this.volume;
      if (total <= 0) return;

      const master = ctx.createGain();
      master.gain.setValueAtTime(level, ctx.currentTime);
      this.routeOutput(master, dest);

      const hatLen = Math.max(1, Math.floor(ctx.sampleRate * 0.045));
      const hatBuf = ctx.createBuffer(1, hatLen, ctx.sampleRate);
      const hatData = hatBuf.getChannelData(0);
      for (let i = 0; i < hatLen; i++) hatData[i] = (Math.random() * 2 - 1) * (1 - i / hatLen);

      for (let at = 0; at < total; at += bar) {
        const chord = opts.chords[Math.floor((start + at) / bar) % opts.chords.length];
        chord.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = opts.wave;
          osc.frequency.setValueAtTime(freq, base + at + idx * 0.012);
          g.gain.setValueAtTime(0.0001, base + at);
          g.gain.exponentialRampToValueAtTime(0.16, base + at + 0.05);
          g.gain.exponentialRampToValueAtTime(0.0001, base + at + bar * 0.92);
          osc.connect(g);
          g.connect(master);
          osc.start(base + at);
          osc.stop(base + at + bar);
        });

        for (let b = 0; b < 4; b += 2) {
          const src = ctx.createBufferSource();
          src.buffer = hatBuf;
          const hp = ctx.createBiquadFilter();
          hp.type = 'highpass';
          hp.frequency.value = 6000;
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.05, base + at + b * beat);
          g.gain.exponentialRampToValueAtTime(0.0001, base + at + b * beat + 0.045);
          src.connect(hp);
          hp.connect(g);
          g.connect(master);
          src.start(base + at + b * beat);
        }
      }
    } catch {}
  }

  // ---- 30s score slices, one per comedy short ----
  public playArcadeClawScoreSection(dest?: AudioNode, start = 0, end = 7.5) {
    this.scoreSlice(dest, start, end, {
      bpm: 150,
      wave: 'square',
      level: 0.42,
      chords: [
        [261.63, 329.63, 392.0],
        [293.66, 349.23, 440.0],
        [246.94, 311.13, 369.99],
        [261.63, 329.63, 392.0],
      ],
    });
  }

  public playDiamondHeistScoreSection(dest?: AudioNode, start = 0, end = 7.5) {
    this.scoreSlice(dest, start, end, {
      bpm: 132,
      wave: 'triangle',
      level: 0.4,
      chords: [
        [110.0, 164.81, 220.0],
        [123.47, 185.0, 246.94],
        [98.0, 146.83, 196.0],
        [110.0, 164.81, 220.0],
      ],
    });
  }

  public playHeistPizzicatoSection(dest?: AudioNode, start = 0, end = 7.5) {
    this.scoreSlice(dest, start, end, {
      bpm: 124,
      wave: 'triangle',
      level: 0.38,
      chords: [
        [146.83, 220.0, 293.66],
        [130.81, 196.0, 261.63],
        [164.81, 246.94, 329.63],
        [146.83, 220.0, 293.66],
      ],
    });
  }

  public playPancakeScoreSection(dest?: AudioNode, start = 0, end = 7.5) {
    this.scoreSlice(dest, start, end, {
      bpm: 148,
      wave: 'triangle',
      level: 0.44,
      chords: [
        [261.63, 349.23, 440.0],
        [293.66, 369.99, 466.16],
        [329.63, 415.3, 523.25],
        [261.63, 349.23, 440.0],
      ],
    });
  }

  public playVendingScoreSection(dest?: AudioNode, start = 0, end = 7.5) {
    this.scoreSlice(dest, start, end, {
      bpm: 144,
      wave: 'square',
      level: 0.4,
      chords: [
        [246.94, 311.13, 369.99],
        [220.0, 277.18, 329.63],
        [196.0, 246.94, 293.66],
        [246.94, 311.13, 369.99],
      ],
    });
  }

  public playBalloonScoreSection(dest?: AudioNode, start = 0, end = 7.5) {
    this.scoreSlice(dest, start, end, {
      bpm: 146,
      wave: 'triangle',
      level: 0.42,
      chords: [
        [329.63, 415.3, 523.25],
        [293.66, 369.99, 466.16],
        [349.23, 440.0, 554.37],
        [329.63, 415.3, 523.25],
      ],
    });
  }

  public playFindTheBallScoreSection(dest?: AudioNode, start = 0, end = 7.5) {
    this.scoreSlice(dest, start, end, {
      bpm: 138,
      wave: 'triangle',
      level: 0.42,
      chords: [
        [220.0, 277.18, 329.63],
        [246.94, 311.13, 369.99],
        [196.0, 246.94, 293.66],
        [220.0, 277.18, 329.63],
      ],
    });
  }

  public playAttempt247ScoreSection(dest?: AudioNode, start = 0, end = 7.5) {
    this.scoreSlice(dest, start, end, {
      bpm: 140,
      wave: 'square',
      level: 0.38,
      chords: [
        [174.61, 220.0, 261.63],
        [196.0, 246.94, 293.66],
        [164.81, 207.65, 246.94],
        [174.61, 220.0, 261.63],
      ],
    });
  }

  public playNeedleThreadScoreSection(dest?: AudioNode, start = 0, end = 7.5) {
    this.scoreSlice(dest, start, end, {
      bpm: 150,
      wave: 'triangle',
      level: 0.4,
      chords: [
        [293.66, 369.99, 440.0],
        [261.63, 329.63, 392.0],
        [311.13, 392.0, 466.16],
        [293.66, 369.99, 440.0],
      ],
    });
  }

  public playMagnetScoreSection(dest?: AudioNode, start = 0, end = 7.5) {
    this.scoreSlice(dest, start, end, {
      bpm: 136,
      wave: 'square',
      level: 0.38,
      chords: [
        [233.08, 293.66, 349.23],
        [207.65, 261.63, 311.13],
        [246.94, 311.13, 369.99],
        [233.08, 293.66, 349.23],
      ],
    });
  }

  public playRingShotScoreSection(dest?: AudioNode, start = 0, end = 7.5) {
    this.scoreSlice(dest, start, end, {
      bpm: 142,
      wave: 'triangle',
      level: 0.42,
      chords: [
        [246.94, 311.13, 392.0],
        [277.18, 349.23, 440.0],
        [220.0, 277.18, 349.23],
        [246.94, 311.13, 392.0],
      ],
    });
  }

  public playPencilLandingScoreSection(dest?: AudioNode, start = 0, end = 7.5) {
    this.scoreSlice(dest, start, end, {
      bpm: 152,
      wave: 'triangle',
      level: 0.4,
      chords: [
        [261.63, 329.63, 415.3],
        [293.66, 349.23, 440.0],
        [246.94, 311.13, 392.0],
        [261.63, 329.63, 415.3],
      ],
    });
  }

  public playDominoTrickshotScoreSection(dest?: AudioNode, start = 0, end = 7.5) {
    this.scoreSlice(dest, start, end, {
      bpm: 152,
      wave: 'square',
      level: 0.4,
      chords: [
        [261.63, 329.63, 392.0],
        [293.66, 349.23, 440.0],
        [246.94, 311.13, 369.99],
        [261.63, 329.63, 392.0],
      ],
    });
  }

  // ---- carnival arcade score for "The Balloon Pop Jackpot" ----
  public playBalloonPopScoreSection(dest?: AudioNode, start = 0, end = 7.5) {
    this.scoreSlice(dest, start, end, {
      bpm: 160,
      wave: 'square',
      level: 0.4,
      chords: [
        [329.63, 415.3, 493.88],
        [349.23, 440.0, 523.25],
        [293.66, 369.99, 466.16],
        [329.63, 415.3, 493.88],
      ],
    });
  }

  // ---- carnival + balloon SFX for "The Balloon Pop Jackpot" ----
  public playDartWhoosh(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 'n', f: 2600, f2: 700, d: 0.3, g: 0.14, ft: 'bandpass', q: 2 },
      { k: 't', f: 900, f2: 2200, d: 0.28, g: 0.07, w: 'triangle' },
    ]);
  }

  public playBalloonPop(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 'n', f: 2600, f2: 500, d: 0.22, g: 0.28, ft: 'highpass' },
      { k: 't', f: 900, f2: 220, d: 0.18, g: 0.16, w: 'triangle' },
      { k: 't', f: 1800, f2: 900, d: 0.08, g: 0.09, w: 'square', t: 0.01 },
    ]);
  }

  public playGoldenPop(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 'n', f: 3000, f2: 400, d: 0.4, g: 0.3, ft: 'highpass' },
      { k: 't', f: 1200, f2: 300, d: 0.3, g: 0.18, w: 'triangle' },
      { k: 't', f: 1567.98, d: 0.9, g: 0.12, w: 'sine', t: 0.02 },
      { k: 't', f: 2093, d: 0.9, g: 0.09, w: 'sine', t: 0.08 },
      { k: 't', f: 2637, d: 0.9, g: 0.07, w: 'sine', t: 0.14 },
    ]);
  }

  public playPrizeSparkle(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 2093, d: 0.2, g: 0.07, w: 'sine', t: 0 },
      { k: 't', f: 2637, d: 0.2, g: 0.065, w: 'sine', t: 0.08 },
      { k: 't', f: 3136, d: 0.2, g: 0.06, w: 'sine', t: 0.16 },
      { k: 't', f: 2349, d: 0.25, g: 0.05, w: 'sine', t: 0.24 },
    ]);
  }

  public playBalloonInflate(dest?: AudioNode, duration: number = 3.0) {
    const layers: SfxLayer[] = [];
    for (let at = 0; at < duration; at += 0.18) {
      const p = at / Math.max(0.2, duration);
      layers.push({ k: 't', f: 160 + p * 520, f2: 180 + p * 560, d: 0.2, g: 0.05, w: 'triangle', t: at });
      layers.push({ k: 'n', f: 900 + p * 1200, d: 0.12, g: 0.03, ft: 'bandpass', q: 2, t: at });
    }
    this.sfx(dest, layers);
  }

  public playBoothLights(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 784, d: 0.12, g: 0.09, w: 'square', t: 0 },
      { k: 't', f: 988, d: 0.12, g: 0.09, w: 'square', t: 0.1 },
      { k: 't', f: 1175, d: 0.12, g: 0.09, w: 'square', t: 0.2 },
      { k: 't', f: 1568, d: 0.35, g: 0.1, w: 'square', t: 0.3 },
    ]);
  }

  public playDartThunkWood(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 'n', f: 1600, f2: 900, d: 0.08, g: 0.2, ft: 'bandpass', q: 3 },
      { k: 't', f: 420, f2: 180, d: 0.1, g: 0.16, w: 'triangle' },
    ]);
  }
`;

out += manual;
fs.writeFileSync('gen-sfx-block.txt', out, 'utf8');
console.log('generated', Object.keys(specs).length, 'simple methods, chars', out.length);
