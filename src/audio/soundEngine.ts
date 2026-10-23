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
