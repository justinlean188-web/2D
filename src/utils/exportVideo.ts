import { CanvasRenderer } from '../animation/canvasRenderer';
import { StudioConfig } from '../types';

/**
 * Renders the 10-second animation frame by frame (24fps = 240 frames)
 * and records it into a downloadable WebM video file.
 */
export async function exportVideo(
  config: StudioConfig,
  onProgress?: (progress: number) => void
): Promise<void> {
  const width = 1080;
  const height = 1920;
  const fps = 24;
  const totalFrames = 240; // 10 seconds * 24 fps

  const offCanvas = document.createElement('canvas');
  offCanvas.width = width;
  offCanvas.height = height;
  const ctx = offCanvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  const renderer = new CanvasRenderer();

  // Check if MediaRecorder is supported
  if (typeof MediaRecorder === 'undefined' || typeof (offCanvas as unknown as { captureStream?: (fps: number) => MediaStream }).captureStream !== 'function') {
    // Fallback: Download high-resolution PNG snapshot of final punchline frame
    renderer.render(ctx, 8.5, config);
    const link = document.createElement('a');
    link.download = 'shadow-quit-punchline-1080x1920.png';
    link.href = offCanvas.toDataURL('image/png');
    link.click();
    return;
  }

  const stream = (offCanvas as unknown as { captureStream: (fps: number) => MediaStream }).captureStream(fps);

  let mimeType = 'video/webm;codecs=vp9';
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = '';
    }
  }

  const chunks: Blob[] = [];
  const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  const recordingFinished = new Promise<Blob>((resolve) => {
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType || 'video/webm' });
      resolve(blob);
    };
  });

  recorder.start();

  // Render each frame with accurate time step
  for (let f = 0; f < totalFrames; f++) {
    const t = f / fps;
    renderer.render(ctx, t, config);

    if (onProgress) {
      onProgress(Math.round((f / totalFrames) * 100));
    }

    // Yield a fraction of a millisecond to allow stream buffer capture
    await new Promise((r) => setTimeout(r, 1000 / fps));
  }

  // Final frame render
  renderer.render(ctx, 10.0, config);
  if (onProgress) {
    onProgress(100);
  }

  recorder.stop();
  const videoBlob = await recordingFinished;

  // Trigger download
  const url = URL.createObjectURL(videoBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'what-if-your-shadow-quit-1080x1920.webm';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
