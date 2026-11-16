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
   * "THE ANGRY STICKMAN VS. THE IMPOSSIBLE COIN FLIP" — a 30-second comedy
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
   * Cartoon spring "boing" for cake jumps and leaps.
   */
  public playBoingSpring(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(760, now + 0.28);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.42 * this.volume, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
      osc.connect(gain);
      this.routeOutput(gain, dest);
      osc.start(now);
      osc.stop(now + 0.5);
    } catch {}
  }

  /**
   * Squishy frosting squirt / slick slide sound.
   */
  public playFrostingSquirt(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.35);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, now);
      filter.frequency.linearRampToValueAtTime(250, now + 0.35);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.38 * this.volume, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);
      osc.connect(filter);
      filter.connect(gain);
      this.routeOutput(gain, dest);
      osc.start(now);
      osc.stop(now + 0.4);
    } catch {}
  }

  /**
   * Snappy confetti cannon explosion with sparkle chimes.
   */
  public playConfettiPop(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Snappy noise burst
      const noiseBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.2), ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.03));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(0.6 * this.volume, now);
      nGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
      noise.connect(nGain);
      this.routeOutput(nGain, dest);
      noise.start(now);

      // Party sparkles
      const notes = [880, 1174, 1318, 1760];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.04);
        g.gain.setValueAtTime(0.18 * this.volume, now + i * 0.04);
        g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.04 + 0.3);
        osc.connect(g);
        this.routeOutput(g, dest);
        osc.start(now + i * 0.04);
        osc.stop(now + i * 0.04 + 0.35);
      });
    } catch {}
  }

  /**
   * Comedic cartoon CHOMP / bite sound.
   */
  public playCupcakeChomp(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.12);
      gain.gain.setValueAtTime(0.48 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
      osc.connect(gain);
      this.routeOutput(gain, dest);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch {}
  }

  /**
   * Dizzy wobbling cartoon stars.
   */
  public playDizzyWhirl(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      for (let i = 0; i < 2; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(540 + i * 80, now);
        for (let k = 0; k < 6; k++) {
          osc.frequency.linearRampToValueAtTime(500 + ((k % 2) * 120), now + k * 0.12);
        }
        gain.gain.setValueAtTime(0.18 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);
        osc.connect(gain);
        this.routeOutput(gain, dest);
        osc.start(now);
        osc.stop(now + 0.9);
      }
    } catch {}
  }

  /**
   * Complete 30s bouncy cartoon comedy score for "The Runaway Birthday Cake".
   * Sliced into four 7.5s chunks with comedic silences for:
   * - 4.8 - 5.8s: cake legs unfold & Stickman confusion
   * - 13.5 - 15.5s: frosting slide whirl
   * - 22.5 - 23.8s: cake lands on head frozen shock
   * - 28.2 - 30.0s: cupcake chomp and boiling rage freeze
   */
  public playRunawayCakeScoreSection(dest?: AudioNode, fromSec = 0, toSec = 30) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const beat = 60 / 138; // lively comedy tempo: 138 BPM
      const base = ctx.currentTime + 0.05 - fromSec;
      const LEVEL = 0.58;

      const tone = (
        freq: number,
        at: number,
        dur: number,
        type: OscillatorType,
        gain: number
      ) => {
        if (at < ctx.currentTime - 0.05 || at > ctx.currentTime + (toSec - fromSec) + 0.1) return;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, at);
        g.gain.setValueAtTime(0.0001, at);
        g.gain.linearRampToValueAtTime(gain * LEVEL * this.volume, at + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        osc.connect(g);
        this.routeOutput(g, dest);
        osc.start(at);
        osc.stop(at + dur + 0.02);
      };

      // Part 1: 0 - 7.5s (Cheerful Birthday Intro)
      if (fromSec < 7.5 && toSec > 0) {
        // Melodic marimba theme
        const melody = [
          { t: 0.2, f: 523.25 }, // C5
          { t: 0.6, f: 587.33 }, // D5
          { t: 1.0, f: 659.25 }, // E5
          { t: 1.4, f: 783.99 }, // G5
          { t: 2.0, f: 880.00 }, // A5
          { t: 2.6, f: 783.99 }, // G5
          { t: 3.2, f: 659.25 }, // E5
          { t: 3.8, f: 523.25 }, // C5
        ];
        for (const m of melody) {
          const at = base + m.t;
          tone(m.f, at, beat * 0.9, 'triangle', 0.45);
          tone(m.f * 0.5, at, beat * 0.6, 'sine', 0.35);
        }
        // Bassline
        for (let b = 0; b < 10; b++) {
          const at = base + b * beat * 2;
          tone(130.81, at, beat * 0.8, 'triangle', 0.4);
          tone(196.00, at + beat, beat * 0.7, 'triangle', 0.3);
        }
      }

      // Part 2: 7.5 - 15.0s (Fast Cartoon Chase)
      if (fromSec < 15.0 && toSec > 7.5) {
        const chaseNotes = [659.25, 698.46, 783.99, 880.00, 783.99, 698.46];
        for (let step = 0; step < 16; step++) {
          const at = base + 7.5 + step * (beat * 0.5);
          const f = chaseNotes[step % chaseNotes.length];
          tone(f, at, beat * 0.45, 'triangle', 0.42);
          if (step % 2 === 0) {
            tone(164.81, at, beat * 0.6, 'sine', 0.38);
          }
        }
      }

      // Part 3: 15.0 - 22.5s (Tiptoe Ambush & Suspense)
      if (fromSec < 22.5 && toSec > 15.0) {
        // Tiptoe plinks (18.5 - 21.8s)
        const tiptoeNotes = [880, 932, 987, 1046, 1174, 1318];
        for (let step = 0; step < 8; step++) {
          const at = base + 18.5 + step * 0.35;
          const f = tiptoeNotes[step % tiptoeNotes.length];
          tone(f, at, 0.15, 'sine', 0.38);
        }
      }

      // Part 4: 22.5 - 30.0s (Cupcake Party & Final Freeze)
      if (fromSec < 30.0 && toSec > 22.5) {
        // Cupcake celebratory bouncy rhythm (25.2 - 28.0s)
        const partyNotes = [523.25, 659.25, 783.99, 1046.50];
        for (let step = 0; step < 8; step++) {
          const at = base + 25.2 + step * 0.35;
          const f = partyNotes[step % partyNotes.length];
          tone(f, at, 0.22, 'triangle', 0.45);
          tone(f * 0.5, at, 0.25, 'sine', 0.35);
        }
        // 28.2+ is silence / rage freeze followed by sad trombone in cues!
      }
    } catch {}
  }

  /**
   * High-tech blue laser scan sweep for The Self-Building Robot.
   */
  public playLaserScan(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const mod = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1150, now);
      osc.frequency.exponentialRampToValueAtTime(2100, now + 0.18);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.38);

      mod.type = 'triangle';
      mod.frequency.setValueAtTime(24, now);
      const modGain = ctx.createGain();
      modGain.gain.setValueAtTime(90, now);
      mod.connect(modGain);
      modGain.connect(osc.frequency);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.26 * this.volume, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

      osc.connect(gain);
      this.routeOutput(gain, dest);
      osc.start(now);
      mod.start(now);
      osc.stop(now + 0.45);
      mod.stop(now + 0.45);
    } catch {}
  }

  /**
   * Mechanical servo whir + latch click when attaching upgrades or unfolding giant legs.
   */
  public playServoWhir(dest?: AudioNode, pitch = 1.0) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160 * pitch, now);
      osc.frequency.exponentialRampToValueAtTime(420 * pitch, now + 0.28);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(650 * pitch, now);
      filter.Q.setValueAtTime(2.5, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.24 * this.volume, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);

      osc.connect(filter);
      filter.connect(gain);
      this.routeOutput(gain, dest);
      osc.start(now);
      osc.stop(now + 0.35);

      // Latch click at completion
      const click = ctx.createOscillator();
      const cGain = ctx.createGain();
      click.type = 'square';
      click.frequency.setValueAtTime(920, now + 0.26);
      click.frequency.exponentialRampToValueAtTime(320, now + 0.31);
      cGain.gain.setValueAtTime(0.2 * this.volume, now + 0.26);
      cGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);
      click.connect(cGain);
      this.routeOutput(cGain, dest);
      click.start(now + 0.26);
      click.stop(now + 0.34);
    } catch {}
  }

  /**
   * Descending triple warning beep when robot hits low battery at 24.0s.
   */
  public playPowerDownBeep(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [660, 440, 260];
      notes.forEach((freq, idx) => {
        const at = now + idx * 0.16;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, at);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.78, at + 0.12);
        gain.gain.setValueAtTime(0.18 * this.volume, at);
        gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.14);
        osc.connect(gain);
        this.routeOutput(gain, dest);
        osc.start(at);
        osc.stop(at + 0.16);
      });
    } catch {}
  }

  /**
   * Bright ascending electric recharge chord when power bank is plugged in.
   */
  public playPowerUpSurge(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [330, 440, 659.25, 880, 1318.5];
      notes.forEach((freq, idx) => {
        const at = now + idx * 0.07;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, at);
        gain.gain.setValueAtTime(0.001, at);
        gain.gain.linearRampToValueAtTime(0.24 * this.volume, at + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.32);
        osc.connect(gain);
        this.routeOutput(gain, dest);
        osc.start(at);
        osc.stop(at + 0.35);
      });
    } catch {}
  }

  /**
   * 30s workshop comedy synth score for "The Self-Building Robot",
   * sliced into 4 x 7.5s sections so Web Audio node count stays small.
   */
  public playRobotScoreSection(dest?: AudioNode, fromSec = 0, toSec = 30) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const beat = 60 / 136; // playful 136 BPM
      const base = ctx.currentTime + 0.05 - fromSec;
      const LEVEL = 0.55;

      const tone = (
        freq: number,
        at: number,
        dur: number,
        type: OscillatorType,
        gain: number
      ) => {
        if (at < ctx.currentTime - 0.05 || at > ctx.currentTime + (toSec - fromSec) + 0.1) return;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, at);
        g.gain.setValueAtTime(0.0001, at);
        g.gain.linearRampToValueAtTime(gain * LEVEL * this.volume, at + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        osc.connect(g);
        this.routeOutput(g, dest);
        osc.start(at);
        osc.stop(at + dur + 0.02);
      };

      const firstBeat = Math.max(0, Math.floor(fromSec / beat));
      const lastBeat = Math.ceil(toSec / beat);
      const melody = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880.0, 783.99];
      const bass = [130.81, 130.81, 174.61, 196.0];

      for (let b = firstBeat; b < lastBeat; b++) {
        const t = b * beat;
        const at = base + t;
        // Brief comedic silence window during low-battery freeze (24.0 - 25.4s)
        if (t >= 23.95 && t < 25.35) continue;

        const bar = Math.floor(b / 4) % bass.length;
        // Plucky synth bass on beat
        tone(bass[bar], at, beat * 0.65, 'triangle', 0.36);

        // Quirky workshop arpeggio
        const note = melody[b % melody.length] * (t >= 16.0 && t < 24.0 ? 0.75 : 1.0);
        tone(note, at + beat * 0.5, beat * 0.42, 'sine', 0.34);

        // Extra driving pulse during Scene 2 chase & Scene 3-4 monster upgrades
        if ((t >= 8.8 && t < 12.0) || (t >= 16.2 && t < 23.8) || t >= 26.4) {
          tone(note * 1.5, at, beat * 0.25, 'square', 0.11);
        }
      }
    } catch {}
  }

  /**
   * Playful elastic ribbon pull squeak/stretch for The Infinite Gift Box.
   */
  public playRibbonPull(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(340, now);
      osc.frequency.exponentialRampToValueAtTime(620, now + 0.16);
      osc.frequency.exponentialRampToValueAtTime(480, now + 0.28);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.24 * this.volume, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

      osc.connect(gain);
      this.routeOutput(gain, dest);
      osc.start(now);
      osc.stop(now + 0.32);
    } catch {}
  }

  /**
   * Crisp cardboard lid pop open + chime reveal for nested gift boxes.
   */
  public playBoxPopOpen(dest?: AudioNode, pitch = 1.0) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const pop = ctx.createOscillator();
      const pGain = ctx.createGain();
      pop.type = 'sine';
      pop.frequency.setValueAtTime(190 * pitch, now);
      pop.frequency.exponentialRampToValueAtTime(620 * pitch, now + 0.08);
      pGain.gain.setValueAtTime(0.32 * this.volume, now);
      pGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);
      pop.connect(pGain);
      this.routeOutput(pGain, dest);
      pop.start(now);
      pop.stop(now + 0.13);

      // Reveal sparkle
      const ding = ctx.createOscillator();
      const dGain = ctx.createGain();
      ding.type = 'triangle';
      ding.frequency.setValueAtTime(880 * pitch, now + 0.06);
      dGain.gain.setValueAtTime(0.001, now + 0.06);
      dGain.gain.linearRampToValueAtTime(0.22 * this.volume, now + 0.08);
      dGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);
      ding.connect(dGain);
      this.routeOutput(dGain, dest);
      ding.start(now + 0.06);
      ding.stop(now + 0.35);
    } catch {}
  }

  /**
   * Rising accordion/cardboard expansion whoosh when the giant red box unfolds.
   */
  public playMagicExpand(dest?: AudioNode, reverse = false) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const dur = 0.72;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      if (reverse) {
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(125, now + dur);
      } else {
        osc.frequency.setValueAtTime(125, now);
        osc.frequency.exponentialRampToValueAtTime(520, now + dur);
      }

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1100, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.22 * this.volume, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

      osc.connect(filter);
      filter.connect(gain);
      this.routeOutput(gain, dest);
      osc.start(now);
      osc.stop(now + dur + 0.02);
    } catch {}
  }

  /**
   * Popping cascade of tiny gift boxes erupting upward in Scene 5.
   */
  public playGiftFountain(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const freqs = [523, 659, 784, 987, 1174, 880, 1318, 1046];
      freqs.forEach((f, idx) => {
        const at = now + idx * 0.065;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f * 0.7, at);
        osc.frequency.exponentialRampToValueAtTime(f * 1.15, at + 0.07);
        gain.gain.setValueAtTime(0.22 * this.volume, at);
        gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.14);
        osc.connect(gain);
        this.routeOutput(gain, dest);
        osc.start(at);
        osc.stop(at + 0.16);
      });
    } catch {}
  }

  /**
   * 30s playful living-room comedy score for "The Infinite Gift Box",
   * sliced into 4 x 7.5s sections so Web Audio node count stays small.
   */
  public playGiftBoxScoreSection(dest?: AudioNode, fromSec = 0, toSec = 30) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const beat = 60 / 134; // bouncy 134 BPM comedy groove
      const base = ctx.currentTime + 0.05 - fromSec;
      const LEVEL = 0.54;

      const tone = (
        freq: number,
        at: number,
        dur: number,
        type: OscillatorType,
        gain: number
      ) => {
        if (at < ctx.currentTime - 0.05 || at > ctx.currentTime + (toSec - fromSec) + 0.1) return;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, at);
        g.gain.setValueAtTime(0.0001, at);
        g.gain.linearRampToValueAtTime(gain * LEVEL * this.volume, at + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        osc.connect(g);
        this.routeOutput(g, dest);
        osc.start(at);
        osc.stop(at + dur + 0.02);
      };

      const firstBeat = Math.max(0, Math.floor(fromSec / beat));
      const lastBeat = Math.ceil(toSec / beat);
      const melody = [523.25, 659.25, 783.99, 880.0, 783.99, 659.25, 587.33, 659.25];
      const bass = [130.81, 164.81, 174.61, 196.0];

      for (let b = firstBeat; b < lastBeat; b++) {
        const t = b * beat;
        const at = base + t;
        // Brief comedic silence right before final beanie bonk & stare (28.35 - 30.0s)
        if (t >= 28.35) continue;

        const bar = Math.floor(b / 4) % bass.length;
        tone(bass[bar], at, beat * 0.6, 'triangle', 0.36);

        const note = melody[b % melody.length] * (t >= 18.0 && t < 24.0 ? 0.85 : 1.0);
        tone(note, at + beat * 0.5, beat * 0.4, 'sine', 0.34);

        if ((t >= 13.3 && t < 17.8) || (t >= 20.0 && t < 23.8) || (t >= 26.6 && t < 27.6)) {
          tone(note * 1.5, at, beat * 0.25, 'triangle', 0.14);
        }
      }
    } catch {}
  }


  /**
   * Weird electronic double-blink chirp when the traffic light wakes up.
   */
  public playTrafficBlink(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [880, 1180];
      notes.forEach((freq, idx) => {
        const at = now + idx * 0.14;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, at);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.18, at + 0.08);
        gain.gain.setValueAtTime(0.001, at);
        gain.gain.linearRampToValueAtTime(0.26 * this.volume, at + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.11);
        osc.connect(gain);
        this.routeOutput(gain, dest);
        osc.start(at);
        osc.stop(at + 0.13);
      });
    } catch {}
  }

  /**
   * Snappy mechanical arm + STOP sign slam with metallic clack.
   */
  public playStopSignSnap(dest?: AudioNode, pitch = 1.0) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520 * pitch, now);
      osc.frequency.exponentialRampToValueAtTime(140 * pitch, now + 0.14);
      gain.gain.setValueAtTime(0.36 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
      osc.connect(gain);
      this.routeOutput(gain, dest);
      osc.start(now);
      osc.stop(now + 0.2);

      // Metallic sign ring
      const ring = ctx.createOscillator();
      const rGain = ctx.createGain();
      ring.type = 'sine';
      ring.frequency.setValueAtTime(1320 * pitch, now + 0.02);
      rGain.gain.setValueAtTime(0.16 * this.volume, now + 0.02);
      rGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.26);
      ring.connect(rGain);
      this.routeOutput(rGain, dest);
      ring.start(now + 0.02);
      ring.stop(now + 0.28);
    } catch {}
  }

  /**
   * Rolling rubber-wheel squeak/whir as the traffic light stalks sideways.
   */
  public playWheelRoll(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(240, now + 0.25);
      osc.frequency.linearRampToValueAtTime(170, now + 0.52);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.2 * this.volume, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.56);
      osc.connect(gain);
      this.routeOutput(gain, dest);
      osc.start(now);
      osc.stop(now + 0.58);
    } catch {}
  }

  /**
   * Heavy plug yank + blackout power-down drop.
   */
  public playPowerBlackout(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Pop from socket
      const pop = ctx.createOscillator();
      const pGain = ctx.createGain();
      pop.type = 'sine';
      pop.frequency.setValueAtTime(420, now);
      pop.frequency.exponentialRampToValueAtTime(120, now + 0.09);
      pGain.gain.setValueAtTime(0.38 * this.volume, now);
      pGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
      pop.connect(pGain);
      this.routeOutput(pGain, dest);
      pop.start(now);
      pop.stop(now + 0.14);

      // Descending blackout power-down turbine
      const down = ctx.createOscillator();
      const dGain = ctx.createGain();
      down.type = 'sawtooth';
      down.frequency.setValueAtTime(360, now + 0.05);
      down.frequency.exponentialRampToValueAtTime(52, now + 0.72);
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, now + 0.05);
      filter.frequency.exponentialRampToValueAtTime(140, now + 0.72);
      dGain.gain.setValueAtTime(0.24 * this.volume, now + 0.05);
      dGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.75);
      down.connect(filter);
      filter.connect(dGain);
      this.routeOutput(dGain, dest);
      down.start(now + 0.05);
      down.stop(now + 0.78);
    } catch {}
  }

  /**
   * Hidden backup battery hatch pop + rising electric charge hum.
   */
  public playBatteryCharge(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(760, now + 0.58);
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(620, now);
      filter.Q.setValueAtTime(2.0, now);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.25 * this.volume, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.62);
      osc.connect(filter);
      filter.connect(gain);
      this.routeOutput(gain, dest);
      osc.start(now);
      osc.stop(now + 0.65);
    } catch {}
  }

  /**
   * Bright red alarm flash sting right in Stickman's face at 27.6s.
   */
  public playRedAlarmFlash(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [0, 0.28, 0.56].forEach((offset) => {
        const at = now + offset;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(740, at);
        osc.frequency.setValueAtTime(520, at + 0.11);
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1600, at);
        gain.gain.setValueAtTime(0.001, at);
        gain.gain.linearRampToValueAtTime(0.22 * this.volume, at + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.22);
        osc.connect(filter);
        filter.connect(gain);
        this.routeOutput(gain, dest);
        osc.start(at);
        osc.stop(at + 0.24);
      });
    } catch {}
  }

  /**
   * 30s urban cartoon comedy score for "The Living Traffic Light",
   * sliced into 4 x 7.5s sections with a blackout silence window at 24.9-26.8s.
   */
  public playTrafficLightScoreSection(dest?: AudioNode, fromSec = 0, toSec = 30) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const beat = 60 / 132; // quirky 132 BPM street-comedy walk/chase tempo
      const base = ctx.currentTime + 0.05 - fromSec;
      const LEVEL = 0.54;

      const tone = (
        freq: number,
        at: number,
        dur: number,
        type: OscillatorType,
        gain: number
      ) => {
        if (at < ctx.currentTime - 0.05 || at > ctx.currentTime + (toSec - fromSec) + 0.1) return;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, at);
        g.gain.setValueAtTime(0.0001, at);
        g.gain.linearRampToValueAtTime(gain * LEVEL * this.volume, at + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        osc.connect(g);
        this.routeOutput(g, dest);
        osc.start(at);
        osc.stop(at + dur + 0.02);
      };

      const firstBeat = Math.max(0, Math.floor(fromSec / beat));
      const lastBeat = Math.ceil(toSec / beat);
      const melody = [523.25, 622.25, 698.46, 783.99, 698.46, 622.25, 587.33, 493.88];
      const tiptoe = [783.99, 830.61, 880.0, 932.33, 880.0, 783.99];
      const bass = [130.81, 130.81, 155.56, 196.0];

      for (let b = firstBeat; b < lastBeat; b++) {
        const t = b * beat;
        const at = base + t;
        // Blackout silence window (24.85 - 26.85s) + final freeze after 28.6s
        if ((t >= 24.85 && t < 26.85) || t >= 28.6) continue;

        const bar = Math.floor(b / 4) % bass.length;
        tone(bass[bar], at, beat * 0.58, 'triangle', 0.36);

        if (t >= 12.0 && t < 18.0) {
          // Sneaky tiptoe pizzicato in Scene 3
          const note = tiptoe[b % tiptoe.length];
          tone(note, at + beat * 0.5, beat * 0.22, 'sine', 0.38);
        } else {
          const note = melody[b % melody.length];
          tone(note, at + beat * 0.5, beat * 0.38, 'triangle', 0.34);
        }

        // Urgent chase pulse during Scene 4 mini-light wall (18.0 - 24.0s)
        if (t >= 18.0 && t < 24.0) {
          tone(melody[(b + 2) % melody.length] * 1.5, at, beat * 0.2, 'square', 0.1);
        }
      }
    } catch {}
  }

  /**
   * Chunky red CLONE / RESET button mechanical press click + spring return.
   */
  public playCloneButtonPress(dest?: AudioNode, pitch = 1) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(640 * pitch, now);
      osc.frequency.exponentialRampToValueAtTime(190 * pitch, now + 0.08);
      gain.gain.setValueAtTime(0.42 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);
      osc.connect(gain);
      this.routeOutput(gain, dest);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch {}
  }

  /**
   * Bright sci-fi cartoon flash + bubbly spawn pop as a clone appears.
   */
  public playClonePop(dest?: AudioNode, pitch = 1) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const flash = ctx.createOscillator();
      const fGain = ctx.createGain();
      flash.type = 'sine';
      flash.frequency.setValueAtTime(520 * pitch, now);
      flash.frequency.exponentialRampToValueAtTime(1380 * pitch, now + 0.14);
      fGain.gain.setValueAtTime(0.24 * this.volume, now);
      fGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.17);
      flash.connect(fGain);
      this.routeOutput(fGain, dest);
      flash.start(now);
      flash.stop(now + 0.18);

      const pop = ctx.createOscillator();
      const pGain = ctx.createGain();
      pop.type = 'sine';
      pop.frequency.setValueAtTime(220 * pitch, now + 0.05);
      pop.frequency.exponentialRampToValueAtTime(760 * pitch, now + 0.13);
      pGain.gain.setValueAtTime(0.36 * this.volume, now + 0.05);
      pGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
      pop.connect(pGain);
      this.routeOutput(pGain, dest);
      pop.start(now + 0.05);
      pop.stop(now + 0.2);
    } catch {}
  }

  /**
   * Massive white-flash vacuum sweep when pressing RESET vanishes all clones.
   */
  public playResetFlashVanish(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const sweep = ctx.createOscillator();
      const sGain = ctx.createGain();
      sweep.type = 'sawtooth';
      sweep.frequency.setValueAtTime(1180, now);
      sweep.frequency.exponentialRampToValueAtTime(95, now + 0.55);
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2400, now);
      filter.frequency.exponentialRampToValueAtTime(220, now + 0.55);
      sGain.gain.setValueAtTime(0.34 * this.volume, now);
      sGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.58);
      sweep.connect(filter);
      filter.connect(sGain);
      this.routeOutput(sGain, dest);
      sweep.start(now);
      sweep.stop(now + 0.6);

      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const at = now + 0.22 + idx * 0.06;
        const c = ctx.createOscillator();
        const g = ctx.createGain();
        c.type = 'triangle';
        c.frequency.setValueAtTime(freq, at);
        g.gain.setValueAtTime(0.22 * this.volume, at);
        g.gain.exponentialRampToValueAtTime(0.0001, at + 0.28);
        c.connect(g);
        this.routeOutput(g, dest);
        c.start(at);
        c.stop(at + 0.3);
      });
    } catch {}
  }

  /**
   * Comedic shock sting when tiny clone waves from Stickman's shoulder.
   */
  public playCloneShockSting(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [622.25, 587.33, 554.37, 466.16].forEach((freq, i) => {
        const at = now + i * 0.14;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, at);
        if (i === 3) {
          osc.frequency.linearRampToValueAtTime(349.23, at + 0.52);
        }
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, at);
        const dur = i === 3 ? 0.58 : 0.12;
        gain.gain.setValueAtTime(0.001, at);
        gain.gain.linearRampToValueAtTime(0.24 * this.volume, at + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        osc.connect(filter);
        filter.connect(gain);
        this.routeOutput(gain, dest);
        osc.start(at);
        osc.stop(at + dur + 0.03);
      });
    } catch {}
  }

  /**
   * 30s energetic lab/slapstick comedy score for "The Clone Button Disaster",
   * sliced into 4 x 7.5s sections with a brief hush before the final tiny-clone reveal.
   */
  public playCloneDisasterScoreSection(dest?: AudioNode, fromSec = 0, toSec = 30) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const beat = 60 / 138; // peppy 138 BPM slapstick escalation
      const base = ctx.currentTime + 0.05 - fromSec;
      const LEVEL = 0.52;

      const tone = (
        freq: number,
        at: number,
        dur: number,
        type: OscillatorType,
        gain: number
      ) => {
        if (at < ctx.currentTime - 0.05 || at > ctx.currentTime + (toSec - fromSec) + 0.1) return;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, at);
        g.gain.setValueAtTime(0.0001, at);
        g.gain.linearRampToValueAtTime(gain * LEVEL * this.volume, at + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        osc.connect(g);
        this.routeOutput(g, dest);
        osc.start(at);
        osc.stop(at + dur + 0.02);
      };

      const firstBeat = Math.max(0, Math.floor(fromSec / beat));
      const lastBeat = Math.ceil(toSec / beat);
      const melody = [587.33, 659.25, 739.99, 880.0, 783.99, 739.99, 659.25, 587.33];
      const chaosLead = [880.0, 987.77, 1174.66, 987.77, 1046.5, 932.33, 880.0, 783.99];
      const bass = [146.83, 146.83, 196.0, 220.0];

      for (let b = firstBeat; b < lastBeat; b++) {
        const t = b * beat;
        const at = base + t;
        if ((t >= 25.35 && t < 26.05) || t >= 28.4) continue;

        const bar = Math.floor(b / 4) % bass.length;
        tone(bass[bar], at, beat * 0.55, 'triangle', 0.36);

        if (t >= 12.0 && t < 24.0) {
          const note = chaosLead[b % chaosLead.length];
          tone(note, at + beat * 0.5, beat * 0.28, 'square', 0.14);
        } else {
          const note = melody[b % melody.length];
          tone(note, at + beat * 0.5, beat * 0.34, 'triangle', 0.32);
        }
      }
    } catch {}
  }

  /**
   * Strained elastic rubber-band stretch creak.
   */
  public playRubberStretch(dest?: AudioNode, intensity = 1) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(115 * intensity, now);
      osc.frequency.linearRampToValueAtTime(245 * intensity, now + 0.55);

      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(26, now);
      lfoGain.gain.setValueAtTime(18, now);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(520 * intensity, now);
      filter.Q.setValueAtTime(3.5, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.28 * this.volume, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

      osc.connect(filter);
      filter.connect(gain);
      this.routeOutput(gain, dest);

      lfo.start(now);
      osc.start(now);
      lfo.stop(now + 0.62);
      osc.stop(now + 0.62);
    } catch {}
  }

  /**
   * Heavy wooden post crack & snap loose from bolts.
   */
  public playWoodCrackSnap(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const bufSize = Math.floor(ctx.sampleRate * 0.16);
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        data[i] = (Math.sin(i * 0.19) * 0.5 + (((i * 1103515245) % 97) / 97 - 0.5)) * Math.exp(-i / (bufSize * 0.25));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buf;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1350, now);
      filter.Q.setValueAtTime(1.8, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.55 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      noise.connect(filter);
      filter.connect(gain);
      this.routeOutput(gain, dest);
      noise.start(now);

      const thud = ctx.createOscillator();
      const tGain = ctx.createGain();
      thud.type = 'triangle';
      thud.frequency.setValueAtTime(220, now);
      thud.frequency.exponentialRampToValueAtTime(62, now + 0.18);
      tGain.gain.setValueAtTime(0.45 * this.volume, now);
      tGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
      thud.connect(tGain);
      this.routeOutput(tGain, dest);
      thud.start(now);
      thud.stop(now + 0.21);
    } catch {}
  }

  /**
   * Giant elastic rubber band snap & oscillating twang recoil.
   */
  public playRubberTwangSnap(dest?: AudioNode, pitch = 1) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(110 * pitch, now);
      osc.frequency.exponentialRampToValueAtTime(340 * pitch, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(135 * pitch, now + 0.55);

      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(24, now);
      lfoGain.gain.setValueAtTime(48 * pitch, now);
      lfoGain.gain.exponentialRampToValueAtTime(4, now + 0.55);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      gain.gain.setValueAtTime(0.45 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.58);

      osc.connect(gain);
      this.routeOutput(gain, dest);

      lfo.start(now);
      osc.start(now);
      lfo.stop(now + 0.6);
      osc.stop(now + 0.6);
    } catch {}
  }

  /**
   * Soft puffy sofa / pillow bounce boing.
   */
  public playCushionBounce(dest?: AudioNode, pitch = 1) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140 * pitch, now);
      osc.frequency.exponentialRampToValueAtTime(380 * pitch, now + 0.12);
      osc.frequency.exponentialRampToValueAtTime(190 * pitch, now + 0.28);
      gain.gain.setValueAtTime(0.4 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
      osc.connect(gain);
      this.routeOutput(gain, dest);
      osc.start(now);
      osc.stop(now + 0.32);
    } catch {}
  }

  /**
   * Crisp elastic whip flick when the loose band knocks Stickman's beanie off.
   */
  public playBeanieFlick(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(360, now);
      osc.frequency.exponentialRampToValueAtTime(1480, now + 0.06);
      osc.frequency.exponentialRampToValueAtTime(280, now + 0.18);
      gain.gain.setValueAtTime(0.42 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
      osc.connect(gain);
      this.routeOutput(gain, dest);
      osc.start(now);
      osc.stop(now + 0.21);
    } catch {}
  }

  /**
   * 30s energetic slapstick comedy score for "The Giant Rubber Band Trap",
   * sliced into 4 x 7.5s sections with dramatic silence windows for the snap & final stare.
   */
  public playRubberBandScoreSection(dest?: AudioNode, fromSec = 0, toSec = 30) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const beat = 60 / 134;
      const base = ctx.currentTime + 0.05 - fromSec;
      const LEVEL = 0.5;

      const tone = (
        freq: number,
        at: number,
        dur: number,
        type: OscillatorType,
        gain: number
      ) => {
        if (at < ctx.currentTime - 0.05 || at > ctx.currentTime + (toSec - fromSec) + 0.1) return;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, at);
        g.gain.setValueAtTime(0.0001, at);
        g.gain.linearRampToValueAtTime(gain * LEVEL * this.volume, at + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        osc.connect(g);
        this.routeOutput(g, dest);
        osc.start(at);
        osc.stop(at + dur + 0.02);
      };

      const firstBeat = Math.max(0, Math.floor(fromSec / beat));
      const lastBeat = Math.ceil(toSec / beat);
      const melody = [523.25, 659.25, 783.99, 880.0, 783.99, 659.25, 587.33, 659.25];
      const launchLead = [783.99, 987.77, 1046.5, 1174.66, 1046.5, 987.77, 880.0, 783.99];
      const bass = [130.81, 130.81, 174.61, 196.0];

      for (let b = firstBeat; b < lastBeat; b++) {
        const t = b * beat;
        const at = base + t;
        // Brief comedic hush right at post crack (13.1-13.55s) & final beanie flick stare (28.15s+)
        if ((t >= 13.1 && t < 13.55) || t >= 28.15) continue;

        const bar = Math.floor(b / 4) % bass.length;
        tone(bass[bar], at, beat * 0.55, 'triangle', 0.36);

        if (t >= 13.6 && t < 24.0) {
          tone(launchLead[b % launchLead.length], at + beat * 0.5, beat * 0.28, 'square', 0.13);
        } else {
          tone(melody[b % melody.length], at + beat * 0.5, beat * 0.34, 'triangle', 0.31);
        }
      }
    } catch {}
  }

  /**
   * Mysterious descending portal bloop as a small object falls into the purple floor hole.
   */
  public playHoleDropBloop(dest?: AudioNode, pitch = 1) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(760 * pitch, now);
      osc.frequency.exponentialRampToValueAtTime(160 * pitch, now + 0.24);
      gain.gain.setValueAtTime(0.36 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.26);
      osc.connect(gain);
      this.routeOutput(gain, dest);
      osc.start(now);
      osc.stop(now + 0.28);
    } catch {}
  }

  /**
   * Giant purple-portal eruption boom + expanding rising shimmer when an oversized prop shoots out.
   */
  public playHoleGiantErupt(dest?: AudioNode, scalePitch = 1) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const boom = ctx.createOscillator();
      const bGain = ctx.createGain();
      boom.type = 'triangle';
      boom.frequency.setValueAtTime(95 * scalePitch, now);
      boom.frequency.exponentialRampToValueAtTime(340 * scalePitch, now + 0.12);
      boom.frequency.exponentialRampToValueAtTime(68, now + 0.45);
      bGain.gain.setValueAtTime(0.5 * this.volume, now);
      bGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.48);
      boom.connect(bGain);
      this.routeOutput(bGain, dest);
      boom.start(now);
      boom.stop(now + 0.5);

      const shimmer = ctx.createOscillator();
      const sGain = ctx.createGain();
      shimmer.type = 'sine';
      shimmer.frequency.setValueAtTime(380 * scalePitch, now);
      shimmer.frequency.exponentialRampToValueAtTime(1120 * scalePitch, now + 0.25);
      sGain.gain.setValueAtTime(0.24 * this.volume, now);
      sGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
      shimmer.connect(sGain);
      this.routeOutput(sGain, dest);
      shimmer.start(now);
      shimmer.stop(now + 0.3);
    } catch {}
  }

  /**
   * Comically huge deep rubber-ducky squeak-honk!
   */
  public playGiantDuckSqueak(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [0, 0.24].forEach((offset, idx) => {
        const at = now + offset;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        const f0 = idx === 0 ? 310 : 280;
        osc.frequency.setValueAtTime(f0, at);
        osc.frequency.linearRampToValueAtTime(f0 * 1.32, at + 0.08);
        osc.frequency.linearRampToValueAtTime(f0 * 0.85, at + 0.18);
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(720, at);
        filter.Q.setValueAtTime(2.6, at);
        gain.gain.setValueAtTime(0.42 * this.volume, at);
        gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.2);
        osc.connect(filter);
        filter.connect(gain);
        this.routeOutput(gain, dest);
        osc.start(at);
        osc.stop(at + 0.21);
      });
    } catch {}
  }

  /**
   * Wooden living-room furniture crash & splintering impact.
   */
  public playFurnitureSmash(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const bufSize = Math.floor(ctx.sampleRate * 0.24);
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        data[i] = (Math.sin(i * 0.16) * 0.4 + (((i * 1664525) % 101) / 101 - 0.5)) * Math.exp(-i / (bufSize * 0.28));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buf;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1900, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.55 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
      noise.connect(filter);
      filter.connect(gain);
      this.routeOutput(gain, dest);
      noise.start(now);

      const thump = ctx.createOscillator();
      const tGain = ctx.createGain();
      thump.type = 'triangle';
      thump.frequency.setValueAtTime(160, now);
      thump.frequency.exponentialRampToValueAtTime(48, now + 0.22);
      tGain.gain.setValueAtTime(0.45 * this.volume, now);
      tGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
      thump.connect(tGain);
      this.routeOutput(tGain, dest);
      thump.start(now);
      thump.stop(now + 0.25);
    } catch {}
  }

  /**
   * 30s playful sci-fi mystery slapstick score for "The Mystery Hole in the Floor",
   * sliced into 4 x 7.5s sections with a suspense pause right before the giant head reveal.
   */
  public playMysteryHoleScoreSection(dest?: AudioNode, fromSec = 0, toSec = 30) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const beat = 60 / 132;
      const base = ctx.currentTime + 0.05 - fromSec;
      const LEVEL = 0.5;

      const tone = (
        freq: number,
        at: number,
        dur: number,
        type: OscillatorType,
        gain: number
      ) => {
        if (at < ctx.currentTime - 0.05 || at > ctx.currentTime + (toSec - fromSec) + 0.1) return;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, at);
        g.gain.setValueAtTime(0.0001, at);
        g.gain.linearRampToValueAtTime(gain * LEVEL * this.volume, at + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        osc.connect(g);
        this.routeOutput(g, dest);
        osc.start(at);
        osc.stop(at + dur + 0.02);
      };

      const firstBeat = Math.max(0, Math.floor(fromSec / beat));
      const lastBeat = Math.ceil(toSec / beat);
      const melody = [493.88, 587.33, 659.25, 739.99, 659.25, 587.33, 554.37, 587.33];
      const chaseLead = [739.99, 880.0, 987.77, 1174.66, 987.77, 880.0, 783.99, 659.25];
      const bass = [123.47, 123.47, 164.81, 185.0];

      for (let b = firstBeat; b < lastBeat; b++) {
        const t = b * beat;
        const at = base + t;
        if ((t >= 27.15 && t < 27.85) || t >= 28.55) continue;

        const bar = Math.floor(b / 4) % bass.length;
        tone(bass[bar], at, beat * 0.55, 'triangle', 0.36);

        if (t >= 13.8 && t < 24.0) {
          tone(chaseLead[b % chaseLead.length], at + beat * 0.5, beat * 0.28, 'square', 0.13);
        } else {
          tone(melody[b % melody.length], at + beat * 0.5, beat * 0.34, 'triangle', 0.3);
        }
      }
    } catch {}
  }

  /**
   * Bouncy metallic coil-spring BOING! Pitch scales up with bounce height.
   */
  public playSpringBoing(dest?: AudioNode, pitch = 1) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(145 * pitch, now);
      osc.frequency.exponentialRampToValueAtTime(420 * pitch, now + 0.14);
      osc.frequency.exponentialRampToValueAtTime(240 * pitch, now + 0.42);

      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(28, now);
      lfoGain.gain.setValueAtTime(42 * pitch, now);
      lfoGain.gain.exponentialRampToValueAtTime(4, now + 0.42);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      gain.gain.setValueAtTime(0.42 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
      osc.connect(gain);
      this.routeOutput(gain, dest);

      lfo.start(now);
      osc.start(now);
      lfo.stop(now + 0.47);
      osc.stop(now + 0.47);
    } catch {}
  }

  /**
   * Giant trampoline + spring rocket-launch boing & upward whistle.
   */
  public playRocketLaunchBoing(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const boing = ctx.createOscillator();
      const bGain = ctx.createGain();
      boing.type = 'triangle';
      boing.frequency.setValueAtTime(110, now);
      boing.frequency.exponentialRampToValueAtTime(620, now + 0.25);
      bGain.gain.setValueAtTime(0.5 * this.volume, now);
      bGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);
      boing.connect(bGain);
      this.routeOutput(bGain, dest);
      boing.start(now);
      boing.stop(now + 0.44);

      const whistle = ctx.createOscillator();
      const wGain = ctx.createGain();
      whistle.type = 'sine';
      whistle.frequency.setValueAtTime(360, now + 0.08);
      whistle.frequency.exponentialRampToValueAtTime(1320, now + 0.65);
      wGain.gain.setValueAtTime(0.24 * this.volume, now + 0.08);
      wGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.68);
      whistle.connect(wGain);
      this.routeOutput(wGain, dest);
      whistle.start(now + 0.08);
      whistle.stop(now + 0.7);
    } catch {}
  }

  /**
   * Loose metallic coil pop-out snap when the sneaker launches onto Stickman's head.
   */
  public playSpringPopOut(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(980, now + 0.09);
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.24);
      gain.gain.setValueAtTime(0.4 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.26);
      osc.connect(gain);
      this.routeOutput(gain, dest);
      osc.start(now);
      osc.stop(now + 0.28);
    } catch {}
  }

  /**
   * 30s energetic bouncy pop comedy score for "The Super Bouncy Shoes",
   * sliced into 4 x 7.5s sections with a brief hush before the loose-spring sneaker bonk.
   */
  public playSuperBouncyScoreSection(dest?: AudioNode, fromSec = 0, toSec = 30) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const beat = 60 / 138;
      const base = ctx.currentTime + 0.05 - fromSec;
      const LEVEL = 0.5;

      const tone = (
        freq: number,
        at: number,
        dur: number,
        type: OscillatorType,
        gain: number
      ) => {
        if (at < ctx.currentTime - 0.05 || at > ctx.currentTime + (toSec - fromSec) + 0.1) return;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, at);
        g.gain.setValueAtTime(0.0001, at);
        g.gain.linearRampToValueAtTime(gain * LEVEL * this.volume, at + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        osc.connect(g);
        this.routeOutput(g, dest);
        osc.start(at);
        osc.stop(at + dur + 0.02);
      };

      const firstBeat = Math.max(0, Math.floor(fromSec / beat));
      const lastBeat = Math.ceil(toSec / beat);
      const melody = [523.25, 659.25, 783.99, 1046.5, 880.0, 783.99, 659.25, 587.33];
      const airLead = [1046.5, 1174.66, 1318.51, 1174.66, 987.77, 880.0, 783.99, 659.25];
      const bass = [130.81, 164.81, 196.0, 174.61];

      for (let b = firstBeat; b < lastBeat; b++) {
        const t = b * beat;
        const at = base + t;
        if (t >= 27.6) continue;

        const bar = Math.floor(b / 4) % bass.length;
        tone(bass[bar], at, beat * 0.5, 'triangle', 0.36);

        if (t >= 12.0 && t < 24.0) {
          tone(airLead[b % airLead.length], at + beat * 0.5, beat * 0.28, 'square', 0.12);
        } else {
          tone(melody[b % melody.length], at + beat * 0.5, beat * 0.34, 'triangle', 0.31);
        }
      }
    } catch {}
  }

  /** Magical shadowy swoosh when the silhouette stretches or kicks. */
  public playShadowWhoosh(dest?: AudioNode, pitch = 1.0) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(160 * pitch, now);
      osc.frequency.exponentialRampToValueAtTime(520 * pitch, now + 0.14);
      osc.frequency.exponentialRampToValueAtTime(120 * pitch, now + 0.34);

      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(0.24 * this.volume, now + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.36);

      osc.connect(g);
      this.routeOutput(g, dest);
      osc.start(now);
      osc.stop(now + 0.38);

      const nSize = Math.floor(ctx.sampleRate * 0.25);
      const buf = ctx.createBuffer(1, nSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < nSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.09));
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(700 * pitch, now);
      bp.Q.setValueAtTime(1.5, now);
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0.16 * this.volume, now);
      ng.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
      src.connect(bp);
      bp.connect(ng);
      this.routeOutput(ng, dest);
      src.start(now);
    } catch {}
  }

  /** Mechanical spotlight swivel click or bulb power-off flicker buzz. */
  public playSpotlightClick(dest?: AudioNode, powerOn = true) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = powerOn ? 'triangle' : 'sawtooth';
      if (powerOn) {
        osc.frequency.setValueAtTime(920, now);
        osc.frequency.exponentialRampToValueAtTime(340, now + 0.07);
        g.gain.setValueAtTime(0.22 * this.volume, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
        osc.connect(g);
        this.routeOutput(g, dest);
        osc.start(now);
        osc.stop(now + 0.11);
      } else {
        // Two electric sputter flickers followed by power-down drop
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(110, now + 0.22);
        osc.frequency.exponentialRampToValueAtTime(48, now + 0.45);
        g.gain.setValueAtTime(0.2 * this.volume, now);
        g.gain.setValueAtTime(0.03 * this.volume, now + 0.09);
        g.gain.setValueAtTime(0.22 * this.volume, now + 0.16);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.46);
        osc.connect(g);
        this.routeOutput(g, dest);
        osc.start(now);
        osc.stop(now + 0.48);
      }
    } catch {}
  }

  /** Hollow white cup drop & rattle when the ball lands cleanly inside. */
  public playCupDropClink(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [680, 1020, 880].forEach((freq, idx) => {
        const at = now + idx * 0.075;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, at);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.85, at + 0.11);
        g.gain.setValueAtTime(0.24 * Math.pow(0.7, idx) * this.volume, at);
        g.gain.exponentialRampToValueAtTime(0.0001, at + 0.14);
        osc.connect(g);
        this.routeOutput(g, dest);
        osc.start(at);
        osc.stop(at + 0.16);
      });
    } catch {}
  }

  /**
   * 30s Spy-Comedy Trickshot score in 7.5s sections.
   * Stops at 26.95s when the spotlight flickers off.
   */
  public playShadowTrickshotScoreSection(dest?: AudioNode, fromSec = 0, toSec = 30) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const beat = 60 / 134;
      const base = ctx.currentTime + 0.05 - fromSec;
      const LEVEL = 0.28;

      const tone = (freq: number, at: number, dur: number, type: OscillatorType, gain: number) => {
        if (at < ctx.currentTime - 0.05) return;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, at);
        g.gain.setValueAtTime(0.0001, at);
        g.gain.linearRampToValueAtTime(gain * LEVEL * this.volume, at + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        osc.connect(g);
        this.routeOutput(g, dest);
        osc.start(at);
        osc.stop(at + dur + 0.02);
      };

      const firstBeat = Math.max(0, Math.floor(fromSec / beat));
      const lastBeat = Math.ceil(toSec / beat);
      // Spy-comedy minor-to-bright motif
      const bass = [146.83, 146.83, 174.61, 196.0, 220.0, 196.0, 174.61, 164.81];
      const lead = [587.33, 659.25, 698.46, 880.0, 783.99, 698.46, 659.25, 523.25];
      const climax = [880.0, 1046.5, 1174.66, 1046.5, 987.77, 880.0, 783.99, 659.25];

      for (let b = firstBeat; b < lastBeat; b++) {
        const t = b * beat;
        const at = base + t;
        if (t >= 26.9) continue; // Cut dead when spotlight flickers off

        tone(bass[b % bass.length], at, beat * 0.48, 'triangle', 0.36);

        if (t >= 18.0 && t < 24.2) {
          // Tense rising setup pulse in Scene 4
          tone(climax[b % climax.length], at + beat * 0.5, beat * 0.26, 'square', 0.13);
        } else {
          tone(lead[b % lead.length], at + beat * 0.5, beat * 0.32, 'triangle', 0.28);
        }
      }
    } catch {}
  }

  /** Crystalline invisible glass wall bounce ping + soft thump. */
  public playInvisibleWallPing(dest?: AudioNode, pitch = 1.0) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Glass resonance shimmer
      [880 * pitch, 1320 * pitch].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.04, now + 0.16);
        g.gain.setValueAtTime(0.0001, now);
        g.gain.linearRampToValueAtTime((idx === 0 ? 0.24 : 0.12) * this.volume, now + 0.006);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
        osc.connect(g);
        this.routeOutput(g, dest);
        osc.start(now);
        osc.stop(now + 0.24);
      });

      // Rubber basketball impact thump
      const thud = ctx.createOscillator();
      const tg = ctx.createGain();
      thud.type = 'sine';
      thud.frequency.setValueAtTime(185, now);
      thud.frequency.exponentialRampToValueAtTime(68, now + 0.09);
      tg.gain.setValueAtTime(0.24 * this.volume, now);
      tg.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);
      thud.connect(tg);
      this.routeOutput(tg, dest);
      thud.start(now);
      thud.stop(now + 0.12);
    } catch {}
  }

  /** Heavy glass face-slam thump + crystalline wobble when Stickman runs into the wall. */
  public playGlassFaceSlam(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const body = ctx.createOscillator();
      const bg = ctx.createGain();
      body.type = 'triangle';
      body.frequency.setValueAtTime(150, now);
      body.frequency.exponentialRampToValueAtTime(42, now + 0.22);
      bg.gain.setValueAtTime(0.45 * this.volume, now);
      bg.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
      body.connect(bg);
      this.routeOutput(bg, dest);
      body.start(now);
      body.stop(now + 0.27);

      const glass = ctx.createOscillator();
      const gg = ctx.createGain();
      glass.type = 'sine';
      glass.frequency.setValueAtTime(620, now);
      glass.frequency.linearRampToValueAtTime(580, now + 0.18);
      gg.gain.setValueAtTime(0.2 * this.volume, now);
      gg.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
      glass.connect(gg);
      this.routeOutput(gg, dest);
      glass.start(now);
      glass.stop(now + 0.32);
    } catch {}
  }

  /** Rubber-on-glass descending squeak as Stickman slides down the invisible wall. */
  public playGlassSqueakSlide(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [0, 0.22, 0.44].forEach((offset, i) => {
        const at = now + offset;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1150 - i * 140, at);
        osc.frequency.linearRampToValueAtTime(920 - i * 130, at + 0.14);
        g.gain.setValueAtTime(0.0001, at);
        g.gain.linearRampToValueAtTime(0.11 * this.volume, at + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, at + 0.16);
        osc.connect(g);
        this.routeOutput(g, dest);
        osc.start(at);
        osc.stop(at + 0.18);
      });
    } catch {}
  }

  /**
   * 30s Pop Trickshot Challenge score in 7.5s sections.
   * Stops cleanly at 26.8s right before Stickman runs face-first into the invisible wall.
   */
  public playInvisibleWallScoreSection(dest?: AudioNode, fromSec = 0, toSec = 30) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const beat = 60 / 136;
      const base = ctx.currentTime + 0.05 - fromSec;
      const LEVEL = 0.28;

      const tone = (freq: number, at: number, dur: number, type: OscillatorType, gain: number) => {
        if (at < ctx.currentTime - 0.05) return;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, at);
        g.gain.setValueAtTime(0.0001, at);
        g.gain.linearRampToValueAtTime(gain * LEVEL * this.volume, at + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        osc.connect(g);
        this.routeOutput(g, dest);
        osc.start(at);
        osc.stop(at + dur + 0.02);
      };

      const firstBeat = Math.max(0, Math.floor(fromSec / beat));
      const lastBeat = Math.ceil(toSec / beat);
      const bass = [130.81, 130.81, 164.81, 196.0, 174.61, 196.0, 220.0, 196.0];
      const lead = [523.25, 659.25, 783.99, 659.25, 880.0, 783.99, 659.25, 587.33];
      const hype = [783.99, 987.77, 1046.5, 1174.66, 1318.51, 1174.66, 1046.5, 987.77];

      for (let b = firstBeat; b < lastBeat; b++) {
        const t = b * beat;
        const at = base + t;
        if (t >= 26.75) continue;

        tone(bass[b % bass.length], at, beat * 0.48, 'triangle', 0.36);

        if (t >= 18.0 && t < 25.0) {
          tone(hype[b % hype.length], at + beat * 0.5, beat * 0.28, 'square', 0.13);
        } else {
          tone(lead[b % lead.length], at + beat * 0.5, beat * 0.32, 'triangle', 0.3);
        }
      }
    } catch {}
  }

  /** Crisp toggle click + whirring desk fan motor spin-up. */
  public playFanSwitchClick(dest?: AudioNode, pitch = 1.0) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const click = ctx.createOscillator();
      const cg = ctx.createGain();
      click.type = 'square';
      click.frequency.setValueAtTime(1100 * pitch, now);
      click.frequency.exponentialRampToValueAtTime(340, now + 0.045);
      cg.gain.setValueAtTime(0.22 * this.volume, now);
      cg.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);
      click.connect(cg);
      this.routeOutput(cg, dest);
      click.start(now);
      click.stop(now + 0.06);

      const hum = ctx.createOscillator();
      const hg = ctx.createGain();
      hum.type = 'triangle';
      hum.frequency.setValueAtTime(95 * pitch, now + 0.03);
      hum.frequency.exponentialRampToValueAtTime(185 * pitch, now + 0.28);
      hg.gain.setValueAtTime(0.0001, now + 0.03);
      hg.gain.linearRampToValueAtTime(0.16 * this.volume, now + 0.12);
      hg.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);
      hum.connect(hg);
      this.routeOutput(hg, dest);
      hum.start(now + 0.03);
      hum.stop(now + 0.36);
    } catch {}
  }

  /** Snappy fan airflow swoosh as the ping-pong ball zips past a fan stream. */
  public playFanAirWhoosh(dest?: AudioNode, pitch = 1.0) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(240 * pitch, now);
      osc.frequency.exponentialRampToValueAtTime(560 * pitch, now + 0.12);
      osc.frequency.exponentialRampToValueAtTime(180 * pitch, now + 0.22);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(0.17 * this.volume, now + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
      osc.connect(g);
      this.routeOutput(g, dest);
      osc.start(now);
      osc.stop(now + 0.26);
    } catch {}
  }

  /** Roaring 10-fan synchronized wind gust blast launching Stickman backward. */
  public playGiantFanGust(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const dur = 1.15;
      const size = Math.floor(ctx.sampleRate * dur);
      const buf = ctx.createBuffer(1, size, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < size; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / (size * 1.1));
      }

      const src = ctx.createBufferSource();
      src.buffer = buf;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(220, now);
      filter.frequency.exponentialRampToValueAtTime(980, now + 0.35);
      filter.frequency.exponentialRampToValueAtTime(340, now + dur);
      filter.Q.setValueAtTime(1.1, now);

      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(0.55 * this.volume, now + 0.12);
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur);

      src.connect(filter);
      filter.connect(g);
      this.routeOutput(g, dest);
      src.start(now);
      src.stop(now + dur + 0.04);

      // Whistle overtone as his beanie takes off
      const w = ctx.createOscillator();
      const wg = ctx.createGain();
      w.type = 'sine';
      w.frequency.setValueAtTime(520, now + 0.12);
      w.frequency.exponentialRampToValueAtTime(1240, now + 0.48);
      w.frequency.exponentialRampToValueAtTime(420, now + 0.95);
      wg.gain.setValueAtTime(0.0001, now + 0.12);
      wg.gain.linearRampToValueAtTime(0.14 * this.volume, now + 0.22);
      wg.gain.exponentialRampToValueAtTime(0.0001, now + 0.98);
      w.connect(wg);
      this.routeOutput(wg, dest);
      w.start(now + 0.12);
      w.stop(now + 1.0);
    } catch {}
  }

  /**
   * 30s Pop Comedy score for The 10-Fan Impossible Trickshot in 7.5s sections.
   * Stops at 26.15s right as all 10 fans pivot toward Stickman.
   */
  public playTenFanScoreSection(dest?: AudioNode, fromSec = 0, toSec = 30) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const beat = 60 / 138;
      const base = ctx.currentTime + 0.05 - fromSec;
      const LEVEL = 0.27;

      const tone = (freq: number, at: number, dur: number, type: OscillatorType, gain: number) => {
        if (at < ctx.currentTime - 0.05) return;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, at);
        g.gain.setValueAtTime(0.0001, at);
        g.gain.linearRampToValueAtTime(gain * LEVEL * this.volume, at + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        osc.connect(g);
        this.routeOutput(g, dest);
        osc.start(at);
        osc.stop(at + dur + 0.02);
      };

      const firstBeat = Math.max(0, Math.floor(fromSec / beat));
      const lastBeat = Math.ceil(toSec / beat);
      const bass = [146.83, 146.83, 196.0, 220.0, 174.61, 196.0, 220.0, 164.81];
      const lead = [587.33, 739.99, 880.0, 739.99, 987.77, 880.0, 739.99, 659.25];
      const spiral = [880.0, 987.77, 1174.66, 1318.51, 1479.98, 1318.51, 1174.66, 987.77];

      for (let b = firstBeat; b < lastBeat; b++) {
        const t = b * beat;
        const at = base + t;
        if (t >= 26.15) continue;

        tone(bass[b % bass.length], at, beat * 0.46, 'triangle', 0.36);

        if (t >= 14.0 && t < 24.4) {
          tone(spiral[b % spiral.length], at + beat * 0.5, beat * 0.26, 'square', 0.12);
        } else {
          tone(lead[b % lead.length], at + beat * 0.5, beat * 0.32, 'triangle', 0.3);
        }
      }
    } catch {}
  }

  /**
   * Crisp wooden/plastic domino tip click with rising pitch cascade.
   */
  public playDominoClack(dest?: AudioNode, pitch = 1) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1180 * pitch, now);
      osc.frequency.exponentialRampToValueAtTime(420 * pitch, now + 0.045);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.28 * this.volume, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
      osc.connect(gain);
      this.routeOutput(gain, dest);
      osc.start(now);
      osc.stop(now + 0.07);
    } catch {}
  }

  /**
   * Satisfying red target button hit + hydraulic ceiling basketball hoop drop.
   */
  public playChainButtonSlam(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const bell = ctx.createOscillator();
      const bGain = ctx.createGain();
      bell.type = 'sine';
      bell.frequency.setValueAtTime(880, now);
      bell.frequency.setValueAtTime(1174.66, now + 0.07);
      bGain.gain.setValueAtTime(0.32 * this.volume, now);
      bGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.36);
      bell.connect(bGain);
      this.routeOutput(bGain, dest);
      bell.start(now);
      bell.stop(now + 0.38);

      const drop = ctx.createOscillator();
      const dGain = ctx.createGain();
      drop.type = 'sawtooth';
      drop.frequency.setValueAtTime(220, now + 0.08);
      drop.frequency.exponentialRampToValueAtTime(75, now + 0.56);
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(750, now + 0.08);
      dGain.gain.setValueAtTime(0.22 * this.volume, now + 0.08);
      dGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
      drop.connect(filter);
      filter.connect(dGain);
      this.routeOutput(dGain, dest);
      drop.start(now + 0.08);
      drop.stop(now + 0.62);
    } catch {}
  }

  /**
   * Roaring 100-ball avalanche clatter as the remaining balls spill and bury Stickman.
   */
  public playBallAvalancheRumble(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const dur = 1.35;
      const bufSize = Math.floor(ctx.sampleRate * dur);
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        const rattle = Math.sin(i * 0.065) * 0.4 + (((i * 1103515245) % 103) / 103 - 0.5) * 0.8;
        data[i] = rattle * Math.sin((i / bufSize) * Math.PI);
      }

      const src = ctx.createBufferSource();
      src.buffer = buf;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(480, now);
      filter.frequency.exponentialRampToValueAtTime(980, now + 0.65);
      filter.frequency.exponentialRampToValueAtTime(260, now + dur);
      filter.Q.setValueAtTime(1.1, now);

      const g = ctx.createGain();
      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(0.5 * this.volume, now + 0.14);
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur);

      src.connect(filter);
      filter.connect(g);
      this.routeOutput(g, dest);
      src.start(now);
      src.stop(now + dur + 0.04);

      // Bouncing plastic ball pop cascade
      for (let k = 0; k < 10; k++) {
        const at = now + 0.08 + k * 0.095;
        const osc = ctx.createOscillator();
        const og = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320 + ((k * 137) % 420), at);
        osc.frequency.exponentialRampToValueAtTime(180, at + 0.07);
        og.gain.setValueAtTime(0.18 * this.volume, at);
        og.gain.exponentialRampToValueAtTime(0.0001, at + 0.08);
        osc.connect(og);
        this.routeOutput(og, dest);
        osc.start(at);
        osc.stop(at + 0.09);
      }
    } catch {}
  }

  /**
   * 30s Rube-Goldberg Pop Comedy score for "The 100-Ball Chain Reaction",
   * sliced into 4 x 7.5s sections with a hush for the 100-ball bury reveal.
   */
  public playHundredBallScoreSection(dest?: AudioNode, fromSec = 0, toSec = 30) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const beat = 60 / 140;
      const base = ctx.currentTime + 0.05 - fromSec;
      const LEVEL = 0.27;

      const tone = (freq: number, at: number, dur: number, type: OscillatorType, gain: number) => {
        if (at < ctx.currentTime - 0.05) return;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, at);
        g.gain.setValueAtTime(0.0001, at);
        g.gain.linearRampToValueAtTime(gain * LEVEL * this.volume, at + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        osc.connect(g);
        this.routeOutput(g, dest);
        osc.start(at);
        osc.stop(at + dur + 0.02);
      };

      const firstBeat = Math.max(0, Math.floor(fromSec / beat));
      const lastBeat = Math.ceil(toSec / beat);
      const bass = [130.81, 164.81, 196.0, 220.0, 174.61, 196.0, 146.83, 196.0];
      const lead = [523.25, 659.25, 783.99, 1046.5, 880.0, 783.99, 659.25, 587.33];
      const chaosLead = [783.99, 987.77, 1174.66, 1318.51, 1174.66, 987.77, 880.0, 783.99];

      for (let b = firstBeat; b < lastBeat; b++) {
        const t = b * beat;
        const at = base + t;
        if (t >= 26.9) continue;

        tone(bass[b % bass.length], at, beat * 0.48, 'triangle', 0.36);

        if (t >= 12.0 && t < 24.3) {
          tone(chaosLead[b % chaosLead.length], at + beat * 0.5, beat * 0.25, 'square', 0.12);
        } else {
          tone(lead[b % lead.length], at + beat * 0.5, beat * 0.32, 'triangle', 0.31);
        }
      }
    } catch {}
  }

  /**
   * Springy plastic ruler flick twang! Used for small flicks, giant ruler pullout,
   * and the final ruler catapulting Stickman into the basketball hoop.
   */
  public playRulerFlick(dest?: AudioNode, pitch = 1) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160 * pitch, now);
      osc.frequency.exponentialRampToValueAtTime(340 * pitch, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(125 * pitch, now + 0.36);

      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(34, now);
      lfoGain.gain.setValueAtTime(42 * pitch, now);
      lfoGain.gain.exponentialRampToValueAtTime(2, now + 0.36);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1500, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.32 * this.volume, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);

      osc.connect(filter);
      filter.connect(gain);
      this.routeOutput(gain, dest);

      lfo.start(now);
      osc.start(now);
      lfo.stop(now + 0.4);
      osc.stop(now + 0.4);
    } catch {}
  }

  /**
   * 30s upbeat Trickshot Adventure score for "The World's Longest Ruler Shot",
   * sliced into 4 x 7.5s sections with a comedic silence right as Stickman lands in the hoop.
   */
  public playLongestRulerScoreSection(dest?: AudioNode, fromSec = 0, toSec = 30) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const beat = 60 / 138;
      const base = ctx.currentTime + 0.05 - fromSec;
      const LEVEL = 0.27;

      const tone = (freq: number, at: number, dur: number, type: OscillatorType, gain: number) => {
        if (at < ctx.currentTime - 0.05) return;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, at);
        g.gain.setValueAtTime(0.0001, at);
        g.gain.linearRampToValueAtTime(gain * LEVEL * this.volume, at + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        osc.connect(g);
        this.routeOutput(g, dest);
        osc.start(at);
        osc.stop(at + dur + 0.02);
      };

      const firstBeat = Math.max(0, Math.floor(fromSec / beat));
      const lastBeat = Math.ceil(toSec / beat);
      const bass = [146.83, 174.61, 196.0, 220.0, 146.83, 164.81, 196.0, 246.94];
      const lead = [587.33, 739.99, 880.0, 987.77, 880.0, 739.99, 659.25, 587.33];
      const sprint = [880.0, 1046.5, 1174.66, 1318.51, 1174.66, 1046.5, 987.77, 880.0];

      for (let b = firstBeat; b < lastBeat; b++) {
        const t = b * beat;
        const at = base + t;
        if (t >= 26.85) continue;

        tone(bass[b % bass.length], at, beat * 0.46, 'triangle', 0.36);

        if (t >= 12.0 && t < 24.4) {
          tone(sprint[b % sprint.length], at + beat * 0.5, beat * 0.26, 'square', 0.12);
        } else {
          tone(lead[b % lead.length], at + beat * 0.5, beat * 0.32, 'triangle', 0.31);
        }
      }
    } catch {}
  }

  /**
   * Metallic giant slinky stretch/recoil resonance (chirpy harmonic spring boing + coil shimmer).
   */
  public playSlinkyTwang(dest?: AudioNode, pitch = 1.0) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Primary metallic coil sweep
      const osc = ctx.createOscillator();
      const mod = ctx.createOscillator();
      const modGain = ctx.createGain();
      const g = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(190 * pitch, now);
      osc.frequency.exponentialRampToValueAtTime(520 * pitch, now + 0.14);
      osc.frequency.exponentialRampToValueAtTime(280 * pitch, now + 0.42);

      mod.type = 'sine';
      mod.frequency.setValueAtTime(32 * pitch, now);
      modGain.gain.setValueAtTime(75 * pitch, now);
      modGain.gain.exponentialRampToValueAtTime(8, now + 0.44);

      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(0.32 * this.volume, now + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0008, now + 0.48);

      mod.connect(modGain);
      modGain.connect(osc.frequency);
      osc.connect(g);
      this.routeOutput(g, dest);

      osc.start(now);
      mod.start(now);
      osc.stop(now + 0.5);
      mod.stop(now + 0.5);

      // Crisp metallic laser-like slinky overtone chirp
      const hi = ctx.createOscillator();
      const hg = ctx.createGain();
      hi.type = 'sine';
      hi.frequency.setValueAtTime(1650 * pitch, now);
      hi.frequency.exponentialRampToValueAtTime(420 * pitch, now + 0.24);
      hg.gain.setValueAtTime(0.11 * this.volume, now);
      hg.gain.exponentialRampToValueAtTime(0.0005, now + 0.26);
      hi.connect(hg);
      this.routeOutput(hg, dest);
      hi.start(now);
      hi.stop(now + 0.28);
    } catch {}
  }

  /**
   * 30s energetic Modern Pop comedy score for "THE GIANT SLINKY TRICKSHOT",
   * sliced into 4 x 7.5s sections and dropping silent at 26.0s for the spring-cage revenge!
   */
  public playGiantSlinkyScoreSection(dest?: AudioNode, fromSec = 0, toSec = 30) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const beat = 60 / 138;
      const base = ctx.currentTime + 0.05 - fromSec;
      const LEVEL = 0.27;

      const tone = (freq: number, at: number, dur: number, type: OscillatorType, gain: number) => {
        if (at < ctx.currentTime - 0.05) return;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, at);
        g.gain.setValueAtTime(0.0001, at);
        g.gain.linearRampToValueAtTime(gain * LEVEL * this.volume, at + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        osc.connect(g);
        this.routeOutput(g, dest);
        osc.start(at);
        osc.stop(at + dur + 0.02);
      };

      const firstBeat = Math.max(0, Math.floor(fromSec / beat));
      const lastBeat = Math.ceil(toSec / beat);
      const bass = [130.81, 164.81, 196.0, 146.83, 130.81, 174.61, 196.0, 220.0];
      const motif = [523.25, 659.25, 783.99, 659.25, 880.0, 783.99, 659.25, 587.33];
      const launch = [783.99, 987.77, 1046.5, 1174.66, 1318.51, 1174.66, 1046.5, 987.77];

      for (let b = firstBeat; b < lastBeat; b++) {
        const t = b * beat;
        const at = base + t;
        // Cut dead right when the giant slinky snaps loose to cage Stickman
        if (t >= 26.0) continue;

        tone(bass[b % bass.length], at, beat * 0.45, 'triangle', 0.36);
        if (t >= 17.8 && t < 24.2) {
          tone(launch[b % launch.length], at + beat * 0.5, beat * 0.25, 'square', 0.13);
        } else {
          tone(motif[b % motif.length], at + beat * 0.5, beat * 0.32, 'triangle', 0.31);
        }
      }
    } catch {}
  }

  /**
   * Heavy wooden door swing & slam impact for "THE IMPOSSIBLE KEYHOLE SHOT".
   */
  public playDoorSlam(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(145, now);
      osc.frequency.exponentialRampToValueAtTime(38, now + 0.26);
      g.gain.setValueAtTime(0.45 * this.volume, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.connect(g);
      this.routeOutput(g, dest);
      osc.start(now);
      osc.stop(now + 0.3);

      // Door wood slap noise burst
      const len = Math.floor(ctx.sampleRate * 0.16);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.03));
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const filt = ctx.createBiquadFilter();
      filt.type = 'lowpass';
      filt.frequency.setValueAtTime(950, now);
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0.42 * this.volume, now);
      ng.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      src.connect(filt);
      filt.connect(ng);
      this.routeOutput(ng, dest);
      src.start(now);
    } catch {}
  }

  /**
   * 30s mischievous trickshot score for "THE IMPOSSIBLE KEYHOLE SHOT",
   * sliced into 4 x 7.5s sections and dropping silent at 26.05s for the door slam twist.
   */
  public playKeyholeScoreSection(dest?: AudioNode, fromSec = 0, toSec = 30) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const beat = 60 / 134;
      const base = ctx.currentTime + 0.05 - fromSec;
      const LEVEL = 0.27;

      const tone = (freq: number, at: number, dur: number, type: OscillatorType, gain: number) => {
        if (at < ctx.currentTime - 0.05) return;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, at);
        g.gain.setValueAtTime(0.0001, at);
        g.gain.linearRampToValueAtTime(gain * LEVEL * this.volume, at + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        osc.connect(g);
        this.routeOutput(g, dest);
        osc.start(at);
        osc.stop(at + dur + 0.02);
      };

      const firstBeat = Math.max(0, Math.floor(fromSec / beat));
      const lastBeat = Math.ceil(toSec / beat);
      const bass = [110.0, 130.81, 146.83, 164.81, 110.0, 123.47, 146.83, 196.0];
      const motif = [440.0, 523.25, 659.25, 587.33, 523.25, 659.25, 783.99, 659.25];
      const climb = [659.25, 783.99, 880.0, 987.77, 1046.5, 987.77, 880.0, 783.99];

      for (let b = firstBeat; b < lastBeat; b++) {
        const t = b * beat;
        const at = base + t;
        if (t >= 26.05) continue;

        tone(bass[b % bass.length], at, beat * 0.45, 'triangle', 0.36);
        if (t >= 18.0 && t < 24.3) {
          tone(climb[b % climb.length], at + beat * 0.5, beat * 0.25, 'square', 0.13);
        } else {
          tone(motif[b % motif.length], at + beat * 0.5, beat * 0.32, 'triangle', 0.3);
        }
      }
    } catch {}
  }

  /**
   * Sci-fi red laser barrier deflect zap.
   */
  public playLaserZap(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1180, now);
      osc.frequency.exponentialRampToValueAtTime(210, now + 0.22);
      g.gain.setValueAtTime(0.24 * this.volume, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
      osc.connect(g);
      this.routeOutput(g, dest);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch {}
  }

  /**
   * Vault security laser-cage activation alarm hum & snap.
   */
  public playLaserCageAlarm(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [660, 880, 660, 988];
      notes.forEach((f, idx) => {
        const at = now + idx * 0.09;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(f, at);
        g.gain.setValueAtTime(0.16 * this.volume, at);
        g.gain.exponentialRampToValueAtTime(0.001, at + 0.085);
        osc.connect(g);
        this.routeOutput(g, dest);
        osc.start(at);
        osc.stop(at + 0.09);
      });
    } catch {}
  }

  /**
   * 30s spy-heist synth score for "THE IMPOSSIBLE LASER MAZE",
   * sliced into 4 x 7.5s sections and cutting silent at 26.15s for the laser-cage trap!
   */
  public playLaserMazeScoreSection(dest?: AudioNode, fromSec = 0, toSec = 30) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const beat = 60 / 136;
      const base = ctx.currentTime + 0.05 - fromSec;
      const LEVEL = 0.27;

      const tone = (freq: number, at: number, dur: number, type: OscillatorType, gain: number) => {
        if (at < ctx.currentTime - 0.05) return;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, at);
        g.gain.setValueAtTime(0.0001, at);
        g.gain.linearRampToValueAtTime(gain * LEVEL * this.volume, at + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        osc.connect(g);
        this.routeOutput(g, dest);
        osc.start(at);
        osc.stop(at + dur + 0.02);
      };

      const firstBeat = Math.max(0, Math.floor(fromSec / beat));
      const lastBeat = Math.ceil(toSec / beat);
      const bass = [98.0, 98.0, 116.54, 130.81, 98.0, 110.0, 123.47, 146.83];
      const spy = [392.0, 466.16, 523.25, 587.33, 622.25, 587.33, 523.25, 466.16];
      const tense = [783.99, 932.33, 1046.5, 932.33, 880.0, 783.99, 932.33, 1174.66];

      for (let b = firstBeat; b < lastBeat; b++) {
        const t = b * beat;
        const at = base + t;
        if (t >= 26.15) continue;

        tone(bass[b % bass.length], at, beat * 0.44, 'sawtooth', 0.24);
        if (t >= 18.0 && t < 24.3) {
          tone(tense[b % tense.length], at + beat * 0.5, beat * 0.24, 'square', 0.12);
        } else {
          tone(spy[b % spy.length], at + beat * 0.5, beat * 0.3, 'triangle', 0.3);
        }
      }
    } catch {}
  }

  /**
   * Pinball spring plunger recoil & ball launch twang.
   */
  public playPinballPlunger(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(640, now + 0.14);
      osc.frequency.exponentialRampToValueAtTime(280, now + 0.28);
      g.gain.setValueAtTime(0.28 * this.volume, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(g);
      this.routeOutput(g, dest);
      osc.start(now);
      osc.stop(now + 0.31);
    } catch {}
  }

  /**
   * Classic arcade pinball solenoid bumper chime + thump.
   */
  public playPinballBumper(dest?: AudioNode, pitch = 1.0) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const bell = ctx.createOscillator();
      const g = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(340 * pitch, now);
      osc.frequency.exponentialRampToValueAtTime(140 * pitch, now + 0.08);

      bell.type = 'sine';
      bell.frequency.setValueAtTime(1046.5 * pitch, now);
      bell.frequency.setValueAtTime(1318.5 * pitch, now + 0.035);

      g.gain.setValueAtTime(0.24 * this.volume, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.19);

      osc.connect(g);
      bell.connect(g);
      this.routeOutput(g, dest);

      osc.start(now);
      bell.start(now);
      osc.stop(now + 0.2);
      bell.stop(now + 0.2);
    } catch {}
  }

  /**
   * Punchy mechanical yellow flipper solenoid snap.
   */
  public playPinballFlipper(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(860, now + 0.07);
      g.gain.setValueAtTime(0.26 * this.volume, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
      osc.connect(g);
      this.routeOutput(g, dest);
      osc.start(now);
      osc.stop(now + 0.14);
    } catch {}
  }

  /**
   * Bright arcade WIN jackpot arpeggio.
   */
  public playPinballJackpot(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98];
      notes.forEach((f, idx) => {
        const at = now + idx * 0.075;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, at);
        g.gain.setValueAtTime(0.22 * this.volume, at);
        g.gain.exponentialRampToValueAtTime(0.001, at + 0.28);
        osc.connect(g);
        this.routeOutput(g, dest);
        osc.start(at);
        osc.stop(at + 0.3);
      });
    } catch {}
  }

  /**
   * 30s energetic 142 BPM arcade pinball score for "THE IMPOSSIBLE PINBALL TRICKSHOT",
   * sliced into 4 x 7.5s sections and cutting silent at 25.75s right before Stickman gets launched!
   */
  public playPinballScoreSection(dest?: AudioNode, fromSec = 0, toSec = 30) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const beat = 60 / 142;
      const base = ctx.currentTime + 0.05 - fromSec;
      const LEVEL = 0.26;

      const tone = (freq: number, at: number, dur: number, type: OscillatorType, gain: number) => {
        if (at < ctx.currentTime - 0.05) return;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, at);
        g.gain.setValueAtTime(0.0001, at);
        g.gain.linearRampToValueAtTime(gain * LEVEL * this.volume, at + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        osc.connect(g);
        this.routeOutput(g, dest);
        osc.start(at);
        osc.stop(at + dur + 0.02);
      };

      const firstBeat = Math.max(0, Math.floor(fromSec / beat));
      const lastBeat = Math.ceil(toSec / beat);
      const bass = [130.81, 130.81, 164.81, 196.0, 146.83, 146.83, 174.61, 196.0];
      const arcade = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880.0, 783.99];
      const turbo = [783.99, 987.77, 1046.5, 1174.66, 1318.51, 1174.66, 1046.5, 987.77];

      for (let b = firstBeat; b < lastBeat; b++) {
        const t = b * beat;
        const at = base + t;
        if (t >= 25.75) continue;

        tone(bass[b % bass.length], at, beat * 0.42, 'square', 0.16);
        if (t >= 12.4 && t < 24.15) {
          tone(turbo[b % turbo.length], at + beat * 0.5, beat * 0.25, 'triangle', 0.28);
        } else {
          tone(arcade[b % arcade.length], at + beat * 0.5, beat * 0.3, 'triangle', 0.26);
        }
      }
    } catch {}
  }

  /**
   * Cartoon steam hiss / ice-melt sizzle (filtered white noise + soft shimmer).
   */
  public playHeatSizzle(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const dur = 0.42;
      const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        // Deterministic pseudo-noise waveform for sizzle texture
        const s = Math.sin(i * 12.9898) * 43758.5453;
        data[i] = ((s - Math.floor(s)) * 2 - 1) * 0.7;
      }

      const src = ctx.createBufferSource();
      src.buffer = buf;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2800, now);
      filter.frequency.exponentialRampToValueAtTime(1400, now + dur);
      filter.Q.value = 1.8;

      const g = ctx.createGain();
      g.gain.setValueAtTime(0.01, now);
      g.gain.linearRampToValueAtTime(0.24 * this.volume, now + 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, now + dur);

      src.connect(filter);
      filter.connect(g);
      this.routeOutput(g, dest);

      src.start(now);
      src.stop(now + dur + 0.02);
    } catch {}
  }

  /**
   * Red-hot golden cup pressure pop & upward rocket launch.
   */
  public playHotCupLaunch(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(1120, now + 0.24);
      g.gain.setValueAtTime(0.28 * this.volume, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
      osc.connect(g);
      this.routeOutput(g, dest);
      osc.start(now);
      osc.stop(now + 0.28);
    } catch {}
  }

  /**
   * 30s energetic 138 BPM pop-science score for "THE 1,000-DEGREE HOT SHOT",
   * sliced into 4 x 7.5s sections and cutting silent at 25.85s when the cup overheats!
   */
  public playHotShotScoreSection(dest?: AudioNode, fromSec = 0, toSec = 30) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const beat = 60 / 138;
      const base = ctx.currentTime + 0.05 - fromSec;
      const LEVEL = 0.26;

      const tone = (freq: number, at: number, dur: number, type: OscillatorType, gain: number) => {
        if (at < ctx.currentTime - 0.05) return;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, at);
        g.gain.setValueAtTime(0.0001, at);
        g.gain.linearRampToValueAtTime(gain * LEVEL * this.volume, at + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        osc.connect(g);
        this.routeOutput(g, dest);
        osc.start(at);
        osc.stop(at + dur + 0.02);
      };

      const firstBeat = Math.max(0, Math.floor(fromSec / beat));
      const lastBeat = Math.ceil(toSec / beat);
      const bass = [110.0, 110.0, 130.81, 146.83, 164.81, 146.83, 130.81, 123.47];
      const lead = [440.0, 523.25, 659.25, 587.33, 523.25, 659.25, 783.99, 659.25];
      const heat = [880.0, 987.77, 1046.5, 987.77, 880.0, 1046.5, 1174.66, 1318.51];

      for (let b = firstBeat; b < lastBeat; b++) {
        const t = b * beat;
        const at = base + t;
        if (t >= 25.85) continue;

        tone(bass[b % bass.length], at, beat * 0.44, 'sawtooth', 0.18);
        if (t >= 12.0 && t < 24.15) {
          tone(heat[b % heat.length], at + beat * 0.5, beat * 0.24, 'triangle', 0.27);
        } else {
          tone(lead[b % lead.length], at + beat * 0.5, beat * 0.3, 'triangle', 0.26);
        }
      }
    } catch {}
  }

  /**
   * Cartoon electromagnetic hum + attraction shimmer for The Magnetic Maze Trickshot.
   */
  public playMagnetHum(dest?: AudioNode, pitch = 1.0) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160 * pitch, now);
      osc.frequency.exponentialRampToValueAtTime(340 * pitch, now + 0.28);

      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(28, now);
      lfoGain.gain.setValueAtTime(18 * pitch, now);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.24 * this.volume, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);

      osc.connect(gain);
      this.routeOutput(gain, dest);
      osc.start(now);
      lfo.start(now);
      osc.stop(now + 0.36);
      lfo.stop(now + 0.36);
    } catch {}
  }

  /**
   * Metallic snap / clank when the silver ball sticks to a magnet or metal chair hits Stickman.
   */
  public playMetalClank(dest?: AudioNode, pitch = 1.0) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const partials = [520 * pitch, 980 * pitch, 1560 * pitch];
      partials.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = i === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.92, now + 0.16);
        g.gain.setValueAtTime((0.22 / (i + 1)) * this.volume, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + (0.22 - i * 0.04));
        osc.connect(g);
        this.routeOutput(g, dest);
        osc.start(now);
        osc.stop(now + 0.24);
      });
    } catch {}
  }

  /**
   * All-magnets overload surge when every magnet activates at once in Scene 5.
   */
  public playMagnetOverload(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const g = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(840, now + 0.48);

      osc2.type = 'square';
      osc2.frequency.setValueAtTime(180, now);
      osc2.frequency.exponentialRampToValueAtTime(1120, now + 0.48);

      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(0.26 * this.volume, now + 0.06);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.54);

      osc.connect(g);
      osc2.connect(g);
      this.routeOutput(g, dest);
      osc.start(now);
      osc2.start(now);
      osc.stop(now + 0.56);
      osc2.stop(now + 0.56);
    } catch {}
  }

  /**
   * 30s playful 136 BPM sci-fi comedy score for "THE MAGNETIC MAZE TRICKSHOT",
   * sliced into 4 x 7.5s sections and cutting silent at 25.75s for the all-magnets twist!
   */
  public playMagneticMazeScoreSection(dest?: AudioNode, fromSec = 0, toSec = 30) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const beat = 60 / 136;
      const base = ctx.currentTime + 0.05 - fromSec;
      const LEVEL = 0.26;

      const tone = (freq: number, at: number, dur: number, type: OscillatorType, gain: number) => {
        if (at < ctx.currentTime - 0.05) return;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, at);
        g.gain.setValueAtTime(0.0001, at);
        g.gain.linearRampToValueAtTime(gain * LEVEL * this.volume, at + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        osc.connect(g);
        this.routeOutput(g, dest);
        osc.start(at);
        osc.stop(at + dur + 0.02);
      };

      const firstBeat = Math.max(0, Math.floor(fromSec / beat));
      const lastBeat = Math.ceil(toSec / beat);
      const bass = [130.81, 130.81, 146.83, 164.81, 196.0, 164.81, 146.83, 123.47];
      const lead = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880.0, 783.99];
      const climb = [659.25, 783.99, 880.0, 987.77, 1046.5, 987.77, 880.0, 1174.66];

      for (let b = firstBeat; b < lastBeat; b++) {
        const t = b * beat;
        const at = base + t;
        if (t >= 25.75) continue;

        tone(bass[b % bass.length], at, beat * 0.42, 'triangle', 0.22);
        if (t >= 12.2 && t < 24.15) {
          tone(climb[b % climb.length], at + beat * 0.5, beat * 0.24, 'sine', 0.26);
        } else {
          tone(lead[b % lead.length], at + beat * 0.5, beat * 0.28, 'triangle', 0.24);
        }
      }
    } catch {}
  }

  /**
   * Crisp wooden/steel step bounce tick for The Impossible Spiral Staircase Shot.
   */
  public playSpiralRollTick(dest?: AudioNode, pitch = 1.0) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(340 * pitch, now);
      osc.frequency.exponentialRampToValueAtTime(160 * pitch, now + 0.07);
      g.gain.setValueAtTime(0.22 * this.volume, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
      osc.connect(g);
      this.routeOutput(g, dest);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch {}
  }

  /**
   * Mechanical carousel motor spin-up whir when the spiral staircase starts rotating in Scene 5.
   */
  public playCarouselMotorSpin(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const g = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(620, now + 0.75);

      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(18, now);
      lfoGain.gain.setValueAtTime(22, now);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(0.24 * this.volume, now + 0.08);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);

      osc.connect(g);
      this.routeOutput(g, dest);
      osc.start(now);
      lfo.start(now);
      osc.stop(now + 0.88);
      lfo.stop(now + 0.88);
    } catch {}
  }

  /**
   * 30s energetic 138 BPM pop-arcade score for "THE IMPOSSIBLE SPIRAL STAIRCASE SHOT",
   * sliced into 4 x 7.5s sections and cutting silent at 25.80s for the carousel twist!
   */
  public playSpiralStaircaseScoreSection(dest?: AudioNode, fromSec = 0, toSec = 30) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const beat = 60 / 138;
      const base = ctx.currentTime + 0.05 - fromSec;
      const LEVEL = 0.26;

      const tone = (freq: number, at: number, dur: number, type: OscillatorType, gain: number) => {
        if (at < ctx.currentTime - 0.05) return;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, at);
        g.gain.setValueAtTime(0.0001, at);
        g.gain.linearRampToValueAtTime(gain * LEVEL * this.volume, at + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        osc.connect(g);
        this.routeOutput(g, dest);
        osc.start(at);
        osc.stop(at + dur + 0.02);
      };

      const firstBeat = Math.max(0, Math.floor(fromSec / beat));
      const lastBeat = Math.ceil(toSec / beat);
      const bass = [146.83, 146.83, 164.81, 174.61, 196.0, 174.61, 164.81, 130.81];
      const lead = [587.33, 659.25, 783.99, 880.0, 783.99, 659.25, 587.33, 523.25];
      const spiral = [587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1046.5, 880.0];

      for (let b = firstBeat; b < lastBeat; b++) {
        const t = b * beat;
        const at = base + t;
        if (t >= 25.8) continue;

        tone(bass[b % bass.length], at, beat * 0.42, 'triangle', 0.22);
        if (t >= 12.0 && t < 24.15) {
          tone(spiral[b % spiral.length], at + beat * 0.5, beat * 0.25, 'triangle', 0.27);
        } else {
          tone(lead[b % lead.length], at + beat * 0.5, beat * 0.28, 'sine', 0.25);
        }
      }
    } catch {}
  }

  /**
   * Metallic double-blade scissor snip for The Giant Scissor Trickshot.
   */
  public playScissorSnip(dest?: AudioNode, pitch = 1.0) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Sharp steel blade scrape + crisp metallic snap
      const blade = ctx.createOscillator();
      const bladeG = ctx.createGain();
      blade.type = 'sawtooth';
      blade.frequency.setValueAtTime(1450 * pitch, now);
      blade.frequency.exponentialRampToValueAtTime(2800 * pitch, now + 0.05);
      blade.frequency.exponentialRampToValueAtTime(620 * pitch, now + 0.11);
      bladeG.gain.setValueAtTime(0.001, now);
      bladeG.gain.linearRampToValueAtTime(0.24 * this.volume, now + 0.015);
      bladeG.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
      blade.connect(bladeG);
      this.routeOutput(bladeG, dest);
      blade.start(now);
      blade.stop(now + 0.13);

      const click = ctx.createOscillator();
      const clickG = ctx.createGain();
      click.type = 'triangle';
      click.frequency.setValueAtTime(3400 * pitch, now + 0.045);
      click.frequency.exponentialRampToValueAtTime(980 * pitch, now + 0.09);
      clickG.gain.setValueAtTime(0.28 * this.volume, now + 0.045);
      clickG.gain.exponentialRampToValueAtTime(0.0001, now + 0.10);
      click.connect(clickG);
      this.routeOutput(clickG, dest);
      click.start(now + 0.045);
      click.stop(now + 0.11);
    } catch {}
  }

  /**
   * Taut string recoil twang & snap for The Giant Scissor Trickshot twist.
   */
  public playStringSnap(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.exponentialRampToValueAtTime(1260, now + 0.05);
      osc.frequency.exponentialRampToValueAtTime(190, now + 0.24);
      g.gain.setValueAtTime(0.26 * this.volume, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.26);
      osc.connect(g);
      this.routeOutput(g, dest);
      osc.start(now);
      osc.stop(now + 0.27);
    } catch {}
  }

  /**
   * 30s energetic 136 BPM trickshot comedy score for "THE GIANT SCISSOR TRICKSHOT",
   * sliced into 4 x 7.5s sections and cutting silent at 25.80s for the beanie-snip twist!
   */
  public playGiantScissorScoreSection(dest?: AudioNode, fromSec = 0, toSec = 30) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const beat = 60 / 136;
      const base = ctx.currentTime + 0.05 - fromSec;
      const LEVEL = 0.25;

      const tone = (freq: number, at: number, dur: number, type: OscillatorType, gain: number) => {
        if (at < ctx.currentTime - 0.05) return;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, at);
        g.gain.setValueAtTime(0.0001, at);
        g.gain.linearRampToValueAtTime(gain * LEVEL * this.volume, at + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        osc.connect(g);
        this.routeOutput(g, dest);
        osc.start(at);
        osc.stop(at + dur + 0.02);
      };

      const firstBeat = Math.max(0, Math.floor(fromSec / beat));
      const lastBeat = Math.ceil(toSec / beat);
      const bass = [130.81, 130.81, 164.81, 196.0, 174.61, 164.81, 146.83, 196.0];
      const lead = [523.25, 659.25, 783.99, 880.0, 783.99, 659.25, 587.33, 659.25];
      const chain = [659.25, 783.99, 880.0, 1046.5, 987.77, 880.0, 783.99, 659.25];

      for (let b = firstBeat; b < lastBeat; b++) {
        const t = b * beat;
        const at = base + t;
        if (t >= 25.8) continue;

        tone(bass[b % bass.length], at, beat * 0.42, 'triangle', 0.22);
        if (t >= 12.2 && t < 24.15) {
          tone(chain[b % chain.length], at + beat * 0.5, beat * 0.24, 'triangle', 0.27);
        } else {
          tone(lead[b % lead.length], at + beat * 0.5, beat * 0.28, 'sine', 0.24);
        }
      }
    } catch {}
  }

  /**
   * Shimmering sci-fi gravity field hum when the ball enters Blue/Purple/Green zones.
   */
  public playGravityHum(dest?: AudioNode, pitch = 1.0) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoG = ctx.createGain();
      const g = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220 * pitch, now);
      osc.frequency.exponentialRampToValueAtTime(340 * pitch, now + 0.26);

      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(16, now);
      lfoG.gain.setValueAtTime(18 * pitch, now);
      lfo.connect(lfoG);
      lfoG.connect(osc.frequency);

      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(0.24 * this.volume, now + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.30);

      osc.connect(g);
      this.routeOutput(g, dest);
      osc.start(now);
      lfo.start(now);
      osc.stop(now + 0.32);
      lfo.stop(now + 0.32);
    } catch {}
  }

  /**
   * All-3-gravity-zones simultaneous overload surge for Scene 5 twist.
   */
  public playTripleGravityOverload(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const freqs = [150, 225, 300];
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = idx === 1 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(f, now);
        osc.frequency.exponentialRampToValueAtTime(f * 2.4, now + 0.65);
        g.gain.setValueAtTime(0.001, now);
        g.gain.linearRampToValueAtTime(0.14 * this.volume, now + 0.06);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.72);
        osc.connect(g);
        this.routeOutput(g, dest);
        osc.start(now);
        osc.stop(now + 0.75);
      });
    } catch {}
  }

  /**
   * 30s upbeat 136 BPM sci-fi comedy score for "THE TRIPLE GRAVITY TRICKSHOT",
   * sliced into 4 x 7.5s sections and cutting silent at 25.80s for the ceiling-stick twist!
   */
  public playTripleGravityScoreSection(dest?: AudioNode, fromSec = 0, toSec = 30) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const beat = 60 / 136;
      const base = ctx.currentTime + 0.05 - fromSec;
      const LEVEL = 0.25;

      const tone = (freq: number, at: number, dur: number, type: OscillatorType, gain: number) => {
        if (at < ctx.currentTime - 0.05) return;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, at);
        g.gain.setValueAtTime(0.0001, at);
        g.gain.linearRampToValueAtTime(gain * LEVEL * this.volume, at + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        osc.connect(g);
        this.routeOutput(g, dest);
        osc.start(at);
        osc.stop(at + dur + 0.02);
      };

      const firstBeat = Math.max(0, Math.floor(fromSec / beat));
      const lastBeat = Math.ceil(toSec / beat);
      const bass = [146.83, 146.83, 174.61, 196.0, 220.0, 196.0, 174.61, 164.81];
      const lead = [587.33, 698.46, 880.0, 783.99, 698.46, 659.25, 587.33, 523.25];
      const climb = [587.33, 783.99, 880.0, 1046.5, 1174.66, 1046.5, 880.0, 783.99];

      for (let b = firstBeat; b < lastBeat; b++) {
        const t = b * beat;
        const at = base + t;
        if (t >= 25.8) continue;

        tone(bass[b % bass.length], at, beat * 0.42, 'triangle', 0.22);
        if (t >= 12.2 && t < 24.15) {
          tone(climb[b % climb.length], at + beat * 0.5, beat * 0.24, 'sine', 0.27);
        } else {
          tone(lead[b % lead.length], at + beat * 0.5, beat * 0.28, 'triangle', 0.24);
        }
      }
    } catch {}
  }

  /**
   * Hollow pneumatic suction pop when the ping-pong ball enters a transparent tube.
   */
  public playTubeEnterPop(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(680, now + 0.09);
      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(0.32 * this.volume, now + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
      osc.connect(g);
      this.routeOutput(g, dest);
      osc.start(now);
      osc.stop(now + 0.14);
    } catch {}
  }

  /**
   * Smooth pneumatic tube travel whoosh as the ball zips through bends & loops.
   */
  public playAirTubeWhoosh(dest?: AudioNode, pitch = 1.0) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const g = ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(210 * pitch, now);
      osc1.frequency.exponentialRampToValueAtTime(520 * pitch, now + 0.22);
      osc1.frequency.exponentialRampToValueAtTime(260 * pitch, now + 0.44);

      osc2.frequency.setValueAtTime(420 * pitch, now);
      osc2.frequency.exponentialRampToValueAtTime(840 * pitch, now + 0.24);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(750 * pitch, now);
      filter.Q.setValueAtTime(3.2, now);

      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(0.22 * this.volume, now + 0.06);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.46);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(g);
      this.routeOutput(g, dest);
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.48);
      osc2.stop(now + 0.48);
    } catch {}
  }

  /**
   * Forward Air Pump pneumatic turbo blast when slamming the pump switch ON.
   */
  public playAirPumpBlast(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const thump = ctx.createOscillator();
      const thumpG = ctx.createGain();
      thump.type = 'sine';
      thump.frequency.setValueAtTime(160, now);
      thump.frequency.exponentialRampToValueAtTime(55, now + 0.14);
      thumpG.gain.setValueAtTime(0.32 * this.volume, now);
      thumpG.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
      thump.connect(thumpG);
      this.routeOutput(thumpG, dest);
      thump.start(now);
      thump.stop(now + 0.18);

      const jet = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const jetG = ctx.createGain();
      jet.type = 'sawtooth';
      jet.frequency.setValueAtTime(135, now + 0.03);
      jet.frequency.exponentialRampToValueAtTime(490, now + 0.55);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(600, now + 0.03);
      filter.frequency.exponentialRampToValueAtTime(1800, now + 0.55);
      filter.Q.setValueAtTime(2.4, now);

      jetG.gain.setValueAtTime(0.001, now + 0.03);
      jetG.gain.linearRampToValueAtTime(0.2 * this.volume, now + 0.1);
      jetG.gain.exponentialRampToValueAtTime(0.0001, now + 0.62);

      jet.connect(filter);
      filter.connect(jetG);
      this.routeOutput(jetG, dest);
      jet.start(now + 0.03);
      jet.stop(now + 0.65);
    } catch {}
  }

  /**
   * Reverse vacuum suction surge when the Air Pump flips into REVERSE in Scene 5.
   */
  public playAirPumpReverse(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoG = ctx.createGain();
      const g = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.exponentialRampToValueAtTime(125, now + 0.72);

      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(14, now);
      lfoG.gain.setValueAtTime(24, now);
      lfo.connect(lfoG);
      lfoG.connect(osc.frequency);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1300, now);
      filter.frequency.exponentialRampToValueAtTime(340, now + 0.72);

      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(0.24 * this.volume, now + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.75);

      osc.connect(filter);
      filter.connect(g);
      this.routeOutput(g, dest);
      osc.start(now);
      lfo.start(now);
      osc.stop(now + 0.78);
      lfo.stop(now + 0.78);
    } catch {}
  }

  /**
   * 30s upbeat 136 BPM tube-lab comedy score for "THE INVISIBLE TUBE TRICKSHOT",
   * sliced into 4 x 7.5s sections and cutting silent at 25.80s right before the Air Pump reverses!
   */
  public playInvisibleTubeScoreSection(dest?: AudioNode, fromSec = 0, toSec = 30) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const beat = 60 / 136;
      const base = ctx.currentTime + 0.05 - fromSec;
      const LEVEL = 0.25;

      const tone = (freq: number, at: number, dur: number, type: OscillatorType, gain: number) => {
        if (at < ctx.currentTime - 0.05) return;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, at);
        g.gain.setValueAtTime(0.0001, at);
        g.gain.linearRampToValueAtTime(gain * LEVEL * this.volume, at + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        osc.connect(g);
        this.routeOutput(g, dest);
        osc.start(at);
        osc.stop(at + dur + 0.02);
      };

      const firstBeat = Math.max(0, Math.floor(fromSec / beat));
      const lastBeat = Math.ceil(toSec / beat);
      const bass = [164.81, 164.81, 196.0, 220.0, 246.94, 220.0, 196.0, 174.61];
      const lead = [659.25, 783.99, 987.77, 880.0, 783.99, 659.25, 587.33, 659.25];
      const turbo = [659.25, 880.0, 987.77, 1174.66, 1318.51, 1174.66, 987.77, 880.0];

      for (let b = firstBeat; b < lastBeat; b++) {
        const t = b * beat;
        const at = base + t;
        if (t >= 25.8) continue;

        tone(bass[b % bass.length], at, beat * 0.4, 'triangle', 0.22);
        if (t >= 18.6 && t < 24.15) {
          tone(turbo[b % turbo.length], at + beat * 0.5, beat * 0.22, 'sine', 0.28);
        } else {
          tone(lead[b % lead.length], at + beat * 0.5, beat * 0.26, 'triangle', 0.24);
        }
      }
    } catch {}
  }

  /**
   * Bright metallic steel clink as the silver ball transfers across gear teeth or rings.
   */
  public playGearToothClink(dest?: AudioNode, pitch = 1.0) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const freqs = [980 * pitch, 1480 * pitch];
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = idx === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(f, now);
        osc.frequency.exponentialRampToValueAtTime(f * 0.88, now + 0.14);
        g.gain.setValueAtTime(0.001, now);
        g.gain.linearRampToValueAtTime((idx === 0 ? 0.22 : 0.16) * this.volume, now + 0.008);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
        osc.connect(g);
        this.routeOutput(g, dest);
        osc.start(now);
        osc.stop(now + 0.18);
      });
    } catch {}
  }

  /**
   * Rhythmic interlocking metallic gear whirring burst as gears engage and accelerate.
   */
  public playGearWhir(dest?: AudioNode, pitch = 1.0) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoG = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      const g = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140 * pitch, now);
      osc.frequency.exponentialRampToValueAtTime(240 * pitch, now + 0.38);

      lfo.type = 'square';
      lfo.frequency.setValueAtTime(18 * pitch, now);
      lfoG.gain.setValueAtTime(42, now);
      lfo.connect(lfoG);
      lfoG.connect(osc.frequency);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(820 * pitch, now);
      filter.Q.setValueAtTime(2.6, now);

      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(0.18 * this.volume, now + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

      osc.connect(filter);
      filter.connect(g);
      this.routeOutput(g, dest);
      osc.start(now);
      lfo.start(now);
      osc.stop(now + 0.45);
      lfo.stop(now + 0.45);
    } catch {}
  }

  /**
   * Heavy mechanical clutch clank and descending reverse gear grind in Scene 5.
   */
  public playGearReverse(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const clank = ctx.createOscillator();
      const clankG = ctx.createGain();
      clank.type = 'square';
      clank.frequency.setValueAtTime(320, now);
      clank.frequency.exponentialRampToValueAtTime(85, now + 0.14);
      clankG.gain.setValueAtTime(0.24 * this.volume, now);
      clankG.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
      clank.connect(clankG);
      this.routeOutput(clankG, dest);
      clank.start(now);
      clank.stop(now + 0.18);

      const grind = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoG = ctx.createGain();
      const grindG = ctx.createGain();
      grind.type = 'sawtooth';
      grind.frequency.setValueAtTime(410, now + 0.06);
      grind.frequency.exponentialRampToValueAtTime(115, now + 0.68);
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(16, now + 0.06);
      lfoG.gain.setValueAtTime(28, now + 0.06);
      lfo.connect(lfoG);
      lfoG.connect(grind.frequency);

      grindG.gain.setValueAtTime(0.001, now + 0.06);
      grindG.gain.linearRampToValueAtTime(0.2 * this.volume, now + 0.12);
      grindG.gain.exponentialRampToValueAtTime(0.0001, now + 0.72);
      grind.connect(grindG);
      this.routeOutput(grindG, dest);
      grind.start(now + 0.06);
      lfo.start(now + 0.06);
      grind.stop(now + 0.75);
      lfo.stop(now + 0.75);
    } catch {}
  }

  /**
   * 30s upbeat 138 BPM clockwork-arcade comedy score for "THE GIANT GEAR TRICKSHOT",
   * sliced into 4 x 7.5s sections and cutting silent at 25.80s right before the gears reverse!
   */
  public playGiantGearScoreSection(dest?: AudioNode, fromSec = 0, toSec = 30) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const beat = 60 / 138;
      const base = ctx.currentTime + 0.05 - fromSec;
      const LEVEL = 0.25;

      const tone = (freq: number, at: number, dur: number, type: OscillatorType, gain: number) => {
        if (at < ctx.currentTime - 0.05) return;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, at);
        g.gain.setValueAtTime(0.0001, at);
        g.gain.linearRampToValueAtTime(gain * LEVEL * this.volume, at + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        osc.connect(g);
        this.routeOutput(g, dest);
        osc.start(at);
        osc.stop(at + dur + 0.02);
      };

      const firstBeat = Math.max(0, Math.floor(fromSec / beat));
      const lastBeat = Math.ceil(toSec / beat);
      const bass = [146.83, 146.83, 174.61, 196.0, 220.0, 196.0, 174.61, 164.81];
      const lead = [587.33, 739.99, 880.0, 783.99, 659.25, 587.33, 523.25, 587.33];
      const turbo = [587.33, 880.0, 1046.5, 1174.66, 1318.51, 1174.66, 1046.5, 880.0];

      for (let b = firstBeat; b < lastBeat; b++) {
        const t = b * beat;
        const at = base + t;
        if (t >= 25.8) continue;

        tone(bass[b % bass.length], at, beat * 0.38, 'triangle', 0.22);
        if (t >= 18.45 && t < 24.15) {
          tone(turbo[b % turbo.length], at + beat * 0.5, beat * 0.22, 'sine', 0.28);
        } else {
          tone(lead[b % lead.length], at + beat * 0.5, beat * 0.25, 'triangle', 0.24);
        }
      }
    } catch {}
  }

  /**
   * Low wooden bowling lane roll rumble as the purple bowling ball accelerates.
   */
  public playBowlingRoll(dest?: AudioNode, pitch = 1.0) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const g = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(78 * pitch, now);
      osc.frequency.linearRampToValueAtTime(118 * pitch, now + 0.42);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(340 * pitch, now);
      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(0.2 * this.volume, now + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.46);
      osc.connect(filter);
      filter.connect(g);
      this.routeOutput(g, dest);
      osc.start(now);
      osc.stop(now + 0.48);
    } catch {}
  }

  /**
   * Maple wood bowling pin knock (1 pin) or full cascading 10-pin strike crash.
   */
  public playPinHit(dest?: AudioNode, count: 1 | 10 = 1) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const hits =
        count === 1
          ? [{ dt: 0, f: 780 }, { dt: 0.04, f: 1120 }]
          : [
              { dt: 0, f: 680 },
              { dt: 0.035, f: 980 },
              { dt: 0.075, f: 1240 },
              { dt: 0.115, f: 840 },
              { dt: 0.16, f: 1380 },
              { dt: 0.21, f: 1090 },
            ];
      hits.forEach(({ dt, f }) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + dt);
        osc.frequency.exponentialRampToValueAtTime(f * 0.52, now + dt + 0.11);
        g.gain.setValueAtTime(0.001, now + dt);
        g.gain.linearRampToValueAtTime(0.28 * this.volume, now + dt + 0.006);
        g.gain.exponentialRampToValueAtTime(0.0001, now + dt + 0.13);
        osc.connect(g);
        this.routeOutput(g, dest);
        osc.start(now + dt);
        osc.stop(now + dt + 0.15);
      });
    } catch {}
  }

  /**
   * Bright crystalline mirror deflection ping when the bowling ball bounces off a mirror.
   */
  public playMirrorPing(dest?: AudioNode, pitch = 1.0) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1320 * pitch, now);
      osc.frequency.exponentialRampToValueAtTime(920 * pitch, now + 0.18);
      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(0.24 * this.volume, now + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
      osc.connect(g);
      this.routeOutput(g, dest);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch {}
  }

  /**
   * 30s upbeat 136 BPM bowling-alley comedy synth score for "THE REVERSE BOWLING TRICKSHOT",
   * sliced into 4 x 7.5s sections and cutting silent at 25.80s right before the ball reverses!
   */
  public playReverseBowlingScoreSection(dest?: AudioNode, fromSec = 0, toSec = 30) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const beat = 60 / 136;
      const base = ctx.currentTime + 0.05 - fromSec;
      const LEVEL = 0.25;

      const tone = (freq: number, at: number, dur: number, type: OscillatorType, gain: number) => {
        if (at < ctx.currentTime - 0.05) return;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, at);
        g.gain.setValueAtTime(0.0001, at);
        g.gain.linearRampToValueAtTime(gain * LEVEL * this.volume, at + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        osc.connect(g);
        this.routeOutput(g, dest);
        osc.start(at);
        osc.stop(at + dur + 0.02);
      };

      const firstBeat = Math.max(0, Math.floor(fromSec / beat));
      const lastBeat = Math.ceil(toSec / beat);
      const bass = [130.81, 130.81, 164.81, 196.0, 220.0, 196.0, 164.81, 146.83];
      const lead = [523.25, 659.25, 783.99, 659.25, 587.33, 523.25, 440.0, 523.25];
      const strikeRun = [523.25, 783.99, 987.77, 1046.5, 1174.66, 1046.5, 987.77, 783.99];

      for (let b = firstBeat; b < lastBeat; b++) {
        const t = b * beat;
        const at = base + t;
        if (t >= 25.8) continue;

        tone(bass[b % bass.length], at, beat * 0.4, 'triangle', 0.22);
        if (t >= 18.6 && t < 23.8) {
          tone(strikeRun[b % strikeRun.length], at + beat * 0.5, beat * 0.22, 'sine', 0.28);
        } else {
          tone(lead[b % lead.length], at + beat * 0.5, beat * 0.26, 'triangle', 0.24);
        }
      }
    } catch {}
  }

  /**
   * High-speed spinning yo-yo string & axle whir.
   */
  public playYoyoWhir(dest?: AudioNode, pitch = 1.0) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const g = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(175 * pitch, now);
      osc.frequency.exponentialRampToValueAtTime(390 * pitch, now + 0.28);
      osc.frequency.exponentialRampToValueAtTime(210 * pitch, now + 0.56);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(520 * pitch, now);
      filter.Q.setValueAtTime(2.6, now);

      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(0.24 * this.volume, now + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.58);

      osc.connect(filter);
      filter.connect(g);
      this.routeOutput(g, dest);
      osc.start(now);
      osc.stop(now + 0.6);
    } catch {}
  }

  /**
   * Bright hoop-pass chime as the giant yo-yo threads each spinning ring.
   */
  public playHoopPassDing(dest?: AudioNode, pitch = 1.0) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(740 * pitch, now);
      osc.frequency.exponentialRampToValueAtTime(1180 * pitch, now + 0.14);
      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(0.26 * this.volume, now + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
      osc.connect(g);
      this.routeOutput(g, dest);
      osc.start(now);
      osc.stop(now + 0.26);
    } catch {}
  }

  /**
   * Rapid recoil zip + elastic hoist pull when the yo-yo wraps Stickman's waist.
   */
  public playYoyoRecoilSnap(dest?: AudioNode) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(980, now + 0.36);
      osc.frequency.exponentialRampToValueAtTime(520, now + 0.62);
      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(0.32 * this.volume, now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.66);
      osc.connect(g);
      this.routeOutput(g, dest);
      osc.start(now);
      osc.stop(now + 0.68);
    } catch {}
  }

  /**
   * 30s upbeat 138 BPM arcade comedy synth score for "THE GIANT YO-YO TRICKSHOT",
   * sliced into 4 x 7.5s sections and cutting silent at 25.75s right before recoil!
   */
  public playGiantYoyoScoreSection(dest?: AudioNode, fromSec = 0, toSec = 30) {
    if (this.isMuted && !dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const beat = 60 / 138;
      const base = ctx.currentTime + 0.05 - fromSec;
      const LEVEL = 0.25;

      const tone = (freq: number, at: number, dur: number, type: OscillatorType, gain: number) => {
        if (at < ctx.currentTime - 0.05) return;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, at);
        g.gain.setValueAtTime(0.0001, at);
        g.gain.linearRampToValueAtTime(gain * LEVEL * this.volume, at + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        osc.connect(g);
        this.routeOutput(g, dest);
        osc.start(at);
        osc.stop(at + dur + 0.02);
      };

      const firstBeat = Math.max(0, Math.floor(fromSec / beat));
      const lastBeat = Math.ceil(toSec / beat);
      const bass = [146.83, 146.83, 196.0, 220.0, 246.94, 220.0, 196.0, 164.81];
      const lead = [587.33, 739.99, 880.0, 739.99, 659.25, 587.33, 493.88, 587.33];
      const swingRun = [587.33, 880.0, 1046.5, 1174.66, 1318.51, 1174.66, 1046.5, 880.0];

      for (let b = firstBeat; b < lastBeat; b++) {
        const t = b * beat;
        const at = base + t;
        if (t >= 25.75) continue;

        tone(bass[b % bass.length], at, beat * 0.4, 'triangle', 0.22);
        if (t >= 19.4 && t < 24.1) {
          tone(swingRun[b % swingRun.length], at + beat * 0.5, beat * 0.22, 'sine', 0.28);
        } else {
          tone(lead[b % lead.length], at + beat * 0.5, beat * 0.26, 'triangle', 0.24);
        }
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
    const englishVoice =
      voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Natural') ||
            v.name.includes('Google') ||
            v.name.includes('Samantha') ||
            v.name.includes('Daniel'))
      ) || voices.find((v) => v.lang.startsWith('en'));

    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch {}
}

export function stopVoiceOver() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
}
