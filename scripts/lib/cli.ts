/** Tiny command line helpers shared by the reel scripts. */

export interface ParsedArgs {
  [key: string]: string | boolean;
}

/** Parses `--key value`, `--flag` and positional arguments. */
export function parseArgs(argv: string[]): ParsedArgs {
  const args: ParsedArgs = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      args[key] = next;
      i++;
    } else {
      args[key] = true;
    }
  }
  return args;
}

export const str = (args: ParsedArgs, key: string, fallback = ''): string =>
  typeof args[key] === 'string' ? (args[key] as string) : fallback;

export const num = (args: ParsedArgs, key: string, fallback: number): number => {
  const value = Number(args[key]);
  return Number.isFinite(value) ? value : fallback;
};

export const flag = (args: ParsedArgs, key: string): boolean => args[key] === true;

export const step = (message: string) => console.log(`\u25b8 ${message}`);
export const ok = (message: string) => console.log(`  \u2713 ${message}`);
export const warn = (message: string) => console.log(`  ! ${message}`);
export const fail = (message: string) => console.error(`  \u2717 ${message}`);

export const ROOT = process.cwd();
export const PUBLIC_DIR = `${ROOT}\\public`;
export const REELS_DIR = `${PUBLIC_DIR}\\reels`;
export const CACHE_DIR = `${ROOT}\\scripts\\.cache`;
export const BLUEPRINT_PATH = `${REELS_DIR}\\blueprint.json`;
export const REFERENCE_PATH = `${REELS_DIR}\\reference.json`;
