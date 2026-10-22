import { EffectType } from './types';

class ViralRankAudioEngine {
  private ctx: AudioContext | null = null;
  private musicSource: AudioNode | null = null;
  private isMuted: boolean = false;
  private masterGainNode: GainNode | null = null;

  public getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGainNode = this.ctx.createGain();
        this.masterGainNode.gain.value = 0.9;
        this.masterGainNode.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGainNode) {
      this.masterGainNode.gain.value = muted ? 0 : 0.9;
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  private route(node: AudioNode, dest?: AudioNode) {
    if (dest) {
      node.connect(dest);
    } else if (this.masterGainNode) {
      node.connect(this.masterGainNode);
    } else if (this.ctx) {
      node.connect(this.ctx.destination);
    }
  }

  /**
   * Plays a synthesized sound effect based on its EffectType with custom gain (0.0-2.0) and playbackRate.
   */
  public playEffect(
    type: EffectType,
    options: {
      gain?: number;
      playbackRate?: number;
      fadeIn?: number;
      fadeOut?: number;
      dest?: AudioNode;
    } = {}
  ) {
    if (this.isMuted && !options.dest) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const rate = Math.max(0.2, Math.min(3.0, options.playbackRate ?? 1.0));
    const userGain = Math.max(0.0, Math.min(2.0, options.gain ?? 1.0));
    const now = ctx.currentTime;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(userGain, now);
    this.route(gainNode, options.dest);

    switch (type) {
      case 'whoosh':
        this.synthesizeWhoosh(ctx, gainNode, now, rate);
        break;
      case 'impact':
        this.synthesizeImpact(ctx, gainNode, now, rate);
        break;
      case 'punch':
        this.synthesizePunch(ctx, gainNode, now, rate);
        break;
      case 'pop':
        this.synthesizePop(ctx, gainNode, now, rate);
        break;
      case 'click':
        this.synthesizeClick(ctx, gainNode, now, rate);
        break;
      case 'ding':
        this.synthesizeDing(ctx, gainNode, now, rate);
        break;
      case 'bell':
        this.synthesizeBell(ctx, gainNode, now, rate);
        break;
      case 'drum-hit':
        this.synthesizeDrumHit(ctx, gainNode, now, rate);
        break;
      case 'riser':
        this.synthesizeRiser(ctx, gainNode, now, rate);
        break;
      case 'bass-drop':
        this.synthesizeBassDrop(ctx, gainNode, now, rate);
        break;
      case 'crowd-cheer':
        this.synthesizeCrowdCheer(ctx, gainNode, now, rate);
        break;
      case 'laughter':
        this.synthesizeLaughter(ctx, gainNode, now, rate);
        break;
      case 'suspense':
        this.synthesizeSuspense(ctx, gainNode, now, rate);
        break;
      case 'record-scratch':
        this.synthesizeRecordScratch(ctx, gainNode, now, rate);
        break;
      case 'glitch':
        this.synthesizeGlitch(ctx, gainNode, now, rate);
        break;
      case 'explosion':
        this.synthesizeExplosion(ctx, gainNode, now, rate);
        break;
      case 'success':
        this.synthesizeSuccessFanfare(ctx, gainNode, now, rate);
        break;
      case 'failure':
        this.synthesizeFailureSlide(ctx, gainNode, now, rate);
        break;
      default:
        this.synthesizePop(ctx, gainNode, now, rate);
        break;
    }
  }

  // 1. Whoosh: dynamic filtered white noise sweep + sine pitch dip
  private synthesizeWhoosh(ctx: AudioContext, dest: AudioNode, now: number, rate: number) {
    const dur = 0.35 / rate;
    const bufSize = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufSize) * Math.PI);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buf;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 2.5;
    filter.frequency.setValueAtTime(250 * rate, now);
    filter.frequency.exponentialRampToValueAtTime(1600 * rate, now + dur * 0.5);
    filter.frequency.exponentialRampToValueAtTime(220 * rate, now + dur);

    noise.connect(filter);
    filter.connect(dest);
    noise.start(now);
    noise.stop(now + dur);
  }

  // 2. Impact: Sub-bass 65Hz punch with high-frequency transient click
  private synthesizeImpact(ctx: AudioContext, dest: AudioNode, now: number, rate: number) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180 * rate, now);
    osc.frequency.exponentialRampToValueAtTime(42 * rate, now + 0.35 / rate);

    g.gain.setValueAtTime(1.0, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.45 / rate);

    osc.connect(g);
    g.connect(dest);
    osc.start(now);
    osc.stop(now + 0.5 / rate);
  }

  // 3. Punch: Mid-range snap + quick crunch
  private synthesizePunch(ctx: AudioContext, dest: AudioNode, now: number, rate: number) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320 * rate, now);
    osc.frequency.exponentialRampToValueAtTime(75 * rate, now + 0.12 / rate);

    g.gain.setValueAtTime(1.0, now);
    g.gain.exponentialRampToValueAtTime(0.005, now + 0.18 / rate);

    osc.connect(g);
    g.connect(dest);
    osc.start(now);
    osc.stop(now + 0.2 / rate);
  }

  // 4. Pop: Upward bubbling blip
  private synthesizePop(ctx: AudioContext, dest: AudioNode, now: number, rate: number) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(380 * rate, now);
    osc.frequency.exponentialRampToValueAtTime(820 * rate, now + 0.08 / rate);

    g.gain.setValueAtTime(0.9, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.09 / rate);

    osc.connect(g);
    g.connect(dest);
    osc.start(now);
    osc.stop(now + 0.1 / rate);
  }

  // 5. Click: Crisp mechanical tick
  private synthesizeClick(ctx: AudioContext, dest: AudioNode, now: number, rate: number) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1400 * rate, now);
    osc.frequency.setValueAtTime(200 * rate, now + 0.015);

    g.gain.setValueAtTime(0.8, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.035 / rate);

    osc.connect(g);
    g.connect(dest);
    osc.start(now);
    osc.stop(now + 0.04 / rate);
  }

  // 6. Ding: Resonant high metallic chime
  private synthesizeDing(ctx: AudioContext, dest: AudioNode, now: number, rate: number) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1760 * rate, now);

    g.gain.setValueAtTime(0.8, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.9 / rate);

    osc.connect(g);
    g.connect(dest);
    osc.start(now);
    osc.stop(now + 1.0 / rate);
  }

  // 7. Bell: Rich dual-harmonic brass bell
  private synthesizeBell(ctx: AudioContext, dest: AudioNode, now: number, rate: number) {
    [1046 * rate, 2093 * rate].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      g.gain.setValueAtTime(0.5 / (idx + 1), now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 1.2 / rate);

      osc.connect(g);
      g.connect(dest);
      osc.start(now);
      osc.stop(now + 1.3 / rate);
    });
  }

  // 8. Drum Hit: 808-style low-end kick
  private synthesizeDrumHit(ctx: AudioContext, dest: AudioNode, now: number, rate: number) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160 * rate, now);
    osc.frequency.exponentialRampToValueAtTime(36 * rate, now + 0.22 / rate);

    g.gain.setValueAtTime(1.0, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.35 / rate);

    osc.connect(g);
    g.connect(dest);
    osc.start(now);
    osc.stop(now + 0.4 / rate);
  }

  // 9. Riser: Ascending saw tension sweep
  private synthesizeRiser(ctx: AudioContext, dest: AudioNode, now: number, rate: number) {
    const dur = 1.6 / rate;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const g = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110 * rate, now);
    osc.frequency.exponentialRampToValueAtTime(880 * rate, now + dur);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, now);
    filter.frequency.exponentialRampToValueAtTime(3500, now + dur);

    g.gain.setValueAtTime(0.1, now);
    g.gain.linearRampToValueAtTime(0.85, now + dur * 0.9);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc.connect(filter);
    filter.connect(g);
    g.connect(dest);
    osc.start(now);
    osc.stop(now + dur);
  }

  // 10. Bass Drop: 808 pitch dive
  private synthesizeBassDrop(ctx: AudioContext, dest: AudioNode, now: number, rate: number) {
    const dur = 1.2 / rate;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(130 * rate, now);
    osc.frequency.exponentialRampToValueAtTime(26 * rate, now + dur * 0.7);

    g.gain.setValueAtTime(1.0, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc.connect(g);
    g.connect(dest);
    osc.start(now);
    osc.stop(now + dur);
  }

  // 11. Crowd Cheer: Swelling applause noise
  private synthesizeCrowdCheer(ctx: AudioContext, dest: AudioNode, now: number, rate: number) {
    const dur = 1.4 / rate;
    const bufSize = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      d[i] = (Math.random() * 2 - 1) * 0.6;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 1.2;
    filter.frequency.setValueAtTime(1100, now);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.05, now);
    g.gain.linearRampToValueAtTime(0.7, now + dur * 0.35);
    g.gain.exponentialRampToValueAtTime(0.01, now + dur);

    src.connect(filter);
    filter.connect(g);
    g.connect(dest);
    src.start(now);
    src.stop(now + dur);
  }

  // 12. Laughter: Staccato formant chirps
  private synthesizeLaughter(ctx: AudioContext, dest: AudioNode, now: number, rate: number) {
    for (let i = 0; i < 4; i++) {
      const burstTime = now + (i * 0.14) / rate;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime((360 - i * 25) * rate, burstTime);

      g.gain.setValueAtTime(0.5, burstTime);
      g.gain.exponentialRampToValueAtTime(0.01, burstTime + 0.1 / rate);

      osc.connect(g);
      g.connect(dest);
      osc.start(burstTime);
      osc.stop(burstTime + 0.11 / rate);
    }
  }

  // 13. Suspense: Low drone with subtle detuning
  private synthesizeSuspense(ctx: AudioContext, dest: AudioNode, now: number, rate: number) {
    const dur = 1.8 / rate;
    [65 * rate, 68 * rate].forEach((f) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, now);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(280, now);

      g.gain.setValueAtTime(0.4, now);
      g.gain.exponentialRampToValueAtTime(0.01, now + dur);

      osc.connect(filter);
      filter.connect(g);
      g.connect(dest);
      osc.start(now);
      osc.stop(now + dur);
    });
  }

  // 14. Record Scratch: Quick backward vinyl slip
  private synthesizeRecordScratch(ctx: AudioContext, dest: AudioNode, now: number, rate: number) {
    const dur = 0.28 / rate;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800 * rate, now);
    osc.frequency.linearRampToValueAtTime(200 * rate, now + dur * 0.6);
    osc.frequency.linearRampToValueAtTime(550 * rate, now + dur);

    g.gain.setValueAtTime(0.65, now);
    g.gain.exponentialRampToValueAtTime(0.01, now + dur);

    osc.connect(g);
    g.connect(dest);
    osc.start(now);
    osc.stop(now + dur);
  }

  // 15. Glitch: Digital square noise crunch
  private synthesizeGlitch(ctx: AudioContext, dest: AudioNode, now: number, rate: number) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(650 * rate, now);
    osc.frequency.setValueAtTime(140 * rate, now + 0.04);
    osc.frequency.setValueAtTime(920 * rate, now + 0.08);

    g.gain.setValueAtTime(0.7, now);
    g.gain.exponentialRampToValueAtTime(0.01, now + 0.14 / rate);

    osc.connect(g);
    g.connect(dest);
    osc.start(now);
    osc.stop(now + 0.15 / rate);
  }

  // 16. Explosion: Low rumble + filtered white blast
  private synthesizeExplosion(ctx: AudioContext, dest: AudioNode, now: number, rate: number) {
    const dur = 1.3 / rate;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(95 * rate, now);
    osc.frequency.exponentialRampToValueAtTime(25 * rate, now + dur);

    g.gain.setValueAtTime(1.0, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc.connect(g);
    g.connect(dest);
    osc.start(now);
    osc.stop(now + dur);

    // Noise layer
    const bufSize = Math.floor(ctx.sampleRate * (dur * 0.8));
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.exp(-3 * (i / bufSize));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now);

    noise.connect(filter);
    filter.connect(dest);
    noise.start(now);
  }

  // 17. Success: C major triad fanfare (C5, E5, G5, C6)
  private synthesizeSuccessFanfare(ctx: AudioContext, dest: AudioNode, now: number, rate: number) {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const noteTime = now + (idx * 0.09) / rate;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq * rate, noteTime);

      g.gain.setValueAtTime(0.5, noteTime);
      g.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35 / rate);

      osc.connect(g);
      g.connect(dest);
      osc.start(noteTime);
      osc.stop(noteTime + 0.38 / rate);
    });
  }

  // 18. Failure: Descending comic tritone ("wah wah wah")
  private synthesizeFailureSlide(ctx: AudioContext, dest: AudioNode, now: number, rate: number) {
    const notes = [440, 415.3, 392.0, 349.2];
    notes.forEach((freq, idx) => {
      const noteTime = now + (idx * 0.18) / rate;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq * rate, noteTime);
      if (idx === 3) {
        osc.frequency.linearRampToValueAtTime(290 * rate, noteTime + 0.45 / rate);
      }

      g.gain.setValueAtTime(0.4, noteTime);
      g.gain.exponentialRampToValueAtTime(0.005, noteTime + (idx === 3 ? 0.5 : 0.16) / rate);

      osc.connect(g);
      g.connect(dest);
      osc.start(noteTime);
      osc.stop(noteTime + (idx === 3 ? 0.55 : 0.18) / rate);
    });
  }

  /**
   * Spoken narration synthesis using Web Speech API with fallback.
   */
  public speak(
    text: string,
    options: { rate?: number; pitch?: number; volume?: number; onEnd?: () => void } = {}
  ) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    if (!text || this.isMuted) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = Math.max(0.5, Math.min(2.0, options.rate ?? 1.05));
    utterance.pitch = Math.max(0.5, Math.min(1.8, options.pitch ?? 1.0));
    utterance.volume = Math.max(0, Math.min(1.0, options.volume ?? 1.0));

    if (options.onEnd) {
      utterance.onend = options.onEnd;
    }
    window.speechSynthesis.speak(utterance);
  }

  public stopSpeech() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }
}

export const viralAudio = new ViralRankAudioEngine();
