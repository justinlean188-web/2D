import { CanvasRenderer } from '../animation/canvasRenderer';
import { PaperBallRenderer } from '../animation/paperBallRenderer';
import { soundEngine } from '../audio/soundEngine';
import { StudioConfig } from '../types';
import { fixWebmDuration } from './fixWebmDuration';

export interface ExportOptions {
  config: StudioConfig;
  exportSpeed?: number; // 1.0 = normal, 0.75 = relaxed, 0.5 = slow-mo
  format?: 'mp4' | 'webm';
  previewCanvas?: HTMLCanvasElement | null;
  onProgress?: (progress: number, currentSec: number, totalSec: number) => void;
}

export interface ExportResult {
  blob: Blob;
  url: string;
  filename: string;
  format: 'mp4' | 'webm';
  duration: number;
}

/**
 * Renders the 2D stickman animation frame-by-frame with synchronized cartoon audio
 * into a downloadable high-resolution video file.
 *
 * Guarantees exact playback speed, proper duration metadata, 24fps track headers,
 * and continuous crystal-clear audio from 0.00s.
 */
export async function exportVideo(options: ExportOptions): Promise<ExportResult> {
  const { config, exportSpeed = 1.0, format = 'mp4', previewCanvas, onProgress } = options;

  const width = 1080;
  const height = 1920;
  const fps = 24;
  const animationDuration = 10.0; // 10.0 seconds of animation
  const totalDuration = animationDuration / exportSpeed; // e.g. 10s at 1.0x, 20s at 0.5x

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

  const renderer =
    config.activeProject === 'paper-ball'
      ? new PaperBallRenderer()
      : new CanvasRenderer();

  const filePrefix =
    config.activeProject === 'paper-ball' ? 'paper-ball-ricochet' : 'shadow-quit';
  const speedLabel = exportSpeed !== 1.0 ? `-${exportSpeed}x` : '';

  // 1. Capture video stream from canvas at 24fps
  const canvasStream = (
    offCanvas as unknown as { captureStream: (fps: number) => MediaStream }
  ).captureStream(fps);

  const videoTrack = canvasStream.getVideoTracks()[0];
  const tracks: MediaStreamTrack[] = videoTrack ? [videoTrack] : [];

  // 2. Setup Web Audio MediaStreamDestination to embed synchronized audio
  const audioCtx = soundEngine.getContext();
  let audioDestination: MediaStreamAudioDestinationNode | null = null;
  let silentCarrier: OscillatorNode | AudioScheduledSourceNode | null = null;
  let silentGain: GainNode | null = null;

  if (audioCtx) {
    try {
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      audioDestination = audioCtx.createMediaStreamDestination();
      const audioTracks = audioDestination.stream.getAudioTracks();
      if (audioTracks.length > 0) {
        tracks.push(audioTracks[0]);
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

  let selectedMime = '';
  const searchCandidates =
    format === 'mp4'
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

  const recordingFinished = new Promise<Blob>((resolve) => {
    recorder.onstop = () => {
      const isMp4Actual = selectedMime.includes('mp4');
      const ext = isMp4Actual ? 'mp4' : 'webm';
      const blob = new Blob(chunks, { type: selectedMime || `video/${ext}` });
      resolve(blob);
    };
  });

  const triggeredCues = new Set<string>();

  // Pre-render initial frame t=0
  renderer.render(ctx, 0.0, config);

  if (previewCanvas) {
    const pCtx = previewCanvas.getContext('2d');
    if (pCtx) {
      pCtx.drawImage(offCanvas, 0, 0, previewCanvas.width, previewCanvas.height);
    }
  }

  // Start recorder with 100ms chunk intervals
  recorder.start(100);

  const startTime = performance.now();

  await new Promise<void>((resolve) => {
    const step = () => {
      const now = performance.now();
      const elapsedWallClock = (now - startTime) / 1000;
      const wallClockT = Math.min(totalDuration, elapsedWallClock);

      // Animation time advances according to exportSpeed
      const animT = Math.min(animationDuration, wallClockT * exportSpeed);

      // Quantize to 24fps frames
      const renderT = Math.floor(animT * fps) / fps;
      renderer.render(ctx, renderT, config);

      // Trigger video track frame capture if supported
      if (videoTrack && 'requestFrame' in videoTrack) {
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

        if (config.activeProject === 'paper-ball') {
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

      if (elapsedWallClock < totalDuration) {
        requestAnimationFrame(step);
      } else {
        resolve();
      }
    };

    requestAnimationFrame(step);
  });

  // Final 10.0s frame render
  renderer.render(ctx, 10.0, config);
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

  let finalBlob = rawVideoBlob;
  const isMp4 = selectedMime.includes('mp4');

  // If WebM, patch the EBML header with exact Duration and 24fps DefaultDuration
  if (!isMp4) {
    finalBlob = await fixWebmDuration(rawVideoBlob, totalDuration * 1000, fps);
  }

  // Cleanup offCanvas
  if (offCanvas.parentNode) {
    offCanvas.parentNode.removeChild(offCanvas);
  }

  const extension = isMp4 ? 'mp4' : 'webm';
  const filename = `${filePrefix}${speedLabel}-1080x1920.${extension}`;
  const url = URL.createObjectURL(finalBlob);

  return {
    blob: finalBlob,
    url,
    filename,
    format: isMp4 ? 'mp4' : 'webm',
    duration: totalDuration,
  };
}
