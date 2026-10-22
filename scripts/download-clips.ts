/**
 * download-clips — turn a list of source URLs into a ranked reel blueprint.
 *
 *   node scripts/download-clips.ts clips.json
 *
 * The JSON file looks like this:
 *
 * {
 *   "title": "Best Trick Shots",
 *   "subtitle": "POWER RANKING",
 *   "category": "trick-shots",
 *   "clips": [
 *     {
 *       "url": "https://www.youtube.com/watch?v=VIDEO_ID",
 *       "start": 12,
 *       "end": 18,
 *       "title": "The Impossible Shot",
 *       "category": "Trick Shot"
 *     }
 *   ]
 * }
 *
 * Every clip is downloaded into public/source-videos/ and the result is
 * written to public/reels/blueprint.json, which the Clone Reels editor picks
 * up with "Load generated blueprint".
 *
 * The clips are listed in play order: the first one becomes #N and the last one
 * becomes #1.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { downloadSourceVideo } from './lib/downloadSourceVideo.ts';

const ACCENTS = [
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
import type { ReelBlueprint } from '../src/reels/blueprint.ts';

interface ClipInput {
  url: string;
  start: number;
  end: number;
  title: string;
  category?: string;
}

interface ClipsFile {
  title?: string;
  subtitle?: string;
  category?: string;
  clips: ClipInput[];
}

const slug = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'clip';

async function main() {
  const inputFile = process.argv[2];

  if (!inputFile) {
    throw new Error(
      'Usage: node scripts/download-clips.ts clips.json [--allow-private]'
    );
  }

  // Strip a byte order mark: PowerShell writes one by default.
  const raw = await fs.readFile(inputFile, 'utf8');
  const parsed = JSON.parse(raw.replace(/^\uFEFF/, '')) as ClipsFile;

  if (!parsed.clips?.length) {
    throw new Error('The clips file has no clips.');
  }

  const publicDir = path.resolve('public');
  const outputDir = path.join(publicDir, 'source-videos');
  await fs.mkdir(outputDir, { recursive: true });

  const items: ReelBlueprint['items'] = [];

  for (let index = 0; index < parsed.clips.length; index++) {
    const clip = parsed.clips[index];
    const rank = parsed.clips.length - index;

    console.log(`\n[${index + 1}/${parsed.clips.length}] #${rank} ${clip.title}`);

    const source = await downloadSourceVideo(clip.url, {
      outputDir,
      timeoutMs: 30 * 60 * 1000,
      maxBytes: 2 * 1024 * 1024 * 1024,
      allowPrivateHosts: process.argv.includes('--allow-private'),
      onProgress: (stage, downloaded, total) => {
        if (stage === 'downloading' && total) {
          const percent = ((downloaded ?? 0) / total) * 100;
          process.stdout.write(`\r  downloading ${percent.toFixed(1)}%   `);
        }
      },
    });

    process.stdout.write('\r');

    const localFile = path
      .relative(publicDir, source.filepath)
      .split(path.sep)
      .join('/');

    const id = `${slug(clip.title)}-${rank}`;
    const length = Math.max(0.2, clip.end - clip.start);

    items.push({
      id,
      rank,
      name: clip.title.toUpperCase(),
      category: clip.category ?? 'TRICK SHOT',
      score: Math.round((rank / parsed.clips.length) * 100),
      caption: clip.title.toUpperCase(),
      narration: '',
      visualPrompt: `an original ranked character for ${clip.title}`,
      image: 'characters/original-hero.svg',
      accent: ACCENTS[index % ACCENTS.length],
      video: {
        url: `/${localFile}`,
        start: clip.start,
        end: clip.end,
        length,
        title: clip.title.toUpperCase(),
      },
    });

    console.log(`  saved ${localFile} (${(source.sizeBytes / 1024 / 1024).toFixed(1)} MB)`);
  }

  const blueprint: ReelBlueprint = {
    version: 1,
    generatedAt: new Date().toISOString(),
    source: {
      url: parsed.clips[0]?.url ?? '',
      title: parsed.title ?? 'RANKING REEL',
      duration: items.reduce((total, item) => total + (item.video?.length ?? 0), 0),
      fps: 30,
      width: 1080,
      height: 1920,
    },
    style: 'flat vector illustration, bold clean outlines, vivid accent lighting',
    voice: 'cinematic',
    title: parsed.title ?? 'TOP CLIPS',
    subtitle: parsed.subtitle ?? 'POWER RANKING',
    category: (parsed.category as ReelBlueprint['category']) ?? 'trick-shots',
    introNarration: '',
    introCaption: `${parsed.clips.length} CLIPS. WHO TAKES NUMBER ONE?`,
    outroNarration: '',
    outroCaption: 'WHO DESERVES THE TOP SPOT? COMMENT BELOW.',
    secondsPerItem: 4,
    introSeconds: 3,
    outroSeconds: 3,
    titleCardSeconds: 1.2,
    items,
  };

  const blueprintPath = path.join(publicDir, 'reels', 'blueprint.json');
  await fs.mkdir(path.dirname(blueprintPath), { recursive: true });
  await fs.writeFile(blueprintPath, JSON.stringify(blueprint, null, 2));

  console.log(`\nWrote ${path.relative(process.cwd(), blueprintPath)}`);
  console.log(
    `Ranks: ${items.map((item) => `#${item.rank}`).join(' -> ')} (#1 plays last)`
  );
  console.log('Open the studio, go to Clone Reels and press "Load generated blueprint".');
}

main().catch((error: unknown) => {
  console.error(
    'Failed:',
    error instanceof Error ? error.message : error
  );
  process.exitCode = 1;
});
