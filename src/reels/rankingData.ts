import type { RankingCategory } from './categoryStyles';

/**
 * Clone Reels — the ranking reel data model.
 *
 * Ported from the original Remotion `ranking-reel-generator` project
 * (`src/data/ranking.ts` + `src/schema.ts`) so the same ranking format can be
 * edited and exported from inside the 2D Animation Studio.
 *
 * An entry can carry either static character art or a VIDEO CLIP taken from a
 * URL. Clips are trimmed to a manual in/out range, given a manual length and a
 * manual title, and merged into one countdown in rank order.
 */

export interface RankingClip {
  id: string;
  sourceUrl: string;
  title: string;
  /** Manual time range in the original video, in seconds. */
  startSeconds: number;
  endSeconds: number;
  /** The path under /public once the source has been downloaded. */
  localFile?: string;
}

export interface RankingVideoClip {
  /** The source URL of the clip. */
  url: string;
  /** The original file name, used when the clip is saved. */
  filename?: string;
  /** The manual in point of the source, in seconds. */
  start: number;
  /** The manual out point of the source, in seconds. */
  end: number;
  /** The chosen on-screen length of the clip, in seconds. */
  length: number;
  /** The manual title shown on the title card before the clip plays. */
  title: string;
}

export interface RankingItem {
  id: string;
  rank: number;
  name: string;
  score: number;
  category: string;
  narration: string;
  caption: string;
  image: string;
  accent: string;
  /** Optional video source. When present the clip replaces the still art. */
  video?: RankingVideoClip;
}

export interface RankingVideoData {
  title: string;
  subtitle: string;
  /** The ranking style preset that drives the look. */
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
  items: RankingItem[];
}

/** The bundled original SVG character art (all original generic archetypes). */
export const CHARACTER_ART: { path: string; label: string }[] = [
  { path: 'characters/original-hero.svg', label: 'Original Hero' },
  { path: 'characters/moon-warden.svg', label: 'Moon Warden' },
  { path: 'characters/storm-forger.svg', label: 'Storm Forger' },
  { path: 'characters/ember-queen.svg', label: 'Ember Queen' },
  { path: 'characters/rift-runner.svg', label: 'Rift Runner' },
  { path: 'characters/iron-oracle.svg', label: 'Iron Oracle' },
  { path: 'characters/void-sentinel.svg', label: 'Void Sentinel' },
  { path: 'characters/star-eater.svg', label: 'Star Eater' },
  { path: 'characters/time-architect.svg', label: 'Time Architect' },
];

/** The ranking categories offered in the editor. */
export const RANKING_CATEGORIES = [
  'STREETBALL',
  'ARCADE HEROES',
  'CARS',
  'ANIME FIGHTERS',
  'SUPERHEROES',
  'SCI-FI RACERS',
  'FIGHTERS',
  'MYTHIC BEASTS',
  'Wrestlers',
  'COMEDY CREW',
  'BRAWLERS',
  'SPEEDRUNNERS',
];

/** Demo content: original/fantasy archetypes and a bundled original SVG mascot. */
export const DEFAULT_RANKING_DATA: RankingVideoData = {
  title: 'TOP 10 COSMIC CHAMPIONS',
  subtitle: 'POWER RANKING',
  category: 'trick-shots',
  introNarration:
    'Today, we are counting down ten cosmic champions. Stay until number one.',
  introCaption: '10 COSMIC CHAMPIONS. WHO TAKES NUMBER ONE?',
  outroNarration: 'That is our countdown. Who would you put at number one?',
  outroCaption: 'WHO DESERVES THE TOP SPOT? COMMENT BELOW.',
  secondsPerItem: 4,
  introSeconds: 3,
  outroSeconds: 3,
  titleCardSeconds: 1.2,
  items: [
    {
      id: 'nova-knight',
      rank: 10,
      name: 'NOVA KNIGHT',
      score: 61,
      category: 'COSMIC WARRIOR',
      narration: 'At number ten, Nova Knight brings speed and precision to every battle.',
      caption: 'FAST, FEARLESS, AND PRECISE.',
      image: 'characters/original-hero.svg',
      accent: '#ff6b4a',
    },
    {
      id: 'moon-warden',
      rank: 9,
      name: 'MOON WARDEN',
      score: 65,
      category: 'LUNAR GUARDIAN',
      narration: 'At number nine, Moon Warden channels the power of the lunar tide.',
      caption: 'POWERED BY THE LUNAR TIDE.',
      image: 'characters/moon-warden.svg',
      accent: '#a78bfa',
    },
    {
      id: 'storm-forger',
      rank: 8,
      name: 'STORM FORGER',
      score: 69,
      category: 'STORM CALLER',
      narration: 'At number eight, Storm Forger turns the sky into a weapon.',
      caption: 'THE SKY IS THEIR WEAPON.',
      image: 'characters/storm-forger.svg',
      accent: '#38bdf8',
    },
    {
      id: 'ember-queen',
      rank: 7,
      name: 'EMBER QUEEN',
      score: 73,
      category: 'FLAME SOVEREIGN',
      narration: 'At number seven, Ember Queen burns brighter with every challenge.',
      caption: 'EVERY CHALLENGE FUELS THE FIRE.',
      image: 'characters/ember-queen.svg',
      accent: '#fb7185',
    },
    {
      id: 'rift-runner',
      rank: 6,
      name: 'RIFT RUNNER',
      score: 77,
      category: 'REALITY TRAVELER',
      narration: 'At number six, Rift Runner can cross realities in a heartbeat.',
      caption: 'ONE STEP BETWEEN WORLDS.',
      image: 'characters/rift-runner.svg',
      accent: '#c084fc',
    },
    {
      id: 'iron-oracle',
      rank: 5,
      name: 'IRON ORACLE',
      score: 81,
      category: 'TACTICAL GENIUS',
      narration: 'At number five, Iron Oracle predicts the fight before it begins.',
      caption: 'ALWAYS THREE MOVES AHEAD.',
      image: 'characters/iron-oracle.svg',
      accent: '#fbbf24',
    },
    {
      id: 'void-sentinel',
      rank: 4,
      name: 'VOID SENTINEL',
      score: 86,
      category: 'DIMENSIONAL DEFENDER',
      narration: 'At number four, Void Sentinel commands the edge of the unknown.',
      caption: 'GUARDIAN OF THE UNKNOWN.',
      image: 'characters/void-sentinel.svg',
      accent: '#818cf8',
    },
    {
      id: 'star-eater',
      rank: 3,
      name: 'STAR EATER',
      score: 91,
      category: 'STELLAR TITAN',
      narration: 'At number three, Star Eater absorbs the energy of dying stars.',
      caption: 'POWER THAT OUTSHINES A STAR.',
      image: 'characters/star-eater.svg',
      accent: '#f97316',
    },
    {
      id: 'time-architect',
      rank: 2,
      name: 'TIME ARCHITECT',
      score: 96,
      category: 'TIME MASTER',
      narration: 'At number two, Time Architect can reshape the flow of a battle.',
      caption: 'TIME IS THEIR PLAYGROUND.',
      image: 'characters/time-architect.svg',
      accent: '#2dd4bf',
    },
    {
      id: 'origin-guardian',
      rank: 1,
      name: 'ORIGIN GUARDIAN',
      score: 99,
      category: 'COSMIC CREATOR',
      narration: 'And at number one, Origin Guardian holds the key to creation itself.',
      caption: 'THE ULTIMATE COSMIC CHAMPION.',
      image: 'characters/original-hero.svg',
      accent: '#facc15',
    },
  ],
};

/** How long one entry plays on screen: the clip length wins over the default. */
export const getItemLength = (item: RankingItem, fallback: number): number =>
  item.video && item.video.length > 0 ? item.video.length : fallback;

/**
 * The beats of the reel: an intro, then a title card plus the entry for every
 * ranked item, then the outro.
 */
export interface ReelBeat {
  kind: 'intro' | 'title' | 'item' | 'outro';
  index: number;
  start: number;
  duration: number;
  item?: RankingItem;
}

/** Builds the beat list from the ranking data. */
export const getReelBeats = (data: RankingVideoData): ReelBeat[] => {
  const beats: ReelBeat[] = [];
  let cursor = 0;

  beats.push({ kind: 'intro', index: 0, start: 0, duration: data.introSeconds });
  cursor += data.introSeconds;

  data.items.forEach((item, index) => {
    const titleCard = data.titleCardSeconds ?? 0;
    if (titleCard > 0) {
      beats.push({ kind: 'title', index, start: cursor, duration: titleCard, item });
      cursor += titleCard;
    }
    const length = getItemLength(item, data.secondsPerItem);
    beats.push({ kind: 'item', index, start: cursor, duration: length, item });
    cursor += length;
  });

  beats.push({ kind: 'outro', index: data.items.length, start: cursor, duration: data.outroSeconds });

  return beats;
};

/**
 * Assigns the ranks.
 *
 * The clips are entered in the order they should appear, from the lowest rank
 * to the winner: the first clip becomes #N and the last one becomes #1.
 */
export const getRankedClips = (
  clips: RankingItem[]
): (RankingItem & { rank: number; durationSeconds: number })[] =>
  clips.map((clip, index) => {
    const video = clip.video;
    if (
      video &&
      (!Number.isFinite(video.start) ||
        !Number.isFinite(video.end) ||
        video.start < 0 ||
        video.end <= video.start)
    ) {
      throw new Error(`Invalid time range for "${video.title || clip.id}".`);
    }
    return {
      ...clip,
      rank: clips.length - index,
      durationSeconds: video ? video.length : 0,
    };
  });

/** Total runtime of the reel: intro + every title card and entry + outro. */
export const getRankingDuration = (data: RankingVideoData): number => {
  const beats = getReelBeats(data);
  const last = beats[beats.length - 1];
  return last.start + last.duration;
};

/** The narration lines with the moment they are spoken. */
export const getRankingNarration = (
  data: RankingVideoData
): { time: number; text: string }[] => {
  const beats = getReelBeats(data);
  const lines: { time: number; text: string }[] = [
    { time: 0.15, text: data.introNarration },
  ];
  beats
    .filter((beat) => beat.kind === 'item' && beat.item)
    .forEach((beat) => {
      lines.push({ time: beat.start + 0.2, text: beat.item!.narration });
    });
  const outro = beats.find((beat) => beat.kind === 'outro');
  if (outro) lines.push({ time: outro.start + 0.2, text: data.outroNarration });
  return lines;
};

/** A defensive copy so the editor never mutates the shared defaults. */
export const cloneRankingData = (data: RankingVideoData): RankingVideoData => ({
  ...data,
  items: data.items.map((item) => ({ ...item, video: item.video ? { ...item.video } : undefined })),
});

/** Keeps the ranks in countdown order after the editor reorders or edits. */
export const normalizeRankingData = (data: RankingVideoData): RankingVideoData => {
  // The array order is the play order: the first clip is the lowest rank and
  // the last one is #1, so reordering in the editor renumbers the ranks.
  const items = data.items.map((item, index) => ({
    ...item,
    rank: data.items.length - index,
    score: Math.max(0, Math.min(100, Math.round(item.score))),
    video: item.video
      ? {
          ...item.video,
          start: Math.max(0, item.video.start),
          end: Math.max(item.video.start + 0.1, item.video.end),
          length: Math.max(0.2, item.video.length),
        }
      : undefined,
  }));
  return {
    ...data,
    items,
    secondsPerItem: Math.max(1, Math.min(30, data.secondsPerItem)),
    introSeconds: Math.max(1, Math.min(10, data.introSeconds)),
    outroSeconds: Math.max(1, Math.min(10, data.outroSeconds)),
    titleCardSeconds: Math.max(0, Math.min(4, data.titleCardSeconds ?? 0)),
  };
};
