import { CanvasRenderer } from '../animation/canvasRenderer';
import { ExtendedPaperBallRenderer } from '../animation/extendedPaperBallRenderer';
import { HoopRenderer } from '../animation/hoopRenderer';
import { MachineRenderer } from '../animation/machineRenderer';
import { PaperBallRenderer } from '../animation/paperBallRenderer';
import { PopStageRenderer } from '../animation/popStageRenderer';
import { TrickShotRenderer } from '../animation/trickShotRenderer';
import { PingPongRenderer } from '../animation/pingPongRenderer';
import { DartShotRenderer } from '../animation/dartShotRenderer';
import { CoinFlipRenderer } from '../animation/coinFlipRenderer';
import { ArcadeClawRenderer } from '../animation/arcadeClawRenderer';
import { DiamondHeistRenderer } from '../animation/diamondHeistRenderer';
import { PancakeFlipRenderer } from '../animation/pancakeFlipRenderer';
import { VendingMachineRenderer } from '../animation/vendingMachineRenderer';
import { BiggestBalloonRenderer } from '../animation/biggestBalloonRenderer';
import { FindTheBallRenderer } from '../animation/findTheBallRenderer';
import { Attempt247Renderer } from '../animation/attempt247Renderer';
import { NeedleThreadRenderer } from '../animation/needleThreadRenderer';
import { MagnetTrickRenderer } from '../animation/magnetTrickRenderer';
import { RingShotRenderer } from '../animation/ringShotRenderer';
import { PencilLandingRenderer } from '../animation/pencilLandingRenderer';
import { DominoTrickshotRenderer } from '../animation/dominoTrickshotRenderer';
import { BalloonPopJackpotRenderer } from '../animation/balloonPopJackpotRenderer';
import { CandyClawRenderer } from '../animation/candyClawRenderer';
import { PlateSpinRenderer } from '../animation/plateSpinRenderer';
import { ThreeWallPingPongRenderer } from '../animation/threeWallPingPongRenderer';
import { CupInCupRenderer } from '../animation/cupInCupRenderer';
import { MindTrapsRenderer } from '../animation/mindTrapsRenderer';
import { SequelPaperBallRenderer } from '../animation/sequelPaperBallRenderer';
import {
  MIND_TRAPS_CUES,
  PAPER_BALL_30_CUES,
  POP_STAR_CUES,
  TRICK_SHOT_CUES,
  PING_PONG_CUES,
  DART_SHOT_CUES,
  COIN_FLIP_CUES,
  ARCADE_CLAW_CUES,
  DIAMOND_HEIST_CUES,
  PANCAKE_FLIP_CUES,
  VENDING_MACHINE_CUES,
  BIGGEST_BALLOON_CUES,
  FIND_THE_BALL_CUES,
  ATTEMPT_247_CUES,
  NEEDLE_THREAD_CUES,
  MAGNET_TRICK_CUES,
  RING_SHOT_CUES,
  PENCIL_LANDING_CUES,
  DOMINO_TRICKSHOT_CUES,
  BALLOON_POP_JACKPOT_CUES,
  CANDY_CLAW_CUES,
  PLATE_SPIN_CUES,
  THREE_WALL_PING_PONG_CUES,
  CUP_IN_CUP_CUES,
  PAPER_BALL_PART3_CUES,
  PAPER_BALL_PART4_CUES,
  PAPER_BALL_SEQUEL_CUES,
} from '../audio/cueMaps';
import { soundEngine } from '../audio/soundEngine';
import { PROJECTS, StudioConfig } from '../types';
import { fixWebmDuration } from './fixWebmDuration';

export type ExportFps = 24 | 30 | 60;

export const EXPORT_FPS_OPTIONS: ExportFps[] = [24, 30, 60];

export interface ExportTimelineRenderer {
  render(ctx: CanvasRenderingContext2D, time: number, config: StudioConfig): void;
  /**
   * Lets the export tell the renderer that the timeline is running.
   *
   * A clip renderer keeps its videos playing while the export runs, so it
   * does not have to seek the video on every single frame. Seeking a long
   * clip frame by frame is what makes an export crawl.
   */
  setPlayback?(playing: boolean): void;
}

export interface ExportOptions {
  config: StudioConfig;
  exportSpeed?: number; // 1.0 = normal, 0.75 = relaxed, 0.5 = slow-mo
  loopCount?: number; // 1-10 complete plays of the selected project's timeline
  fps?: ExportFps; // output frame rate; audio timing is unaffected
  format?: 'mp4' | 'webm';
  previewCanvas?: HTMLCanvasElement | null;
  onProgress?: (progress: number, currentSec: number, totalSec: number) => void;
  /** Renders a custom timeline instead of the active project. */
  renderer?: ExportTimelineRenderer;
  /** Duration of the custom timeline in seconds. */
  duration?: number;
  /** Spoken lines with the moment they are read. */
  narration?: { time: number; text: string }[];
  /** File name prefix for the download. */
  filePrefix?: string;
  /** Fallback project filePrefix when none is supplied. */
  projectFilePrefix?: string;
}

export interface ExportResult {
  blob: Blob;
  url: string;
  filename: string;
  format: 'mp4' | 'webm';
  duration: number;
  fps: ExportFps;
  /** True when the browser blocked the audio, so the file has no sound. */
  silent?: boolean;
}

/**
 * Chromium can report MP4 MediaRecorder support but cannot mux the
 * Web Audio destination track into it, which produces a one-frame file.
 * MP4 with audio is currently reliable only in Safari; everywhere else
 * use WebM (VP9 + Opus), which this app can record correctly.
 */
export function canRecordMp4WithAudio(): boolean {
  if (typeof navigator === 'undefined' || typeof MediaRecorder === 'undefined') {
    return false;
  }
  const ua = navigator.userAgent;
  const isSafari =
    /Safari/i.test(ua) && !/Chrome|CriOS|Chromium|Edg|OPR|Android/i.test(ua);
  return isSafari && MediaRecorder.isTypeSupported('video/mp4;codecs=avc1,mp4a.40.2');
}

/**
 * Renders the 2D stickman animation frame-by-frame with synchronized cartoon audio
 * into a downloadable high-resolution video file.
 *
 * Guarantees exact playback speed, proper duration metadata, requested-fps track
 * headers, and continuous crystal-clear audio from 0.00s.
 */
export async function exportVideo(options: ExportOptions): Promise<ExportResult> {
  const {
    config,
    exportSpeed = 1.0,
    loopCount = 1,
    fps = 24,
    format = 'webm',
    previewCanvas,
    onProgress,
  } = options;
  const loops = Math.max(1, Math.min(10, Math.round(loopCount)));
  const requestedMp4 = format === 'mp4' && canRecordMp4WithAudio();
  const exportConfig: StudioConfig = { ...config, showSafeZones: false };

  const width = 1080;
  const height = 1920;
  const animationDuration =
    options.duration ?? PROJECTS[config.activeProject].duration;
  const totalDuration = (animationDuration * loops) / exportSpeed;

  const offCanvas = document.createElement('canvas');
  offCanvas.width = width;
  offCanvas.height = height;

  // Mount to DOM in active viewport so browser compositor guarantees rendering
  offCanvas.style.position = 'fixed';
  offCanvas.style.bottom = '0px';
  offCanvas.style.right = '0px';
  offCanvas.style.width = '2px';
  offCanvas.style.height = '2px';
  offCanvas.style.opacity = '0.01';
  offCanvas.style.pointerEvents = 'none';
  offCanvas.style.zIndex = '-100';
  document.body.appendChild(offCanvas);

  const ctx = offCanvas.getContext('2d', { alpha: false });
  if (!ctx) {
    if (offCanvas.parentNode) offCanvas.parentNode.removeChild(offCanvas);
    throw new Error('Canvas 2D context not available');
  }

  const renderer: ExportTimelineRenderer = options.renderer ??
    (config.activeProject === 'mind-traps'
      ? new MindTrapsRenderer()
      : config.activeProject === 'arcade-claw'
      ? new ArcadeClawRenderer()
      : config.activeProject === 'diamond-heist'
      ? new DiamondHeistRenderer()
      : config.activeProject === 'pancake-flip'
      ? new PancakeFlipRenderer()
      : config.activeProject === 'vending-machine'
      ? new VendingMachineRenderer()
      : config.activeProject === 'biggest-balloon'
      ? new BiggestBalloonRenderer()
      : config.activeProject === 'find-the-ball'
      ? new FindTheBallRenderer()
      : config.activeProject === 'attempt-247'
      ? new Attempt247Renderer()
      : config.activeProject === 'needle-thread'
      ? new NeedleThreadRenderer()
      : config.activeProject === 'magnet-trick'
      ? new MagnetTrickRenderer()
      : config.activeProject === 'ring-shot'
      ? new RingShotRenderer()
      : config.activeProject === 'pencil-landing'
      ? new PencilLandingRenderer()
      : config.activeProject === 'domino-trickshot'
      ? new DominoTrickshotRenderer()
      : config.activeProject === 'balloon-pop-jackpot'
      ? new BalloonPopJackpotRenderer()
      : config.activeProject === 'candy-claw'
      ? new CandyClawRenderer()
      : config.activeProject === 'plate-spin'
      ? new PlateSpinRenderer()
      : config.activeProject === 'three-wall-ping-pong'
      ? new ThreeWallPingPongRenderer()
      : config.activeProject === 'cup-in-cup'
      ? new CupInCupRenderer()
      : config.activeProject === 'coin-flip'
      ? new CoinFlipRenderer()
      : config.activeProject === 'dart-shot'
      ? new DartShotRenderer()
      : config.activeProject === 'ping-pong-revenge'
      ? new PingPongRenderer()
      : config.activeProject === 'trick-shot-champion'
      ? new TrickShotRenderer()
      : config.activeProject === 'pop-star'
      ? new PopStageRenderer()
      : config.activeProject === 'paper-ball-part4'
      ? new MachineRenderer()
      : config.activeProject === 'paper-ball-part3'
      ? new HoopRenderer()
      : config.activeProject === 'paper-ball-sequel'
      ? new SequelPaperBallRenderer()
      : config.activeProject === 'paper-ball-30'
      ? new ExtendedPaperBallRenderer()
      : config.activeProject === 'paper-ball'
      ? new PaperBallRenderer()
      : new CanvasRenderer());

  // The timeline runs on its own clock, so the renderer has to run its clips
  // as well. A clip renderer that keeps its videos paused would seek the
  // video on every frame, and that is what makes an export crawl.
  renderer.setPlayback?.(true);

  const filePrefix =
    options.filePrefix ??
    (config.activeProject === 'mind-traps'
      ? 'mind-traps'
      : config.activeProject === 'shadow-quit'
      ? 'shadow-quit'
      : config.activeProject === 'arcade-claw'
      ? 'arcade-claw'
      : config.activeProject === 'diamond-heist'
      ? 'diamond-heist'
      : config.activeProject === 'pancake-flip'
      ? 'pancake-flip'
      : config.activeProject === 'vending-machine'
      ? 'vending-machine'
      : config.activeProject === 'biggest-balloon'
      ? 'biggest-balloon'
      : config.activeProject === 'find-the-ball'
      ? 'find-the-ball'
      : config.activeProject === 'attempt-247'
      ? 'attempt-247'
      : config.activeProject === 'needle-thread'
      ? 'needle-thread'
      : config.activeProject === 'magnet-trick'
      ? 'magnet-trick'
      : config.activeProject === 'ring-shot'
      ? 'ring-shot'
      : config.activeProject === 'pencil-landing'
      ? 'pencil-landing'
      : config.activeProject === 'domino-trickshot'
      ? 'domino-trickshot'
      : config.activeProject === 'balloon-pop-jackpot'
      ? 'balloon-pop-jackpot'
      : config.activeProject === 'candy-claw'
      ? 'candy-claw'
      : config.activeProject === 'plate-spin'
      ? 'plate-spin'
      : config.activeProject === 'three-wall-ping-pong'
      ? 'three-wall-ping-pong'
      : config.activeProject === 'cup-in-cup'
      ? 'cup-in-cup'
      : config.activeProject === 'coin-flip'
      ? 'coin-flip'
      : config.activeProject === 'dart-shot'
      ? 'dart-shot'
      : config.activeProject === 'ping-pong-revenge'
      ? 'ping-pong-revenge'
      : config.activeProject === 'trick-shot-champion'
      ? 'trick-shot-champion'
      : config.activeProject === 'pop-star'
      ? 'max-rex-beep'
      : config.activeProject === 'paper-ball-part4'
      ? 'paper-ball-part4'
      : config.activeProject === 'paper-ball-part3'
      ? 'paper-ball-part3'
      : config.activeProject === 'paper-ball-sequel'
      ? 'paper-ball-ricochet-ep2'
      : 'paper-ball-ricochet');
  const speedLabel = exportSpeed !== 1.0 ? `-${exportSpeed}x` : '';
  const durationTag =
    Math.abs(totalDuration - 10.0) < 0.05
      ? ''
      : `-${Number(totalDuration.toFixed(1))}s`;
  const fpsTag = fps !== 24 ? `-${fps}fps` : '';

  // 1. Capture video stream from canvas at the requested output frame rate.
  // Frames are pulled explicitly with requestFrame() from a fixed-interval
  // timer (see the loop below) so the recorded file keeps an even spacing.
  const captureStream = (
    offCanvas as unknown as { captureStream?: (fps: number) => MediaStream }
  ).captureStream;
  if (typeof captureStream !== 'function' || typeof MediaRecorder === 'undefined') {
    offCanvas.remove();
    throw new Error(
      'This browser cannot record canvas video. Try a current version of Chrome, Edge, Firefox, or Safari.'
    );
  }
  let canvasStream = captureStream.call(offCanvas, fps);
  let videoTrack = canvasStream.getVideoTracks()[0];
  const manualCapture =
    !!videoTrack &&
    typeof (videoTrack as unknown as { requestFrame?: () => void }).requestFrame === 'function';

  if (manualCapture) {
    // Manual capture: the track only emits a frame when we ask for one, so
    // the recorded pacing is decided by our scheduler and not by however the
    // browser happens to run its animation frames.
    videoTrack.stop();
    canvasStream = captureStream.call(offCanvas, 0);
    videoTrack = canvasStream.getVideoTracks()[0];
  }

  const tracks: MediaStreamTrack[] = videoTrack ? [videoTrack] : [];

  // 2. Setup Web Audio MediaStreamDestination to embed synchronized audio
  let audioCtx = soundEngine.getContext();
  let audioDestination: MediaStreamAudioDestinationNode | null = null;
  let silentCarrier: OscillatorNode | AudioScheduledSourceNode | null = null;
  let silentGain: GainNode | null = null;
  let recordedWithAudio = false;

  if (audioCtx) {
    try {
      // The state is read through a helper: the context can change state
      // while the resume is pending, and the narrowed type would hide that.
      const audioState = () => audioCtx?.state ?? 'closed';
      if (audioState() === 'suspended') {
        // A suspended context only starts after a real user gesture, and
        // `resume()` stays pending for as long as the browser's autoplay
        // policy blocks it. Awaiting it would leave the export sitting at 0%
        // with no error at all, so the resume is raced against a short
        // timeout and the file is exported without sound instead.
        const started = await Promise.race([
          audioCtx.resume().then(() => true).catch(() => false),
          new Promise<boolean>((resolve) => {
            window.setTimeout(() => resolve(false), 1500);
          }),
        ]);
        if (!started && audioState() !== 'running') {
          console.warn('[export] the audio context did not start - exporting without sound');
          audioCtx = null;
        }
      }
    } catch (e) {
      console.warn('Could not resume the audio context:', e);
      audioCtx = null;
    }
  }

  if (audioCtx) {
    try {
      audioDestination = audioCtx.createMediaStreamDestination();
      const audioTracks = audioDestination.stream.getAudioTracks();
      if (audioTracks.length > 0) {
        tracks.push(audioTracks[0]);
        recordedWithAudio = true;
      }

      // Continuous silent audio carrier so audio packets start immediately at t = 0.000s
      silentGain = audioCtx.createGain();
      silentGain.gain.value = 0.00001; // virtually silent, prevents audio stream startup delay
      const ctxWithConst = audioCtx as unknown as { createConstantSource?: () => AudioScheduledSourceNode & { offset: AudioParam } };
      if (typeof ctxWithConst.createConstantSource === 'function') {
        const constSrc = ctxWithConst.createConstantSource();
        constSrc.offset.value = 0;
        constSrc.connect(silentGain);
        silentGain.connect(audioDestination);
        constSrc.start();
        silentCarrier = constSrc;
      } else {
        const osc = audioCtx.createOscillator();
        osc.frequency.value = 440;
        osc.connect(silentGain);
        silentGain.connect(audioDestination);
        osc.start();
        silentCarrier = osc;
      }
    } catch (e) {
      console.warn('Could not initialize audio stream destination:', e);
    }
  }

  const combinedStream = new MediaStream(tracks);

  // Detect supported format based on user preference
  const mp4Candidates = [
    'video/mp4;codecs=avc1,mp4a.40.2',
    'video/mp4;codecs=avc1',
    'video/mp4',
  ];
  const webmCandidates = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ];

  if (format === 'mp4' && !requestedMp4) {
    console.warn(
      'MP4 recording with this synthesized audio track is not reliable in this browser; exporting WebM instead.'
    );
  }

  let selectedMime = '';
  const searchCandidates = requestedMp4
    ? [...mp4Candidates, ...webmCandidates]
    : [...webmCandidates, ...mp4Candidates];

  for (const mime of searchCandidates) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(mime)) {
      selectedMime = mime;
      break;
    }
  }

  const chunks: Blob[] = [];
  const recorder = new MediaRecorder(
    combinedStream,
    selectedMime ? { mimeType: selectedMime, audioBitsPerSecond: 128000 } : undefined
  );

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  const recordingFinished = new Promise<Blob>((resolve, reject) => {
    recorder.onstop = () => {
      const isMp4Actual = selectedMime.includes('mp4');
      const ext = isMp4Actual ? 'mp4' : 'webm';
      const blob = new Blob(chunks, { type: selectedMime || `video/${ext}` });
      resolve(blob);
    };
    recorder.onerror = () => {
      reject(new Error('MediaRecorder stopped with an error while capturing the video.'));
    };
  });

  const triggeredCues = new Set<string>();
  let currentLoop = 0;

  // Pre-render initial frame t=0
  renderer.render(ctx, 0.0, exportConfig);

  if (previewCanvas) {
    const pCtx = previewCanvas.getContext('2d');
    if (pCtx) {
      pCtx.drawImage(offCanvas, 0, 0, previewCanvas.width, previewCanvas.height);
    }
  }

  // Start recorder with 100ms chunk intervals
  recorder.start(100);
  const wallStart = performance.now();

  // ---------------------------------------------------------------------
  // Frame pacing
  // ---------------------------------------------------------------------
  // MediaRecorder stamps every frame with the wall clock, so a page that
  // stalls (or a tab the browser throttles in the background) turns into a
  // frozen download: the picture holds still while the audio keeps playing.
  // The AudioContext clock keeps running even when timers and rAF are
  // throttled, so it drives both the capture schedule and the animation time.
  const useAudioClock = !!audioCtx && audioCtx.state === 'running';
  const clockStart = useAudioClock ? audioCtx!.currentTime : 0;
  const elapsedSeconds = () =>
    useAudioClock
      ? audioCtx!.currentTime - clockStart
      : (performance.now() - wallStart) / 1000;

  /**
   * Schedules `onTick` every `intervalSec`. Uses the audio clock when it is
   * available so the cadence survives background-tab throttling, with a
   * watchdog timer as a safety net.
   */
  const createPacer = (intervalSec: number, onTick: () => void) => {
    let stopped = false;
    let lastTick = performance.now();

    const fire = () => {
      if (stopped) return;
      lastTick = performance.now();
      onTick();
    };

    // Watchdog: keeps the recording moving even if the audio callback stops
    // arriving (for example if the context is suspended mid-export).
    let watchdog = 0;
    const startWatchdog = () => {
      watchdog = window.setInterval(() => {
        if (!stopped && performance.now() - lastTick > intervalSec * 1000 * 2) {
          fire();
        }
      }, 200);
    };

    if (useAudioClock) {
      const ctx = audioCtx!;
      const silent = ctx.createGain();
      silent.gain.value = 0;
      silent.connect(ctx.destination);
      const blip = ctx.createBuffer(
        1,
        Math.max(1, Math.ceil(intervalSec * ctx.sampleRate)),
        ctx.sampleRate
      );
      const tick = () => {
        if (stopped) return;
        const src = ctx.createBufferSource();
        src.buffer = blip;
        src.connect(silent);
        src.onended = () => {
          try {
            src.disconnect();
          } catch {}
          if (!stopped) {
            fire();
            tick();
          }
        };
        const now = ctx.currentTime;
        src.start(now);
        src.stop(now + intervalSec);
      };
      tick();
      startWatchdog();
      return () => {
        stopped = true;
        window.clearInterval(watchdog);
        try {
          silent.disconnect();
        } catch {}
      };
    }

    let timer = 0;
    const tick = () => {
      if (stopped) return;
      fire();
      timer = window.setTimeout(tick, intervalSec * 1000);
    };
    tick();
    startWatchdog();
    return () => {
      stopped = true;
      window.clearTimeout(timer);
      window.clearInterval(watchdog);
    };
  };

  // Draw the opening frame and pull it into the track so the video starts at 0.0s.
  renderer.render(ctx, 0.0, exportConfig);
  if (manualCapture && videoTrack) {
    (videoTrack as unknown as { requestFrame: () => void }).requestFrame();
  }

  const frameInterval = 1 / fps;
  let stopPacer = () => {};
  let rafId = 0;

  await new Promise<void>((resolve) => {
    // One capture per fixed slot, whichever driver gets there first. rAF keeps
    // the foreground on an exact 24/30/60 grid; the audio-clock pacer and its
    // watchdog keep the picture moving once a throttled tab stops painting.
    const slotMs = frameInterval * 1000;
    let nextSlotMs = performance.now() + slotMs;

    const step = () => {
      const nowMs = performance.now();
      if (nowMs < nextSlotMs) return;
      nextSlotMs += slotMs;
      if (nowMs - nextSlotMs > slotMs * 2) nextSlotMs = nowMs + slotMs;

      const elapsed = elapsedSeconds();
      const wallClockT = Math.min(totalDuration, elapsed);

      // Animation time advances according to exportSpeed and wraps each loop.
      let totalAnimationTime = wallClockT * exportSpeed;
      // The final capture can land a hair past the end; pin it to the last
      // frame instead of wrapping around to frame 0 for a one-frame flash.
      if (elapsed >= totalDuration) {
        totalAnimationTime = Math.max(0, totalAnimationTime - 0.0001);
      }
      const loopIndex = Math.floor(totalAnimationTime / animationDuration);
      const animT = totalAnimationTime % animationDuration;
      if (loopIndex !== currentLoop) {
        triggeredCues.clear();
        currentLoop = loopIndex;
      }

      // Draw the exact moment of the timeline for this frame. Sampling the
      // continuous clock (instead of snapping to the frame grid) guarantees
      // every captured frame is unique, so no frame is ever held still.
      const renderT = Math.min(animT, animationDuration - 1 / fps);
      renderer.render(ctx, renderT, exportConfig);

      if (manualCapture && videoTrack) {
        (videoTrack as unknown as { requestFrame: () => void }).requestFrame();
      }

      // Mirror to active preview canvas if available
      if (previewCanvas) {
        const pCtx = previewCanvas.getContext('2d');
        if (pCtx) {
          pCtx.drawImage(offCanvas, 0, 0, previewCanvas.width, previewCanvas.height);
        }
      }

      // Synchronized audio triggers
      if (audioDestination) {
        const dest = audioDestination;

        if (options.narration && options.narration.length > 0) {
          for (const line of options.narration) {
            if (animT >= line.time && !triggeredCues.has(`vo-${line.time}`)) {
              soundEngine.playSpokenText(line.text, dest);
              triggeredCues.add(`vo-${line.time}`);
            }
          }
        } else if (config.activeProject === 'paper-ball-30') {
          if (config.enableSFX) {
            for (const cue of PAPER_BALL_30_CUES) {
              if (animT >= cue.time && !triggeredCues.has(cue.id)) {
                cue.play(dest);
                triggeredCues.add(cue.id);
              }
            }
          }
        } else if (config.activeProject === 'paper-ball-sequel') {
          if (config.enableSFX) {
            for (const cue of PAPER_BALL_SEQUEL_CUES) {
              if (animT >= cue.time && !triggeredCues.has(cue.id)) {
                cue.play(dest);
                triggeredCues.add(cue.id);
              }
            }
          }
        } else if (config.activeProject === 'paper-ball-part3') {
          if (config.enableSFX) {
            for (const cue of PAPER_BALL_PART3_CUES) {
              if (animT >= cue.time && !triggeredCues.has(cue.id)) {
                cue.play(dest);
                triggeredCues.add(cue.id);
              }
            }
          }
        } else if (config.activeProject === 'paper-ball-part4') {
          if (config.enableSFX) {
            for (const cue of PAPER_BALL_PART4_CUES) {
              if (animT >= cue.time && !triggeredCues.has(cue.id)) {
                cue.play(dest);
                triggeredCues.add(cue.id);
              }
            }
          }
        } else if (config.activeProject === 'pop-star') {
          if (config.enableSFX) {
            for (const cue of POP_STAR_CUES) {
              if (animT >= cue.time && !triggeredCues.has(cue.id)) {
                cue.play(dest);
                triggeredCues.add(cue.id);
              }
            }
          }
        } else if (config.activeProject === 'trick-shot-champion') {
          if (config.enableSFX) {
            for (const cue of TRICK_SHOT_CUES) {
              if (animT >= cue.time && !triggeredCues.has(cue.id)) {
                cue.play(dest);
                triggeredCues.add(cue.id);
              }
            }
          }
        } else if (config.activeProject === 'ping-pong-revenge') {
          if (config.enableSFX) {
            for (const cue of PING_PONG_CUES) {
              if (animT >= cue.time && !triggeredCues.has(cue.id)) {
                cue.play(dest);
                triggeredCues.add(cue.id);
              }
            }
          }
        } else if (config.activeProject === 'dart-shot') {
          if (config.enableSFX) {
            for (const cue of DART_SHOT_CUES) {
              if (animT >= cue.time && !triggeredCues.has(cue.id)) {
                cue.play(dest);
                triggeredCues.add(cue.id);
              }
            }
          }
        } else if (config.activeProject === 'mind-traps') {
          if (config.enableSFX) {
            for (const cue of MIND_TRAPS_CUES) {
              if (animT >= cue.time && !triggeredCues.has(cue.id)) {
                cue.play(dest);
                triggeredCues.add(cue.id);
              }
            }
          }
        } else if (config.activeProject === 'coin-flip') {
          if (config.enableSFX) {
            for (const cue of COIN_FLIP_CUES) {
              if (animT >= cue.time && !triggeredCues.has(cue.id)) {
                cue.play(dest);
                triggeredCues.add(cue.id);
              }
            }
          }
        } else if (config.activeProject === 'diamond-heist') {
          if (config.enableSFX) {
            // The four dh-score-* cues each schedule one 7.5s slice of the
            // sneaky score; every other cue is a one-shot on its beat.
            for (const cue of DIAMOND_HEIST_CUES) {
              if (animT >= cue.time && !triggeredCues.has(cue.id)) {
                cue.play(dest);
                triggeredCues.add(cue.id);
              }
            }
          }
        } else if (config.activeProject === 'pancake-flip') {
          if (config.enableSFX) {
            // The four pf-score-* cues each schedule one 7.5s slice of the
            // bouncy score; every other cue is a one-shot on its beat.
            for (const cue of PANCAKE_FLIP_CUES) {
              if (animT >= cue.time && !triggeredCues.has(cue.id)) {
                cue.play(dest);
                triggeredCues.add(cue.id);
              }
            }
          }
        } else if (config.activeProject === 'vending-machine') {
          if (config.enableSFX) {
            // The four vm-score-* cues each schedule one 7.5s slice of the
            // bouncy score; every other cue is a one-shot on its beat.
            for (const cue of VENDING_MACHINE_CUES) {
              if (animT >= cue.time && !triggeredCues.has(cue.id)) {
                cue.play(dest);
                triggeredCues.add(cue.id);
              }
            }
          }
        } else if (config.activeProject === 'biggest-balloon') {
          if (config.enableSFX) {
            // The four bb-score-* cues each schedule one 7.5s slice of the
            // bouncy score; every other cue is a one-shot on its beat.
            for (const cue of BIGGEST_BALLOON_CUES) {
              if (animT >= cue.time && !triggeredCues.has(cue.id)) {
                cue.play(dest);
                triggeredCues.add(cue.id);
              }
            }
          }
        } else if (config.activeProject === 'find-the-ball') {
          if (config.enableSFX) {
            // The four fb-score-* cues each schedule one 7.5s slice of the
            // magic-show score; every other cue is a one-shot on its beat.
            for (const cue of FIND_THE_BALL_CUES) {
              if (animT >= cue.time && !triggeredCues.has(cue.id)) {
                cue.play(dest);
                triggeredCues.add(cue.id);
              }
            }
          }
        } else if (config.activeProject === 'attempt-247') {
          if (config.enableSFX) {
            // The four a247-score-* cues each schedule one 7.5s slice of the
            // sports score; every other cue is a one-shot on its beat.
            for (const cue of ATTEMPT_247_CUES) {
              if (animT >= cue.time && !triggeredCues.has(cue.id)) {
                cue.play(dest);
                triggeredCues.add(cue.id);
              }
            }
          }
        } else if (config.activeProject === 'needle-thread') {
          if (config.enableSFX) {
            // The four nt-score-* cues each schedule one 7.5s slice of the
            // sewing-championship score; every other cue is a one-shot.
            for (const cue of NEEDLE_THREAD_CUES) {
              if (animT >= cue.time && !triggeredCues.has(cue.id)) {
                cue.play(dest);
                triggeredCues.add(cue.id);
              }
            }
          }
        } else if (config.activeProject === 'magnet-trick') {
          if (config.enableSFX) {
            for (const cue of MAGNET_TRICK_CUES) {
              if (animT >= cue.time && !triggeredCues.has(cue.id)) {
                cue.play(dest);
                triggeredCues.add(cue.id);
              }
            }
          }
        } else if (config.activeProject === 'ring-shot') {
          if (config.enableSFX) {
            // The four rs-score-* cues each schedule one 7.5s slice of the
            // sports score; every other cue is a one-shot on its beat.
            for (const cue of RING_SHOT_CUES) {
              if (animT >= cue.time && !triggeredCues.has(cue.id)) {
                cue.play(dest);
                triggeredCues.add(cue.id);
              }
            }
          }
        } else if (config.activeProject === 'pencil-landing') {
          if (config.enableSFX) {
            // The four pl-score-* cues each schedule one 7.5s slice of the
            // Modern Pop score; every other cue is a one-shot on its beat.
            for (const cue of PENCIL_LANDING_CUES) {
              if (animT >= cue.time && !triggeredCues.has(cue.id)) {
                cue.play(dest);
                triggeredCues.add(cue.id);
              }
            }
          }
        } else if (config.activeProject === 'arcade-claw') {
          if (config.enableSFX) {
            // The four ac-score-* cues each schedule one 7.5s slice of the
            // chiptune; every other cue is a one-shot on its beat.
            for (const cue of ARCADE_CLAW_CUES) {
              if (animT >= cue.time && !triggeredCues.has(cue.id)) {
                cue.play(dest);
                triggeredCues.add(cue.id);
              }
            }
          }
        } else if (config.activeProject === 'domino-trickshot') {
          if (config.enableSFX) {
            // The four dt-score-* cues each schedule one 7.5s slice of the
            // bouncy score; every other cue is a one-shot on its beat.
            for (const cue of DOMINO_TRICKSHOT_CUES) {
              if (animT >= cue.time && !triggeredCues.has(cue.id)) {
                cue.play(dest);
                triggeredCues.add(cue.id);
              }
            }
          }
        } else if (config.activeProject === 'balloon-pop-jackpot') {
          if (config.enableSFX) {
            // The four bp-score-* cues each schedule one 7.5s slice of the
            // carnival score; every other cue is a one-shot on its beat.
            for (const cue of BALLOON_POP_JACKPOT_CUES) {
              if (animT >= cue.time && !triggeredCues.has(cue.id)) {
                cue.play(dest);
                triggeredCues.add(cue.id);
              }
            }
          }
        } else if (config.activeProject === 'candy-claw') {
          if (config.enableSFX) {
            // The four cc-score-* cues each schedule one 7.5s slice of the
            // carnival score; every other cue is a one-shot on its beat.
            for (const cue of CANDY_CLAW_CUES) {
              if (animT >= cue.time && !triggeredCues.has(cue.id)) {
                cue.play(dest);
                triggeredCues.add(cue.id);
              }
            }
          }
        } else if (config.activeProject === 'plate-spin') {
          if (config.enableSFX) {
            // The four ps-score-* cues each schedule one 7.5s slice of the
            // circus score; every other cue is a one-shot on its beat.
            for (const cue of PLATE_SPIN_CUES) {
              if (animT >= cue.time && !triggeredCues.has(cue.id)) {
                cue.play(dest);
                triggeredCues.add(cue.id);
              }
            }
          }
        } else if (config.activeProject === 'three-wall-ping-pong') {
          if (config.enableSFX) {
            // The four twpp-score-* cues each schedule one 7.5s slice of the
            // playful score; every other cue is a one-shot on its beat.
            for (const cue of THREE_WALL_PING_PONG_CUES) {
              if (animT >= cue.time && !triggeredCues.has(cue.id)) {
                cue.play(dest);
                triggeredCues.add(cue.id);
              }
            }
          }
        } else if (config.activeProject === 'cup-in-cup') {
          if (config.enableSFX) {
            // The four cic-score-* cues each schedule one 7.5s slice of the
            // playful score; every other cue is a one-shot on its beat.
            for (const cue of CUP_IN_CUP_CUES) {
              if (animT >= cue.time && !triggeredCues.has(cue.id)) {
                cue.play(dest);
                triggeredCues.add(cue.id);
              }
            }
          }
        } else if (config.activeProject === 'paper-ball') {
          if (config.enableSFX) {
            if (animT >= 2.0 && !triggeredCues.has('toss')) {
              soundEngine.playWhoosh(dest);
              triggeredCues.add('toss');
            }
            if (animT >= 4.4 && !triggeredCues.has('rim')) {
              soundEngine.playRimClink(dest);
              triggeredCues.add('rim');
            }
            if (animT >= 6.0 && !triggeredCues.has('lamp')) {
              soundEngine.playLampDing(dest);
              triggeredCues.add('lamp');
            }
            if (animT >= 7.5 && !triggeredCues.has('fan')) {
              soundEngine.playFanWhack(dest);
              triggeredCues.add('fan');
            }
            if (animT >= 8.6 && !triggeredCues.has('wall')) {
              soundEngine.playWallBounce(dest);
              triggeredCues.add('wall');
            }
            if (animT >= 9.4 && !triggeredCues.has('bonk')) {
              soundEngine.playHeadBonk(dest);
              triggeredCues.add('bonk');
            }
            if (animT >= 9.6 && !triggeredCues.has('plop')) {
              soundEngine.playDeskPlop(dest);
              triggeredCues.add('plop');
            }
          }
        } else {
          // Shadow Quit audio cues
          if (config.enableVoiceOver) {
            if (animT >= 0.1 && !triggeredCues.has('vo1')) {
              soundEngine.playSynthesizedVoice(config.customVO1, dest);
              triggeredCues.add('vo1');
            }
            if (animT >= 8.0 && !triggeredCues.has('vo2')) {
              soundEngine.playSynthesizedVoice(config.customVO2, dest);
              triggeredCues.add('vo2');
            }
          }

          if (config.enableSFX) {
            if (animT >= 0.4 && !triggeredCues.has('step1')) {
              soundEngine.playFootstep(false, dest);
              triggeredCues.add('step1');
            }
            if (animT >= 0.8 && !triggeredCues.has('step2')) {
              soundEngine.playFootstep(false, dest);
              triggeredCues.add('step2');
            }
            if (animT >= 1.2 && !triggeredCues.has('skip')) {
              soundEngine.playFootstep(true, dest);
              triggeredCues.add('skip');
            }
            if (animT >= 2.0 && !triggeredCues.has('scratch')) {
              soundEngine.playRecordScratch(dest);
              triggeredCues.add('scratch');
            }
            if (animT >= 4.5 && !triggeredCues.has('paper')) {
              soundEngine.playPaperSlap(dest);
              triggeredCues.add('paper');
            }
            if (animT >= 5.05 && !triggeredCues.has('tap1')) {
              soundEngine.playClipboardTap(dest);
              triggeredCues.add('tap1');
            }
            if (animT >= 5.25 && !triggeredCues.has('tap2')) {
              soundEngine.playClipboardTap(dest);
              triggeredCues.add('tap2');
            }
            if (animT >= 6.1 && !triggeredCues.has('thump')) {
              soundEngine.playFloorThump(dest);
              triggeredCues.add('thump');
            }
            if (animT >= 6.3 && !triggeredCues.has('squeak')) {
              soundEngine.playArmCrossSqueak(dest);
              triggeredCues.add('squeak');
            }
            if (animT >= 8.0 && !triggeredCues.has('trombone')) {
              soundEngine.playSadTrombone(dest);
              triggeredCues.add('trombone');
            }
          }
        }
      }

      if (onProgress) {
        const percent = Math.min(100, Math.round((wallClockT / totalDuration) * 100));
        onProgress(percent, wallClockT, totalDuration);
      }

      if (elapsed < totalDuration) {
        // The drivers call step again on the next slot.
      } else {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = 0;
        resolve();
      }
    };

    stopPacer = createPacer(frameInterval, step);
    const rafLoop = () => {
      rafId = requestAnimationFrame(rafLoop);
      step();
    };
    rafId = requestAnimationFrame(rafLoop);
  });

  stopPacer();
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = 0;
  }

  // Final local-loop pose for the preview/fallback capture. Manual capture
  // stops at the last output frame so no frame is added past the selected
  // video length.
  renderer.render(ctx, animationDuration, exportConfig);
  if (onProgress) {
    onProgress(100, totalDuration, totalDuration);
  }

  // Allow audio trailing decay
  await new Promise((r) => setTimeout(r, 200));

  // Stop silent carrier
  if (silentCarrier) {
    try {
      (silentCarrier as unknown as { stop: () => void }).stop?.();
      silentCarrier.disconnect();
    } catch (_) {}
  }
  if (silentGain) {
    try {
      silentGain.disconnect();
    } catch (_) {}
  }

  recorder.stop();
  const rawVideoBlob = await recordingFinished;

  const isMp4 = selectedMime.includes('mp4');

  try {
    if (rawVideoBlob.size < 50_000) {
      throw new Error(
        'The browser produced an incomplete recording. Try exporting again with the WebM format.'
      );
    }

    let finalBlob = rawVideoBlob;

    // If WebM, patch the EBML header with exact Duration and the selected
    // frame rate's DefaultDuration.
    if (!isMp4) {
      finalBlob = await fixWebmDuration(rawVideoBlob, totalDuration * 1000, fps);
    }

    const extension = isMp4 ? 'mp4' : 'webm';
    const filename = `${filePrefix}${durationTag}${speedLabel}${fpsTag}-1080x1920.${extension}`;
    const url = URL.createObjectURL(finalBlob);

    return {
      blob: finalBlob,
      url,
      filename,
      format: isMp4 ? 'mp4' : 'webm',
      duration: totalDuration,
      fps,
      silent: !recordedWithAudio,
    };
  } finally {
    // The clips only ran for the export; the preview takes over again.
    renderer.setPlayback?.(false);
    offCanvas.remove();
  }
}
