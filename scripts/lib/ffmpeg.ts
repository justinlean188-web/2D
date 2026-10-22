import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import path from 'node:path';

const exec = promisify(execFile);

export interface MediaInfo {
  duration: number;
  fps: number;
  width: number;
  height: number;
}

/** Runs ffprobe and parses the stream information. */
export async function probe(file: string): Promise<MediaInfo> {
  const { stdout } = await exec('ffprobe', [
    '-v',
    'error',
    '-print_format',
    'json',
    '-show_format',
    '-show_streams',
    file,
  ]);
  const parsed = JSON.parse(stdout) as {
    format?: { duration?: string };
    streams?: { codec_type?: string; r_frame_rate?: string; width?: number; height?: number }[];
  };
  const video = (parsed.streams ?? []).find((s) => s.codec_type === 'video');
  const [num, den] = (video?.r_frame_rate ?? '30/1').split('/').map(Number);
  return {
    duration: Number(parsed.format?.duration ?? 0),
    fps: den ? num / den : 30,
    width: video?.width ?? 0,
    height: video?.height ?? 0,
  };
}

/**
 * Finds the scene cuts with ffmpeg's scene detector.
 *
 * The filter prints every frame whose average colour differs from the previous
 * frame by more than the threshold, which is a cheap and reliable way to find
 * the beat structure of an edited short.
 */
export async function detectSceneCuts(file: string, threshold = 0.22): Promise<number[]> {
  let stderr = '';
  try {
    // ffmpeg prints the showinfo lines to stderr and still exits with 0.
    const result = await exec('ffmpeg', [
      '-hide_banner',
      '-i',
      file,
      '-filter:v',
      `select='gt(scene,${threshold})',showinfo`,
      '-f',
      'null',
      '-',
    ]);
    stderr = result.stderr ?? '';
  } catch (err) {
    stderr = String((err as { stderr?: string }).stderr ?? '');
  }

  const cuts = new Set<number>();
  const pattern = /pts_time:([0-9.]+)/g;
  let match = pattern.exec(stderr);
  while (match) {
    cuts.add(Number(match[1]));
    match = pattern.exec(stderr);
  }
  return [...cuts].sort((a, b) => a - b);
}

/** Extracts a single frame at `time` and writes it to `out`. */
export async function extractFrame(
  file: string,
  time: number,
  out: string,
  width = 540
): Promise<void> {
  await fs.mkdir(path.dirname(out), { recursive: true });
  await exec('ffmpeg', [
    '-hide_banner',
    '-loglevel',
    'error',
    '-y',
    '-ss',
    time.toFixed(3),
    '-i',
    file,
    '-frames:v',
    '1',
    '-vf',
    `scale=${width}:-2`,
    '-q:v',
    '3',
    out,
  ]);
}

/** Extracts the audio track as a 16 kHz mono wav (used for the voice timing). */
export async function extractAudio(file: string, out: string): Promise<boolean> {
  await fs.mkdir(path.dirname(out), { recursive: true });
  try {
    await exec('ffmpeg', [
      '-hide_banner',
      '-loglevel',
      'error',
      '-y',
      '-i',
      file,
      '-vn',
      '-ac',
      '1',
      '-ar',
      '16000',
      out,
    ]);
    return true;
  } catch {
    return false;
  }
}

/** True when the binary is on the PATH. */
export async function hasBinary(binary: string): Promise<boolean> {
  try {
    await exec(binary, ['-version']);
    return true;
  } catch {
    return false;
  }
}
