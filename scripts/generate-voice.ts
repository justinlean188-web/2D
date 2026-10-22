/**
 * generate-voice — create a new AI voice from the rewritten narration.
 *
 *   npm run voice [--voice cinematic] [--dry]
 *
 * Every narration line in public/reels/blueprint.json is spoken with the
 * speech model using the chosen voice preset's instruction, and saved as
 * public/audio/<id>.mp3 (intro, one file per entry, outro).
 *
 * Without OPENAI_API_KEY the script still runs and prints the exact lines it
 * would have spoken; the studio then falls back to its procedural formant voice.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { parseArgs, str, flag, step, ok, warn, fail, BLUEPRINT_PATH, PUBLIC_DIR } from './lib/cli.ts';
import { generateSpeech, hasApiKey, isAuthError } from './lib/openai.ts';
import { getVoicePreset } from '../src/reels/blueprint.ts';
import type { ReelBlueprint } from '../src/reels/blueprint.ts';

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const dry = flag(args, 'dry');

  let blueprint: ReelBlueprint;
  try {
    blueprint = JSON.parse(await fs.readFile(BLUEPRINT_PATH, 'utf8')) as ReelBlueprint;
  } catch {
    fail(
      'No blueprint found. Run: npm run reference -- --url "https://..." (or copy the blueprint into public/reels/blueprint.json).'
    );
    process.exit(1);
  }

  const preset = getVoicePreset(str(args, 'voice', blueprint.voice));
  blueprint.voice = preset.id;
  const outDir = path.join(PUBLIC_DIR, 'audio');
  await fs.mkdir(outDir, { recursive: true });

  const lines: { id: string; text: string }[] = [
    { id: 'intro', text: blueprint.introNarration },
    ...blueprint.items.map((item) => ({ id: item.id, text: item.narration })),
    { id: 'outro', text: blueprint.outroNarration },
  ];

  const apiReady = hasApiKey() && !dry;
  if (!hasApiKey()) {
    warn('OPENAI_API_KEY is not set — no clips are written.');
  } else if (dry) {
    warn('--dry run: no audio is generated.');
  }

  let authFailed = false;
  step(`Voicing ${lines.length} lines with the "${preset.label}" voice`);
  for (const line of lines) {
    if (!line.text.trim()) continue;
    if (apiReady && !authFailed) {
      try {
        const audio = await generateSpeech({
          text: line.text,
          voice: preset.modelVoice,
          instructions: preset.instruction,
          speed: preset.speed,
          format: 'mp3',
        });
        await fs.writeFile(path.join(outDir, `${line.id}.mp3`), audio);
        ok(`${line.id}.mp3`);
      } catch (err) {
        if (isAuthError(err)) {
          authFailed = true;
          warn('The API key was rejected — no clips are written.');
        } else {
          warn(`${line.id}: ${(err as Error).message}`);
        }
      }
    } else {
      console.log(`  ${line.id}: "${line.text}"`);
    }
  }

  await fs.writeFile(BLUEPRINT_PATH, JSON.stringify(blueprint, null, 2));
  ok(`updated ${path.relative(process.cwd(), BLUEPRINT_PATH)}`);
  console.log('');
  console.log('  The studio picks the generated clips up automatically when they exist.');
}

main().catch((err) => {
  fail(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
