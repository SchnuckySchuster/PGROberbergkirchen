import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const eventRoot = path.join(root, 'redaktioneller_inhalt', 'veranstaltungen');
const outputFile = path.join(root, 'redaktioneller_inhalt', 'veranstaltungen.json');
const optimizationManifest = JSON.parse(await readFile(
  path.join(root, 'redaktioneller_inhalt', 'bildoptimierung.json'), 'utf8'));
const datedNamePattern = /^(?<title>.+?)(?:__|-)(?<date>\d{4}-\d{2}-\d{2})$/;

function readableTitle(value) {
  return value
    .replace(/([a-zäöüß0-9])([A-ZÄÖÜ])/g, '$1 $2')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugify(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const events = [];
for (const folder of await readdir(eventRoot, { withFileTypes: true })) {
  if (!folder.isDirectory()) continue;
  const match = folder.name.match(datedNamePattern);
  if (!match) {
    console.warn(`Veranstaltungsordner ohne gültiges Datum übersprungen: ${folder.name}`);
    continue;
  }

  const files = (await readdir(path.join(eventRoot, folder.name), { withFileTypes: true }))
    .filter(file => file.isFile()).map(file => file.name);
  const poster = files.find(file => /^plakat\.(?:jpe?g|png|webp)$/i.test(file));
  if (!poster) continue;
  const information = files.find(file => /^information\.md$/i.test(file));
  const title = readableTitle(match.groups.title);

  events.push({
    title,
    date: match.groups.date,
    slug: `${slugify(match.groups.title)}-${match.groups.date}`,
    poster: optimizationManifest[`redaktioneller_inhalt/veranstaltungen/${folder.name}/${poster}`]
      || `redaktioneller_inhalt/veranstaltungen/${folder.name}/${poster}`,
    information: information
      ? `redaktioneller_inhalt/veranstaltungen/${folder.name}/${information}`
      : null
  });
}

events.sort((a, b) => a.date.localeCompare(b.date));
await writeFile(outputFile, `${JSON.stringify(events, null, 2)}\n`);
console.log(`${events.length} Veranstaltungen in redaktioneller_inhalt/veranstaltungen.json erfasst.`);
