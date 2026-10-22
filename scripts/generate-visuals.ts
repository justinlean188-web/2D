/**
 * generate-visuals — turn the rebuilt blueprint into new character visuals.
 *
 *   npm run visuals [--style "flat vector, neon rim light"] [--dry]
 *
 * Every entry of public/reels/blueprint.json is rendered with the image model
 * from its own visualPrompt plus the shared art direction, and saved as
 * public/characters/<id>.png. The blueprint is updated with the new paths.
 *
 * Without OPENAI_API_KEY the script still runs: it copies the bundled original
 * SVG art as a stand-in and prints the exact prompts it would have sent, so the
 * pipeline can be rehearsed offline.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { parseArgs, str, flag, step, ok, warn, fail, BLUEPRINT_PATH, PUBLIC_DIR } from './lib/cli.ts';
import { generateImage, hasApiKey, isAuthError } from './lib/openai.ts';
import { DEFAULT_STYLE } from '../src/reels/blueprint.ts';
import type { ReelBlueprint } from '../src/reels/blueprint.ts';

const FALLBACK_ART = 'characters/original-hero.svg';

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const dry = flag(args, 'dry');
  const style = str(args, 'style', DEFAULT_STYLE);

  let blueprint: ReelBlueprint;
  try {
    blueprint = JSON.parse(await fs.readFile(BLUEPRINT_PATH, 'utf8')) as ReelBlueprint;
  } catch {
    fail(
      'No blueprint found. Run: npm run reference -- --url "https://..." (or copy the blueprint into public/reels/blueprint.json).'
    );
    process.exit(1);
  }

  const outDir = path.join(PUBLIC_DIR, 'characters');
  await fs.mkdir(outDir, { recursive: true });

  const apiReady = hasApiKey() && !dry;
  if (!hasApiKey()) {
    warn('OPENAI_API_KEY is not set — using the bundled art as a stand-in.');
  } else if (dry) {
    warn('--dry run: no image is generated.');
  }

  let authFailed = false;
  step(`Generating ${blueprint.items.length} character visuals`);
  for (const item of blueprint.items) {
    const prompt = [
      item.visualPrompt,
      style,
      'single character, full body, centered composition, plain background, no text, no logo, no watermark',
    ].join('. ');

    const outFile = path.join(outDir, `${item.id}.png`);
    if (apiReady && !authFailed) {
      try {
        const png = await generateImage({ prompt, size: '1024x1024', transparent: true });
        await fs.writeFile(outFile, png);
        item.image = `characters/${item.id}.png`;
        ok(`${item.name} -> characters/${item.id}.png`);
      } catch (err) {
        if (isAuthError(err)) {
          authFailed = true;
          warn('The API key was rejected — using the bundled art for every entry.');
        } else {
          warn(`${item.name}: ${(err as Error).message}`);
        }
        await useFallback(item, outDir);
      }
    } else {
      console.log(`\n  PROMPT for ${item.name}:\n  ${prompt}\n`);
      await useFallback(item, outDir);
    }
  }

  await fs.writeFile(BLUEPRINT_PATH, JSON.stringify(blueprint, null, 2));
  ok(`updated ${path.relative(process.cwd(), BLUEPRINT_PATH)}`);
  console.log('');
  console.log('  Next: npm run voice');
}

async function useFallback(
  item: ReelBlueprint['items'][number],
  outDir: string
): Promise<void> {
  const source = path.join(PUBLIC_DIR, FALLBACK_ART);
  const target = path.join(outDir, `${item.id}.svg`);
  try {
    await fs.copyFile(source, target);
    item.image = `characters/${item.id}.svg`;
  } catch {
    item.image = FALLBACK_ART;
  }
}

main().catch((err) => {
  fail(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
