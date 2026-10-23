import { viralAudio } from './audioEngine';
import type { NarrationVoice } from './types';

/**
 * The narration a ranking reel ships with.
 *
 * The browser's own speech synthesis is never recorded: its audio does not
 * pass through a Web Audio graph, so an export that relied on it would come
 * out silent (or, worse, with a synthetic vowel drone that nobody can
 * understand). Instead the script is spoken by the dev server, decoded into
 * an AudioBuffer once, and that exact take is used for the preview and for
 * the recorded file.
 */

export interface NarrationLine {
  time: number;
  text: string;
  /** Playback speed of the take, 0.5 - 2.0. */
  rate?: number;
}

export interface NarrationClip {
  time: number;
  buffer: AudioBuffer;
  rate?: number;
}

export const NARRATION_VOICES: {
  id: NarrationVoice;
  label: string;
  lang: string;
  preview: string;
}[] = [
  {
    id: 'us',
    label: 'American (clear narrator)',
    lang: 'en',
    preview: 'Number six took down the entire patio fence.',
  },
  {
    id: 'uk',
    label: 'British (calm narrator)',
    lang: 'en-GB',
    preview: 'Number six took down the entire patio fence.',
  },
  {
    id: 'au',
    label: 'Australian (upbeat narrator)',
    lang: 'en-AU',
    preview: 'Number six took down the entire patio fence.',
  },
  {
    id: 'in',
    label: 'Indian (warm narrator)',
    lang: 'en-IN',
    preview: 'Number six took down the entire patio fence.',
  },
];

const VOICE_LANG: Record<NarrationVoice, string> = {
  us: 'en',
  uk: 'en-GB',
  au: 'en-AU',
  in: 'en-IN',
};

export function normalizeNarrationVoice(value: unknown): NarrationVoice {
  return value === 'uk' || value === 'au' || value === 'in' ? value : 'us';
}

export function narrationLang(voice: NarrationVoice): string {
  return VOICE_LANG[normalizeNarrationVoice(voice)];
}

const bufferCache = new Map<string, AudioBuffer>();
const inFlight = new Map<string, Promise<AudioBuffer | null>>();
let lastError: string | null = null;

function cleanText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function cacheKey(text: string, voice: NarrationVoice): string {
  return `${normalizeNarrationVoice(voice)}|${cleanText(text)}`;
}

/** The take that is already decoded, so the preview can start it instantly. */
export function getCachedNarration(
  text: string,
  voice: NarrationVoice
): AudioBuffer | null {
  const key = cacheKey(text, voice);
  return bufferCache.get(key) ?? null;
}

export function getNarrationError(): string | null {
  return lastError;
}

/**
 * Fetches one line of narration and decodes it. Calls for the same line and
 * voice are shared, so a preview pass, the preloader and the export never ask
 * the server for the same audio twice.
 */
export async function getNarrationBuffer(
  text: string,
  voice: NarrationVoice
): Promise<AudioBuffer | null> {
  const clean = cleanText(text);
  if (!clean) return null;

  const key = cacheKey(clean, voice);
  const cached = bufferCache.get(key);
  if (cached) return cached;

  const running = inFlight.get(key);
  if (running) return running;

  const task = (async (): Promise<AudioBuffer | null> => {
    const ctx = viralAudio.getContext();
    if (!ctx) return null;

    const url =
      `/__reel-tts?lang=${encodeURIComponent(narrationLang(voice))}` +
      `&text=${encodeURIComponent(clean)}`;

    const response = await fetch(url);
    if (!response.ok) {
      let detail = `the speech service answered ${response.status}`;
      try {
        const body = (await response.json()) as { error?: string };
        if (body?.error) detail = body.error;
      } catch {}
      throw new Error(detail);
    }

    const bytes = await response.arrayBuffer();
    const buffer = await ctx.decodeAudioData(bytes);
    bufferCache.set(key, buffer);
    lastError = null;
    return buffer;
  })();

  inFlight.set(key, task);
  try {
    return await task;
  } catch (error) {
    lastError = error instanceof Error ? error.message : String(error);
    return null;
  } finally {
    inFlight.delete(key);
  }
}

/** Warms the cache while the editor is open, so playback and export are instant. */
export function preloadNarration(lines: NarrationLine[], voice: NarrationVoice): void {
  const seen = new Set<string>();
  for (const line of lines) {
    const text = cleanText(line.text);
    if (!text || seen.has(text)) continue;
    seen.add(text);
    void getNarrationBuffer(text, voice);
  }
}

/**
 * Resolves every narration line to a decoded clip, ready for the export.
 * Throws only when nothing at all could be generated, so a single blocked
 * line still leaves the rest of the reel narrated.
 */
export async function prepareNarration(
  lines: NarrationLine[],
  voice: NarrationVoice,
  onProgress?: (done: number, total: number) => void
): Promise<NarrationClip[]> {
  const texts = Array.from(
    new Set(lines.map((line) => cleanText(line.text)).filter(Boolean))
  ).filter((text) => !getCachedNarration(text, voice));

  let done = 0;
  const total = Math.max(1, texts.length);
  onProgress?.(0, total);

  await Promise.all(
    texts.map(async (text) => {
      await getNarrationBuffer(text, voice);
      done += 1;
      onProgress?.(done, total);
    })
  );

  const clips: NarrationClip[] = [];
  for (const line of lines) {
    const buffer = getCachedNarration(line.text, voice);
    if (buffer) clips.push({ time: line.time, buffer, rate: line.rate });
  }

  if (clips.length === 0 && lines.length > 0) {
    throw new Error(lastError ?? 'The voice-over could not be generated.');
  }
  return clips;
}

/** Plays a decoded take; the export passes its own destination node. */
export function playNarrationClip(
  clip: NarrationClip,
  options: { dest?: AudioNode; gain?: number } = {}
): { stop: () => void } | null {
  return viralAudio.playBuffer(clip.buffer, {
    rate: clip.rate,
    dest: options.dest,
    gain: options.gain,
  });
}
