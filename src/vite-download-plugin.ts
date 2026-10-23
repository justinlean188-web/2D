import path from 'node:path';
import type { Plugin } from 'vite';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createWriteStream, createReadStream } from 'node:fs';
import { mkdir, rename, rm, stat, readdir } from 'node:fs/promises';
import { downloadSourceVideo } from '../scripts/lib/downloadSourceVideo.ts';

const execFileAsync = promisify(execFile);

/**
 * Codecs every browser can draw onto a canvas at full speed.
 *
 * H.264 is the safe one: it is hardware decoded almost everywhere and it is
 * what the reel export needs. AV1 and VP9 play in the preview, but a software
 * decode of a 1080x1920 frame is slow enough to stall the export.
 */
const BROWSER_SAFE_VIDEO = new Set(['h264']);
const BROWSER_SAFE_AUDIO = new Set(['aac', 'mp3', 'opus', 'vorbis']);

const TTS_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

/**
 * The speech service answers with a 400 when a request carries more than
 * roughly 200 characters, so a line is cut at the last word boundary that
 * fits. The clips are concatenated into one MP3, which every browser decodes
 * as a single clip.
 */
function splitSpeechChunks(text: string, max = 180): string[] {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return [clean];

  const chunks: string[] = [];
  let rest = clean;
  while (rest.length > max) {
    let cut = rest.lastIndexOf(' ', max);
    if (cut < max * 0.5) cut = max;
    chunks.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest) chunks.push(rest);
  return chunks;
}

async function fetchSpeechChunk(chunk: string, lang: string): Promise<Buffer> {
  const url =
    'https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob' +
    `&tl=${encodeURIComponent(lang)}&total=1&idx=0&textlen=${chunk.length}` +
    `&q=${encodeURIComponent(chunk)}`;

  const response = await fetch(url, {
    headers: { 'User-Agent': TTS_USER_AGENT, Referer: 'https://translate.google.com/' },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`the speech service answered ${response.status}`);
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length < 512) {
    throw new Error('the speech service returned no audio');
  }
  return bytes;
}

/**
 * A local bridge for the Clone Reels downloader.
 *
 * The browser can only fetch a file the site is allowed to read, so a YouTube
 * or TikTok link fails there. This middleware runs the same downloader on the
 * Node side (yt-dlp + FFmpeg), drops the file into public/source-videos and
 * hands the public path back, so the editor can use it like any other clip.
 *
 * It only exists in the dev server: the studio is a local tool and the
 * endpoint is not part of a production build.
 */
export const reelDownloadPlugin = (): Plugin => ({
  name: 'reel-download-api',
  configureServer(server) {
    // The stamp changes whenever the dev server restarts. The app polls it,
    // so an open tab that still runs the previous bundle says so instead of
    // quietly behaving like the old code.
    const stamp = String(Date.now());

    server.middlewares.use('/__reel-ping', (req, res) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-store');
      res.end(JSON.stringify({ stamp }));
    });

    // Lists available downloaded videos in public/source-videos
    server.middlewares.use('/__source-videos-list', async (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      const sourceDir = path.resolve(process.cwd(), 'public', 'source-videos');
      try {
        await mkdir(sourceDir, { recursive: true });
        const files = await readdir(sourceDir);
        const list = await Promise.all(
          files
            .filter((f) => /\.(mp4|webm|mov|m4v)$/i.test(f))
            .map(async (filename) => {
              const s = await stat(path.join(sourceDir, filename)).catch(() => ({ size: 0 }));
              return {
                filename,
                filepath: `/source-videos/${encodeURIComponent(filename)}`,
                sizeBytes: s.size,
              };
            })
        );
        res.statusCode = 200;
        res.end(JSON.stringify({ files: list }));
      } catch {
        res.statusCode = 200;
        res.end(JSON.stringify({ files: [] }));
      }
    });

    // Dedicated high-performance video streaming middleware for /source-videos
    // Handles byte-range requests (HTTP 206), CORS headers, and resilient fuzzy matching
    // for percent-encoded or unicode filenames.
    server.middlewares.use('/source-videos', async (req, res, next) => {
      if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
        next();
        return;
      }

      // Handle CORS preflight
      if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type, Accept');
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.end();
        return;
      }

      const rawUrl = req.url ?? '/';
      const pathname = rawUrl.split('?')[0].replace(/^\/+/, '');
      let decodedName = pathname;
      try {
        decodedName = decodeURIComponent(pathname);
      } catch {}

      const sourceDir = path.resolve(process.cwd(), 'public', 'source-videos');
      let targetPath = path.join(sourceDir, decodedName);
      let fileExists = false;

      try {
        const s = await stat(targetPath);
        if (s.isFile()) fileExists = true;
      } catch {}

      if (!fileExists) {
        try {
          const s = await stat(path.join(sourceDir, pathname));
          if (s.isFile()) {
            targetPath = path.join(sourceDir, pathname);
            fileExists = true;
          }
        } catch {}
      }

      // If still not found, search the directory for matches (fuzzy / ID match)
      if (!fileExists) {
        try {
          const allFiles = await readdir(sourceDir);
          const cleanTarget = decodedName.toLowerCase();
          const idMatch = decodedName.match(/\[?([a-zA-Z0-9_-]{11})\]?/);
          const id = idMatch ? idMatch[1] : null;

          const matched = allFiles.find((f) => {
            const lf = f.toLowerCase();
            if (lf === cleanTarget) return true;
            if (id && lf.includes(id.toLowerCase())) return true;
            if (lf.endsWith(cleanTarget) || cleanTarget.endsWith(lf)) return true;
            const baseTarget = cleanTarget.replace(/\.[^.]+$/, '');
            if (
              baseTarget.length > 5 &&
              (lf.includes(baseTarget) || baseTarget.includes(lf.replace(/\.[^.]+$/, '')))
            ) {
              return true;
            }
            return false;
          });

          if (matched) {
            targetPath = path.join(sourceDir, matched);
            fileExists = true;
          }
        } catch {}
      }

      if (!fileExists) {
        next();
        return;
      }

      try {
        const stats = await stat(targetPath);
        const fileSize = stats.size;
        const ext = path.extname(targetPath).toLowerCase();
        const contentType =
          ext === '.webm'
            ? 'video/webm'
            : ext === '.mov'
            ? 'video/quicktime'
            : ext === '.ogg' || ext === '.ogv'
            ? 'video/ogg'
            : 'video/mp4';

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type, Accept');
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Content-Type', contentType);

        const range = req.headers.range;
        if (range) {
          const parts = range.replace(/bytes=/, '').split('-');
          const start = parseInt(parts[0], 10);
          const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

          if (start >= fileSize || end >= fileSize || start > end) {
            res.statusCode = 416;
            res.setHeader('Content-Range', `bytes */${fileSize}`);
            res.end();
            return;
          }

          const chunkSize = end - start + 1;
          res.statusCode = 206;
          res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
          res.setHeader('Content-Length', chunkSize);

          if (req.method === 'HEAD') {
            res.end();
            return;
          }

          const stream = createReadStream(targetPath, { start, end });
          stream.on('error', () => {
            if (!res.headersSent) res.statusCode = 500;
            res.end();
          });
          stream.pipe(res);
        } else {
          res.statusCode = 200;
          res.setHeader('Content-Length', fileSize);

          if (req.method === 'HEAD') {
            res.end();
            return;
          }

          const stream = createReadStream(targetPath);
          stream.on('error', () => {
            if (!res.headersSent) res.statusCode = 500;
            res.end();
          });
          stream.pipe(res);
        }
      } catch {
        next();
      }
    });

    // A small log of every reel request, so a failure can be traced from the
    // browser console to the server side.
    server.middlewares.use((req, res, next) => {
      const url = req.url ?? '';
      if (!url.includes('__reel-') && !url.includes('source-videos')) {
        next();
        return;
      }

      res.on('finish', () => {
        const status = res.statusCode;
        if (status >= 400 || process.env.REEL_LOG === '1') {
          console.log(
            `[reel] ${req.method} ${url.slice(0, 160)} -> ${status} ${
              res.getHeader('Content-Type') ?? ''
            }`
          );
        }
      });

      next();
    });

    /**
     * Accepts a local file, checks it is really a video and, when the browser
     * cannot decode the codec, re-encodes it to something it can.
     */
    server.middlewares.use('/__reel-upload', async (req, res) => {
      const send = (status: number, payload: Record<string, unknown>) => {
        res.statusCode = status;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.end(JSON.stringify(payload));
      };

      if (req.method !== 'POST') {
        send(405, { error: 'Use POST.' });
        return;
      }

      const chunks: Buffer[] = [];
      let size = 0;

      try {
        for await (const chunk of req) {
          const buffer = chunk as Buffer;
          size += buffer.length;
          if (size > 1024 * 1024 * 1024) {
            send(413, { error: 'The file is larger than 1 GB.' });
            return;
          }
          chunks.push(buffer);
        }
      } catch {
        send(400, { error: 'The upload was interrupted.' });
        return;
      }

      const body = Buffer.concat(chunks);
      const headerName = String(req.headers['x-file-name'] ?? 'clip.mp4');
      let rawName = headerName;
      try {
        rawName = decodeURIComponent(headerName);
      } catch {
        // The name was not URL encoded; use it as it came in.
      }
      // A hash or a percent breaks the public path the browser asks for, so
      // those characters are replaced as well.
      const filename =
        path.basename(rawName).replace(/[<>:"/\\|?*#%\x00-\x1f]/g, '_') || 'clip.mp4';
      const uploadDir = path.resolve(process.cwd(), 'public', 'source-videos');
      const tempFile = path.join(uploadDir, `upload-${Date.now()}.tmp`);

      try {
        await mkdir(uploadDir, { recursive: true });
        await new Promise<void>((resolve, reject) => {
          const stream = createWriteStream(tempFile);
          stream.on('error', reject);
          stream.end(body, () => resolve());
        });
      } catch {
        send(500, { error: 'Could not write the upload.' });
        return;
      }

      // Probe the file. When ffprobe cannot read it, it is not a video at all.
      let probed: {
        format?: { duration?: string; format_name?: string };
        streams?: { codec_type?: string; codec_name?: string }[];
      };

      try {
        const { stdout } = await execFileAsync('ffprobe', [
          '-v',
          'error',
          '-show_entries',
          'format=duration,format_name:stream=codec_type,codec_name',
          '-of',
          'json',
          tempFile,
        ]);
        probed = JSON.parse(stdout);
      } catch {
        await rm(tempFile, { force: true });
        send(400, {
          error:
            'That file is not a video. It is usually a web page saved with an .mp4 name, or a download that never finished.',
          sizeBytes: size,
        });
        return;
      }

      const video = (probed.streams ?? []).find((s) => s.codec_type === 'video');
      const audio = (probed.streams ?? []).find((s) => s.codec_type === 'audio');

      if (!video) {
        await rm(tempFile, { force: true });
        send(400, {
          error:
            'That file has no video track in it. Pick the video file itself, not a page or an audio file.',
          sizeBytes: size,
        });
        return;
      }

      const needsVideo = !BROWSER_SAFE_VIDEO.has(video.codec_name ?? '');
      const needsAudio = Boolean(audio && !BROWSER_SAFE_AUDIO.has(audio.codec_name ?? ''));

      try {
        let outFile = path.join(uploadDir, filename);

        if (needsVideo || needsAudio) {
          // The browser cannot decode this codec, so make one it can.
          outFile = path.join(uploadDir, filename.replace(/\.[^.]+$/, '') + '-h264.mp4');
          // A copy from an earlier upload is removed first: ffmpeg cannot
          // write over a file that is still open somewhere else.
          await rm(outFile, { force: true });
          await execFileAsync('ffmpeg', [
            '-hide_banner',
            '-loglevel',
            'error',
            '-y',
            '-i',
            tempFile,
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
            outFile,
          ]);
          await rm(tempFile, { force: true });
        } else {
          // The same clip can be picked again, and the folder already holds
          // it. Windows refuses to rename onto a file that exists, so the old
          // copy is removed first; the new one replaces it.
          await rm(outFile, { force: true });
          await rename(tempFile, outFile);
        }

        const outStats = await stat(outFile);

        send(200, {
          // The name is percent encoded: a file name can hold spaces, a
          // hashtag or an emoji, and those break a plain path.
          filepath: `/source-videos/${encodeURIComponent(path.basename(outFile))}`,
          filename: path.basename(outFile),
          sizeBytes: outStats.size,
          durationSeconds: Number(probed.format?.duration ?? 0),
          transcoded: needsVideo || needsAudio,
          sourceCodec: video.codec_name ?? 'unknown',
        });
      } catch (error) {
        await rm(tempFile, { force: true });
        const raw = error instanceof Error ? error.message : '';
        // A raw file-system error means nothing to the user, so it is turned
        // into a sentence they can act on.
        const friendly = /EPERM|EACCES|EBUSY|permission denied/i.test(raw)
          ? 'The clip could not be written into public/source-videos. Close anything that has that file open (a player, an explorer preview) and try again.'
          : /ffmpeg|ffprobe|ENOENT|not found/i.test(raw)
            ? 'ffmpeg and ffprobe have to be on the PATH for the studio to check a clip.'
            : raw || 'That file could not be read as a video.';
        send(400, {
          error: friendly,
          sizeBytes: size,
        });
      }
    });

    /**
     * Voice-over narration for the ranking reels.
     *
     * A ranking reel has to ship with a voice that a viewer can actually
     * understand, and the browser's own speech synthesis cannot be recorded
     * into the export (its audio never reaches a Web Audio graph). This
     * endpoint turns the script into real MP3 narration on the Node side,
     * where no CORS rule applies, so the studio can decode it once and mix
     * the exact same voice into the preview and the recorded file.
     */
    const ttsCache = new Map<string, Buffer>();

    server.middlewares.use('/__reel-tts', async (req, res) => {
      const requestUrl = new URL(req.url ?? '/', 'http://localhost');
      const text = (requestUrl.searchParams.get('text') ?? '').replace(/\s+/g, ' ').trim();
      const lang = (requestUrl.searchParams.get('lang') ?? 'en').trim();

      const sendError = (status: number, message: string) => {
        res.statusCode = status;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.end(JSON.stringify({ error: message }));
      };

      if (!text) {
        sendError(400, 'Missing the text parameter.');
        return;
      }
      if (text.length > 2400) {
        sendError(400, 'That narration line is too long. Keep it under 2400 characters.');
        return;
      }
      if (!/^[a-z]{2}(-[A-Za-z]{2,4})?$/.test(lang)) {
        sendError(400, 'Unsupported language tag.');
        return;
      }

      const cacheKey = `${lang}|${text}`;
      try {
        let audio = ttsCache.get(cacheKey);
        if (!audio) {
          const chunks = splitSpeechChunks(text);
          const parts: Buffer[] = [];
          for (const chunk of chunks) {
            parts.push(await fetchSpeechChunk(chunk, lang));
            // The service rate-limits bursts of requests, and a reel only has
            // a handful of lines, so a short gap between chunks is free.
            if (chunks.length > 1) await new Promise((r) => setTimeout(r, 60));
          }
          audio = Buffer.concat(parts);
          if (ttsCache.size > 60) ttsCache.clear();
          ttsCache.set(cacheKey, audio);
          console.log(`[tts] ${lang} ${text.length} chars -> ${audio.length} bytes`);
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Length', String(audio.length));
        res.setHeader('Cache-Control', 'no-store');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.end(audio);
      } catch (error) {
        const raw = error instanceof Error ? error.message : String(error);
        console.warn(`[tts] failed: ${raw}`);
        sendError(
          502,
          `The voice-over could not be generated (${raw}). Check the internet connection and try again.`
        );
      }
    });

    server.middlewares.use('/__reel-download', async (req, res) => {
      const requestUrl = new URL(req.url ?? '/', 'http://localhost');
      const target = requestUrl.searchParams.get('url');

      const send = (status: number, payload: Record<string, unknown>) => {
        res.statusCode = status;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.end(JSON.stringify(payload));
      };

      if (!target) {
        send(400, { error: 'Missing the url parameter.' });
        return;
      }

      console.log(`[reel] download request: ${target.slice(0, 200)}`);

      try {
        const result = await downloadSourceVideo(target, {
          outputDir: path.resolve(process.cwd(), 'public', 'source-videos'),
          timeoutMs: 30 * 60 * 1000,
          maxBytes: 2 * 1024 * 1024 * 1024,
          allowPrivateHosts: true,
        });

        send(200, {
          // The name is percent encoded: a file name can hold spaces, a
          // hashtag or an emoji, and those break a plain path.
          filepath: `/source-videos/${encodeURIComponent(result.filename)}`,
          filename: result.filename,
          sizeBytes: result.sizeBytes,
          sourceType: result.sourceType,
        });
      } catch (error) {
        send(500, {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    });
  },
});
