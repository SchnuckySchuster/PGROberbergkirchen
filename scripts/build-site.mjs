import { cp, mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');

await rm(dist, { recursive: true, force: true });
await mkdir(path.join(dist, 'redaktioneller_inhalt'), { recursive: true });

for (const file of ['index.html', 'styles.css', 'app.js']) {
  await cp(path.join(root, file), path.join(dist, file));
}

for (const file of ['artikel.json', 'slideshow.json', 'veranstaltungen.json', 'bildoptimierung.json']) {
  await cp(
    path.join(root, 'redaktioneller_inhalt', file),
    path.join(dist, 'redaktioneller_inhalt', file));
}

await cp(
  path.join(root, 'redaktioneller_inhalt', 'logo'),
  path.join(dist, 'redaktioneller_inhalt', 'logo'),
  { recursive: true });
await cp(
  path.join(root, 'redaktioneller_inhalt', 'artikel'),
  path.join(dist, 'redaktioneller_inhalt', 'artikel'),
  { recursive: true });
await cp(
  path.join(root, 'redaktioneller_inhalt', 'optimiert'),
  path.join(dist, 'redaktioneller_inhalt', 'optimiert'),
  { recursive: true });

async function copyEventInformation(sourceDirectory, relative = '') {
  for (const entry of await readdir(sourceDirectory, { withFileTypes: true })) {
    const source = path.join(sourceDirectory, entry.name);
    const nextRelative = path.join(relative, entry.name);
    if (entry.isDirectory()) await copyEventInformation(source, nextRelative);
    else if (entry.isFile() && entry.name.toLowerCase() === 'information.md') {
      const destination = path.join(dist, 'redaktioneller_inhalt', 'veranstaltungen', nextRelative);
      await mkdir(path.dirname(destination), { recursive: true });
      await cp(source, destination);
    }
  }
}

await copyEventInformation(path.join(root, 'redaktioneller_inhalt', 'veranstaltungen'));
await writeFile(path.join(dist, '.nojekyll'), '');
console.log('Veröffentlichungspaket unter dist/ erstellt.');
