/**
 * The ranking-reel blueprint.
 *
 * A blueprint is the editable "recipe" for one reel: the beats, the ranking
 * entries, the visual prompts for every character, and the narration that is
 * voiced. The scripts under `scripts/` build it (from a reference video URL,
 * from generated visuals, from the new AI voice) and this app reads it back.
 *
 * This module is the single source of truth for both the Node scripts and the
 * studio, so a blueprint written by the CLI is always understood by the UI.
 */

import type { RankingVideoData } from './rankingData.ts';
import type { RankingCategory } from './categoryStyles.ts';

export interface BlueprintItem {
  id: string;
  rank: number;
  name: string;
  category: string;
  score: number;
  caption: string;
  narration: string;
  /** What the image model should draw for this entry. */
  visualPrompt: string;
  /** Path under /public once the visuals exist. */
  image: string;
  accent: string;
  /** Optional video clip for this entry. */
  video?: {
    url: string;
    start: number;
    end: number;
    length: number;
    title: string;
  };
}

export interface BlueprintSource {
  /** The reference video URL that inspired the structure. */
  url: string;
  title: string;
  duration: number;
  fps: number;
  width: number;
  height: number;
}

export interface ReelBlueprint {
  version: 1;
  generatedAt: string;
  source: BlueprintSource;
  /** The shared art direction applied to every generated visual. */
  style: string;
  /** The voice preset used for the AI voice. */
  voice: string;
  title: string;
  subtitle: string;
  /** The ranking style for this reel. */
  category: RankingCategory;
  introNarration: string;
  introCaption: string;
  outroNarration: string;
  outroCaption: string;
  secondsPerItem: number;
  introSeconds: number;
  outroSeconds: number;
  /** The title card that plays before every entry. */
  titleCardSeconds: number;
  items: BlueprintItem[];
}

export interface ReferenceSegment {
  index: number;
  start: number;
  duration: number;
  thumbnail: string;
}

export interface ReferenceAnalysis {
  generatedAt: string;
  source: {
    url: string;
    file: string;
    duration: number;
    fps: number;
    width: number;
    height: number;
  };
  analysis: {
    detectedCuts: boolean;
    segmentCount: number;
    averageSceneSeconds: number;
    beatPattern: number[];
  };
  segments: ReferenceSegment[];
}

/** The voice presets the AI voice generator understands. */
export interface VoicePreset {
  id: string;
  label: string;
  /** Sent to the speech model as the voice instruction. */
  instruction: string;
  /** The speech model voice slot. */
  modelVoice: string;
  speed: number;
}

export const VOICE_PRESETS: VoicePreset[] = [
  {
    id: 'cinematic',
    label: 'Cinematic Trailer',
    instruction:
      'Speak like a movie trailer narrator: rich, deep, measured, with a slow build and a warm resonant tone.',
    modelVoice: 'onyx',
    speed: 0.92,
  },
  {
    id: 'hype',
    label: 'Hyped Countdown',
    instruction:
      'Speak with hype and punch: bright, fast, confident, like a stadium announcer counting down.',
    modelVoice: 'shimmer',
    speed: 1.12,
  },
  {
    id: 'documentary',
    label: 'Deadpan Documentary',
    instruction:
      'Speak completely deadpan and unhurried, like a serious documentary narrator with no excitement.',
    modelVoice: 'coral',
    speed: 0.88,
  },
  {
    id: 'storyteller',
    label: 'Storyteller',
    instruction:
      'Speak warmly and conversationally, like someone telling a friend an epic story over coffee.',
    modelVoice: 'sage',
    speed: 0.96,
  },
];

export const getVoicePreset = (id: string): VoicePreset =>
  VOICE_PRESETS.find((v) => v.id === id) ?? VOICE_PRESETS[0];

/** The shared art direction for every generated character visual. */
export const DEFAULT_STYLE =
  'flat vector illustration, bold clean outlines, vivid accent lighting, full body character, centered, plain light background, no text, no watermark';

export const ACCENTS = [
  '#ff6b4a',
  '#a78bfa',
  '#38bdf8',
  '#fb7185',
  '#c084fc',
  '#fbbf24',
  '#818cf8',
  '#f97316',
  '#2dd4bf',
  '#facc15',
];

/** An empty blueprint used when a run starts without any reference material. */
export const createEmptyBlueprint = (): ReelBlueprint => ({
  version: 1,
  generatedAt: new Date().toISOString(),
  source: { url: '', title: '', duration: 0, fps: 30, width: 1080, height: 1920 },
  style: DEFAULT_STYLE,
  voice: 'cinematic',
  title: 'TOP 10 CHAMPIONS',
  subtitle: 'POWER RANKING',
  category: 'trick-shots',
  introNarration: 'Ten contenders. One crown. Stay until number one.',
  introCaption: 'TEN CONTENDERS. WHO TAKES THE CROWN?',
  outroNarration: 'That is the countdown. Who would you crown?',
  outroCaption: 'WHO DESERVES THE TOP SPOT? COMMENT BELOW.',
  secondsPerItem: 4,
  introSeconds: 3,
  outroSeconds: 3,
  titleCardSeconds: 1.2,
  items: [],
});

// ------------------------------------------------------------------
// Narration rewriting (runs in the browser, no API needed)
// ------------------------------------------------------------------

const LEAD_IN = /^(at number (one|two|three|four|five|six|seven|eight|nine|ten|\d+)[,:]?\s*|and at number (one|two|three|four|five|six|seven|eight|nine|ten|\d+)[,:]?\s*|next[,]?\s*|then[,]?\s*)/i;

const ORDINAL_WORDS = [
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
];

const ordinal = (rank: number): string => ORDINAL_WORDS[rank - 1] ?? String(rank);

/** Strips the "At number ten," lead-in so a rewrite can rephrase the body. */
export const stripLeadIn = (text: string): string => text.replace(LEAD_IN, '').trim();

/**
 * Rewrites a narration line into the chosen voice.
 *
 * This is the offline counterpart of the AI voice: it keeps the meaning of the
 * line and re-frames it with the preset's rhythm so the copy, the captions and
 * the voice all share one voice preset.
 */
export const rewriteNarration = (
  text: string,
  voiceId: string,
  meta: { name?: string; category?: string; rank?: number } = {}
): string => {
  const body = stripLeadIn(text);
  const name = meta.name ?? 'the challenger';
  const category = meta.category ?? 'contender';
  const rank = meta.rank ?? 0;
  const lead = rank ? `number ${ordinal(rank)}` : 'this entry';

  switch (voiceId) {
    case 'hype':
      return `Number ${rank || 'ten'}! ${name}! ${category} — ${body}`;
    case 'documentary':
      return `Number ${rank || 'ten'}. ${name}, ${category}. ${body}`;
    case 'storyteller':
      return `Now, ${lead}, we meet ${name}. ${body}`;
    case 'cinematic':
    default:
      return `And at ${lead}, ${name} — ${category}. ${body}`;
  }
};

/** Rewrites the intro and outro lines for a voice preset. */
export const rewriteIntroOutro = (
  text: string,
  voiceId: string,
  kind: 'intro' | 'outro'
): string => {
  const body = stripLeadIn(text);
  switch (voiceId) {
    case 'hype':
      return kind === 'intro'
        ? `Ten contenders enter the arena. Only one leaves with the crown!`
        : `That is the final countdown! Tell us who should have won!`;
    case 'documentary':
      return kind === 'intro'
        ? `The following is a ranking of ten subjects.`
        : `The ranking is now complete.`;
    case 'storyteller':
      return kind === 'intro'
        ? `Let me tell you about ten very different contenders.`
        : `And that is where our countdown ends.`;
    case 'cinematic':
    default:
      return kind === 'intro'
        ? `Ten contenders. One crown. Stay until number one.`
        : `That is the countdown. Who would you crown?`;
  }
};

// ------------------------------------------------------------------
// Loading the generated files
// ------------------------------------------------------------------

const fetchJson = async <T>(url: string): Promise<T | null> => {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
};

/** Loads the blueprint written by `npm run reference`. */
export const loadBlueprint = (): Promise<ReelBlueprint | null> =>
  fetchJson<ReelBlueprint>('/reels/blueprint.json');

/** Loads the reference analysis written by `npm run reference`. */
export const loadReference = (): Promise<ReferenceAnalysis | null> =>
  fetchJson<ReferenceAnalysis>('/reels/reference.json');

/** True when the generated AI voice clips are present in /public/audio. */
export const hasVoiceClips = async (ids: string[]): Promise<boolean> => {
  if (!ids.length) return false;
  try {
    const checks = await Promise.all(
      ids.map(async (id) => {
        const res = await fetch(`/audio/${id}.mp3`, { method: 'HEAD' });
        return res.ok;
      })
    );
    return checks.every(Boolean);
  } catch {
    return false;
  }
};

/** Turns a blueprint into the ranking data the renderer and the editor use. */
export const blueprintToRankingData = (blueprint: ReelBlueprint): RankingVideoData => ({
  title: blueprint.title,
  subtitle: blueprint.subtitle,
  category: blueprint.category || 'trick-shots',
  introNarration: blueprint.introNarration,
  introCaption: blueprint.introCaption,
  outroNarration: blueprint.outroNarration,
  outroCaption: blueprint.outroCaption,
  secondsPerItem: blueprint.secondsPerItem,
  introSeconds: blueprint.introSeconds,
  outroSeconds: blueprint.outroSeconds,
  titleCardSeconds: blueprint.titleCardSeconds ?? 0,
  items: blueprint.items.map((item, index) => ({
    id: item.id,
    rank: item.rank ?? blueprint.items.length - index,
    name: item.name,
    score: item.score,
    category: item.category,
    narration: item.narration,
    caption: item.caption,
    image: item.image,
    accent: item.accent,
    video: item.video ? { ...item.video } : undefined,
  })),
});

