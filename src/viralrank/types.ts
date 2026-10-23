export type AspectRatio = '9:16' | '16:9' | '1:1';

/**
 * Narration accent for the generated voice-over.
 *
 * The reel narration is spoken by the dev-server speech endpoint and decoded
 * into an AudioBuffer, so the preview and the export use the exact same take.
 */
export type NarrationVoice = 'us' | 'uk' | 'au' | 'in';

export type EffectType =
  | 'whoosh'
  | 'impact'
  | 'punch'
  | 'pop'
  | 'click'
  | 'ding'
  | 'bell'
  | 'drum-hit'
  | 'riser'
  | 'bass-drop'
  | 'crowd-cheer'
  | 'laughter'
  | 'suspense'
  | 'record-scratch'
  | 'glitch'
  | 'explosion'
  | 'success'
  | 'failure'
  | 'custom';

export interface AudioEffect {
  id: string;
  clipId: string;
  effectType: EffectType;
  label: string;
  /** Start time in seconds relative to the start of the project timeline */
  timelineStart: number;
  /** Start time in seconds relative to the clip start */
  clipOffset: number;
  duration: number;
  /** Volume gain: 0.0 to 2.0 (0% to 200%) */
  gain: number;
  fadeIn: number;
  fadeOut: number;
  playbackRate: number;
  enabled: boolean;
}

export type TransitionType = 'none' | 'fade' | 'slide-left' | 'slide-up' | 'zoom' | 'flash';

export type CropMode = 'fit' | 'fill' | 'contain';

export interface RankingItem {
  id: string;
  /** 1-based rank number, e.g. 1 for #1, 5 for #5 */
  rank: number;
  title: string;
  description?: string;
  sourceMediaId: string;
  sourceUrl: string;
  sourceStart: number;
  sourceEnd: number;
  duration: number;
  speed: number;
  volume: number;
  muted: boolean;
  cropMode: CropMode;
  transition: TransitionType;
  narrationText: string;
  narrationEnabled: boolean; // Off by default; the rank's Voice switch enables it
  narrationSpeed: number; // Voiceover speed multiplier (0.5 - 2.0)
  soundEffects: AudioEffect[];
}

export interface SourceMedia {
  id: string;
  name: string;
  url: string;
  duration: number;
  type: 'video' | 'audio' | 'image';
  thumbnail?: string;
  width?: number;
  height?: number;
}

export interface VoiceoverSegment {
  id: string;
  itemId: string;
  text: string;
  timelineStart: number;
  duration: number;
  voiceId?: string;
}

export interface VoiceoverConfig {
  enabled: boolean;
  provider: 'webspeech' | 'formant';
  voice: string;
  speed: number;
  pitch: number;
  volume: number;
  duckingPercentage: number;
  segments: VoiceoverSegment[];
}

export interface MusicTrack {
  id: string;
  enabled: boolean;
  trackName: string;
  genre: 'energetic' | 'suspense' | 'action' | 'comedy' | 'cinematic';
  volume: number;
  loop: boolean;
  fadeIn: number;
  fadeOut: number;
  duckingEnabled: boolean;
}

export type CaptionPreset = 'mrbeast' | 'tiktok-karaoke' | 'minimal' | 'neon' | 'badge';

export interface CaptionStyle {
  preset: CaptionPreset;
  fontSize: number;
  primaryColor: string;
  outlineColor: string;
  bgColor?: string;
  yPos: number; // Percentage 0 - 100% from top
}

export interface CaptionSegment {
  id: string;
  itemId?: string;
  text: string;
  startTime: number;
  endTime: number;
  style?: Partial<CaptionStyle>;
}

export type OrderMode = 'countdown' | 'best-first';

export interface ViralRankProject {
  id: string;
  title: string;
  description: string;
  aspect: AspectRatio;
  resolution: { width: number; height: number };
  fps: number;
  rankingCount: number; // 3, 5, 10, 20 or custom
  orderMode: OrderMode; // 'countdown' = #5 to #1; 'best-first' = #1 to #5
  badgeTheme: 'gold' | 'neon-cyan' | 'crimson' | 'emerald' | 'amber';
  titlePrefix?: string; // e.g. "Ranking Best"
  titleAccent?: string; // e.g. "Pool Fails"
  accentColor?: string; // e.g. "#ef4444"
  voiceIntro?: string; // e.g. "Top 6 Ranking best pool fails"
  voiceIntroSpeed?: number; // Voice intro speed multiplier (0.5 - 2.0)
  narrationVoice?: NarrationVoice; // Accent used for the intro and every clip
  useVoiceIntroOnly?: boolean; // When true, no visual title card is shown; voiceover hook speaks right at 0.0s over the video
  items: RankingItem[];
  sourceLibrary: SourceMedia[];
  music: MusicTrack;
  voiceover: VoiceoverConfig;
  captions: CaptionSegment[];
  captionStyle: CaptionStyle;
  showSafeZones: boolean;
  resolutionQuality: 'full' | 'half' | 'quarter';
}

export interface AISoundSuggestion {
  id: string;
  clipId: string;
  effectType: EffectType;
  label: string;
  offsetSec: number;
  reason: string;
  volume: number;
  approved?: boolean;
}

export type ActiveTab = 'media' | 'sfx' | 'music' | 'captions' | 'ai' | 'templates';

export type SelectedElement =
  | { type: 'clip'; id: string }
  | { type: 'sfx'; id: string; clipId: string }
  | { type: 'caption'; id: string }
  | { type: 'music' }
  | { type: 'voiceover' }
  | null;
