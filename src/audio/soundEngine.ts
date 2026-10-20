/**
 * Procedural Web Audio API sound engine for 2D stickman animations.
 * Synthesizes all cartoon comedic sound effects and voice cues in real-time.
 * Supports direct routing to an external AudioNode (such as a MediaStreamDestination for video export).
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.85;

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
