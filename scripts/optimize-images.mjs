import { mkdir, readdir, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const editorialRoot = path.join(root, 'redaktioneller_inhalt');
const outputRoot = path.join(editorialRoot, 'optimiert');
const manifestFile = path.join(editorialRoot, 'bildoptimierung.json');
const sources = ['bilder', 'veranstaltungen'];
const imagePattern = /\.(?:jpe?g|png|webp)$/i;
const manifest = {};
let created = 0;

async function collectFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectFiles(fullPath));
    else if (entry.isFile() && imagePattern.test(entry.name)) files.push(fullPath);
  }
  return files;
}

await rm(outputRoot, { recursive: true, force: true });

for (const sourceName of sources) {
  const sourceRoot = path.join(editorialRoot, sourceName);
  for (const inputFile of await collectFiles(sourceRoot)) {
    const relative = path.relative(editorialRoot, inputFile);
    const parsed = path.parse(relative);
    const outputRelative = path.join('optimiert', parsed.dir, `${parsed.name}.webp`);
    const outputFile = path.join(editorialRoot, outputRelative);
    await mkdir(path.dirname(outputFile), { recursive: true });

    await sharp(inputFile)
      .rotate()
      .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82, effort: 5 })
      .toFile(outputFile);

    const originalWebPath = `redaktioneller_inhalt/${relative.split(path.sep).join('/')}`;
    const optimizedWebPath = `redaktioneller_inhalt/${outputRelative.split(path.sep).join('/')}`;
    manifest[originalWebPath] = optimizedWebPath;
    created += 1;
  }
}

await writeFile(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);

const originalBytes = await Promise.all(Object.keys(manifest).map(async webPath =>
  (await stat(path.join(root, webPath))).size));
const optimizedBytes = await Promise.all(Object.values(manifest).map(async webPath =>
  (await stat(path.join(root, webPath))).size));
const before = originalBytes.reduce((sum, size) => sum + size, 0);
const after = optimizedBytes.reduce((sum, size) => sum + size, 0);
const saving = before ? Math.round((1 - after / before) * 100) : 0;

console.log(`${created} Bilder als WebP optimiert (${saving}% kleiner).`);
