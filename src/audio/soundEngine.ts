/**
 * Procedural Web Audio API sound engine for 2D stickman animations.
 * Synthesizes all cartoon comedic sound effects and voice cues in real-time.
 * Supports direct routing to an external AudioNode (such as a MediaStreamDestination for video export).
 */

/** F1 / F2 formant pairs for the cartoon narration voice. */
const VOWEL_FORMANTS: Record<string, [number, number]> = {
  a: [730, 1090],
  e: [530, 1840],
  i: [270, 2290],
  o: [570, 840],
  u: [300, 870],
  y: [440, 1600],
};

export interface SfxLayer {
  k: 't' | 'n';
  f: number;
  f2?: number;
  d: number;
  g: number;
  w?: OscillatorType;
  ft?: BiquadFilterType;
  q?: number;
  t?: number;
}

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 1.0;

  public getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public getVolume(): number {
    return this.volume;
  }

  private routeOutput(node: AudioNode, dest?: AudioNode) {
    if (dest) {
      node.connect(dest);
    } else if (this.ctx) {
      node.connect(this.ctx.destination);
    }
  }

  // Soft cartoon footstep pop
  public playFootstep(isCheerSkip: boolean = false, dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const startFreq = isCheerSkip ? 580 : 310;
      const endFreq = isCheerSkip ? 280 : 90;
      const duration = isCheerSkip ? 0.12 : 0.08;

      osc.type = isCheerSkip ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

      gain.gain.setValueAtTime(0.3 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      this.routeOutput(gain, dest);

      osc.start(now);
      osc.stop(now + duration);
    } catch {}
  }

  // Sharp comedic record scratch when shadow abruptly stops
  public playRecordScratch(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const duration = 0.28;

      // 1. Noise scratch burst
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(2400, now);
      bandpass.frequency.exponentialRampToValueAtTime(300, now + duration);
      bandpass.Q.setValueAtTime(4, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.4 * this.volume, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(bandpass);
      bandpass.connect(noiseGain);
      this.routeOutput(noiseGain, dest);

      // 2. High-pitched needle rip
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + duration);

      oscGain.gain.setValueAtTime(0.25 * this.volume, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(oscGain);
      this.routeOutput(oscGain, dest);

      noise.start(now);
      osc.start(now);
      noise.stop(now + duration);
      osc.stop(now + duration);
    } catch {}
  }

  // Paper slap / clipboard snap
  public playPaperSlap(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const duration = 0.12;

      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.02));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(900, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.35 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      this.routeOutput(gain, dest);

      noise.start(now);
      noise.stop(now + duration);
    } catch {}
  }

  // Clipboard tapping sound (sharp dry click)
  public playClipboardTap(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1350, now);
      osc.frequency.exponentialRampToValueAtTime(500, now + 0.035);

      gain.gain.setValueAtTime(0.4 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      this.routeOutput(gain, dest);

      osc.start(now);
      osc.stop(now + 0.035);
    } catch {}
  }

  // Soft floor-contact thump
  public playFloorThump(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(38, now + 0.16);

      gain.gain.setValueAtTime(0.5 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(gain);
      this.routeOutput(gain, dest);

      osc.start(now);
      osc.stop(now + 0.16);
    } catch {}
  }

  // Squeak as shadow crosses arms
  public playArmCrossSqueak(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(750, now);
      osc.frequency.linearRampToValueAtTime(980, now + 0.09);

      gain.gain.setValueAtTime(0.18 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      this.routeOutput(gain, dest);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {}
  }

  // Cartoon toss whoosh
  public playWhoosh(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.18);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.3 * this.volume, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      this.routeOutput(gain, dest);

      osc.start(now);
      osc.stop(now + 0.18);
    } catch {}
  }

  // Metallic rim clink
  public playRimClink(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1850, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);

      gain.gain.setValueAtTime(0.35 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      this.routeOutput(gain, dest);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {}
  }

  // Bright gold-coin ring
  public playCoinTing(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [2600, 3900, 5200].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.94, now + 0.4);

        const dur = 0.42 - idx * 0.1;
        gain.gain.setValueAtTime((0.24 / (idx + 1)) * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

        osc.connect(gain);
        this.routeOutput(gain, dest);

        osc.start(now);
        osc.stop(now + dur);
      });
    } catch {}
  }

  // Wet splash: filtered noise plus one low bloop
  public playWaterSplash(dest?: AudioNode, strength = 1) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const dur = 0.4;
      const size = Math.floor(ctx.sampleRate * dur);
      const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < size; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.08));
      }
      const src = ctx.createBufferSource();
      src.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.frequency.exponentialRampToValueAtTime(3200, now + 0.12);
      filter.Q.setValueAtTime(0.9, now);

      const g = ctx.createGain();
      g.gain.setValueAtTime(0.42 * strength * this.volume, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + dur);

      src.connect(filter);
      filter.connect(g);
      this.routeOutput(g, dest);
      src.start(now);
      src.stop(now + dur);

      const bloop = ctx.createOscillator();
      const bloopGain = ctx.createGain();
      bloop.type = 'sine';
      bloop.frequency.setValueAtTime(620, now);
      bloop.frequency.exponentialRampToValueAtTime(180, now + 0.16);
      bloopGain.gain.setValueAtTime(0.22 * strength * this.volume, now);
      bloopGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      bloop.connect(bloopGain);
      this.routeOutput(bloopGain, dest);
      bloop.start(now);
      bloop.stop(now + 0.22);
    } catch {}
  }

  // Resonant lamp metal ring
  public playLampDing(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [1100, 1650, 2200].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        const dur = 0.35 - idx * 0.08;
        gain.gain.setValueAtTime((0.25 / (idx + 1)) * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

        osc.connect(gain);
        this.routeOutput(gain, dest);

        osc.start(now);
        osc.stop(now + dur);
      });
    } catch {}
  }

  // Heavy ceiling fan blade WHACK
  public playFanWhack(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const dur = 0.22;

      // Noise burst for impact slap
      const bufferSize = Math.floor(ctx.sampleRate * dur);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.03));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.frequency.exponentialRampToValueAtTime(200, now + dur);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.5 * this.volume, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + dur);

      noise.connect(filter);
      filter.connect(noiseGain);
      this.routeOutput(noiseGain, dest);

      // Low frequency body thump
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(65, now + 0.15);

      oscGain.gain.setValueAtTime(0.4 * this.volume, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(oscGain);
      this.routeOutput(oscGain, dest);

      noise.start(now);
      osc.start(now);
      noise.stop(now + dur);
      osc.stop(now + dur);
    } catch {}
  }

  // Wall bounce elastic pop
  public playWallBounce(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.09);

      gain.gain.setValueAtTime(0.3 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      this.routeOutput(gain, dest);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {}
  }

  // Forehead cartoon bonk
  public playHeadBonk(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // 1. High wooden click
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = 'triangle';
      clickOsc.frequency.setValueAtTime(950, now);
      clickOsc.frequency.exponentialRampToValueAtTime(320, now + 0.06);

      clickGain.gain.setValueAtTime(0.4 * this.volume, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      clickOsc.connect(clickGain);
      this.routeOutput(clickGain, dest);

      // 2. Hollow resonant skull bonk (classic cartoon "dook")
      const hollowOsc = ctx.createOscillator();
      const hollowGain = ctx.createGain();
      hollowOsc.type = 'sine';
      hollowOsc.frequency.setValueAtTime(380, now);
      hollowOsc.frequency.exponentialRampToValueAtTime(110, now + 0.22);

      hollowGain.gain.setValueAtTime(0.45 * this.volume, now);
      hollowGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      hollowOsc.connect(hollowGain);
      this.routeOutput(hollowGain, dest);

      clickOsc.start(now);
      hollowOsc.start(now);
      clickOsc.stop(now + 0.06);
      hollowOsc.stop(now + 0.22);
    } catch {}
  }

  // Paper ball rolling / plop onto desk
  public playDeskPlop(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);

      gain.gain.setValueAtTime(0.25 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      this.routeOutput(gain, dest);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {}
  }

  // Tiny calculator button beep (two-step chirp)
  /**
   * A short woody thunk for a blunt dart sticking into cork, a dartboard or
   * the top of a stickman's head. Softer and rounder than a desk plop.
   */
  public playDartThunk(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(230, now);
      osc.frequency.exponentialRampToValueAtTime(88, now + 0.09);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(0.34 * this.volume, now + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
      osc.connect(g);
      this.routeOutput(g, dest);
      osc.start(now);
      osc.stop(now + 0.18);

      const size = Math.max(1, Math.floor(ctx.sampleRate * 0.04));
      const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < size; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.007));
      }
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1700, now);
      filter.Q.setValueAtTime(1.3, now);
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0.22 * this.volume, now);
      ng.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
      src.connect(filter);
      filter.connect(ng);
      this.routeOutput(ng, dest);
      src.start(now);
      src.stop(now + 0.06);
    } catch {}
  }

  public playCalculatorBeep(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [920, 1380].forEach((freq, idx) => {
        const start = now + idx * 0.07;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.07 * this.volume, start + 0.006);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.06);

        osc.connect(gain);
        this.routeOutput(gain, dest);
        osc.start(start);
        osc.stop(start + 0.065);
      });
    } catch {}
  }

  // Bright two-note "I am a genius" confirmation chime
  public playConfidenceDing(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [
        { f: 1046.5, start: 0, dur: 0.16 },
        { f: 1568.0, start: 0.13, dur: 0.32 },
      ].forEach((note) => {
        const start = now + note.start;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(note.f, start);
        gain.gain.setValueAtTime(0.14 * this.volume, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + note.dur);

        osc.connect(gain);
        this.routeOutput(gain, dest);
        osc.start(start);
        osc.stop(start + note.dur);
      });
    } catch {}
  }

  // Four-second procedural training-montage music bed
  public playTrainingMusic(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const melody = [
        440.0, 523.25, 659.25, 523.25, 440.0, 523.25, 659.25, 783.99,
        659.25, 523.25, 440.0, 392.0, 440.0, 523.25, 659.25, 880.0,
        783.99, 659.25,
      ];

      melody.forEach((freq, idx) => {
        const start = now + idx * 0.2;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.065 * this.volume, start + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.17);
        osc.connect(gain);
        this.routeOutput(gain, dest);
        osc.start(start);
        osc.stop(start + 0.18);
      });

      // Simple stomp-like downbeats under the montage.
      for (let i = 0; i < 9; i++) {
        const start = now + i * 0.4;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(130, start);
        osc.frequency.exponentialRampToValueAtTime(48, start + 0.12);
        gain.gain.setValueAtTime(0.13 * this.volume, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.13);
        osc.connect(gain);
        this.routeOutput(gain, dest);
        osc.start(start);
        osc.stop(start + 0.14);
      }
    } catch {}
  }

  // Two-thump suspense heartbeat (lub-dub)
  public playHeartbeat(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [
        { start: 0, gain: 0.34, from: 72, to: 42, dur: 0.17 },
        { start: 0.22, gain: 0.25, from: 62, to: 36, dur: 0.2 },
      ].forEach((beat) => {
        const start = now + beat.start;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(beat.from, start);
        osc.frequency.exponentialRampToValueAtTime(beat.to, start + beat.dur);
        gain.gain.setValueAtTime(beat.gain * this.volume, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + beat.dur);
        osc.connect(gain);
        this.routeOutput(gain, dest);
        osc.start(start);
        osc.stop(start + beat.dur);
      });
    } catch {}
  }

  // Three-second triumphant fanfare, timed to end just before the crash
  public playVictoryFanfare(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [
        { f: 523.25, start: 0.0, dur: 0.16 },
        { f: 659.25, start: 0.18, dur: 0.16 },
        { f: 783.99, start: 0.36, dur: 0.16 },
        { f: 1046.5, start: 0.54, dur: 0.55 },
        { f: 783.99, start: 1.2, dur: 0.16 },
        { f: 1046.5, start: 1.38, dur: 0.16 },
        { f: 1318.5, start: 1.56, dur: 0.55 },
        { f: 1046.5, start: 2.25, dur: 0.16 },
        { f: 1318.5, start: 2.43, dur: 0.16 },
        { f: 1568.0, start: 2.61, dur: 0.55 },
      ];

      notes.forEach((note) => {
        const start = now + note.start;
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(note.f, start);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2400, start);
        filter.frequency.exponentialRampToValueAtTime(1100, start + note.dur);
        filter.Q.setValueAtTime(1.8, start);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.12 * this.volume, start + 0.025);
        gain.gain.setValueAtTime(0.1 * this.volume, start + Math.max(0.04, note.dur - 0.05));
        gain.gain.exponentialRampToValueAtTime(0.001, start + note.dur);

        osc.connect(filter);
        filter.connect(gain);
        this.routeOutput(gain, dest);
        osc.start(start);
        osc.stop(start + note.dur);
      });
    } catch {}
  }

  // Trash can tipping crash: noise burst, metal clatter, low thud, paper bounces
  public playTrashCrash(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const duration = 0.5;

      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.09));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2200, now);
      filter.frequency.exponentialRampToValueAtTime(280, now + duration);
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.45 * this.volume, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      noise.connect(filter);
      filter.connect(noiseGain);
      this.routeOutput(noiseGain, dest);
      noise.start(now);
      noise.stop(now + duration);

      const clanks = [
        { f: 1320, start: 0.0, dur: 0.09, g: 0.2 },
        { f: 880, start: 0.08, dur: 0.1, g: 0.16 },
        { f: 1560, start: 0.17, dur: 0.08, g: 0.14 },
        { f: 720, start: 0.26, dur: 0.11, g: 0.12 },
      ];
      clanks.forEach((clank) => {
        const start = now + clank.start;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(clank.f, start);
        osc.frequency.exponentialRampToValueAtTime(clank.f * 0.55, start + clank.dur);
        gain.gain.setValueAtTime(clank.g * this.volume, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + clank.dur);
        osc.connect(gain);
        this.routeOutput(gain, dest);
        osc.start(start);
        osc.stop(start + clank.dur);
      });

      const thud = ctx.createOscillator();
      const thudGain = ctx.createGain();
      thud.type = 'sine';
      thud.frequency.setValueAtTime(125, now);
      thud.frequency.exponentialRampToValueAtTime(34, now + 0.3);
      thudGain.gain.setValueAtTime(0.5 * this.volume, now);
      thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
      thud.connect(thudGain);
      this.routeOutput(thudGain, dest);
      thud.start(now);
      thud.stop(now + 0.33);

      // A few soft paper-ball bounces in the spill
      [0.18, 0.3, 0.44].forEach((startOffset, idx) => {
        const start = now + startOffset;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(210 - idx * 25, start);
        osc.frequency.exponentialRampToValueAtTime(75, start + 0.08);
        gain.gain.setValueAtTime(0.12 * this.volume, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.09);
        osc.connect(gain);
        this.routeOutput(gain, dest);
        osc.start(start);
        osc.stop(start + 0.1);
      });
    } catch {}
  }

  // Mournful sad trombone (wah-wah-wah-waaa)
  public playSadTrombone(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [
        { freq: 155.56, start: 0.0, dur: 0.28 }, // Eb3
        { freq: 146.83, start: 0.32, dur: 0.28 }, // D3
        { freq: 138.59, start: 0.64, dur: 0.28 }, // Db3
        { freq: 130.81, start: 0.96, dur: 0.75, slideTo: 108.0 }, // C3 drooping to A2
      ];

      notes.forEach((n) => {
        const noteStart = now + n.start;
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        // Trombone buzzy brass timbre
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(n.freq, noteStart);
        if (n.slideTo) {
          osc.frequency.linearRampToValueAtTime(n.slideTo, noteStart + n.dur);
        }

        // Wah filter sweep
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(350, noteStart);
        filter.frequency.linearRampToValueAtTime(750, noteStart + 0.08);
        filter.frequency.exponentialRampToValueAtTime(320, noteStart + n.dur);
        filter.Q.setValueAtTime(3.5, noteStart);

        gain.gain.setValueAtTime(0.001, noteStart);
        gain.gain.linearRampToValueAtTime(0.32 * this.volume, noteStart + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + n.dur);

        osc.connect(filter);
        filter.connect(gain);
        this.routeOutput(gain, dest);

        osc.start(noteStart);
        osc.stop(noteStart + n.dur);
      });
    } catch {}
  }

  // Low dramatic rumble that opens a big comic beat
  public playDramaticRumble(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const duration = 1.4;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(58, now);
      osc.frequency.linearRampToValueAtTime(38, now + duration);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, now);
      filter.frequency.linearRampToValueAtTime(90, now + duration);
      filter.Q.setValueAtTime(2.5, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.32 * this.volume, now + 0.18);
      gain.gain.setValueAtTime(0.28 * this.volume, now + duration * 0.6);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      this.routeOutput(gain, dest);

      osc.start(now);
      osc.stop(now + duration);
    } catch {}
  }

  // Soft calming chime (two warm bell partials)
  public playCalmingChime(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [
        { f: 880, start: 0, dur: 0.9, g: 0.16 },
        { f: 1320, start: 0.06, dur: 0.8, g: 0.09 },
        { f: 1760, start: 0.12, dur: 0.6, g: 0.05 },
      ].forEach((note) => {
        const start = now + note.start;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(note.f, start);
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(note.g * this.volume, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + note.dur);
        osc.connect(gain);
        this.routeOutput(gain, dest);
        osc.start(start);
        osc.stop(start + note.dur);
      });
    } catch {}
  }

  // Small mechanical click for assembling a contraption
  public playMechanicalClick(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const duration = 0.055;

      const noise = ctx.createBufferSource();
      const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration));
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.012));
      }
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(3200, now);
      filter.Q.setValueAtTime(6, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.28 * this.volume, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(filter);
      filter.connect(noiseGain);
      this.routeOutput(noiseGain, dest);

      const click = ctx.createOscillator();
      const clickGain = ctx.createGain();
      click.type = 'square';
      click.frequency.setValueAtTime(720, now);
      click.frequency.exponentialRampToValueAtTime(240, now + 0.04);
      clickGain.gain.setValueAtTime(0.12 * this.volume, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      click.connect(clickGain);
      this.routeOutput(clickGain, dest);

      noise.start(now);
      noise.stop(now + duration);
      click.start(now);
      click.stop(now + 0.06);
    } catch {}
  }

  // Rubber band twang when the launcher is stretched and released
  public playRubberBandTwang(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const duration = 0.22;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + duration);

      gain.gain.setValueAtTime(0.3 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      this.routeOutput(gain, dest);

      osc.start(now);
      osc.stop(now + duration);
    } catch {}
  }

  // Over-powered launcher release: spring twang plus air blast
  public playLauncherFire(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Sharp spring release
      const twang = ctx.createOscillator();
      const twangGain = ctx.createGain();
      twang.type = 'sawtooth';
      twang.frequency.setValueAtTime(760, now);
      twang.frequency.exponentialRampToValueAtTime(120, now + 0.18);
      twangGain.gain.setValueAtTime(0.34 * this.volume, now);
      twangGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      twang.connect(twangGain);
      this.routeOutput(twangGain, dest);

      // Air blast
      const duration = 0.4;
      const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration));
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.1));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1500, now);
      filter.frequency.exponentialRampToValueAtTime(380, now + duration);
      filter.Q.setValueAtTime(1.4, now);
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.4 * this.volume, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      noise.connect(filter);
      filter.connect(noiseGain);
      this.routeOutput(noiseGain, dest);

      // Low body thump for the excessive force
      const body = ctx.createOscillator();
      const bodyGain = ctx.createGain();
      body.type = 'sine';
      body.frequency.setValueAtTime(150, now);
      body.frequency.exponentialRampToValueAtTime(48, now + 0.26);
      bodyGain.gain.setValueAtTime(0.45 * this.volume, now);
      bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      body.connect(bodyGain);
      this.routeOutput(bodyGain, dest);

      twang.start(now);
      twang.stop(now + 0.22);
      noise.start(now);
      noise.stop(now + duration);
      body.start(now);
      body.stop(now + 0.3);
    } catch {}
  }

  // Two dry knuckle cracks
  public playKnuckleCrack(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [0, 0.13].forEach((offset, idx) => {
        const start = now + offset;
        const duration = 0.07;
        const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration));
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.01));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(idx === 0 ? 2400 : 1900, start);
        filter.Q.setValueAtTime(5, now);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.34 * this.volume, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        noise.connect(filter);
        filter.connect(gain);
        this.routeOutput(gain, dest);
        noise.start(start);
        noise.stop(start + duration);
      });
    } catch {}
  }

  // Cartoon deep inhale before faking calm
  public playDeepBreath(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const duration = 0.65;

      const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration));
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const u = i / bufferSize;
        data[i] = (Math.random() * 2 - 1) * Math.sin(u * Math.PI) * (0.35 + u * 0.65);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(700, now);
      filter.frequency.linearRampToValueAtTime(1500, now + duration);
      filter.Q.setValueAtTime(1.2, now);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.26 * this.volume, now + duration * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      noise.connect(filter);
      filter.connect(gain);
      this.routeOutput(gain, dest);
      noise.start(now);
      noise.stop(now + duration);
    } catch {}
  }

  // Driving dramatic march: kick, snare and a low bass line
  public playDramaticMarch(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Kick drum
      [0, 0.5, 1.0, 1.5].forEach((offset) => {
        const start = now + offset;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, start);
        osc.frequency.exponentialRampToValueAtTime(42, start + 0.14);
        gain.gain.setValueAtTime(0.42 * this.volume, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.16);
        osc.connect(gain);
        this.routeOutput(gain, dest);
        osc.start(start);
        osc.stop(start + 0.18);
      });

      // Snare
      [0.25, 0.75, 1.25, 1.75].forEach((offset) => {
        const start = now + offset;
        const duration = 0.12;
        const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration));
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.02));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1800, start);
        filter.Q.setValueAtTime(1.1, start);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.22 * this.volume, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        noise.connect(filter);
        filter.connect(gain);
        this.routeOutput(gain, dest);
        noise.start(start);
        noise.stop(start + duration);
      });

      // Bass line
      [
        { f: 82.4, start: 0, dur: 0.45 },
        { f: 82.4, start: 0.5, dur: 0.45 },
        { f: 98, start: 1.0, dur: 0.45 },
        { f: 82.4, start: 1.5, dur: 0.6 },
      ].forEach((note) => {
        const start = now + note.start;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(note.f, start);
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(520, start);
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.14 * this.volume, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + note.dur);
        osc.connect(filter);
        filter.connect(gain);
        this.routeOutput(gain, dest);
        osc.start(start);
        osc.stop(start + note.dur + 0.02);
      });
    } catch {}
  }

  // High squeaky shoe / strained gym creak
  public playSqueak(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const duration = 0.26;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(760, now);
      osc.frequency.linearRampToValueAtTime(1250, now + duration * 0.5);
      osc.frequency.linearRampToValueAtTime(880, now + duration);

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1500, now);
      filter.Q.setValueAtTime(6, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.16 * this.volume, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      this.routeOutput(gain, dest);

      osc.start(now);
      osc.stop(now + duration + 0.02);
    } catch {}
  }

  // Basketball bounce: a low rubbery boing
  public playBasketballBounce(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const duration = 0.3;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(88, now + duration * 0.55);
      osc.frequency.exponentialRampToValueAtTime(150, now + duration);

      gain.gain.setValueAtTime(0.42 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      this.routeOutput(gain, dest);

      // A little rubber slap on top
      const noise = ctx.createBufferSource();
      const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * 0.05));
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.012));
      }
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(900, now);
      filter.Q.setValueAtTime(1.2, now);
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.16 * this.volume, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      noise.connect(filter);
      filter.connect(noiseGain);
      this.routeOutput(noiseGain, dest);

      osc.start(now);
      osc.stop(now + duration + 0.02);
      noise.start(now);
      noise.stop(now + 0.07);
    } catch {}
  }

  // Net swish: a soft airy flutter with a gentle thump
  public playSwish(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const duration = 0.55;

      const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration));
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const u = i / bufferSize;
        data[i] = (Math.random() * 2 - 1) * Math.sin(u * Math.PI) * (1 - u * 0.4);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(3200, now);
      filter.frequency.exponentialRampToValueAtTime(900, now + duration);
      filter.Q.setValueAtTime(1.6, now);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.3 * this.volume, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      noise.connect(filter);
      filter.connect(gain);
      this.routeOutput(gain, dest);
      noise.start(now);
      noise.stop(now + duration);

      const thump = ctx.createOscillator();
      const thumpGain = ctx.createGain();
      thump.type = 'sine';
      thump.frequency.setValueAtTime(190, now);
      thump.frequency.exponentialRampToValueAtTime(90, now + 0.12);
      thumpGain.gain.setValueAtTime(0.2 * this.volume, now);
      thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
      thump.connect(thumpGain);
      this.routeOutput(thumpGain, dest);
      thump.start(now);
      thump.stop(now + 0.15);
    } catch {}
  }

  // Imaginary crowd cheering: filtered noise swell with a couple of whoops
  public playCrowdCheer(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const duration = 2.4;

      const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration));
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const u = i / bufferSize;
        const swell = Math.sin(Math.min(1, u * 1.6) * Math.PI) * (1 - u * 0.35);
        data[i] = (Math.random() * 2 - 1) * swell;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(900, now);
      filter.frequency.linearRampToValueAtTime(1600, now + duration * 0.4);
      filter.frequency.linearRampToValueAtTime(800, now + duration);
      filter.Q.setValueAtTime(1.1, now);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.22 * this.volume, now + 0.25);
      gain.gain.setValueAtTime(0.2 * this.volume, now + duration * 0.6);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      noise.connect(filter);
      filter.connect(gain);
      this.routeOutput(gain, dest);
      noise.start(now);
      noise.stop(now + duration);

      // A few crowd whoops
      [0.18, 0.55, 1.0, 1.55].forEach((offset, idx) => {
        const start = now + offset;
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sine';
        const base = 320 + idx * 40;
        osc.frequency.setValueAtTime(base, start);
        osc.frequency.linearRampToValueAtTime(base * 1.7, start + 0.18);
        osc.frequency.linearRampToValueAtTime(base * 1.2, start + 0.42);
        oscGain.gain.setValueAtTime(0.001, start);
        oscGain.gain.linearRampToValueAtTime(0.07 * this.volume, start + 0.05);
        oscGain.gain.exponentialRampToValueAtTime(0.001, start + 0.45);
        osc.connect(oscGain);
        this.routeOutput(oscGain, dest);
        osc.start(start);
        osc.stop(start + 0.47);
      });
    } catch {}
  }

  // Basketball hoop tipping over: metal crash plus a low boom
  public playHoopCrash(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const duration = 0.85;

      const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration));
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.16));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(900, now);
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.38 * this.volume, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      noise.connect(filter);
      filter.connect(noiseGain);
      this.routeOutput(noiseGain, dest);
      noise.start(now);
      noise.stop(now + duration);

      // Metal clangs
      [
        { f: 1480, start: 0.0, dur: 0.32, g: 0.16 },
        { f: 1120, start: 0.07, dur: 0.26, g: 0.13 },
        { f: 1760, start: 0.16, dur: 0.22, g: 0.1 },
        { f: 860, start: 0.26, dur: 0.3, g: 0.11 },
      ].forEach((clang) => {
        const start = now + clang.start;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(clang.f, start);
        osc.frequency.exponentialRampToValueAtTime(clang.f * 0.6, start + clang.dur);
        gain.gain.setValueAtTime(clang.g * this.volume, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + clang.dur);
        osc.connect(gain);
        this.routeOutput(gain, dest);
        osc.start(start);
        osc.stop(start + clang.dur + 0.02);
      });

      // Low boom
      const boom = ctx.createOscillator();
      const boomGain = ctx.createGain();
      boom.type = 'sine';
      boom.frequency.setValueAtTime(120, now);
      boom.frequency.exponentialRampToValueAtTime(36, now + 0.4);
      boomGain.gain.setValueAtTime(0.5 * this.volume, now);
      boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
      boom.connect(boomGain);
      this.routeOutput(boomGain, dest);
      boom.start(now);
      boom.stop(now + 0.45);
    } catch {}
  }

  // ---------------------------------------------------------------------
  // ORIGINAL POP INSTRUMENTAL (used by the pop-star episode)
  // ---------------------------------------------------------------------

  /**
   * Schedule a slice of the original 58-second pop instrumental.
   *
   * The track is scheduled in sections so the browser never has to hold
   * thousands of live audio nodes at once (that crashes the tab on a 58s export).
   */
  public playPopTrackSection(dest?: AudioNode, fromSec = 0, toSec = 58) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const beat = 60 / 124;
      const bar = beat * 4;
      const base = ctx.currentTime + 0.06 - fromSec;

      // I - V - vi - IV, two bars each.
      const chords = [
        { root: 130.81, notes: [261.63, 329.63, 392.0] },
        { root: 98.0, notes: [246.94, 293.66, 392.0] },
        { root: 110.0, notes: [220.0, 261.63, 329.63] },
        { root: 87.31, notes: [174.61, 220.0, 261.63] },
      ];

      // One shared noise buffer for every drum hit.
      const noiseSize = Math.max(1, Math.floor(ctx.sampleRate * 0.3));
      const noiseBuffer = ctx.createBuffer(1, noiseSize, ctx.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseSize; i++) {
        noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.06));
      }

      const tone = (
        freq: number,
        at: number,
        dur: number,
        type: OscillatorType,
        gain: number,
        detune = 0
      ) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, at);
        if (detune) osc.detune.setValueAtTime(detune, at);
        g.gain.setValueAtTime(0.0001, at);
        g.gain.linearRampToValueAtTime(gain * this.volume, at + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        osc.connect(g);
        this.routeOutput(g, dest);
        osc.start(at);
        osc.stop(at + dur + 0.02);
      };

      const hit = (at: number, dur: number, freq: number, gain: number, q: number) => {
        const src = ctx.createBufferSource();
        src.buffer = noiseBuffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(freq, at);
        filter.Q.setValueAtTime(q, at);
        const g = ctx.createGain();
        g.gain.setValueAtTime(gain * this.volume, at);
        g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        src.connect(filter);
        filter.connect(g);
        this.routeOutput(g, dest);
        src.start(at);
        src.stop(at + dur + 0.02);
      };

      const firstBeat = Math.max(0, Math.floor(fromSec / beat));
      const lastBeat = Math.ceil(toSec / beat);

      for (let b = firstBeat; b < lastBeat; b++) {
        const at = base + b * beat;
        if (at < ctx.currentTime - 0.05) continue;
        const inBar = b % 4;
        const chord = chords[Math.floor(b / 8) % chords.length];
        const chorus = b * beat >= 32;
        const finale = b * beat >= 43;

        // Kick
        if (inBar === 0 || inBar === 2) {
          tone(78, at, 0.16, 'sine', 0.34);
          tone(48, at, 0.12, 'sine', 0.16);
        }
        if (inBar === 2 && chorus) {
          tone(78, at + beat * 0.75, 0.12, 'sine', 0.2);
        }

        // Snare and hats
        if (inBar === 1 || inBar === 3) {
          hit(at, 0.16, 1800, 0.2, 0.9);
        }
        hit(at + beat * 0.5, 0.045, 8200, 0.06, 1.4);
        if (chorus) {
          hit(at + beat * 0.25, 0.03, 9200, 0.04, 1.4);
        }

        // Bass
        tone(chord.root, at, beat * 0.9, 'square', 0.11);
        tone(chord.root * 1.5, at + beat * 0.75, beat * 0.4, 'square', 0.05);

        // Pluck arpeggio
        const arp = [0, 1, 2, 1];
        for (let sIdx = 0; sIdx < 4; sIdx++) {
          const note = chord.notes[arp[sIdx]];
          tone(note * (finale && sIdx === 0 ? 2 : 1), at + sIdx * (beat / 2), beat * 0.4, 'square', 0.045);
        }

        // Pad
        if (b % 4 === 0) {
          tone(chord.notes[0] / 2, at, bar * 0.95, 'sawtooth', 0.035, -7);
          tone(chord.notes[2] / 2, at, bar * 0.95, 'sawtooth', 0.028, 7);
        }

        // Lead melody once the robot takes over the stage.
        if (chorus) {
          const lead = [659.25, 587.33, 523.25, 587.33, 659.25, 783.99, 659.25, 523.25];
          const note = lead[b % lead.length];
          tone(note, at, beat * 0.85, 'triangle', 0.1);
          if (finale) {
            tone(note * 2, at, beat * 0.5, 'sine', 0.04);
          }
        }
      }

      // A big final hit on the last section.
      if (toSec >= 57.6) {
        const end = base + 57.6;
        tone(130.81, end, 0.9, 'sawtooth', 0.12);
        tone(196.0, end, 0.9, 'sawtooth', 0.1);
        hit(end, 0.5, 3200, 0.16, 0.8);
      }
    } catch {}
  }

  /** The whole 58-second original pop instrumental. */
  public playPopTrack(dest?: AudioNode) {
    this.playPopTrackSection(dest, 0, 58);
  }

  // Funny little robot bleep
  public playRobotBleep(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      [880, 1320].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + i * 0.09);
        gain.gain.setValueAtTime(0.0001, now + i * 0.09);
        gain.gain.linearRampToValueAtTime(0.1 * this.volume, now + i * 0.09 + 0.006);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.09 + 0.1);
        osc.connect(gain);
        this.routeOutput(gain, dest);
        osc.start(now + i * 0.09);
        osc.stop(now + i * 0.09 + 0.12);
      });
    } catch {}
  }

  // A hairbrush snapping in half
  public playBrushBreak(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.16);
      gain.gain.setValueAtTime(0.22 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
      osc.connect(gain);
      this.routeOutput(gain, dest);
      osc.start(now);
      osc.stop(now + 0.2);

      const size = Math.max(1, Math.floor(ctx.sampleRate * 0.22));
      const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < size; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.05));
      }
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2600, now);
      filter.Q.setValueAtTime(1.2, now);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.18 * this.volume, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
      src.connect(filter);
      filter.connect(g);
      this.routeOutput(g, dest);
      src.start(now);
      src.stop(now + 0.24);
    } catch {}
  }

  // A glamorous microphone sparkle
  public playMicSparkle(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      [1046.5, 1396.9, 1760, 2093].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const at = now + i * 0.055;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, at);
        gain.gain.setValueAtTime(0.0001, at);
        gain.gain.linearRampToValueAtTime(0.07 * this.volume, at + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.34);
        osc.connect(gain);
        this.routeOutput(gain, dest);
        osc.start(at);
        osc.stop(at + 0.36);
      });
    } catch {}
  }

  // ---------------------------------------------------------------------
  // ORIGINAL SCORE - "ANGRY STICKMAN: TRICK-SHOT CHAMPION"
  // ---------------------------------------------------------------------

  /**
   * Schedule a slice of the 60-second trick-shot score.
   *
   * An original modern pop instrumental: a driving 128 BPM pop beat that
   * escalates into a full cinematic epic during the championship shot and
   * ends on a triumphant final chord.
   *
   * The score is scheduled in short sections so the browser never holds
   * thousands of live audio nodes at once.
   */
  public playTrickShotScoreSection(dest?: AudioNode, fromSec = 0, toSec = 60) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const beat = 60 / 128;
      const bar = beat * 4;
      const base = ctx.currentTime + 0.06 - fromSec;

      // i - VI - III - VII in A minor, one bar each.
      const chords = [
        { root: 110.0, notes: [220.0, 261.63, 329.63] },
        { root: 87.31, notes: [174.61, 220.0, 261.63] },
        { root: 130.81, notes: [261.63, 329.63, 392.0] },
        { root: 98.0, notes: [196.0, 246.94, 293.66] },
      ];

      const noiseSize = Math.max(1, Math.floor(ctx.sampleRate * 0.35));
      const noiseBuffer = ctx.createBuffer(1, noiseSize, ctx.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseSize; i++) {
        noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.07));
      }

      // The score stacks a lot of voices, so it gets its own headroom trim.
      const LEVEL = 0.64;

      const tone = (
        freq: number,
        at: number,
        dur: number,
        type: OscillatorType,
        gain: number,
        detune = 0
      ) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, at);
        if (detune) osc.detune.setValueAtTime(detune, at);
        g.gain.setValueAtTime(0.0001, at);
        g.gain.linearRampToValueAtTime(gain * LEVEL * this.volume, at + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        osc.connect(g);
        this.routeOutput(g, dest);
        osc.start(at);
        osc.stop(at + dur + 0.02);
      };

      const hit = (at: number, dur: number, freq: number, gain: number, q: number) => {
        const src = ctx.createBufferSource();
        src.buffer = noiseBuffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(freq, at);
        filter.Q.setValueAtTime(q, at);
        const g = ctx.createGain();
        g.gain.setValueAtTime(gain * LEVEL * this.volume, at);
        g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        src.connect(filter);
        filter.connect(g);
        this.routeOutput(g, dest);
        src.start(at);
        src.stop(at + dur + 0.02);
      };

      const firstBeat = Math.max(0, Math.floor(fromSec / beat));
      const lastBeat = Math.ceil(toSec / beat);

      for (let b = firstBeat; b < lastBeat; b++) {
        const at = base + b * beat;
        if (at < ctx.currentTime - 0.05) continue;
        const inBar = b % 4;
        const chord = chords[Math.floor(b / 4) % chords.length];
        const time = b * beat;
        const training = time >= 16;
        const epic = time >= 36;
        const peak = time >= 49;
        const slowMo = time >= 41.6 && time < 46.05;

        // Kick
        if (inBar === 0 || inBar === 2) {
          tone(74, at, 0.17, 'sine', 0.34);
          tone(46, at, 0.12, 'sine', 0.17);
        }
        if (epic && inBar === 2) {
          tone(74, at + beat * 0.75, 0.13, 'sine', 0.2);
        }

        // Snare and clap
        if (inBar === 1 || inBar === 3) {
          hit(at, 0.16, 1900, 0.19, 0.9);
        }

        // Hats
        hit(at + beat * 0.5, 0.045, 8200, training ? 0.065 : 0.045, 1.4);
        if (training) {
          hit(at + beat * 0.25, 0.03, 9200, 0.038, 1.4);
          hit(at + beat * 0.75, 0.03, 9200, 0.03, 1.4);
        }

        // Bass
        tone(chord.root, at, beat * 0.9, 'square', training ? 0.13 : 0.1);
        tone(chord.root * 1.5, at + beat * 0.75, beat * 0.4, 'square', 0.055);

        // Pluck arpeggio
        const arp = [0, 1, 2, 1];
        for (let s = 0; s < 4; s++) {
          const note = chord.notes[arp[s]];
          tone(note * (peak && s === 0 ? 2 : 1), at + s * (beat / 2), beat * 0.4, 'square', 0.042);
        }

        // A bright sixteenth arp once the training starts.
        if (training && !slowMo) {
          for (let s = 0; s < 4; s++) {
            const note = chord.notes[(s + 1) % 3];
            tone(note * 2, at + beat * 0.5 + s * (beat / 4), beat * 0.2, 'triangle', 0.026);
          }
        }

        // The epic pad under the championship shot.
        if (epic && b % 4 === 0) {
          tone(chord.notes[0] / 2, at, bar * 0.98, 'sawtooth', 0.04, -8);
          tone(chord.notes[2] / 2, at, bar * 0.98, 'sawtooth', 0.032, 8);
        }

        // The epic lead.
        if (epic) {
          const lead = [440.0, 523.25, 659.25, 587.33, 523.25, 440.0, 392.0, 523.25];
          const note = lead[b % lead.length];
          tone(note, at, beat * 0.9, 'sawtooth', slowMo ? 0.085 : 0.1, -6);
          tone(note * 1.005, at, beat * 0.9, 'sawtooth', 0.07, 6);
        }

        // The triumphant bell melody.
        if (peak) {
          const bell = [880.0, 1046.5, 1318.5, 1046.5, 880.0, 783.99, 880.0, 0];
          const note = bell[b % bell.length];
          if (note > 0) {
            tone(note, at, beat * 1.1, 'sine', 0.07);
            tone(note * 2, at, beat * 0.6, 'sine', 0.03);
          }
        }

        // A rolling snare build through the slow motion rim spin.
        if (slowMo) {
          const roll = (t: number) => {
            const u = (time + t - 41.6) / 4.45;
            return Math.max(0, u);
          };
          for (let r = 0; r < 4; r++) {
            const rt = (r + 1) * (beat / 4);
            hit(at + rt, 0.05, 2400, 0.03 + roll(rt) * 0.07, 1.1);
          }
        }
      }

      // Big chord hits.
      if (fromSec <= 16.4 && toSec > 16.4) {
        const at = base + 16.4;
        tone(110, at, 0.5, 'sawtooth', 0.1);
        tone(164.81, at, 0.5, 'sawtooth', 0.08);
        hit(at, 0.3, 3000, 0.14, 0.9);
      }
      if (fromSec <= 36.0 && toSec > 36.0) {
        const at = base + 36.0;
        tone(110, at, 0.7, 'sawtooth', 0.12);
        tone(130.81, at, 0.7, 'sawtooth', 0.1);
        tone(164.81, at, 0.7, 'sawtooth', 0.09);
        hit(at, 0.4, 2600, 0.16, 0.8);
      }
      if (fromSec <= 49.2 && toSec > 49.2) {
        const at = base + 49.2;
        tone(130.81, at, 0.9, 'sawtooth', 0.13);
        tone(164.81, at, 0.9, 'sawtooth', 0.11);
        tone(196.0, at, 0.9, 'sawtooth', 0.1);
        tone(261.63, at, 0.9, 'sawtooth', 0.07);
        hit(at, 0.5, 3400, 0.17, 0.8);
      }
      if (fromSec <= 59.55 && toSec > 59.55) {
        const at = base + 59.55;
        tone(110, at, 1.1, 'sawtooth', 0.14);
        tone(130.81, at, 1.1, 'sawtooth', 0.12);
        tone(164.81, at, 1.1, 'sawtooth', 0.11);
        tone(261.63, at, 1.1, 'sawtooth', 0.08);
        hit(at, 0.6, 3200, 0.18, 0.8);
      }
    } catch {}
  }

  /**
   * The 30-second score for "THE PING-PONG REVENGE".
   *
   * A tiny one-room comedy score: a smug pizzicato sneaks under the opening,
   * turns into a ticking measuring theme, builds into a rage tremolo, cuts
   * dead on the table slam, comes back as a tick-tock during the ricochet,
   * holds its breath for the cup, and finishes with a short victory fanfare
   * that the record scratch kills.
   *
   * Scheduled in sections so a 30-second export never holds thousands of live
   * nodes at once.
   */
  public playPingPongScoreSection(dest?: AudioNode, fromSec = 0, toSec = 30) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const beat = 60 / 132;
      const bar = beat * 4;
      const base = ctx.currentTime + 0.06 - fromSec;

      const noiseSize = Math.max(1, Math.floor(ctx.sampleRate * 0.3));
      const noiseBuffer = ctx.createBuffer(1, noiseSize, ctx.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseSize; i++) {
        noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.05));
      }

      const LEVEL = 0.62;

      const tone = (
        freq: number,
        at: number,
        dur: number,
        type: OscillatorType,
        gain: number,
        detune = 0
      ) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, at);
        if (detune) osc.detune.setValueAtTime(detune, at);
        g.gain.setValueAtTime(0.0001, at);
        g.gain.linearRampToValueAtTime(gain * LEVEL * this.volume, at + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        osc.connect(g);
        this.routeOutput(g, dest);
        osc.start(at);
        osc.stop(at + dur + 0.02);
      };

      const hit = (at: number, dur: number, freq: number, gain: number, q: number) => {
        const src = ctx.createBufferSource();
        src.buffer = noiseBuffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(freq, at);
        filter.Q.setValueAtTime(q, at);
        const g = ctx.createGain();
        g.gain.setValueAtTime(gain * LEVEL * this.volume, at);
        g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        src.connect(filter);
        filter.connect(g);
        this.routeOutput(g, dest);
        src.start(at);
        src.stop(at + dur + 0.02);
      };

      const firstBeat = Math.max(0, Math.floor(fromSec / beat));
      const lastBeat = Math.ceil(toSec / beat);

      // The comedy bed: A minor, one root per bar.
      const roots = [110.0, 110.0, 87.31, 98.0];
      const motif = [440.0, 523.25, 659.25, 523.25, 587.33, 523.25, 440.0, 392.0];
      const climb = [440.0, 493.88, 523.25, 587.33, 659.25, 698.46, 783.99, 880.0];

      // The score must drop out for the bonk, the slam and the final gag.
      const silent = (time: number) =>
        (time >= 5.95 && time < 6.9) ||
        (time >= 15.42 && time < 18.3) ||
        (time >= 27.2 && time < 30.0);

      for (let b = firstBeat; b < lastBeat; b++) {
        const time = b * beat;
        const at = base + b * beat;
        if (time < fromSec - 0.001 || time >= toSec) continue;
        if (at < ctx.currentTime - 0.05) continue;

        const inBar = b % 4;
        const barIndex = Math.floor(b / 4);
        const root = roots[barIndex % roots.length];

        if (silent(time)) continue;

        if (time < 8.4) {
          // ------- SMUG: pizzicato bass, shaker and a self-satisfied motif.
          hit(at, 0.03, 9000, 0.024, 1.5);
          hit(at + beat * 0.5, 0.025, 8000, 0.018, 1.5);

          tone(root, at, beat * 0.55, 'triangle', 0.13);
          if (inBar === 2) {
            tone(root * 1.5, at + beat * 0.5, beat * 0.3, 'triangle', 0.06);
          }

          if (inBar === 1 || inBar === 3) {
            const note = motif[b % motif.length];
            tone(note, at + beat * 0.5, beat * 0.34, 'sine', 0.055);
            tone(note * 2, at + beat * 0.5, beat * 0.2, 'sine', 0.016);
          }
        } else if (time < 13.0) {
          // ------- THE PLAN: a ticking, measuring little march.
          hit(at, 0.028, 2600, 0.05, 2.2);
          hit(at + beat * 0.5, 0.028, 2000, 0.04, 2.2);
          tone(root, at, beat * 0.4, 'square', 0.075);
          if (inBar === 2) {
            tone(root * 2, at + beat * 0.5, beat * 0.25, 'square', 0.035);
          }
          if (inBar === 1 || inBar === 3) {
            tone(motif[b % motif.length], at + beat * 0.5, beat * 0.28, 'sine', 0.04);
          }
        } else if (time < 15.42) {
          // ------- RAGE: rising tremolo and an accelerating snare.
          const u = (time - 13.0) / 2.42;
          tone(root / 2, at, beat * 0.85, 'sawtooth', 0.09 + u * 0.06);
          hit(at, 0.06, 1800 + u * 2400, 0.035 + u * 0.14, 0.8);
          for (let s = 1; s < 4; s++) {
            if (u > 0.3) hit(at + (s * beat) / 4, 0.04, 2300, 0.022 + u * 0.055, 1.1);
          }
          if (inBar === 0) {
            tone(220 * Math.pow(2, u * 1.7), at, bar * 0.9, 'sawtooth', 0.045, 5);
          }
        } else if (time < 18.3) {
          // ------- DEAD AIR after the slam: one low boom only.
          if (time < 15.95) {
            tone(55, at, 0.5, 'sine', 0.2);
          }
        } else if (time < 22.2) {
          // ------- THE RICOCHET: tick-tock plus a climbing scale.
          const u = (time - 18.3) / 3.9;
          hit(at, 0.03, 2500, 0.055, 2.2);
          hit(at + beat * 0.5, 0.03, 1800, 0.042, 2.2);
          tone(root, at, beat * 0.5, 'triangle', 0.095 + u * 0.045);
          tone(climb[b % climb.length], at + beat * 0.5, beat * 0.32, 'sine', 0.03 + u * 0.03);
          if (inBar === 0 && u > 0.55) {
            tone(root * 4, at, beat * 0.35, 'triangle', 0.026);
          }
        } else if (time < 25.0) {
          // ------- THE CUP: hold your breath, then a shimmer.
          const u = (time - 22.2) / 2.8;
          if (time < 23.4) {
            if (inBar === 0) tone(1318.51, at, beat * 1.4, 'sine', 0.018);
          } else {
            tone(880 + u * 880, at, beat * 0.45, 'sine', 0.026 + u * 0.028);
            hit(at, 0.03, 6000 + u * 2000, 0.02, 1.5);
          }
        } else {
          // ------- VICTORY: a bright two-bar fanfare, then the room goes quiet.
          const chords = [
            [261.63, 329.63, 392.0],
            [349.23, 440.0, 523.25],
            [392.0, 493.88, 587.33],
            [261.63, 329.63, 392.0],
          ];
          const chord = chords[barIndex % 4];
          if (inBar === 0) {
            chord.forEach((n) => tone(n, at, beat * 1.5, 'square', 0.045));
            tone(chord[0] / 2, at, beat * 1.5, 'triangle', 0.11);
          }
          const melody = [523.25, 659.25, 783.99, 1046.5, 783.99, 659.25, 587.33, 523.25];
          tone(melody[b % melody.length], at + beat * 0.25, beat * 0.28, 'sine', 0.055);
          hit(at + beat * 0.5, 0.05, 8200, 0.028, 1.4);
          if (inBar === 0 || inBar === 2) {
            tone(98, at, 0.12, 'sine', 0.16);
          }
        }
      }
    } catch {}
  }

  /**
   * The 30-second score for "THE ANGRY STICKMAN VS. THE IMPOSSIBLE DART SHOT".
   *
   * A smug pizzicato strut, a ticking engineering march, a tremolo rage that
   * cuts dead for the throw, a pinball tick-tock through the ricochet, a
   * breath-hold shimmer for the bullseye and a bright fanfare that the
   * dartboard bonk silences.
   *
   * Scheduled in sections so a long export never holds thousands of live
   * nodes at once.
   */
  public playDartShotScoreSection(dest?: AudioNode, fromSec = 0, toSec = 30) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const beat = 60 / 132;
      const base = ctx.currentTime + 0.06 - fromSec;

      const noiseSize = Math.max(1, Math.floor(ctx.sampleRate * 0.3));
      const noiseBuffer = ctx.createBuffer(1, noiseSize, ctx.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseSize; i++) {
        noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.05));
      }

      const LEVEL = 0.62;

      const tone = (
        freq: number,
        at: number,
        dur: number,
        type: OscillatorType,
        gain: number
      ) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, at);
        g.gain.setValueAtTime(0.0001, at);
        g.gain.linearRampToValueAtTime(gain * LEVEL * this.volume, at + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        osc.connect(g);
        this.routeOutput(g, dest);
        osc.start(at);
        osc.stop(at + dur + 0.02);
      };

      const hit = (at: number, dur: number, freq: number, gain: number, q: number) => {
        const src = ctx.createBufferSource();
        src.buffer = noiseBuffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(freq, at);
        filter.Q.setValueAtTime(q, at);
        const g = ctx.createGain();
        g.gain.setValueAtTime(gain * LEVEL * this.volume, at);
        g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        src.connect(filter);
        filter.connect(g);
        this.routeOutput(g, dest);
        src.start(at);
        src.stop(at + dur + 0.02);
      };

      const chord = (at: number, notes: number[], dur: number, gain: number) => {
        for (const n of notes) tone(n, at, dur, 'square', gain);
      };

      // Victory fanfare, played once when the section reaches it.
      if (fromSec <= 25.0 && toSec > 25.0) {
        chord(base + 25.0, [261.63, 329.63, 392.0, 523.25], beat * 1.2, 0.075);
        chord(base + 25.45, [349.23, 440.0, 523.25, 698.46], beat * 1.2, 0.075);
        chord(base + 25.88, [392.0, 493.88, 587.33, 783.99], beat * 0.8, 0.07);
        tone(1046.5, base + 25.88, beat * 0.5, 'sine', 0.09);
      }

      const roots = [110.0, 98.0, 87.31, 98.0];
      const motif = [440.0, 523.25, 659.25, 523.25, 587.33, 659.25, 523.25, 440.0];
      const climb = [440.0, 523.25, 587.33, 659.25, 783.99, 880.0, 987.77, 1046.5];
      const pinball = [1046.5, 1318.5, 1567.98, 1318.5, 1046.5, 880.0, 987.77, 1174.66];

      const firstBeat = Math.max(0, Math.floor(fromSec / beat));
      const lastBeat = Math.ceil(toSec / beat);

      for (let b = firstBeat; b < lastBeat; b++) {
        const time = b * beat;
        const at = base + b * beat;
        if (time < fromSec - 0.001 || time >= toSec) continue;
        if (at < ctx.currentTime - 0.05) continue;

        // The score drops out for the final throw and the closing gag.
        if (time >= 17.5 && time < 19.3) continue;
        if (time >= 26.8 && time < 30.0) continue;

        const inBar = b % 4;
        const barIndex = Math.floor(b / 4);

        if (time < 8.4) {
          // Smug strut.
          if (inBar === 0 || inBar === 2) {
            tone(roots[barIndex % 4], at, beat * 0.85, 'triangle', 0.13);
          }
          tone(motif[b % motif.length], at, beat * 0.5, 'sine', 0.055);
          if (inBar === 1 || inBar === 3) {
            tone(motif[b % motif.length] * 2, at + beat * 0.5, beat * 0.16, 'square', 0.03);
          }
          hit(at, 0.04, 8200, 0.028, 1.4);
        } else if (time < 13.3) {
          // Engineering march.
          hit(at, 0.035, 2600, 0.08, 2.2);
          tone(roots[barIndex % 4] * 0.5, at, beat * 0.42, 'square', 0.07);
          if (inBar === 0 || inBar === 2) {
            tone(880.0, at, beat * 0.26, 'sine', 0.05);
          }
          hit(at + beat * 0.5, 0.03, 1500, 0.05, 2.4);
          if (inBar === 3) {
            tone(climb[b % climb.length], at + beat * 0.5, beat * 0.2, 'triangle', 0.05);
          }
        } else if (time < 17.5) {
          // Rage tremolo.
          for (let s = 0; s < 4; s++) {
            const sub = at + (s * beat) / 4;
            tone(110, sub, beat * 0.2, 'sawtooth', 0.045 + 0.012 * s);
          }
          tone(roots[barIndex % 4] * 0.5, at, beat * 0.9, 'sawtooth', 0.07);
          hit(at, 0.07, 1200, 0.09 + 0.02 * Math.max(0, Math.min(1, (time - 13.3) / 4)), 1.2);
          if (inBar === 0) {
            tone(55, at, beat * 0.5, 'sine', 0.18);
          }
          tone(climb[b % climb.length] * 0.5, at + beat * 0.5, beat * 0.18, 'triangle', 0.04);
        } else if (time < 23.4) {
          // Pinball tick-tock.
          tone(pinball[b % pinball.length], at, beat * 0.16, 'triangle', 0.06);
          tone(pinball[(b + 3) % pinball.length], at + beat * 0.5, beat * 0.12, 'sine', 0.04);
          tone(70, at, beat * 0.12, 'sine', 0.17);
          hit(at, 0.03, 3000, 0.03, 2.0);
        } else if (time < 25.0) {
          // Breath held for the bullseye.
          tone(1567.98, at, beat * 1.3, 'sine', 0.045);
          tone(2093.0, at, beat * 1.2, 'sine', 0.025);
          tone(523.25, at, beat * 0.8, 'triangle', 0.04);
        }
        // 25.0-26.8 is the fanfare, scheduled once above; 26.8+ is silence.
      }
    } catch {}
  }

  /**
   * "THE ANGRY STICKMAN VS. THE IMPOSSIBLE COIN FLIP" ΓÇö a 30-second comedy
   * score in four 7.5 s slices: a smug coin-showman strut, a mechanical
   * engineer march, a rage tremolo that cuts dead for the final flick, a
   * pinball tick-tock through the ricochet, a held breath for the splash and
   * a fanfare that dies under the tipping glass.
   */
  public playCoinFlipScoreSection(dest?: AudioNode, fromSec = 0, toSec = 30) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const beat = 60 / 126;
      const base = ctx.currentTime + 0.06 - fromSec;

      const noiseSize = Math.max(1, Math.floor(ctx.sampleRate * 0.3));
      const noiseBuffer = ctx.createBuffer(1, noiseSize, ctx.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseSize; i++) {
        noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.05));
      }

      const LEVEL = 0.62;

      const tone = (
        freq: number,
        at: number,
        dur: number,
        type: OscillatorType,
        gain: number
      ) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, at);
        g.gain.setValueAtTime(0.0001, at);
        g.gain.linearRampToValueAtTime(gain * LEVEL * this.volume, at + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        osc.connect(g);
        this.routeOutput(g, dest);
        osc.start(at);
        osc.stop(at + dur + 0.02);
      };

      const hit = (at: number, dur: number, freq: number, gain: number, q: number) => {
        const src = ctx.createBufferSource();
        src.buffer = noiseBuffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(freq, at);
        filter.Q.setValueAtTime(q, at);
        const g = ctx.createGain();
        g.gain.setValueAtTime(gain * LEVEL * this.volume, at);
        g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        src.connect(filter);
        filter.connect(g);
        this.routeOutput(g, dest);
        src.start(at);
        src.stop(at + dur + 0.02);
      };

      const chord = (at: number, notes: number[], dur: number, gain: number) => {
        for (const n of notes) tone(n, at, dur, 'square', gain);
      };

      // Victory fanfare, played once when the section reaches it.
      if (fromSec <= 25.0 && toSec > 25.0) {
        chord(base + 25.0, [261.63, 329.63, 392.0, 523.25], beat * 1.2, 0.075);
        chord(base + 25.45, [293.66, 369.99, 440.0, 587.33], beat * 1.2, 0.075);
        chord(base + 25.9, [329.63, 415.3, 493.88, 659.25], beat * 0.9, 0.07);
        tone(1318.5, base + 25.9, beat * 0.5, 'sine', 0.08);
      }

      const roots = [110.0, 98.0, 87.31, 98.0];
      const motif = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 659.25, 523.25];
      const climb = [440.0, 523.25, 587.33, 659.25, 783.99, 880.0, 987.77, 1046.5];
      const pinball = [987.77, 1318.5, 1567.98, 1174.66, 1046.5, 1396.91, 1760.0, 1174.66];

      const firstBeat = Math.max(0, Math.floor(fromSec / beat));
      const lastBeat = Math.ceil(toSec / beat);

      for (let b = firstBeat; b < lastBeat; b++) {
        const time = b * beat;
        const at = base + b * beat;
        if (time < fromSec - 0.001 || time >= toSec) continue;
        if (at < ctx.currentTime - 0.05) continue;

        // The score drops out for the final flick and the closing gag.
        if (time >= 17.5 && time < 19.3) continue;
        if (time >= 26.9 && time < 30.0) continue;

        const inBar = b % 4;
        const barIndex = Math.floor(b / 4);

        if (time < 8.4) {
          // A smug showman strut.
          if (inBar === 0 || inBar === 2) {
            tone(roots[barIndex % 4], at, beat * 0.85, 'triangle', 0.13);
          }
          tone(motif[b % motif.length], at, beat * 0.5, 'sine', 0.055);
          if (inBar === 1 || inBar === 3) {
            tone(motif[b % motif.length] * 2, at + beat * 0.5, beat * 0.16, 'square', 0.028);
          }
          hit(at, 0.04, 8600, 0.026, 1.5);
        } else if (time < 14.1) {
          // Engineering march.
          hit(at, 0.035, 2700, 0.08, 2.2);
          tone(roots[barIndex % 4] * 0.5, at, beat * 0.42, 'square', 0.07);
          if (inBar === 0 || inBar === 2) {
            tone(880.0, at, beat * 0.26, 'sine', 0.05);
          }
          hit(at + beat * 0.5, 0.03, 1600, 0.05, 2.4);
          if (inBar === 3) {
            tone(climb[b % climb.length], at + beat * 0.5, beat * 0.2, 'triangle', 0.05);
          }
        } else if (time < 17.5) {
          // Rage tremolo.
          for (let s = 0; s < 4; s++) {
            const sub = at + (s * beat) / 4;
            tone(110, sub, beat * 0.2, 'sawtooth', 0.045 + 0.012 * s);
          }
          tone(roots[barIndex % 4] * 0.5, at, beat * 0.9, 'sawtooth', 0.07);
          hit(at, 0.07, 1200, 0.09 + 0.02 * Math.max(0, Math.min(1, (time - 14.1) / 3.4)), 1.2);
          if (inBar === 0) {
            tone(55, at, beat * 0.5, 'sine', 0.18);
          }
          tone(climb[b % climb.length] * 0.5, at + beat * 0.5, beat * 0.18, 'triangle', 0.04);
        } else if (time < 23.45) {
          // Pinball tick-tock through the ricochet.
          tone(pinball[b % pinball.length], at, beat * 0.16, 'triangle', 0.06);
          tone(pinball[(b + 3) % pinball.length], at + beat * 0.5, beat * 0.12, 'sine', 0.04);
          tone(70, at, beat * 0.12, 'sine', 0.17);
          hit(at, 0.03, 3100, 0.03, 2.0);
        } else if (time < 25.0) {
          // The splash lands: a held, glowing chord.
          tone(1567.98, at, beat * 1.3, 'sine', 0.045);
          tone(2093.0, at, beat * 1.2, 'sine', 0.022);
          tone(523.25, at, beat * 0.8, 'triangle', 0.04);
        }
        // 25.0-26.9 is the fanfare, scheduled once above; 26.9+ is silence.
      }
    } catch {}
  }

  /**
   * Speaks arbitrary text with the cartoon formant voice.
   *
   * Each word becomes a short syllable sequence: the vowel group picks the
   * F1/F2 formant pair and the pitch drifts down across the sentence so it
   * reads like a narrator counting down. Used by the Clone Reels export,
   * where the narration changes with the ranking data.
   */
  public playSpokenText(text: string, dest?: AudioNode) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const words = text.split(/\s+/).filter(Boolean);
      const total = Math.max(1, words.length);
      let t = now;

      words.forEach((word, wordIndex) => {
        const clean = word.toLowerCase().replace(/[^a-z]/g, '');
        if (!clean) {
          t += 0.05;
          return;
        }

        const groups = clean.match(/[aeiouy]+/g) ?? ['a'];
        const syllables = Math.min(4, Math.max(1, groups.length));
        // The narrator settles lower as the countdown goes on.
        const basePitch = 150 - (wordIndex / total) * 30;
        const wordDur = Math.min(1.5, 0.1 + clean.length * 0.028);

        for (let s = 0; s < syllables; s++) {
          const vowel = groups[s % groups.length];
          const formants = VOWEL_FORMANTS[vowel[0]] ?? VOWEL_FORMANTS.a;
          const sStart = t + (wordDur / syllables) * s;
          const dur = wordDur / syllables;

          const osc = ctx.createOscillator();
          osc.type = 'sawtooth';
          // A small falling contour inside each word.
          osc.frequency.setValueAtTime(basePitch * (1 + s * 0.04), sStart);
          osc.frequency.linearRampToValueAtTime(basePitch * 0.92, sStart + dur);

          const f1 = ctx.createBiquadFilter();
          f1.type = 'bandpass';
          f1.frequency.setValueAtTime(formants[0], sStart);
          f1.Q.setValueAtTime(6, sStart);

          const f2 = ctx.createBiquadFilter();
          f2.type = 'bandpass';
          f2.frequency.setValueAtTime(formants[1], sStart);
          f2.Q.setValueAtTime(8, sStart);

          const mix = ctx.createGain();
          mix.gain.setValueAtTime(1, sStart);

          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.001, sStart);
          gain.gain.linearRampToValueAtTime(0.5 * this.volume, sStart + 0.025);
          gain.gain.setValueAtTime(0.5 * this.volume, sStart + dur - 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, sStart + dur);

          osc.connect(f1);
          osc.connect(f2);
          f1.connect(mix);
          f2.connect(mix);
          mix.connect(gain);
          this.routeOutput(gain, dest);

          osc.start(sStart);
          osc.stop(sStart + dur + 0.02);
        }

        t += wordDur + 0.06;
      });
    } catch {}
  }

  // Deadpan documentary computer voice synthesis directly into AudioNode (embedded in video export)
  public playSynthesizedVoice(text: string, dest?: AudioNode) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Syllable rhythm breakdown for monotone deadpan speech
      const isIntro = text.toLowerCase().includes('shadow');
      const syllables = isIntro
        ? [
            { f: 120, dur: 0.16, v: 450 }, // "What"
            { f: 120, dur: 0.12, v: 380 }, // "if"
            { f: 118, dur: 0.16, v: 520 }, // "your"
            { f: 122, dur: 0.18, v: 680 }, // "sha-"
            { f: 115, dur: 0.22, v: 480 }, // "-dow"
            { f: 110, dur: 0.28, v: 360 }, // "quit"
          ]
        : [
            { f: 125, dur: 0.18, v: 550 }, // "H"
            { f: 125, dur: 0.2, v: 700 }, // "R"
            { f: 120, dur: 0.15, v: 620 }, // "has"
            { f: 118, dur: 0.14, v: 420 }, // "been"
            { f: 122, dur: 0.16, v: 500 }, // "no-"
            { f: 120, dur: 0.15, v: 390 }, // "-ti-"
            { f: 112, dur: 0.32, v: 640 }, // "-fied"
          ];

      let tOffset = 0;
      syllables.forEach((s) => {
        const sStart = now + tOffset;
        const osc = ctx.createOscillator();
        const formant = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(s.f, sStart);

        // Vocal tract formant resonance
        formant.type = 'bandpass';
        formant.frequency.setValueAtTime(s.v, sStart);
        formant.Q.setValueAtTime(5.5, sStart);

        gain.gain.setValueAtTime(0.001, sStart);
        gain.gain.linearRampToValueAtTime(0.28 * this.volume, sStart + 0.02);
        gain.gain.setValueAtTime(0.28 * this.volume, sStart + s.dur - 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, sStart + s.dur);

        osc.connect(formant);
        formant.connect(gain);
        this.routeOutput(gain, dest);

        osc.start(sStart);
        osc.stop(sStart + s.dur);

        tOffset += s.dur + 0.04;
      });
    } catch {}
  }

  // Cartoon liquid drop / coffee drip plop
  public playCoffeeDrip(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(2200, now + 0.04);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.12);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.38 * this.volume, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      this.routeOutput(gain, dest);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {}
  }

  // Wood pin impact / bowling strike crash
  public playPinImpact(dest?: AudioNode, intensity = 1.0) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // High wooden clack
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1100, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.08);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.45 * intensity * this.volume, now + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      this.routeOutput(gain, dest);
      osc.start(now);
      osc.stop(now + 0.13);

      // Hollow wooden resonance noise
      const dur = 0.18;
      const size = Math.max(1, Math.floor(ctx.sampleRate * dur));
      const buf = ctx.createBuffer(1, size, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < size; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.025));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, now);
      filter.Q.setValueAtTime(3.2, now);
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.35 * intensity * this.volume, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + dur);
      noise.connect(filter);
      filter.connect(noiseGain);
      this.routeOutput(noiseGain, dest);
      noise.start(now);
      noise.stop(now + dur);
    } catch {}
  }

  // Huge satisfying bowling pin explosion crash
  public playBowlingStrikeCrash(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      this.playPinImpact(dest, 1.4);
      setTimeout(() => this.playPinImpact(dest, 1.2), 35);
      setTimeout(() => this.playPinImpact(dest, 1.0), 70);
      setTimeout(() => this.playPinImpact(dest, 0.8), 110);
      setTimeout(() => this.playFloorThump(dest), 40);
    } catch {}
  }

  // Marble tiny high-pitched rolling sound
  public playMarbleRoll(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2400, now);
      osc.frequency.linearRampToValueAtTime(2800, now + 0.15);
      osc.frequency.linearRampToValueAtTime(2200, now + 0.3);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.18 * this.volume, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

      osc.connect(gain);
      this.routeOutput(gain, dest);
      osc.start(now);
      osc.stop(now + 0.33);
    } catch {}
  }

  // Muffled angry cartoon scream from underneath a pile
  public playMuffledScream(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const formant = ctx.createBiquadFilter();
      const lowpass = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(380, now + 0.4);

      formant.type = 'bandpass';
      formant.frequency.setValueAtTime(650, now); // low muffled formant
      formant.Q.setValueAtTime(3.0, now);

      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(750, now); // heavily muffled by the pile of pins!

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.28 * this.volume, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

      osc.connect(formant);
      formant.connect(lowpass);
      lowpass.connect(gain);
      this.routeOutput(gain, dest);

      osc.start(now);
      osc.stop(now + 0.45);
    } catch {}
  }

  // Comedic cartoon angry vocal scream / whistle
  public playAngryScream(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const formant = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.linearRampToValueAtTime(540, now + 0.35);

      formant.type = 'bandpass';
      formant.frequency.setValueAtTime(1200, now);
      formant.frequency.linearRampToValueAtTime(1800, now + 0.35);
      formant.Q.setValueAtTime(4.0, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.35 * this.volume, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(formant);
      formant.connect(gain);
      this.routeOutput(gain, dest);

      osc.start(now);
      osc.stop(now + 0.42);
    } catch {}
  }

  // ==========================================================
  // GOLF SHORT ΓÇö "THE IMPOSSIBLE HOLE-IN-ONE"
  // ==========================================================

  /** A big driver swing: a fast airy swoosh with a low body behind it. */
  public playGolfSwing(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const duration = 0.32;
      const size = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < size; i++) {
        const u = i / size;
        data[i] = (Math.random() * 2 - 1) * Math.sin(u * Math.PI) * (1 - u * 0.35);
      }
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(700, now);
      filter.frequency.exponentialRampToValueAtTime(3200, now + 0.18);
      filter.frequency.exponentialRampToValueAtTime(400, now + duration);
      filter.Q.setValueAtTime(1.2, now);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(0.36 * this.volume, now + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, now + duration);
      src.connect(filter);
      filter.connect(g);
      this.routeOutput(g, dest);
      src.start(now);
      src.stop(now + duration);

      const thump = ctx.createOscillator();
      const tg = ctx.createGain();
      thump.type = 'sine';
      thump.frequency.setValueAtTime(95, now);
      thump.frequency.exponentialRampToValueAtTime(52, now + 0.2);
      tg.gain.setValueAtTime(0.16 * this.volume, now);
      tg.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      thump.connect(tg);
      this.routeOutput(tg, dest);
      thump.start(now);
      thump.stop(now + 0.24);
    } catch {}
  }

  /** The tiny hollow sound of a club cutting nothing but air. */
  public playWhiff(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const duration = 0.16;
      const size = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < size; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin((i / size) * Math.PI);
      }
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1800, now);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.22 * this.volume, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + duration);
      src.connect(filter);
      filter.connect(g);
      this.routeOutput(g, dest);
      src.start(now);
      src.stop(now + duration);
    } catch {}
  }

  /** A dizzy rise-and-fall whistle for the three full spins. */
  public playSpinWhistle(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const duration = 1.25;
      const osc = ctx.createOscillator();
      const vibrato = ctx.createOscillator();
      const vibratoGain = ctx.createGain();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(460, now);
      osc.frequency.exponentialRampToValueAtTime(1180, now + 0.55);
      osc.frequency.exponentialRampToValueAtTime(380, now + duration);

      vibrato.type = 'sine';
      vibrato.frequency.setValueAtTime(7.5, now);
      vibratoGain.gain.setValueAtTime(34, now);
      vibrato.connect(vibratoGain);
      vibratoGain.connect(osc.frequency);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.16 * this.volume, now + 0.08);
      gain.gain.setValueAtTime(0.16 * this.volume, now + duration - 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      this.routeOutput(gain, dest);
      osc.start(now);
      vibrato.start(now);
      osc.stop(now + duration);
      vibrato.stop(now + duration);
    } catch {}
  }

  /** Metallic club-on-bunker clang. */
  public playClubClang(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [880, 1320, 1760, 2340].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.7, now + 0.28);
        const dur = 0.34 - idx * 0.06;
        gain.gain.setValueAtTime((0.22 / (idx + 1)) * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
        osc.connect(gain);
        this.routeOutput(gain, dest);
        osc.start(now);
        osc.stop(now + dur);
      });

      const thud = ctx.createOscillator();
      const thudGain = ctx.createGain();
      thud.type = 'sine';
      thud.frequency.setValueAtTime(120, now);
      thud.frequency.exponentialRampToValueAtTime(44, now + 0.18);
      thudGain.gain.setValueAtTime(0.3 * this.volume, now);
      thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      thud.connect(thudGain);
      this.routeOutput(thudGain, dest);
      thud.start(now);
      thud.stop(now + 0.22);
    } catch {}
  }

  /** Leaf-blower engine climbing from idle to a screaming rev. */
  public playLeafBlowerRev(dest?: AudioNode, seconds = 2.2) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const wobble = ctx.createOscillator();
      const wobbleGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(48, now);
      osc.frequency.exponentialRampToValueAtTime(155, now + seconds * 0.72);
      osc.frequency.exponentialRampToValueAtTime(210, now + seconds);

      wobble.type = 'sine';
      wobble.frequency.setValueAtTime(11, now);
      wobbleGain.gain.setValueAtTime(9, now);
      wobble.connect(wobbleGain);
      wobbleGain.connect(osc.frequency);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(240, now);
      filter.frequency.exponentialRampToValueAtTime(1400, now + seconds);
      filter.Q.setValueAtTime(3.4, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.1 * this.volume, now + 0.2);
      gain.gain.linearRampToValueAtTime(0.2 * this.volume, now + seconds * 0.8);
      gain.gain.setValueAtTime(0.2 * this.volume, now + seconds - 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + seconds);

      osc.connect(filter);
      filter.connect(gain);
      this.routeOutput(gain, dest);
      osc.start(now);
      wobble.start(now);
      osc.stop(now + seconds);
      wobble.stop(now + seconds);

      // Airy intake hiss under the engine.
      const size = Math.floor(ctx.sampleRate * seconds);
      const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < size; i++) {
        const u = i / size;
        data[i] = (Math.random() * 2 - 1) * (0.25 + u * 0.75);
      }
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const hissFilter = ctx.createBiquadFilter();
      hissFilter.type = 'bandpass';
      hissFilter.frequency.setValueAtTime(600, now);
      hissFilter.frequency.exponentialRampToValueAtTime(2200, now + seconds);
      hissFilter.Q.setValueAtTime(0.8, now);
      const hissGain = ctx.createGain();
      hissGain.gain.setValueAtTime(0.0001, now);
      hissGain.gain.linearRampToValueAtTime(0.035 * this.volume, now + 0.35);
      hissGain.gain.linearRampToValueAtTime(0.055 * this.volume, now + seconds * 0.8);
      hissGain.gain.exponentialRampToValueAtTime(0.001, now + seconds);
      src.connect(hissFilter);
      hissFilter.connect(hissGain);
      this.routeOutput(hissGain, dest);
      src.start(now);
      src.stop(now + seconds);
    } catch {}
  }

  /** Giant jack-in-the-box spring release. */
  public playSpringBoing(dest?: AudioNode, strength = 1) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(90, now);
      osc.frequency.exponentialRampToValueAtTime(720, now + 0.16);
      osc.frequency.exponentialRampToValueAtTime(190, now + 0.45);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.95);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2200, now);
      filter.frequency.exponentialRampToValueAtTime(500, now + 1.0);
      filter.Q.setValueAtTime(3.0, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.28 * strength * this.volume, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);

      osc.connect(filter);
      filter.connect(gain);
      this.routeOutput(gain, dest);
      osc.start(now);
      osc.stop(now + 1.02);

      const wobble = ctx.createOscillator();
      const wobbleGain = ctx.createGain();
      wobble.type = 'sine';
      wobble.frequency.setValueAtTime(8, now);
      wobble.frequency.linearRampToValueAtTime(18, now + 0.8);
      wobbleGain.gain.setValueAtTime(0.14 * strength * this.volume, now);
      wobbleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      wobble.connect(wobbleGain);
      this.routeOutput(wobbleGain, dest);
      wobble.start(now);
      wobble.stop(now + 0.92);
    } catch {}
  }

  /** A comedy-sized pool splash: low boom, wide water burst and foam. */
  public playHugeSplash(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const duration = 1.1;
      const size = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < size; i++) {
        const u = i / size;
        data[i] = (Math.random() * 2 - 1) * Math.exp(-u * 3.4);
      }
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(4200, now);
      filter.frequency.exponentialRampToValueAtTime(500, now + duration);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.6 * this.volume, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + duration);
      src.connect(filter);
      filter.connect(g);
      this.routeOutput(g, dest);
      src.start(now);
      src.stop(now + duration);

      const boom = ctx.createOscillator();
      const boomGain = ctx.createGain();
      boom.type = 'sine';
      boom.frequency.setValueAtTime(115, now);
      boom.frequency.exponentialRampToValueAtTime(32, now + 0.55);
      boomGain.gain.setValueAtTime(0.55 * this.volume, now);
      boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      boom.connect(boomGain);
      this.routeOutput(boomGain, dest);
      boom.start(now);
      boom.stop(now + 0.62);

      // Water blobs falling back into the pool.
      [0.16, 0.28, 0.43, 0.6].forEach((offset, idx) => {
        const start = now + offset;
        const bloop = ctx.createOscillator();
        const bloopGain = ctx.createGain();
        bloop.type = 'sine';
        bloop.frequency.setValueAtTime(620 - idx * 70, start);
        bloop.frequency.exponentialRampToValueAtTime(150, start + 0.16);
        bloopGain.gain.setValueAtTime(0.14 * this.volume, start);
        bloopGain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);
        bloop.connect(bloopGain);
        this.routeOutput(bloopGain, dest);
        bloop.start(start);
        bloop.stop(start + 0.2);
      });

      // Foam hiss on top.
      const foamSize = Math.floor(ctx.sampleRate * 0.8);
      const foamBuffer = ctx.createBuffer(1, foamSize, ctx.sampleRate);
      const foamData = foamBuffer.getChannelData(0);
      for (let i = 0; i < foamSize; i++) {
        const u = i / foamSize;
        foamData[i] = (Math.random() * 2 - 1) * Math.exp(-u * 1.8);
      }
      const foam = ctx.createBufferSource();
      foam.buffer = foamBuffer;
      const foamFilter = ctx.createBiquadFilter();
      foamFilter.type = 'highpass';
      foamFilter.frequency.setValueAtTime(2400, now);
      const foamGain = ctx.createGain();
      foamGain.gain.setValueAtTime(0.12 * this.volume, now);
      foamGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      foam.connect(foamFilter);
      foamFilter.connect(foamGain);
      this.routeOutput(foamGain, dest);
      foam.start(now);
      foam.stop(now + 0.82);
    } catch {}
  }

  /** Tiny three-note victory trumpet. */
  public playVictoryTrumpet(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [
        { f: 523.25, start: 0.0, dur: 0.22 },
        { f: 659.25, start: 0.2, dur: 0.22 },
        { f: 783.99, start: 0.4, dur: 0.24 },
        { f: 1046.5, start: 0.6, dur: 0.62 },
      ];
      notes.forEach((note) => {
        const start = now + note.start;
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(note.f, start);
        osc.frequency.setValueAtTime(note.f * 1.01, start + note.dur * 0.55);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2600, start);
        filter.frequency.exponentialRampToValueAtTime(1300, start + note.dur);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.linearRampToValueAtTime(0.16 * this.volume, start + 0.02);
        gain.gain.setValueAtTime(0.13 * this.volume, start + note.dur * 0.7);
        gain.gain.exponentialRampToValueAtTime(0.001, start + note.dur);
        osc.connect(filter);
        filter.connect(gain);
        this.routeOutput(gain, dest);
        osc.start(start);
        osc.stop(start + note.dur + 0.02);
      });
    } catch {}
  }

  /** Wire basket rattle when the stickman lands in the cart. */
  public playBasketClang(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [1040, 1380, 1760, 2300, 1520].forEach((freq, idx) => {
        const start = now + idx * 0.035;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.82, start + 0.16);
        gain.gain.setValueAtTime(0.12 * this.volume, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);
        osc.connect(gain);
        this.routeOutput(gain, dest);
        osc.start(start);
        osc.stop(start + 0.2);
      });

      const thud = ctx.createOscillator();
      const thudGain = ctx.createGain();
      thud.type = 'sine';
      thud.frequency.setValueAtTime(150, now);
      thud.frequency.exponentialRampToValueAtTime(50, now + 0.22);
      thudGain.gain.setValueAtTime(0.24 * this.volume, now);
      thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
      thud.connect(thudGain);
      this.routeOutput(thudGain, dest);
      thud.start(now);
      thud.stop(now + 0.26);
    } catch {}
  }

  /**
   * "THE ANGRY STICKMAN: THE IMPOSSIBLE HOLE-IN-ONE" ΓÇö a 30-second comedy
   * score in four slices: a dramatic golf-showdown build, comic pizzicato
   * for the whiff, a mechanical construction march, a rocket-tracking groove,
   * a suspense tick for the spring, and a victory fanfare that the final bonk
   * cuts dead.
   */
  public playGolfScoreSection(dest?: AudioNode, fromSec = 0, toSec = 30) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const beat = 60 / 120;
      const base = ctx.currentTime + 0.06 - fromSec;

      const noiseSize = Math.max(1, Math.floor(ctx.sampleRate * 0.3));
      const noiseBuffer = ctx.createBuffer(1, noiseSize, ctx.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseSize; i++) {
        noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.05));
      }

      const LEVEL = 0.6;

      const tone = (
        freq: number,
        at: number,
        dur: number,
        type: OscillatorType,
        gain: number,
        slideTo?: number
      ) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, at);
        if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, at + dur);
        g.gain.setValueAtTime(0.0001, at);
        g.gain.linearRampToValueAtTime(gain * LEVEL * this.volume, at + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        osc.connect(g);
        this.routeOutput(g, dest);
        osc.start(at);
        osc.stop(at + dur + 0.02);
      };

      const hit = (at: number, dur: number, freq: number, gain: number, q: number) => {
        const src = ctx.createBufferSource();
        src.buffer = noiseBuffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(freq, at);
        filter.Q.setValueAtTime(q, at);
        const g = ctx.createGain();
        g.gain.setValueAtTime(gain * LEVEL * this.volume, at);
        g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        src.connect(filter);
        filter.connect(g);
        this.routeOutput(g, dest);
        src.start(at);
        src.stop(at + dur + 0.02);
      };

      const chord = (at: number, notes: number[], dur: number, gain: number) => {
        for (const n of notes) tone(n, at, dur, 'square', gain);
      };

      // One-off victory fanfare for the pool landing.
      if (fromSec <= 28.4 && toSec > 28.4) {
        chord(base + 28.4, [261.63, 329.63, 392.0, 523.25], beat * 0.6, 0.075);
        chord(base + 28.75, [329.63, 415.3, 493.88, 659.25], beat * 0.6, 0.075);
        tone(1318.5, base + 28.75, beat * 0.7, 'sine', 0.08);
      }

      const roots = [110.0, 98.0, 87.31, 98.0];
      const build = [220.0, 261.63, 329.63, 392.0, 440.0, 523.25, 659.25, 783.99];
      const groove = [440.0, 523.25, 587.33, 659.25, 783.99, 880.0, 987.77, 1046.5];
      const tick = [1567.98, 1318.51, 1760.0, 1396.91];

      const firstBeat = Math.max(0, Math.floor(fromSec / beat));
      const lastBeat = Math.ceil(toSec / beat);

      for (let b = firstBeat; b < lastBeat; b++) {
        const time = b * beat;
        const at = base + b * beat;
        if (time < fromSec - 0.001 || time >= toSec) continue;
        if (at < ctx.currentTime - 0.05) continue;

        // Hard drops for the whiff, the spring boing, the splash and the bonk.
        if (time >= 5.62 && time < 6.1) continue;
        if (time >= 23.28 && time < 23.85) continue;
        if (time >= 29.02 && time < 30.0) continue;

        const inBar = b % 4;
        const barIndex = Math.floor(b / 4);

        if (time < 5.0) {
          // ------- THE CHALLENGE: a slow dramatic course build.
          tone(roots[barIndex % 4] * 0.5, at, beat * 0.9, 'triangle', 0.13);
          if (inBar === 0 || inBar === 2) {
            tone(build[barIndex % build.length], at, beat * 0.4, 'sine', 0.045);
          }
          if (inBar === 3) {
            tone(build[(barIndex + 4) % build.length], at + beat * 0.5, beat * 0.22, 'sine', 0.05);
          }
          // Snare roll that accelerates into the first swing.
          hit(at, 0.035, 2200, 0.018 + (time > 3.2 ? 0.02 : 0), 1.6);
          if (time > 3.4) {
            for (let s = 1; s < 4; s++) {
              hit(at + (s * beat) / 4, 0.028, 2500, 0.02, 1.5);
            }
          }
          if (time > 4.5) {
            tone(783.99, at, beat * 0.35, 'sine', 0.06);
          }
        } else if (time < 9.0) {
          // ------- THE WHIFF: comic pizzicato and a descending trombone line.
          if (inBar === 0 || inBar === 2) {
            tone(roots[barIndex % 4], at, beat * 0.55, 'triangle', 0.14);
          }
          const comic = [440, 415.3, 392, 349.23, 329.63, 293.66, 261.63, 220];
          tone(comic[b % comic.length], at + beat * 0.5, beat * 0.28, 'sine', 0.05);
          if (time > 6.1 && inBar === 3) {
            tone(196, at, beat * 0.8, 'sawtooth', 0.045, 146.83);
          }
          hit(at, 0.03, 7800, 0.02, 1.4);
        } else if (time < 15.0) {
          // ------- THE CANNON: an accelerating mechanical march.
          const u = (time - 9.0) / 6.0;
          hit(at, 0.03, 2500, 0.055 + u * 0.02, 2.1);
          hit(at + beat * 0.5, 0.025, 1700, 0.04 + u * 0.02, 2.3);
          tone(roots[barIndex % 4] * 0.5, at, beat * 0.34, 'square', 0.07 + u * 0.03);
          tone(build[(barIndex + 2) % build.length] * (1 + u * 0.35), at + beat * 0.5, beat * 0.16, 'triangle', 0.045);
          if (inBar === 0) {
            tone(55, at, beat * 0.35, 'sine', 0.16);
          }
          if (u > 0.7) {
            tone(110 * (1 + u * 0.25), at, beat * 0.2, 'sawtooth', 0.04);
          }
        } else if (time < 22.0) {
          // ------- THE SHOT: a driving tracking groove.
          tone(roots[barIndex % 4] * 0.5, at, beat * 0.3, 'triangle', 0.12);
          tone(groove[b % groove.length], at, beat * 0.24, 'sine', 0.055);
          tone(groove[(b + 3) % groove.length] * 0.5, at + beat * 0.5, beat * 0.16, 'triangle', 0.04);
          hit(at, 0.028, 8800, 0.022, 1.5);
          if (inBar === 0 || inBar === 2) tone(80, at, beat * 0.22, 'sine', 0.14);
          if (time > 20.2) {
            tone(1318.5, at, beat * 0.55, 'sine', 0.03);
            tone(1760.0, at, beat * 0.5, 'sine', 0.018);
          }
        } else if (time < 26.0) {
          // ------- THE SPRING: a suspense tick and a rising pedal.
          const u = (time - 22.0) / 4.0;
          tone(55, at, beat * 0.65, 'sine', 0.14 + u * 0.05);
          tone(tick[b % tick.length], at + beat * 0.5, beat * 0.05, 'triangle', 0.035);
          hit(at, 0.025, 3000, 0.02 + u * 0.015, 2.0);
          if (time > 23.9) {
            tone(220 * Math.pow(2, u * 1.2), at, beat * 0.2, 'sawtooth', 0.025 + u * 0.02);
          }
        } else if (time < 29.02) {
          // ------- THE PAYOFF: splash, then a short triumphant march.
          if (time < 26.4) {
            tone(55, at, beat * 0.5, 'sine', 0.16);
          } else {
            tone(roots[barIndex % 4] * 0.5, at, beat * 0.35, 'triangle', 0.11);
            tone(groove[b % groove.length], at + beat * 0.5, beat * 0.2, 'sine', 0.045);
            hit(at, 0.03, 8600, 0.022, 1.5);
          }
        }
      }
    } catch {}
  }

  // ===== EXTRA PROCEDURAL SFX (all projects) =====

  public playAirPuff(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 'n', f: 900, d: 0.4, g: 0.2, f2: 260, ft: 'lowpass' },
    ]);
  }

  public playAirRelease(dest?: AudioNode, duration?: number) {
    this.sfx(dest, [
      { k: 'n', f: 1400, d: 0.5, g: 0.16, f2: 420, ft: 'highpass' },
      { k: 't', f: 620, d: 0.4, g: 0.07, f2: 200, w: 'triangle' },
    ], duration ? duration / 0.5 : 1);
  }

  public playAlarmSiren(dest?: AudioNode, duration?: number) {
    this.sfx(dest, [
      { k: 't', f: 700, d: 0.45, g: 0.1, f2: 1150, w: 'square' },
      { k: 't', f: 1150, d: 0.45, g: 0.1, f2: 700, w: 'square', t: 0.45 },
      { k: 't', f: 700, d: 0.45, g: 0.1, f2: 1150, w: 'square', t: 0.9 },
    ], duration ? duration / 1.35 : 1);
  }

  public playAngelicChoir(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 523.25, d: 1.6, g: 0.07, w: 'sine' },
      { k: 't', f: 659.25, d: 1.6, g: 0.06, w: 'sine', t: 0.05 },
      { k: 't', f: 783.99, d: 1.6, g: 0.055, w: 'sine', t: 0.1 },
      { k: 't', f: 1046.5, d: 1.6, g: 0.04, w: 'sine', t: 0.15 },
    ]);
  }

  public playAngrySting(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 220, d: 0.5, g: 0.16, f2: 110, w: 'sawtooth' },
      { k: 't', f: 164.81, d: 0.65, g: 0.14, f2: 82, w: 'sawtooth', t: 0.08 },
    ]);
  }

  public playArcadeAlarm(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 880, d: 0.15, g: 0.09, w: 'square' },
      { k: 't', f: 659.25, d: 0.15, g: 0.09, w: 'square', t: 0.15 },
      { k: 't', f: 880, d: 0.15, g: 0.09, w: 'square', t: 0.3 },
      { k: 't', f: 659.25, d: 0.15, g: 0.09, w: 'square', t: 0.45 },
    ]);
  }

  public playArcadeChime(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 987.77, d: 0.12, g: 0.1, w: 'triangle' },
      { k: 't', f: 1318.5, d: 0.12, g: 0.09, w: 'triangle', t: 0.1 },
      { k: 't', f: 1567.98, d: 0.22, g: 0.09, w: 'triangle', t: 0.2 },
    ]);
  }

  public playArcadeWinJingle(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 783.99, d: 0.14, g: 0.1, w: 'square' },
      { k: 't', f: 987.77, d: 0.14, g: 0.1, w: 'square', t: 0.14 },
      { k: 't', f: 1174.66, d: 0.14, g: 0.1, w: 'square', t: 0.28 },
      { k: 't', f: 1567.98, d: 0.4, g: 0.11, w: 'square', t: 0.42 },
    ]);
  }

  public playAwkwardCough(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 'n', f: 420, d: 0.2, g: 0.2, f2: 300, ft: 'bandpass', q: 3 },
      { k: 't', f: 190, d: 0.18, g: 0.12, f2: 90, w: 'sawtooth', t: 0.02 },
    ]);
  }

  public playBagRip(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 'n', f: 2600, d: 0.3, g: 0.2, f2: 700, ft: 'highpass' },
    ]);
  }

  public playBalloonSqueak(pitch = 1, dest?: AudioNode) {
    const p = Math.max(0.4, Math.min(2.4, pitch));
    this.sfx(dest, [
      { k: 't', f: 900 * p, d: 0.1, g: 0.09, f2: 1500 * p, w: 'sine' },
      { k: 't', f: 1400 * p, d: 0.12, g: 0.08, f2: 700 * p, w: 'sine', t: 0.1 },
    ]);
  }

  public playBalloonStretch(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 200, d: 0.6, g: 0.08, f2: 900, w: 'sawtooth' },
      { k: 'n', f: 1200, d: 0.5, g: 0.05, f2: 2200, ft: 'bandpass', q: 2 },
    ]);
  }

  public playBigImpact(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 70, d: 0.8, g: 0.5, f2: 30, w: 'sine' },
      { k: 'n', f: 900, d: 0.3, g: 0.22, f2: 200, ft: 'lowpass' },
    ]);
  }

  public playBinThunk(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 180, d: 0.25, g: 0.3, f2: 60, w: 'sine' },
      { k: 'n', f: 1400, d: 0.1, g: 0.12, f2: 900, ft: 'bandpass', q: 2 },
    ]);
  }

  public playBroomScrape(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 'n', f: 1500, d: 0.35, g: 0.13, f2: 600, ft: 'bandpass', q: 3 },
    ]);
  }

  public playButtonClick(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 1200, d: 0.05, g: 0.2, w: 'square' },
      { k: 'n', f: 3000, d: 0.03, g: 0.1, ft: 'highpass' },
    ]);
  }

  public playCameraClick(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 'n', f: 3200, d: 0.05, g: 0.28, f2: 1800, ft: 'highpass' },
      { k: 't', f: 2000, d: 0.04, g: 0.12, w: 'square' },
    ]);
  }

  public playCartoonBoing(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 200, d: 0.35, g: 0.18, f2: 620, w: 'sine' },
      { k: 't', f: 620, d: 0.25, g: 0.12, f2: 220, w: 'sine', t: 0.32 },
    ]);
  }

  public playCartoonCrash(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 500, d: 0.8, g: 0.24, f2: 60, w: 'sawtooth' },
      { k: 'n', f: 1600, d: 0.3, g: 0.16, f2: 800, ft: 'highpass' },
    ]);
  }

  public playCaseOpen(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 300, d: 0.3, g: 0.1, f2: 600, w: 'triangle' },
      { k: 'n', f: 1800, d: 0.18, g: 0.07, f2: 1200, ft: 'bandpass', q: 2, t: 0.05 },
    ]);
  }

  public playClawMotor(dest?: AudioNode, duration?: number) {
    this.sfx(dest, [
      { k: 't', f: 90, d: 0.8, g: 0.1, f2: 110, w: 'sawtooth' },
      { k: 't', f: 140, d: 0.8, g: 0.05, f2: 120, w: 'square', t: 0.02 },
    ], duration ? duration / 0.8 : 1);
  }

  public playCoinClink(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 1800, d: 0.08, g: 0.16, w: 'triangle' },
      { k: 't', f: 2400, d: 0.12, g: 0.12, w: 'triangle', t: 0.05 },
    ]);
  }

  public playConfettiPop(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 'n', f: 2200, d: 0.25, g: 0.24, f2: 900, ft: 'highpass' },
      { k: 't', f: 900, d: 0.22, g: 0.12, f2: 300, w: 'triangle' },
    ]);
  }

  public playCounterBump(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 120, d: 0.2, g: 0.3, f2: 50, w: 'sine' },
      { k: 'n', f: 600, d: 0.08, g: 0.1, f2: 300, ft: 'lowpass' },
    ]);
  }

  public playCupClunk(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 400, d: 0.15, g: 0.22, f2: 150, w: 'triangle' },
      { k: 'n', f: 1600, d: 0.08, g: 0.1, f2: 1000, ft: 'bandpass', q: 2 },
    ]);
  }

  public playCupSlide(dest?: AudioNode, duration?: number) {
    this.sfx(dest, [
      { k: 'n', f: 900, d: 0.3, g: 0.1, f2: 700, ft: 'bandpass', q: 2.5 },
    ], duration ? duration / 0.3 : 1);
  }

  public playCupWobbleCreak(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 180, d: 0.14, g: 0.1, f2: 220, w: 'square' },
      { k: 't', f: 200, d: 0.14, g: 0.09, f2: 240, w: 'square', t: 0.15 },
      { k: 't', f: 220, d: 0.14, g: 0.085, f2: 250, w: 'square', t: 0.3 },
      { k: 't', f: 240, d: 0.14, g: 0.08, f2: 270, w: 'square', t: 0.45 },
    ]);
  }

  public playDiamondChime(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 2093, d: 0.5, g: 0.07, w: 'sine' },
      { k: 't', f: 2637, d: 0.55, g: 0.06, w: 'sine', t: 0.06 },
      { k: 't', f: 3136, d: 0.6, g: 0.05, w: 'sine', t: 0.12 },
    ]);
  }

  public playDramaticBoom(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 80, d: 1.5, g: 0.42, f2: 30, w: 'sine' },
      { k: 'n', f: 400, d: 0.5, g: 0.1, f2: 120, ft: 'lowpass' },
    ]);
  }

  public playFanTink(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 2400, d: 0.12, g: 0.14, f2: 1800, w: 'triangle' },
      { k: 'n', f: 4000, d: 0.05, g: 0.08, ft: 'highpass' },
    ]);
  }

  public playFreezeSting(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 1200, d: 0.8, g: 0.14, f2: 200, w: 'sawtooth' },
      { k: 'n', f: 2400, d: 0.5, g: 0.1, f2: 400, ft: 'highpass' },
    ]);
  }

  public playGlassClunk(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 900, d: 0.12, g: 0.18, f2: 500, w: 'sine' },
      { k: 't', f: 1800, d: 0.18, g: 0.09, f2: 1500, w: 'sine', t: 0.04 },
    ]);
  }

  public playHardFlick(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 400, d: 0.3, g: 0.24, f2: 150, w: 'sawtooth' },
      { k: 'n', f: 1800, d: 0.12, g: 0.12, f2: 900, ft: 'bandpass', q: 2 },
    ]);
  }

  public playHollowBonk(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 120, d: 0.5, g: 0.34, f2: 60, w: 'sine' },
      { k: 't', f: 240, d: 0.4, g: 0.14, f2: 120, w: 'sine', t: 0.02 },
    ]);
  }

  public playIdeaDing(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 1567.98, d: 0.45, g: 0.16, w: 'sine' },
      { k: 't', f: 2093, d: 0.5, g: 0.1, w: 'sine', t: 0.02 },
    ]);
  }

  public playKnotSnap(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 'n', f: 2000, d: 0.2, g: 0.18, f2: 400, ft: 'bandpass', q: 3 },
      { k: 't', f: 300, d: 0.18, g: 0.1, f2: 120, w: 'triangle', t: 0.02 },
    ]);
  }

  public playLaserZap(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 1800, d: 0.4, g: 0.14, f2: 200, w: 'sawtooth' },
      { k: 't', f: 900, d: 0.35, g: 0.08, f2: 120, w: 'square', t: 0.02 },
    ]);
  }

  public playMagicSparkle(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 2093, d: 0.14, g: 0.07, w: 'sine' },
      { k: 't', f: 2637, d: 0.14, g: 0.065, w: 'sine', t: 0.07 },
      { k: 't', f: 3136, d: 0.14, g: 0.06, w: 'sine', t: 0.14 },
      { k: 't', f: 2349, d: 0.14, g: 0.055, w: 'sine', t: 0.21 },
      { k: 't', f: 2794, d: 0.2, g: 0.05, w: 'sine', t: 0.28 },
    ]);
  }

  public playNeedlePoke(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 2000, d: 0.06, g: 0.1, f2: 1200, w: 'sine' },
      { k: 'n', f: 5000, d: 0.03, g: 0.06, ft: 'highpass' },
    ]);
  }

  public playPancakeSlide(dest?: AudioNode, duration?: number) {
    this.sfx(dest, [
      { k: 'n', f: 700, d: 0.3, g: 0.1, f2: 420, ft: 'bandpass', q: 2 },
    ], duration ? duration / 0.3 : 1);
  }

  public playPancakeSplat(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 'n', f: 600, d: 0.25, g: 0.3, f2: 260, ft: 'lowpass' },
      { k: 't', f: 200, d: 0.2, g: 0.16, f2: 60, w: 'sine', t: 0.01 },
    ]);
  }

  public playPaperCrumple(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 'n', f: 2500, d: 0.4, g: 0.16, f2: 900, ft: 'bandpass', q: 1.5 },
    ]);
  }

  public playPlateClink(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 2600, d: 0.2, g: 0.12, f2: 2200, w: 'sine' },
      { k: 't', f: 3400, d: 0.25, g: 0.08, f2: 3000, w: 'sine', t: 0.04 },
    ]);
  }

  /** Soft circular whirr of a plate spinning on a stick tip. */
  public playPlateWhir(dest?: AudioNode, duration = 1.0) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const dur = Math.max(0.2, duration);
      const osc = ctx.createOscillator();
      const ring = ctx.createOscillator();
      const trem = ctx.createOscillator();
      const tremGain = ctx.createGain();
      const gain = ctx.createGain();
      const ringGain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(680, now);
      osc.frequency.linearRampToValueAtTime(860, now + dur * 0.4);
      osc.frequency.linearRampToValueAtTime(740, now + dur);

      trem.type = 'sine';
      trem.frequency.setValueAtTime(16, now);
      tremGain.gain.setValueAtTime(45, now);
      trem.connect(tremGain);
      tremGain.connect(osc.frequency);

      ring.type = 'sine';
      ring.frequency.setValueAtTime(1720, now);
      ringGain.gain.setValueAtTime(0.018 * this.volume, now);
      ringGain.gain.exponentialRampToValueAtTime(0.001, now + dur);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.055 * this.volume, now + 0.07);
      gain.gain.setValueAtTime(0.05 * this.volume, now + dur * 0.68);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

      osc.connect(gain);
      ring.connect(ringGain);
      this.routeOutput(gain, dest);
      this.routeOutput(ringGain, dest);
      osc.start(now);
      trem.start(now);
      ring.start(now);
      osc.stop(now + dur);
      trem.stop(now + dur);
      ring.stop(now + dur);
    } catch {}
  }

  /** Wobbly plate losing its balance: a nervous rising and falling creak. */
  public playPlateWobble(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const dur = 1.2;
      const osc = ctx.createOscillator();
      const vibrato = ctx.createOscillator();
      const vibratoGain = ctx.createGain();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.linearRampToValueAtTime(560, now + dur * 0.55);
      osc.frequency.linearRampToValueAtTime(330, now + dur);

      vibrato.type = 'sine';
      vibrato.frequency.setValueAtTime(11, now);
      vibratoGain.gain.setValueAtTime(38, now);
      vibrato.connect(vibratoGain);
      vibratoGain.connect(osc.frequency);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.07 * this.volume, now + 0.06);
      gain.gain.setValueAtTime(0.065 * this.volume, now + dur - 0.25);
      gain.gain.exponentialRampToValueAtTime(0.0002, now + dur);

      osc.connect(gain);
      this.routeOutput(gain, dest);
      osc.start(now);
      vibrato.start(now);
      osc.stop(now + dur);
      vibrato.stop(now + dur);
    } catch {}
  }

  public playPlushAvalanche(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 'n', f: 800, d: 1.2, g: 0.2, f2: 300, ft: 'lowpass' },
      { k: 'n', f: 2000, d: 1, g: 0.08, f2: 900, ft: 'bandpass', q: 1.5, t: 0.1 },
    ]);
  }

  public playPreciseTap(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 1200, d: 0.08, g: 0.16, f2: 900, w: 'sine' },
    ]);
  }

  public playRelievedSigh(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 'n', f: 800, d: 0.8, g: 0.14, f2: 300, ft: 'highpass' },
    ]);
  }

  public playRisingMusicSwelling(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 261.63, d: 0.5, g: 0.08, w: 'sine' },
      { k: 't', f: 293.66, d: 0.5, g: 0.08, w: 'sine', t: 0.5 },
      { k: 't', f: 329.63, d: 0.5, g: 0.09, w: 'sine', t: 1 },
      { k: 't', f: 349.23, d: 0.5, g: 0.09, w: 'sine', t: 1.5 },
      { k: 't', f: 392, d: 0.6, g: 0.1, w: 'sine', t: 2 },
      { k: 't', f: 440, d: 0.6, g: 0.1, w: 'sine', t: 2.6 },
      { k: 't', f: 493.88, d: 0.7, g: 0.11, w: 'sine', t: 3.2 },
      { k: 't', f: 523.25, d: 0.9, g: 0.12, w: 'sine', t: 3.8 },
    ]);
  }

  public playRisingWhistle(dest?: AudioNode, duration?: number) {
    this.sfx(dest, [
      { k: 't', f: 400, d: 1, g: 0.1, f2: 1800, w: 'sine' },
      { k: 'n', f: 2000, d: 1, g: 0.05, f2: 800, ft: 'highpass' },
    ], duration ? duration / 1 : 1);
  }

  public playScoop(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 'n', f: 1200, d: 0.2, g: 0.12, f2: 600, ft: 'bandpass', q: 2 },
    ]);
  }

  public playSlideWhistle(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 1200, d: 0.5, g: 0.14, f2: 300, w: 'sine' },
      { k: 'n', f: 1500, d: 0.4, g: 0.05, f2: 600, ft: 'highpass' },
    ]);
  }

  public playSoftFlick(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 600, d: 0.2, g: 0.12, f2: 300, w: 'triangle' },
      { k: 'n', f: 2200, d: 0.08, g: 0.05, ft: 'highpass' },
    ]);
  }

  public playSpiralWhirr(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 300, d: 1, g: 0.08, f2: 900, w: 'sawtooth' },
      { k: 't', f: 450, d: 1, g: 0.05, f2: 1200, w: 'triangle', t: 0.05 },
    ]);
  }

  public playSpoonDraw(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 'n', f: 1800, d: 0.25, g: 0.12, f2: 900, ft: 'bandpass', q: 2.5 },
    ]);
  }

  public playStrainedTug(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 150, d: 0.5, g: 0.12, f2: 170, w: 'sawtooth' },
      { k: 't', f: 150, d: 0.5, g: 0.06, f2: 140, w: 'square', t: 0.02 },
    ]);
  }

  public playTinyChipTink(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 1800, d: 0.1, g: 0.14, f2: 1400, w: 'triangle' },
      { k: 't', f: 2400, d: 0.08, g: 0.08, f2: 2000, w: 'sine', t: 0.04 },
    ]);
  }

  public playTinyPlop(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 200, d: 0.15, g: 0.14, f2: 80, w: 'sine' },
    ]);
  }

  public playTrayPing(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 1400, d: 0.3, g: 0.16, f2: 1000, w: 'triangle' },
      { k: 't', f: 2100, d: 0.25, g: 0.07, f2: 1600, w: 'sine', t: 0.03 },
    ]);
  }

  public playVendingRattle(dest?: AudioNode, duration?: number) {
    this.sfx(dest, [
      { k: 'n', f: 600, d: 0.4, g: 0.14, f2: 900, ft: 'bandpass', q: 1.6 },
      { k: 't', f: 260, d: 0.12, g: 0.1, f2: 200, w: 'square', t: 0.05 },
    ], duration ? duration / 0.4 : 1);
  }

  public playVendingThud(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 90, d: 0.3, g: 0.32, f2: 40, w: 'sine' },
      { k: 'n', f: 700, d: 0.15, g: 0.14, f2: 260, ft: 'lowpass' },
    ]);
  }

  public playVictoryFanfareShort(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 523.25, d: 0.15, g: 0.12, w: 'square' },
      { k: 't', f: 659.25, d: 0.15, g: 0.12, w: 'square', t: 0.15 },
      { k: 't', f: 783.99, d: 0.15, g: 0.12, w: 'square', t: 0.3 },
      { k: 't', f: 1046.5, d: 0.4, g: 0.13, w: 'square', t: 0.45 },
    ]);
  }

  public playWallBoing(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 300, d: 0.4, g: 0.18, f2: 700, w: 'sine' },
      { k: 't', f: 700, d: 0.25, g: 0.1, f2: 320, w: 'sine', t: 0.38 },
    ]);
  }

  public playWetSplat(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 'n', f: 1200, d: 0.3, g: 0.2, f2: 300, ft: 'lowpass' },
      { k: 't', f: 160, d: 0.2, g: 0.1, f2: 70, w: 'sine', t: 0.02 },
    ]);
  }

  public playWindGust(dest?: AudioNode, duration?: number) {
    this.sfx(dest, [
      { k: 'n', f: 600, d: 1.2, g: 0.18, f2: 900, ft: 'lowpass' },
      { k: 'n', f: 400, d: 1, g: 0.1, f2: 800, ft: 'bandpass', q: 1.2, t: 0.1 },
    ], duration ? duration / 1.2 : 1);
  }

  public playWindowKnock(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 400, d: 0.08, g: 0.22, f2: 300, w: 'triangle' },
      { k: 't', f: 400, d: 0.08, g: 0.2, f2: 300, w: 'triangle', t: 0.14 },
    ]);
  }

  public playWoodClack(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 'n', f: 1500, d: 0.06, g: 0.18, f2: 1100, ft: 'bandpass', q: 3 },
      { k: 't', f: 600, d: 0.06, g: 0.12, f2: 400, w: 'triangle' },
    ]);
  }

  public playCountBeep(dest?: AudioNode, duration?: number) {
    const total = duration && duration > 0 ? duration : 0.12;
    const layers: SfxLayer[] = [];
    for (let at = 0; at < total; at += 0.5) {
      layers.push({ k: 't', f: 880, d: 0.12, g: 0.18, w: 'square', t: at });
    }
    this.sfx(dest, layers);
  }

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

  public playCandyClawScoreSection(dest?: AudioNode, start = 0, end = 7.5) {
    this.scoreSlice(dest, start, end, {
      bpm: 155,
      wave: 'square',
      level: 0.42,
      chords: [
        [293.66, 369.99, 440.0],    // D4 + F#4 + A4 (D major)
        [329.63, 415.3, 493.88],   // E4 + G#4 + B4 (E major)
        [277.18, 349.23, 415.3],   // C#4 + F4 + G#4 (C# minor / F major)
        [293.66, 369.99, 440.0],   // D4 + F#4 + A4 (D major)
      ],
    });
  }

  public playPlateSpinScoreSection(dest?: AudioNode, start = 0, end = 7.5) {
    this.scoreSlice(dest, start, end, {
      bpm: 160,
      wave: 'square',
      level: 0.4,
      chords: [
        [523.25, 659.25, 783.99],  // C5 + E5 + G5 (C major)
        [349.23, 440.0, 523.25],   // F4 + A4 + C5 (F major)
        [392.0, 493.88, 587.33],   // G4 + B4 + D5 (G major)
        [523.25, 659.25, 783.99],  // C5 + E5 + G5 (C major)
      ],
    });
  }

  public playThreeWallPingPongScoreSection(dest?: AudioNode, start = 0, end = 7.5) {
    this.scoreSlice(dest, start, end, {
      bpm: 140,
      wave: 'triangle',
      level: 0.42,
      chords: [
        [440.0, 554.37, 659.25],  // A4 + C#5 + E5 (A major)
        [523.25, 659.25, 783.99], // C5 + E5 + G5 (C major)
        [493.88, 622.25, 739.99], // B4 + D#5 + F#5 (B major)
        [440.0, 554.37, 659.25],  // A4 + C#5 + E5 (A major)
      ],
    });
  }

  public playCupInCupScoreSection(dest?: AudioNode, start = 0, end = 7.5) {
    this.scoreSlice(dest, start, end, {
      bpm: 135,
      wave: 'triangle',
      level: 0.4,
      chords: [
        [392.0, 493.88, 587.33],  // G4 + B4 + D5 (G major)
        [523.25, 659.25, 783.99], // C5 + E5 + G5 (C major)
        [440.0, 554.37, 659.25],  // A4 + C#5 + E5 (A major)
        [392.0, 493.88, 587.33],  // G4 + B4 + D5 (G major)
      ],
    });
  }

  public playYoyoScoreSection(dest?: AudioNode, start = 0, end = 7.5) {
    this.scoreSlice(dest, start, end, {
      bpm: 142,
      wave: 'triangle',
      level: 0.42,
      chords: [
        [293.66, 369.99, 440.0],  // D4 + F#4 + A4 (D major)
        [349.23, 440.0, 523.25],  // F4 + A4 + C5 (F major)
        [392.0, 493.88, 587.33],  // G4 + B4 + D5 (G major)
        [293.66, 369.99, 440.0],  // D4 + F#4 + A4 (D major)
      ],
    });
  }

  public playRubberBandScoreSection(dest?: AudioNode, start = 0, end = 7.5) {
    this.scoreSlice(dest, start, end, {
      bpm: 138,
      wave: 'triangle',
      level: 0.4,
      chords: [
        [261.63, 329.63, 392.0],  // C4 + E4 + G4 (C major)
        [349.23, 440.0, 523.25],  // F4 + A4 + C5 (F major)
        [392.0, 493.88, 587.33],  // G4 + B4 + D5 (G major)
        [261.63, 329.63, 392.0],  // C4 + E4 + G4 (C major)
      ],
    });
  }

  public playDesertIslandScoreSection(dest?: AudioNode, start = 0, end = 7.5) {
    this.scoreSlice(dest, start, end, {
      bpm: 110,
      wave: "sine",
      level: 0.35,
      chords: [
        [261.63, 329.63, 392.0],
        [293.66, 369.99, 440.0],
        [329.63, 415.30, 493.88],
        [261.63, 329.63, 392.0],
      ],
    });
  }

  public playGiantBalloonScoreSection(dest?: AudioNode, start = 0, end = 7.5) {
    this.scoreSlice(dest, start, end, {
      bpm: 132,
      wave: "triangle",
      level: 0.4,
      chords: [
        [261.63, 329.63, 392.0],  // C4 + E4 + G4 (C major)
        [293.66, 349.23, 440.0],  // D4 + F4 + A4 (D minor)
        [349.23, 440.0, 523.25],  // F4 + A4 + C5 (F major)
        [329.63, 415.3, 493.88],  // E4 + G#4 + B4 (E major)
      ],
    });
  }

  // ---- Three-Wall Ping-Pong SFX ----
  public playPaddleHit(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 800, d: 0.08, g: 0.25, f2: 400, w: 'triangle' },
      { k: 'n', f: 1200, d: 0.06, g: 0.15, f2: 600, ft: 'bandpass', q: 3 },
    ]);
  }

  public playCupPing(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 2200, d: 0.3, g: 0.18, f2: 1800, w: 'sine' },
      { k: 't', f: 3300, d: 0.25, g: 0.1, f2: 2600, w: 'sine', t: 0.03 },
      { k: 't', f: 4400, d: 0.2, g: 0.06, f2: 3500, w: 'sine', t: 0.06 },
    ]);
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

  // ---- Giant Balloon Prison SFX ----
  public playHandPump(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 'n', f: 1800, f2: 900, d: 0.09, g: 0.13, ft: 'bandpass', q: 2.5 },
      { k: 't', f: 620, f2: 980, d: 0.1, g: 0.07, w: 'triangle' },
      { k: 't', f: 320, f2: 180, d: 0.07, g: 0.06, w: 'sine', t: 0.03 },
    ]);
  }

  public playWoodCreak(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 180, f2: 90, d: 0.55, g: 0.1, w: 'sawtooth' },
      { k: 'n', f: 700, f2: 380, d: 0.45, g: 0.06, ft: 'bandpass', q: 6 },
    ]);
  }

  public playElasticStretch(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 240, f2: 760, d: 0.42, g: 0.11, w: 'triangle' },
      { k: 'n', f: 1400, f2: 2600, d: 0.38, g: 0.05, ft: 'bandpass', q: 3 },
    ]);
  }

  public playBeanieWhoosh(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 'n', f: 2400, f2: 900, d: 0.45, g: 0.14, ft: 'bandpass', q: 1.6 },
      { k: 't', f: 1500, f2: 2600, d: 0.4, g: 0.05, w: 'sine' },
    ]);
  }

  public playRocketLaunch(dest?: AudioNode) {
    const layers: SfxLayer[] = [
      { k: 't', f: 90, f2: 260, d: 1.1, g: 0.16, w: 'sawtooth' },
      { k: 'n', f: 900, f2: 3200, d: 1.0, g: 0.14, ft: 'bandpass', q: 1.4 },
    ];
    for (let at = 0; at < 1.0; at += 0.14) {
      layers.push({ k: 'n', f: 2200 + at * 900, d: 0.12, g: 0.05, ft: 'highpass', t: at });
    }
    this.sfx(dest, layers);
  }

  public playHouseThud(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 90, f2: 44, d: 0.5, g: 0.34, w: 'sine' },
      { k: 'n', f: 620, f2: 180, d: 0.3, g: 0.16, ft: 'lowpass' },
    ]);
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

  public playDominoClick(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 1000, f2: 600, d: 0.06, g: 0.1, w: 'triangle' },
      { k: 'n', f: 2600, f2: 1200, d: 0.04, g: 0.05, ft: 'bandpass', q: 3 },
    ]);
  }
  // ---- Desert Island SFX ----
  public playTropicalBirds(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const chirps = [
        { freq: 2200, start: 0.0, dur: 0.15 },
        { freq: 1800, start: 0.2, dur: 0.15 },
        { freq: 2500, start: 0.5, dur: 0.12 },
        { freq: 2000, start: 0.7, dur: 0.15 },
      ];
      chirps.forEach((c) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(c.freq, now + c.start);
        gain.gain.setValueAtTime(0.0, now + c.start);
        gain.gain.linearRampToValueAtTime(0.15 * this.volume, now + c.start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + c.start + c.dur);
        osc.connect(gain);
        this.routeOutput(gain, dest);
        osc.start(now + c.start);
        osc.stop(now + c.start + c.dur);
      });
    } catch {}
  }

  public playPlaneEngine(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 2);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, now);
      filter.Q.setValueAtTime(2, now);
      gain.gain.setValueAtTime(0.0, now);
      gain.gain.linearRampToValueAtTime(0.1 * this.volume, now + 0.5);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 4);
      osc.connect(filter);
      filter.connect(gain);
      this.routeOutput(gain, dest);
      osc.start(now);
      osc.stop(now + 4);
    } catch {}
  }

  // ---- The Shrinking Remote score + SFX ----
  public playShrinkingRemoteScoreSection(dest?: AudioNode, start = 0, end = 7.5) {
    this.scoreSlice(dest, start, end, {
      bpm: 120,
      wave: 'triangle',
      level: 0.32,
      chords: [
        [261.63, 329.63, 392.0],
        [349.23, 440.0, 523.25],
        [392.0, 493.88, 587.33],
        [261.63, 329.63, 392.0],
      ],
    });
  }

  public playRemoteClick(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 1600, f2: 700, d: 0.05, g: 0.16, w: 'square' },
      { k: 'n', f: 3200, f2: 1400, d: 0.035, g: 0.08, ft: 'bandpass', q: 4 },
    ]);
  }

  public playShrinkBeam(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 420, f2: 1500, d: 0.22, g: 0.14, w: 'sine' },
      { k: 't', f: 900, f2: 2400, d: 0.2, g: 0.08, w: 'triangle', t: 0.04 },
      { k: 'n', f: 1800, f2: 5200, d: 0.18, g: 0.05, ft: 'bandpass', q: 2 },
    ]);
  }

  public playShrinkDown(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 1200, f2: 180, d: 0.55, g: 0.15, w: 'sine' },
      { k: 't', f: 1800, f2: 300, d: 0.45, g: 0.08, w: 'triangle', t: 0.05 },
    ]);
  }

  public playSneakerSlide(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 'n', f: 900, f2: 300, d: 0.9, g: 0.16, ft: 'bandpass', q: 1.2 },
      { k: 't', f: 140, f2: 90, d: 0.9, g: 0.06, w: 'sawtooth' },
    ]);
  }

  public playPillowPoof(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 'n', f: 700, f2: 220, d: 0.24, g: 0.1, ft: 'lowpass' },
      { k: 't', f: 180, f2: 90, d: 0.22, g: 0.12, w: 'sine' },
    ]);
  }

  // ---- The Magic Paintbrush score + SFX ----
  public playMagicPaintbrushScoreSection(dest?: AudioNode, start = 0, end = 7.5) {
    this.scoreSlice(dest, start, end, {
      bpm: 128,
      wave: 'triangle',
      level: 0.34,
      chords: [
        [261.63, 329.63, 392.0],
        [349.23, 440.0, 523.25],
        [392.0, 493.88, 587.33],
        [329.63, 415.30, 493.88],
      ],
    });
  }

  public playPaintSwish(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 900, f2: 200, d: 0.18, g: 0.14, w: 'sawtooth' },
      { k: 'n', f: 4000, f2: 1200, d: 0.16, g: 0.07, ft: 'bandpass', q: 2 },
    ]);
  }

  public playTransformDing(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 800, f2: 1600, d: 0.2, g: 0.16, w: 'sine' },
      { k: 't', f: 1200, f2: 2400, d: 0.18, g: 0.1, w: 'triangle', t: 0.06 },
    ]);
  }

  public playMonsterFootstep(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 90, f2: 40, d: 0.18, g: 0.2, w: 'sine' },
      { k: 'n', f: 200, f2: 100, d: 0.16, g: 0.12, ft: 'bandpass', q: 1.5 },
    ]);
  }

  public playCartoonRun(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 220, f2: 120, d: 0.1, g: 0.14, w: 'triangle' },
      { k: 't', f: 300, f2: 160, d: 0.1, g: 0.1, w: 'triangle', t: 0.1 },
    ]);
  }

  public playFunnyImpact(dest?: AudioNode) {
    this.sfx(dest, [
      { k: 't', f: 150, f2: 80, d: 0.25, g: 0.22, w: 'sine' },
      { k: 'n', f: 500, f2: 250, d: 0.2, g: 0.12, ft: 'lowpass' },
    ]);
  }
}

export const soundEngine = new SoundEngine();

/**
 * Deadpan, calm, slightly bored documentary Voice-Over synthesizer via Web Speech API
 */
export function speakVoiceOver(
  text: string,
  options?: { rate?: number; pitch?: number; volume?: number }
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options?.rate ?? 0.88;
    utterance.pitch = options?.pitch ?? 0.92;
    utterance.volume = options?.volume ?? 1.0;

    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Natural') ||
          v.name.includes('Google') ||
          v.name.includes('Samantha') ||
          v.name.includes('Victoria'))
    );
    if (englishVoice) utterance.voice = englishVoice;

    window.speechSynthesis.speak(utterance);
  } catch {}
}

export function stopVoiceOver() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
}
