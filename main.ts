// Milo's Garden — the program that hands the game in (Node 22).
//
// It stages the playable game and its screenshots into the output directory
// the grader names (MAKEFUN_OUTPUT_DIR, default /output) and writes the
// dossier the judge reads, using the vendored make.fun library. It refuses
// to hand in a game whose index.html is missing, so a bad stage fails loud
// here instead of silently in the grader.
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function stageTree(name) {
  const from = join(here, name);
  const to = join(outDir, name);
  if (!existsSync(from)) {
    if (name === 'screenshots') return 0; // screenshots are optional to stage
    throw new Error(`missing ${name}/ beside main.ts`);
  }
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true });
  return readdirSync(to, { recursive: true }).filter((p) => statSync(join(to, p)).isFile()).length;
}

mkdirSync(outDir, { recursive: true });
const gameFiles = stageTree('game');
const shotFiles = stageTree('screenshots');
if (!existsSync(join(outDir, 'game', 'index.html'))) {
  throw new Error('staged game/ has no index.html');
}

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);
console.log(`Milo's Garden staged: ${gameFiles} game files, ${shotFiles} screenshots -> ${outDir}`);
