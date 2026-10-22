/**
 * Ranking style presets.
 *
 * A category is a reusable look: the colours, the title-card timing and the
 * labels. Changing the category never touches a clip's manual range or title —
 * the style and the edit are independent.
 *
 * This file is the source of truth; the Remotion project keeps a copy at
 * src/ranking/categoryStyles.ts.
 */

export type RankingCategory =
  | 'trick-shots'
  | 'funny-moments'
  | 'amazing-skills'
  | 'top-facts'
  | 'satisfying'
  | 'animals'
  | 'gaming'
  | 'custom';

export interface RankingStyle {
  rankPosition: 'middle-left';
  titleDurationSeconds: number;
  showRankBadge: boolean;
  showTitleCard: boolean;
  backgroundColor: string;
  accentColor: string;
  titleColor: string;
}

export const CATEGORY_LABELS: Record<RankingCategory, string> = {
  'trick-shots': 'Trick Shots',
  'funny-moments': 'Funny Moments',
  'amazing-skills': 'Amazing Skills',
  'top-facts': 'Top Facts',
  satisfying: 'Satisfying Videos',
  animals: 'Animals',
  gaming: 'Gaming',
  custom: 'Custom',
};

export const CATEGORY_BLURBS: Record<RankingCategory, string> = {
  'trick-shots': 'Sports tricks, escalating difficulty',
  'funny-moments': 'Fails, reactions, unexpected endings',
  'amazing-skills': 'Talent, stunts, precision',
  'top-facts': 'Interesting facts and discoveries',
  satisfying: 'Perfect loops, transformations, precision',
  animals: 'Funny, cute, or impressive animal clips',
  gaming: 'Clutches, plays, highlights',
  custom: 'Choose your own visual settings',
};

export const CATEGORY_STYLES: Record<RankingCategory, RankingStyle> = {
  'trick-shots': {
    rankPosition: 'middle-left',
    titleDurationSeconds: 1.5,
    showRankBadge: true,
    showTitleCard: true,
    backgroundColor: '#101010',
    accentColor: '#FFD43B',
    titleColor: '#FFFFFF',
  },
  'funny-moments': {
    rankPosition: 'middle-left',
    titleDurationSeconds: 1.6,
    showRankBadge: true,
    showTitleCard: true,
    backgroundColor: '#171024',
    accentColor: '#FF8A3D',
    titleColor: '#FFFFFF',
  },
  'amazing-skills': {
    rankPosition: 'middle-left',
    titleDurationSeconds: 1.7,
    showRankBadge: true,
    showTitleCard: true,
    backgroundColor: '#080E18',
    accentColor: '#42D9FF',
    titleColor: '#FFFFFF',
  },
  'top-facts': {
    rankPosition: 'middle-left',
    titleDurationSeconds: 2,
    showRankBadge: true,
    showTitleCard: true,
    backgroundColor: '#111827',
    accentColor: '#60A5FA',
    titleColor: '#FFFFFF',
  },
  satisfying: {
    rankPosition: 'middle-left',
    titleDurationSeconds: 1.2,
    showRankBadge: true,
    showTitleCard: true,
    backgroundColor: '#F2F0E9',
    accentColor: '#187C72',
    titleColor: '#17201D',
  },
  animals: {
    rankPosition: 'middle-left',
    titleDurationSeconds: 1.5,
    showRankBadge: true,
    showTitleCard: true,
    backgroundColor: '#13251A',
    accentColor: '#A3E635',
    titleColor: '#FFFFFF',
  },
  gaming: {
    rankPosition: 'middle-left',
    titleDurationSeconds: 1.4,
    showRankBadge: true,
    showTitleCard: true,
    backgroundColor: '#140D2B',
    accentColor: '#B794FF',
    titleColor: '#FFFFFF',
  },
  custom: {
    rankPosition: 'middle-left',
    titleDurationSeconds: 1.5,
    showRankBadge: true,
    showTitleCard: true,
    backgroundColor: '#101010',
    accentColor: '#FFFFFF',
    titleColor: '#FFFFFF',
  },
};

/** The style for a category, with any per-project overrides applied. */
export const getRankingStyle = (
  category: RankingCategory,
  overrides: Partial<RankingStyle> = {}
): RankingStyle => ({
  ...CATEGORY_STYLES[category] ?? CATEGORY_STYLES.custom,
  ...overrides,
});

/** Per-clip category labels offered in the editor. */
export const CLIP_CATEGORIES = [
  'Trick Shot',
  'Bank Shot',
  'Long Distance',
  'Best Trick Shot',
  'Fail',
  'Reaction',
  'Clutch',
  'Perfect Loop',
  'Record',
  'Funniest',
];
