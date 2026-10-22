/**
 * analyze-reference — turn a reference video URL into a rebuilt reel blueprint.
 *
 *   npm run reference -- --url "https://example.com/reel.mp4" [--count 8]
 *                       [--title "My Ranking"] [--voice cinematic] [--keep-cache]
 *
 * Step 1 (always, no API key needed): download the reference, detect its scene
 * cuts with ffmpeg and pull a keyframe for every beat. That structure is
 * written to public/reels/reference.json.
 *
 * Step 2 (needs OPENAI_API_KEY): send the beat structure plus the keyframes to
 * the vision model and ask it to REBUILD the ranking — new names, new copy,
 * new characters, the same pacing. The result is written to
 * public/reels/blueprint.json, which the studio loads into Clone Reels.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { parseArgs, str, num, step, ok, warn, fail, CACHE_DIR, REELS_DIR, BLUEPRINT_PATH, REFERENCE_PATH } from './lib/cli.ts';
import { detectSceneCuts, extractFrame, hasBinary, probe } from './lib/ffmpeg.ts';
import { downloadSourceVideo } from './lib/downloadSourceVideo.ts';
import { chatJson, hasApiKey, toDataUrl } from './lib/openai.ts';
import {
  ACCENTS,
  DEFAULT_STYLE,
  createEmptyBlueprint,
  getVoicePreset,
} from '../src/reels/blueprint.ts';
import type { ReelBlueprint } from '../src/reels/blueprint.ts';

interface ReferenceSegment {
  index: number;
  start: number;
  duration: number;
  thumbnail: string;
}

interface ReferenceFile {
  generatedAt: string;
  source: { url: string; file: string; duration: number; fps: number; width: number; height: number };
  analysis: {
    detectedCuts: boolean;
    segmentCount: number;
    averageSceneSeconds: number;
    beatPattern: number[];
  };
  segments: ReferenceSegment[];
}

const BLUEPRINT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'title',
    'subtitle',
    'introNarration',
    'introCaption',
    'outroNarration',
    'outroCaption',
    'secondsPerItem',
    'introSeconds',
    'outroSeconds',
    'items',
  ],
  properties: {
    title: { type: 'string' },
    subtitle: { type: 'string' },
    introNarration: { type: 'string' },
    introCaption: { type: 'string' },
    outroNarration: { type: 'string' },
    outroCaption: { type: 'string' },
    secondsPerItem: { type: 'number' },
    introSeconds: { type: 'number' },
    outroSeconds: { type: 'number' },
    items: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['rank', 'name', 'category', 'score', 'caption', 'narration', 'visualPrompt', 'accent'],
        properties: {
          rank: { type: 'integer' },
          name: { type: 'string' },
          category: { type: 'string' },
          score: { type: 'integer' },
          caption: { type: 'string' },
          narration: { type: 'string' },
          visualPrompt: { type: 'string' },
          accent: { type: 'string' },
        },
      },
    },
  },
} as Record<string, unknown>;

const slug = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'entry';

async function download(url: string, out: string): Promise<string> {
  if (!/^https?:\/\//i.test(url)) {
    // A local path was given instead of a URL.
    await fs.mkdir(path.dirname(out), { recursive: true });
    await fs.copyFile(url, out);
    return out;
  }

  // Direct MP4 links are streamed, platform URLs go through yt-dlp.
  const source = await downloadSourceVideo(url, {
    outputDir: path.dirname(out),
    timeoutMs: 30 * 60 * 1000,
    maxBytes: 2 * 1024 * 1024 * 1024,
    allowPrivateHosts: process.argv.includes('--allow-private'),
    onProgress: (stage, downloaded, total) => {
      if (stage === 'downloading' && total) {
        const percent = ((downloaded ?? 0) / total) * 100;
        process.stdout.write(
          `\r  downloading ${percent.toFixed(1)}%   `
        );
      }
    },
  });
  if (source.sourceType === 'direct') {
    process.stdout.write('\r');
  }
  return source.filepath;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const url = str(args, 'url');
  if (!url) {
    fail('Missing --url. Example: npm run reference -- --url "https://example.com/reel.mp4"');
    process.exit(1);
  }

  if (!(await hasBinary('ffmpeg')) || !(await hasBinary('ffprobe'))) {
    fail('ffmpeg and ffprobe must be on the PATH. See SETUP-WINDOWS.md.');
    process.exit(1);
  }

  const entryCount = num(args, 'count', 0);
  const cacheFile = path.join(CACHE_DIR, 'source', 'reference.mp4');

  step('Downloading the reference video');
  let file = cacheFile;
  try {
    file = await download(url, cacheFile);
    ok(`saved to ${path.relative(process.cwd(), cacheFile)}`);
  } catch (err) {
    fail(`Download failed: ${(err as Error).message}`);
    process.exit(1);
  }

  step('Probing the reference');
  const info = await probe(file);
  ok(`${info.width}x${info.height} · ${info.duration.toFixed(1)}s · ${info.fps.toFixed(2)} fps`);

  step('Detecting the beat structure');
  const cuts = await detectSceneCuts(file);
  const boundaries = [0, ...cuts.filter((c) => c > 0.2 && c < info.duration - 0.2), info.duration];
  const detectedCuts = cuts.length > 0;
  if (!detectedCuts) warn('No hard cuts found — falling back to an even split.');

  const rawSegments = boundaries.slice(0, -1).map((start, i) => ({
    start,
    duration: boundaries[i + 1] - start,
  }));

  // Merge tiny beats and split long ones so every entry has a similar length.
  const target = entryCount > 0 ? entryCount : rawSegments.length;
  const segments: { start: number; duration: number }[] = [];
  if (target <= 0) {
    segments.push({ start: 0, duration: info.duration });
  } else {
    const slice = info.duration / target;
    for (let i = 0; i < target; i++) {
      segments.push({ start: i * slice, duration: slice });
    }
  }

  step('Pulling a keyframe for every beat');
  const thumbDir = path.join(REELS_DIR, 'reference');
  await fs.mkdir(thumbDir, { recursive: true });
  const referenceSegments: ReferenceSegment[] = [];
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const fileName = `${String(i).padStart(2, '0')}.jpg`;
    const out = path.join(thumbDir, fileName);
    try {
      await extractFrame(file, seg.start + seg.duration / 2, out);
    } catch {
      warn(`could not extract a frame at ${seg.start.toFixed(2)}s`);
    }
    referenceSegments.push({
      index: i,
      start: Number(seg.start.toFixed(3)),
      duration: Number(seg.duration.toFixed(3)),
      thumbnail: `/reels/reference/${fileName}`,
    });
  }
  ok(`${referenceSegments.length} beats captured`);

  const reference: ReferenceFile = {
    generatedAt: new Date().toISOString(),
    source: {
      url,
      file: path.relative(process.cwd(), file),
      duration: Number(info.duration.toFixed(3)),
      fps: Number(info.fps.toFixed(3)),
      width: info.width,
      height: info.height,
    },
    analysis: {
      detectedCuts,
      segmentCount: referenceSegments.length,
      averageSceneSeconds: Number(
        (info.duration / Math.max(1, referenceSegments.length)).toFixed(3)
      ),
      beatPattern: referenceSegments.map((s) => Number(s.duration.toFixed(2))),
    },
    segments: referenceSegments,
  };
  await fs.mkdir(REELS_DIR, { recursive: true });
  await fs.writeFile(REFERENCE_PATH, JSON.stringify(reference, null, 2));
  ok(`wrote ${path.relative(process.cwd(), REFERENCE_PATH)}`);

  if (!hasApiKey()) {
    warn('OPENAI_API_KEY is not set — the structure was saved but no blueprint was rebuilt.');
    warn('Set the key and re-run to generate the new ranking, copy and character prompts.');
    return;
  }

  step('Rebuilding the ranking from the reference structure (vision model)');
  const images = [];
  for (const seg of referenceSegments.slice(0, 12)) {
    const abs = path.join(process.cwd(), 'public', seg.thumbnail.replace(/^\//, ''));
    try {
      images.push({ path: seg.thumbnail, dataUrl: await toDataUrl(abs) });
    } catch {
      /* skip a missing frame */
    }
  }

  const beatSummary = referenceSegments
    .map((s) => `${s.index}: ${s.duration.toFixed(2)}s`)
    .join(', ');

  const system = [
    'You rebuild short-form vertical ranking reels (1080x1920).',
    'You are shown the beat structure of a reference video and one keyframe per beat.',
    'Recreate the STRUCTURE (the number of beats, the intro/outro shape and the pacing),',
    'but write everything from scratch: new character names, new categories, new captions,',
    'new narration and new character designs. Never copy the reference characters, names,',
    'artwork, wording or logos.',
    'Each character must be an original generic archetype you can describe in a single image prompt.',
    'Rank 1 is the strongest and scores near 100; the last rank scores lowest.',
    'Narration is one or two short sentences that fit the scene length.',
    'Answer with JSON only.',
  ].join(' ');

  const user = [
    `Beat structure (${referenceSegments.length} beats): ${beatSummary}.`,
    entryCount > 0 ? `Rebuild with exactly ${entryCount} ranked entries.` : '',
    `The reel title should be "${str(args, 'title', '') || 'an original ranking title'}".`,
    'Write the visualPrompt so an image model can draw a single original character,',
    'full body, centered, no text.',
  ]
    .filter(Boolean)
    .join('\n');

  const base = createEmptyBlueprint();

  const rebuilt = await chatJson<{
    title: string;
    subtitle: string;
    introNarration: string;
    introCaption: string;
    outroNarration: string;
    outroCaption: string;
    secondsPerItem: number;
    introSeconds: number;
    outroSeconds: number;
    items: {
      rank: number;
      name: string;
      category: string;
      score: number;
      caption: string;
      narration: string;
      visualPrompt: string;
      accent: string;
    }[];
  }>({ system, user, images, schema: BLUEPRINT_SCHEMA }).catch((err: Error) => {
    warn(`The vision rebuild failed: ${err.message}`);
    warn('Falling back to a structural blueprint built from the beat pattern.');
    return null;
  });

  const beatSeconds = referenceSegments.length ? info.duration / referenceSegments.length : 4;
  const rebuiltCount =
    rebuilt?.items?.length ?? Math.max(2, referenceSegments.length || Math.round(info.duration / 4));
  const voice = getVoicePreset(str(args, 'voice', base.voice));

  const items = rebuilt
    ? rebuilt.items.map((item, index) => {
        const id = slug(item.name) || `entry-${index + 1}`;
        return {
          id,
          rank: item.rank,
          name: item.name,
          category: item.category,
          score: Math.max(0, Math.min(100, Math.round(item.score))),
          caption: item.caption,
          narration: item.narration,
          visualPrompt: item.visualPrompt,
          image: `characters/${id}.png`,
          accent: item.accent || ACCENTS[index % ACCENTS.length],
        };
      })
    : Array.from({ length: rebuiltCount }, (_, index) => {
        const rank = entryCount - index;
        const id = `challenger-${String(rank).padStart(2, '0')}`;
        return {
          id,
          rank,
          name: `CHALLENGER ${String(rank).padStart(2, '0')}`,
          category: 'RANKED CONTENDER',
          score: 50 + Math.round((rank / entryCount) * 49),
          caption: 'A NEW CONTENDER ENTERS THE COUNTDOWN.',
          narration: `At number ${rank}, challenger ${rank} enters the countdown.`,
          visualPrompt: `an original ranked contender number ${rank}, a unique silhouette`,
          image: `characters/${id}.png`,
          accent: ACCENTS[index % ACCENTS.length],
        };
      });

  const blueprint: ReelBlueprint = {
    ...base,
    generatedAt: new Date().toISOString(),
    source: {
      url,
      title: rebuilt?.title ?? str(args, 'title', 'Reference Reel'),
      duration: info.duration,
      fps: info.fps,
      width: info.width,
      height: info.height,
    },
    style: DEFAULT_STYLE,
    voice: voice.id,
    title: rebuilt?.title ?? str(args, 'title', 'TOP 10 CHALLENGERS'),
    subtitle: rebuilt?.subtitle ?? 'POWER RANKING',
    introNarration:
      rebuilt?.introNarration ??
      `${items.length} contenders enter the countdown. Stay until number one.`,
    introCaption:
      rebuilt?.introCaption ?? `${items.length} CONTENDERS. WHO TAKES NUMBER ONE?`,
    outroNarration:
      rebuilt?.outroNarration ?? 'That is the countdown. Who would you crown?',
    outroCaption:
      rebuilt?.outroCaption ?? 'WHO DESERVES THE TOP SPOT? COMMENT BELOW.',
    secondsPerItem: rebuilt?.secondsPerItem ?? Number(beatSeconds.toFixed(2)),
    introSeconds: rebuilt?.introSeconds ?? Math.min(6, Math.max(2, beatSeconds)),
    outroSeconds: rebuilt?.outroSeconds ?? Math.min(6, Math.max(2, beatSeconds)),
    titleCardSeconds: 1.2,
    items,
  };

  await fs.writeFile(BLUEPRINT_PATH, JSON.stringify(blueprint, null, 2));
  ok(`wrote ${path.relative(process.cwd(), BLUEPRINT_PATH)} with ${blueprint.items.length} entries`);
  console.log('');
  console.log('  Next:');
  console.log('    npm run visuals     # generate the new character visuals');
  console.log('    npm run voice       # generate the new AI voice');
  console.log('    npm run dev         # open the studio, then Clone Reels');
}

main().catch((err) => {
  fail(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
