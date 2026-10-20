/**
 * Procedural Web Audio API sound engine for "What If Your Shadow Quit?"
 * Synthesizes all cartoon comedic sound effects with zero external audio assets.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.85;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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

  // Soft cartoon footstep pop
  public playFootstep(isCheerSkip: boolean = false) {
    if (this.isMuted) return;
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
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // AudioContext policy fallback
    }
  }

  // Sharp comedic record scratch when shadow abruptly stops
  public playRecordScratch() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const duration = 0.28;

      // 1. Noise scratch burst
      const bufferSize = ctx.sampleRate * duration;
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
      noiseGain.connect(ctx.destination);

      // 2. High-pitched needle rip
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + duration);

      oscGain.gain.setValueAtTime(0.25 * this.volume, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      noise.start(now);
      osc.start(now);
      noise.stop(now + duration);
      osc.stop(now + duration);
    } catch {
      // Ignore
    }
  }

  // Paper slap / clipboard snap
  public playPaperSlap() {
    if (this.isMuted) return;
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
      gain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + duration);
    } catch {
      // Ignore
    }
  }

  // Clipboard tapping sound (sharp dry click)
  public playClipboardTap() {
    if (this.isMuted) return;
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
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.035);
    } catch {
      // Ignore
    }
  }

  // Soft floor-contact thump when shadow sits down
  public playFloorThump() {
    if (this.isMuted) return;
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
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.16);
    } catch {
      // Ignore
    }
  }

  // Squeak as shadow crosses arms
  public playArmCrossSqueak() {
    if (this.isMuted) return;
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
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // Ignore
    }
  }

  // Mournful sad trombone (wah-wah-wah-waaa)
  public playSadTrombone() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [
        { freq: 155.56, start: 0.0, dur: 0.28 },  // Eb3
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
        gain.connect(ctx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + n.dur);
      });
    } catch {
      // Ignore
    }
  }
}

export const soundEngine = new SoundEngine();

/**
 * Deadpan, calm, slightly bored documentary Voice-Over synthesizer
 */
export function speakVoiceOver(text: string, options?: { rate?: number; pitch?: number; volume?: number }) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options?.rate ?? 0.88;
    utterance.pitch = options?.pitch ?? 0.92;
    utterance.volume = options?.volume ?? 1.0;

    // Pick best English voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel'))
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch {
    // Speech synthesis error handling
  }
}

export function stopVoiceOver() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore
    }
  }
}
