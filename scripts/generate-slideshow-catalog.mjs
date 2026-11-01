import { readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const editorialRoot = path.join(root, 'redaktioneller_inhalt');
const eventRoot = path.join(editorialRoot, 'veranstaltungen');
const imageRoot = path.join(editorialRoot, 'bilder');
const outputFile = path.join(editorialRoot, 'slideshow.json');
const imagePattern = /\.(?:jpe?g|png|webp)$/i;
const datedNamePattern = /^(?<title>.+?)(?:__|-)(?<date>\d{4}-\d{2}-\d{2})$/;

function readableTitle(value) {
  return value
    .replace(/([a-zäöüß0-9])([A-ZÄÖÜ])/g, '$1 $2')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function webPath(...parts) {
  return parts.join('/');
}

const entries = [];

for (const folder of await readdir(eventRoot, { withFileTypes: true })) {
  if (!folder.isDirectory()) continue;
  const folderMatch = folder.name.match(datedNamePattern);
  if (!folderMatch) {
    console.warn(`Veranstaltungsordner ohne gültiges Datum übersprungen: ${folder.name}`);
    continue;
  }
  const files = await readdir(path.join(eventRoot, folder.name), { withFileTypes: true });
  for (const file of files) {
    if (!file.isFile() || !imagePattern.test(file.name) || /^plakat(?:\.|-|_)/i.test(file.name)) continue;
    const title = readableTitle(path.parse(file.name).name);
    entries.push({
      title,
      date: folderMatch.groups.date,
      source: folder.name,
      image: webPath('redaktioneller_inhalt', 'veranstaltungen', folder.name, file.name)
    });
  }
}

for (const file of await readdir(imageRoot, { withFileTypes: true })) {
  if (!file.isFile() || !imagePattern.test(file.name)) continue;
  const parsed = path.parse(file.name);
  const match = parsed.name.match(datedNamePattern);
  if (!match) {
    console.warn(`Freies Bild ohne gültiges Datum übersprungen: ${file.name}`);
    continue;
  }
  entries.push({
    title: readableTitle(match.groups.title),
    date: match.groups.date,
    source: `frei:${file.name}`,
    image: webPath('redaktioneller_inhalt', 'bilder', file.name)
  });
}

entries.sort((a, b) => b.date.localeCompare(a.date));
await writeFile(outputFile, `${JSON.stringify(entries, null, 2)}\n`);
console.log(`${entries.length} Bilder in redaktioneller_inhalt/slideshow.json erfasst.`);
