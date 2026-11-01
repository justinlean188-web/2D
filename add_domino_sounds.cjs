const fs = require('fs');
const filePath = 'src/audio/soundEngine.ts';
const content = fs.readFileSync(filePath, 'utf8');

// Find the position right before the closing brace of the SoundEngine class
const endClassMarker = '}';
const exportMarker = 'export const soundEngine = new SoundEngine();';
const exportIndex = content.indexOf(exportMarker);

// Find the last '}' before the export
let insertIndex = exportIndex;
while (insertIndex > 0 && content[insertIndex - 1] !== '}') {
  insertIndex--;
}
if (content[insertIndex - 1] !== '}') {
  throw new Error('Could not find class closing brace');
}
insertIndex--; // Position right before the closing brace

const newSection = `
  // ===== DOMINO TRICKSHOT SOUNDS =====
  // Only truly new functions that don't exist elsewhere in the engine.
  // All other sounds (whoosh, coinTing, crowdCheer, recordScratch, angrySting,
  // victoryFanfare, sadTrombone, heartbeat, magicSparkle, ideaDing, woodClack,
  // mechanicalClick, launcherFire, armCrossSqueak, squeak, slideWhistle,
  // deepBreath, needlePoke, bigImpact, paperCrumple, fanTink, windowKnock,
  // binThunk, freezeSting, dramaticRumble, knuckleCrack, risingWhistle,
  // spiralWhirr, vendingThud, strainedTug, vendingRattle, coinClink, bagRip,
  // airPuff, tinyChipTink, cupSlide, cupClunk, ballRoll, drumRoll, countBeep,
  // confettiPop, vendingScoreSection, balloonScoreSection, findTheBallScoreSection,
  // needleThreadScoreSection, attempt247ScoreSection, ringShotScoreSection,
  // pencilLandingScoreSection, arcadeClawScoreSection, diamondHeistScoreSection,
  // pancakeScoreSection) are already defined above and reused via cue maps.

  public playDominoTrickshotScoreSection(dest?: AudioNode, start: number = 0, end: number = 7.5) {
    const ctx = this.getContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    const target = dest ?? ctx.destination;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, t);
    gain.connect(target);

    const notes = [261.63, 329.63, 392.00, 523.25, 392.00, 329.63, 261.63];
    const sectionDur = end - start;
    const noteDur = sectionDur / notes.length;

    for (let i = 0; i < notes.length; i++) {
      const noteTime = t + start + i * noteDur;
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(notes[i], noteTime);
      noteGain.gain.setValueAtTime(0, noteTime);
      noteGain.gain.linearRampToValueAtTime(0.3, noteTime + 0.02);
      noteGain.gain.exponentialRampToValueAtTime(0.001, noteTime + noteDur * 0.8);
      osc.connect(noteGain);
      noteGain.connect(gain);
      osc.start(noteTime);
      osc.stop(noteTime + noteDur);
    }

    for (let i = 0; i < 4; i++) {
      const percTime = t + start + i * (sectionDur / 4) + 0.1;
      this.schedulePercHit(ctx, percTime, gain);
    }
  }

  private schedulePercHit(ctx: BaseAudioContext, time: number, target: AudioNode) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, time);
    osc.frequency.exponentialRampToValueAtTime(60, time + 0.1);
    gain.gain.setValueAtTime(0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
    osc.connect(gain);
    gain.connect(target);
    osc.start(time);
    osc.stop(time + 0.2);
  }

  public playDramaticBoom(dest?: AudioNode) {
    const ctx = this.getContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    const target = dest ?? ctx.destination;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 1.5);
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
    osc.connect(gain);
    gain.connect(target);
    osc.start(t);
    osc.stop(t + 1.5);
  }

  public playTickingCountdown(dest?: AudioNode, duration: number = 3.0) {
    const ctx = this.getContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    const target = dest ?? ctx.destination;
    for (let i = 0; i < duration * 2; i++) {
      const tickTime = t + i * 0.5;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(1200, tickTime);
      gain.gain.setValueAtTime(0.1, tickTime);
      gain.gain.exponentialRampToValueAtTime(0.001, tickTime + 0.05);
      osc.connect(gain);
      gain.connect(target);
      osc.start(tickTime);
      osc.stop(tickTime + 0.1);
    }
  }

  public playSoftFlick(dest?: AudioNode) {
    const ctx = this.getContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    const target = dest ?? ctx.destination;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.15);
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.connect(gain);
    gain.connect(target);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  public playTinyPlop(dest?: AudioNode) {
    const ctx = this.getContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    const target = dest ?? ctx.destination;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.1);
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.connect(gain);
    gain.connect(target);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  public playHardFlick(dest?: AudioNode) {
    const ctx = this.getContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    const target = dest ?? ctx.destination;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(150, t + 0.2);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.connect(gain);
    gain.connect(target);
    osc.start(t);
    osc.stop(t + 0.35);
  }

  public playDominoClatter(dest?: AudioNode, duration: number = 3.0) {
    const ctx = this.getContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    const target = dest ?? ctx.destination;
    for (let i = 0; i < duration * 10; i++) {
      const hitTime = t + i * 0.1 + Math.random() * 0.05;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800 + Math.random() * 400, hitTime);
      gain.gain.setValueAtTime(0.08, hitTime);
      gain.gain.exponentialRampToValueAtTime(0.001, hitTime + 0.05);
      osc.connect(gain);
      gain.connect(target);
      osc.start(hitTime);
      osc.stop(hitTime + 0.08);
    }
  }

  public playCartoonCrash(dest?: AudioNode) {
    const ctx = this.getContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    const target = dest ?? ctx.destination;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(500, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.8);
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
    osc.connect(gain);
    gain.connect(target);
    osc.start(t);
    osc.stop(t + 1.0);
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.3), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) * 0.3;
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1000, t);
    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(0.15, t);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    src.connect(filter);
    filter.connect(gain2);
    gain2.connect(target);
    src.start(t);
  }

  public playPreciseTap(dest?: AudioNode) {
    const ctx = this.getContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    const target = dest ?? ctx.destination;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, t);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    osc.connect(gain);
    gain.connect(target);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  public playDominoClick(dest?: AudioNode) {
    const ctx = this.getContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    const target = dest ?? ctx.destination;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1000, t);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.05);
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    osc.connect(gain);
    gain.connect(target);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  public playRisingMusicSwelling(dest?: AudioNode) {
    const ctx = this.getContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    const target = dest ?? ctx.destination;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.05, t);
    gain.gain.linearRampToValueAtTime(0.2, t + 4);
    gain.connect(target);

    const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
    for (let i = 0; i < notes.length; i++) {
      const noteTime = t + i * 0.5;
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(notes[i], noteTime);
      noteGain.gain.setValueAtTime(0, noteTime);
      noteGain.gain.linearRampToValueAtTime(0.2, noteTime + 0.05);
      noteGain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.8);
      osc.connect(noteGain);
      noteGain.connect(gain);
      osc.start(noteTime);
      osc.stop(noteTime + 1.0);
    }
  }

  public playCupPing(dest?: AudioNode) {
    const ctx = this.getContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    const target = dest ?? ctx.destination;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1500, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.3);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    osc.connect(gain);
    gain.connect(target);
    osc.start(t);
    osc.stop(t + 0.6);
  }

  public playCupWobbleCreak(dest?: AudioNode) {
    const ctx = this.getContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    const target = dest ?? ctx.destination;
    for (let i = 0; i < 4; i++) {
      const creakTime = t + i * 0.15;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(180 + i * 20, creakTime);
      osc.frequency.linearRampToValueAtTime(220 + i * 20, creakTime + 0.1);
      gain.gain.setValueAtTime(0.12, creakTime);
      gain.gain.exponentialRampToValueAtTime(0.001, creakTime + 0.15);
      osc.connect(gain);
      gain.connect(target);
      osc.start(creakTime);
      osc.stop(creakTime + 0.2);
    }
  }

  public playHollowBonk(dest?: AudioNode) {
    const ctx = this.getContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    const target = dest ?? ctx.destination;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.4);
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    osc.connect(gain);
    gain.connect(target);
    osc.start(t);
    osc.stop(t + 0.6);
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(240, t);
    osc2.frequency.exponentialRampToValueAtTime(120, t + 0.3);
    gain2.gain.setValueAtTime(0.15, t);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc2.connect(gain2);
    gain2.connect(target);
    osc2.start(t);
    osc2.stop(t + 0.5);
  }
`;

const before = content.substring(0, content.lastIndexOf('}'));
const after = content.substring(content.lastIndexOf('}'));

const newContent = before + newSection + '\n' + after;
fs.writeFileSync(filePath, newContent, 'utf8');
console.log('Done');