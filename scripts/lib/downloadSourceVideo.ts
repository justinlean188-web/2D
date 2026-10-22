import { createWriteStream } from 'node:fs';
import { mkdir, rename, rm, stat, access, readdir } from 'node:fs/promises';
import { Readable, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { lookup } from 'node:dns/promises';

const execFileAsync = promisify(execFile);

export type DownloadSourceType = 'direct' | 'platform';

export interface DownloadResult {
  /** The exact path of the downloaded file, ready for the next stage. */
  filepath: string;
  filename: string;
  directory: string;
  sourceUrl: string;
  sourceType: DownloadSourceType;
  sizeBytes: number;
  /** True when the file was re-encoded to a codec every browser plays fast. */
  transcoded?: boolean;
  /** The codec the file had before the re-encode. */
  sourceCodec?: string;
}

export interface DownloadOptions {
  outputDir?: string;
  timeoutMs?: number;
  maxBytes?: number;
  /** Cancels the download. */
  signal?: AbortSignal;
  /** Allow loopback and private-network hosts (for local tools only). */
  allowPrivateHosts?: boolean;
  /** Treat the URL as a direct file even if it has no video extension. */
  forceDirect?: boolean;
  onProgress?: (
    stage: 'starting' | 'downloading' | 'finished',
    downloadedBytes?: number,
    totalBytes?: number
  ) => void;
}

const VIDEO_EXTENSIONS = new Set([
  '.mp4',
  '.m4v',
  '.mov',
  '.webm',
  '.mkv',
  '.avi',
  '.mpeg',
  '.mpg',
  '.ts',
  '.3gp',
]);

const DEFAULT_MAX_BYTES = 2 * 1024 * 1024 * 1024;

/** Hosts that must never be fetched by a server-side downloader. */
const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^169\.254\./,
  /^\[?::1\]?$/,
  /^fc00:/i,
  /^fe80:/i,
  /\.internal$/i,
  /\.local$/i,
];

/**
 * Refuses loopback and private-network targets.
 *
 * A public service that downloads a URL the user supplies would otherwise be
 * able to reach the machine it runs on, or a cloud metadata address.
 */
async function assertHostAllowed(url: URL, allowPrivateHosts: boolean) {
  if (allowPrivateHosts) return;

  const host = url.hostname.replace(/^\[|\]$/g, '');

  if (PRIVATE_HOST_PATTERNS.some((pattern) => pattern.test(host))) {
    throw new Error(
      `Refusing to download from a local or private address (${host}). Pass allowPrivateHosts: true when this is a local tool.`
    );
  }

  try {
    const { address } = await lookup(host);
    if (PRIVATE_HOST_PATTERNS.some((pattern) => pattern.test(address))) {
      throw new Error(
        `Refusing to download from a local or private address (${host} resolves to ${address}).`
      );
    }
  } catch (error) {
    // A failed lookup is not a private address; the request itself will fail.
    if (error instanceof Error && error.message.startsWith('Refusing')) {
      throw error;
    }
  }
}
const DEFAULT_TIMEOUT_MS = 30 * 60 * 1000;
const MAX_REDIRECTS = 5;

/** Hosts that always serve a video file directly. */
const DIRECT_HOSTS = new Set([
  'cdn.example.com',
  'storage.googleapis.com',
  'commondatastorage.googleapis.com',
  'media.w3.org',
  'test-videos.co.uk',
  'filesamples.com',
  'sample-videos.com',
]);

function validateUrl(input: string): URL {
  let url: URL;

  try {
    url = new URL(input);
  } catch {
    throw new Error('The provided URL is invalid.');
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Only HTTP and HTTPS URLs are supported.');
  }

  if (url.username || url.password) {
    throw new Error('URLs containing embedded credentials are not supported.');
  }

  return url;
}

/** True when the URL points straight at a video file. */
export function isDirectVideoUrl(url: URL): boolean {
  if (VIDEO_EXTENSIONS.has(path.extname(url.pathname).toLowerCase())) return true;
  const host = url.hostname.replace(/^www\./, '');
  return DIRECT_HOSTS.has(host);
}

function safeFilename(name: string): string {
  const cleaned = path
    .basename(name)
    // A hash or a percent breaks the public path the browser asks for, so
    // those characters are replaced as well.
    .replace(/[<>:"/\\|?*#%\x00-\x1f]/g, '_')
    .replace(/[. ]+$/g, '')
    .slice(0, 180);

  if (!cleaned || cleaned === '.' || cleaned === '..') {
    return `video-${randomUUID()}.mp4`;
  }

  return cleaned;
}

/**
 * The codecs the studio can draw onto a canvas at full speed.
 *
 * H.264 is the safe one: it is hardware decoded almost everywhere and it is
 * what the reel export needs. AV1 and VP9 play in the preview, but a software
 * decode of a 1080x1920 frame is slow enough to stall the export.
 */
const EXPORT_SAFE_VIDEO = new Set(['h264']);
const EXPORT_SAFE_AUDIO = new Set(['aac', 'mp3', 'opus', 'vorbis']);

/** The video codec of a file, or null when it is not a video. */
async function probeVideoCodec(filepath: string): Promise<{
  video: string | null;
  audio: string | null;
  durationSeconds: number;
}> {
  try {
    const { stdout } = await execFileAsync(
      'ffprobe',
      [
        '-v',
        'error',
        '-show_entries',
        'format=duration:stream=codec_type,codec_name',
        '-of',
        'json',
        filepath,
      ],
      { windowsHide: true }
    );
    const probed = JSON.parse(stdout) as {
      format?: { duration?: string };
      streams?: { codec_type?: string; codec_name?: string }[];
    };
    const video = (probed.streams ?? []).find((s) => s.codec_type === 'video');
    const audio = (probed.streams ?? []).find((s) => s.codec_type === 'audio');
    return {
      video: video?.codec_name ?? null,
      audio: audio?.codec_name ?? null,
      durationSeconds: Number(probed.format?.duration ?? 0),
    };
  } catch {
    return { video: null, audio: null, durationSeconds: 0 };
  }
}

/**
 * Re-encodes a file when its codec would make the reel export crawl.
 *
 * The file is replaced by an H.264 version and the original is removed.
 */
async function ensureExportSafeCodec(
  filepath: string
): Promise<{ transcoded: boolean; sourceCodec: string | null }> {
  const { video, audio } = await probeVideoCodec(filepath);

  if (!video) {
    throw new Error('The downloaded file is not a video.');
  }

  const needsVideo = !EXPORT_SAFE_VIDEO.has(video);
  const needsAudio = Boolean(audio && !EXPORT_SAFE_AUDIO.has(audio));

  if (!needsVideo && !needsAudio) {
    return { transcoded: false, sourceCodec: video };
  }

  const target = path.join(
    path.dirname(filepath),
    `${path.basename(filepath, path.extname(filepath))}-h264.mp4`
  );

  await execFileAsync(
    'ffmpeg',
    [
      '-hide_banner',
      '-loglevel',
      'error',
      '-y',
      '-i',
      filepath,
      '-c:v',
      'libx264',
      '-preset',
      'ultrafast',
      '-crf',
      '26',
      '-pix_fmt',
      'yuv420p',
      '-c:a',
      'aac',
      '-movflags',
      '+faststart',
      target,
    ],
    { windowsHide: true }
  );

  await rm(filepath, { force: true });
  await rename(target, filepath);

  return { transcoded: true, sourceCodec: video };
}

/**
 * Follows redirects by hand so every hop can be validated instead of
 * letting fetch follow them unchecked.
 */
async function fetchWithValidatedRedirects(
  url: URL,
  signal: AbortSignal
): Promise<Response> {
  let current = url;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const response = await fetch(current, {
      signal,
      redirect: 'manual',
    });

    const status = response.status;
    if (status === 301 || status === 302 || status === 303 || status === 307 || status === 308) {
      const location = response.headers.get('location');
      if (!location) {
        throw new Error(`HTTP ${status} without a Location header.`);
      }
      const next = new URL(location, current);
      if (!['http:', 'https:'].includes(next.protocol)) {
        throw new Error('The redirect left the HTTP(S) protocol.');
      }
      current = next;
      continue;
    }

    return response;
  }

  throw new Error('Too many redirects.');
}

async function downloadDirectVideo(
  url: URL,
  outputDir: string,
  options: Required<
    Pick<DownloadOptions, 'timeoutMs' | 'maxBytes'>
  > &
    Pick<DownloadOptions, 'onProgress' | 'signal'>
): Promise<DownloadResult> {
  const response = await fetchWithValidatedRedirects(
    url,
    options.signal
      ? AbortSignal.any([options.signal, AbortSignal.timeout(options.timeoutMs)])
      : AbortSignal.timeout(options.timeoutMs)
  );

  if (!response.ok || !response.body) {
    throw new Error(`HTTP download failed: ${response.status}`);
  }

  const contentType = (response.headers.get('content-type') ?? '')
    .split(';')[0]
    .trim()
    .toLowerCase();

  if (
    !contentType.startsWith('video/') &&
    contentType !== 'application/octet-stream' &&
    contentType !== 'binary/octet-stream'
  ) {
    throw new Error(
      `The URL did not return a video file (Content-Type: ${contentType || 'unknown'}).`
    );
  }

  const contentLength = Number(response.headers.get('content-length') ?? 0);

  if (contentLength > 0 && contentLength > options.maxBytes) {
    throw new Error('The video exceeds the configured size limit.');
  }

  const ext = path.extname(url.pathname).toLowerCase();
  const outputName = safeFilename(
    `video-${randomUUID()}${VIDEO_EXTENSIONS.has(ext) ? ext : '.mp4'}`
  );

  const filepath = path.resolve(outputDir, outputName);
  const tempPath = `${filepath}.part`;
  let downloadedBytes = 0;

  try {
    options.onProgress?.('downloading', 0, contentLength || undefined);

    const progressStream = new Transform({
      transform(chunk: Buffer, _encoding, callback) {
        downloadedBytes += chunk.length;

        if (downloadedBytes > options.maxBytes) {
          callback(new Error('The video exceeds the configured size limit.'));
          return;
        }

        options.onProgress?.(
          'downloading',
          downloadedBytes,
          contentLength || undefined
        );

        callback(null, chunk);
      },
    });

    await pipeline(
      Readable.fromWeb(
        response.body as unknown as import('node:stream/web').ReadableStream
      ),
      progressStream,
      createWriteStream(tempPath, { flags: 'wx' })
    );

    if (downloadedBytes === 0) {
      throw new Error('The downloaded file is empty.');
    }

    await rename(tempPath, filepath);

    // A clip in AV1 or VP9 plays in the preview but makes the reel export
    // crawl, so it is re-encoded to H.264 before it is handed over.
    const { transcoded, sourceCodec } = await ensureExportSafeCodec(filepath);
    const fileStats = await stat(filepath);

    options.onProgress?.('finished', fileStats.size, fileStats.size);

    return {
      filepath,
      filename: path.basename(filepath),
      directory: outputDir,
      sourceUrl: url.toString(),
      sourceType: 'direct',
      sizeBytes: fileStats.size,
      transcoded,
      sourceCodec: sourceCodec ?? undefined,
    };
  } catch (error) {
    await rm(tempPath, { force: true });
    throw error;
  }
}

async function downloadPlatformVideo(
  url: URL,
  outputDir: string,
  options: Required<
    Pick<DownloadOptions, 'timeoutMs' | 'maxBytes'>
  > &
    Pick<DownloadOptions, 'onProgress' | 'signal'>
): Promise<DownloadResult> {
  try {
    await execFileAsync('yt-dlp', ['--version'], { windowsHide: true });
  } catch {
    throw new Error(
      'yt-dlp is required for video-platform URLs. Install it with: winget install yt-dlp.yt-dlp'
    );
  }

  const outputTemplate = path.join(
    outputDir,
    '%(title).120B [%(id)s].%(ext)s'
  );

  // What was in the folder before, so the new file can be found no matter
  // what the console did to the path yt-dlp printed.
  const existing = new Set(await readdir(outputDir));

  options.onProgress?.('downloading');

  // --print after_move:filepath reports the final path, including any
  // extension changes made while merging the audio and video streams.
  const { stdout } = await execFileAsync(
    'yt-dlp',
    [
      '--no-playlist',
      '--no-warnings',
      '--quiet',
      '--no-progress',
      '--max-filesize',
      String(options.maxBytes),
      '--socket-timeout',
      '30',
      '--retries',
      '2',
      '-f',
      // Prefer an H.264 stream: it is hardware decoded everywhere and it is
      // what the reel export needs. The fallbacks cover platforms that only
      // offer AV1 or VP9 (those are re-encoded afterwards).
      'bv*[vcodec^=avc1]+ba/b[vcodec^=avc1]/bv*+ba/b',
      '--merge-output-format',
      'mp4',
      '-o',
      outputTemplate,
      '--print',
      'after_move:filepath',
      '--',
      url.toString(),
    ],
    {
      timeout: options.timeoutMs,
      maxBuffer: 10 * 1024 * 1024,
      windowsHide: true,
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
      signal: options.signal,
    }
  );

  const printedPaths = stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  // Prefer the path yt-dlp printed, but fall back to whatever landed in the
  // output folder: Windows consoles mangle non-ASCII titles on the way out.
  let absolutePath: string | undefined;

  const printed = printedPaths.at(-1);
  if (printed) {
    const candidate = path.resolve(printed);
    try {
      await access(candidate);
      absolutePath = candidate;
    } catch {
      absolutePath = undefined;
    }
  }

  if (!absolutePath) {
    const created = (await readdir(outputDir)).filter(
      (name) => !existing.has(name)
    );
    const usable = created.filter((name) =>
      VIDEO_EXTENSIONS.has(path.extname(name).toLowerCase())
    );
    const pick = usable.at(-1) ?? created.at(-1);
    if (pick) absolutePath = path.resolve(outputDir, pick);
  }

  if (!absolutePath) {
    throw new Error('yt-dlp completed without producing an output file.');
  }

  await access(absolutePath);

  // yt-dlp names the file after the title, and a title can hold a hash or a
  // percent. Those break the public path the browser asks for, so the file is
  // renamed before it is handed over.
  const rawName = path.basename(absolutePath);
  const cleanName = safeFilename(rawName);
  if (cleanName !== rawName) {
    const renamed = path.join(path.dirname(absolutePath), cleanName);
    await rm(renamed, { force: true });
    await rename(absolutePath, renamed);
    absolutePath = renamed;
  }

  const fileStats = await stat(absolutePath);

  if (!fileStats.isFile() || fileStats.size === 0) {
    throw new Error('yt-dlp did not produce a valid video file.');
  }

  if (fileStats.size > options.maxBytes) {
    await rm(absolutePath, { force: true });
    throw new Error('The downloaded video exceeds the size limit.');
  }

  // A clip in AV1 or VP9 plays in the preview but makes the reel export
  // crawl, so it is re-encoded to H.264 before it is handed over.
  const { transcoded, sourceCodec } = await ensureExportSafeCodec(absolutePath);
  const finalStats = await stat(absolutePath);

  options.onProgress?.('finished', finalStats.size, finalStats.size);

  return {
    filepath: absolutePath,
    filename: path.basename(absolutePath),
    directory: path.dirname(absolutePath),
    sourceUrl: url.toString(),
    sourceType: 'platform',
    sizeBytes: finalStats.size,
    transcoded,
    sourceCodec: sourceCodec ?? undefined,
  };
}

/**
 * Downloads a source video and returns the exact local file path.
 *
 * A direct MP4 link is streamed to disk with fetch. A video-platform URL
 * (YouTube, TikTok, ...) is fetched with yt-dlp. Nothing here bypasses DRM,
 * logins or other access controls: platform downloads only work when the
 * source is publicly accessible.
 */
export async function downloadSourceVideo(
  sourceUrl: string,
  userOptions: DownloadOptions = {}
): Promise<DownloadResult> {
  const url = validateUrl(sourceUrl);

  const options = {
    timeoutMs: userOptions.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    maxBytes: userOptions.maxBytes ?? DEFAULT_MAX_BYTES,
    onProgress: userOptions.onProgress,
    signal: userOptions.signal,
  };

  if (
    !Number.isSafeInteger(options.timeoutMs) ||
    options.timeoutMs <= 0 ||
    !Number.isSafeInteger(options.maxBytes) ||
    options.maxBytes <= 0
  ) {
    throw new Error('Timeout and size limit must be positive safe integers.');
  }

  await assertHostAllowed(url, userOptions.allowPrivateHosts ?? false);

  if (options.signal?.aborted) {
    throw new Error('The download was cancelled.');
  }

  const outputDir = path.resolve(userOptions.outputDir ?? 'downloads/source');

  await mkdir(outputDir, { recursive: true });

  options.onProgress?.('starting');

  const direct = userOptions.forceDirect ?? isDirectVideoUrl(url);

  if (direct) {
    return downloadDirectVideo(url, outputDir, options);
  }

  return downloadPlatformVideo(url, outputDir, options);
}
