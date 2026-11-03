import { readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const articleDirectory = path.join(root, 'redaktioneller_inhalt', 'artikel');
const outputFile = path.join(root, 'redaktioneller_inhalt', 'artikel.json');
const pattern = /^(?<title>[A-Za-z0-9ÄÖÜäöüß]+)-(?<date>\d{4}-\d{2}-\d{2})\.md$/;

function separateCamelCase(value) {
  return value
    .replace(/([a-zäöüß0-9])([A-ZÄÖÜ])/g, '$1 $2')
    .replace(/([A-ZÄÖÜ]+)([A-ZÄÖÜ][a-zäöüß])/g, '$1 $2');
}

function slugify(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const entries = [];
for (const name of await readdir(articleDirectory)) {
  const match = name.match(pattern);
  if (!match) {
    if (name.endsWith('.md')) console.warn(`Übersprungen: ${name}`);
    continue;
  }
  const { title, date } = match.groups;
  entries.push({
    title: separateCamelCase(title),
    date,
    slug: `${slugify(title)}-${date}`,
    file: `redaktioneller_inhalt/artikel/${name}`
  });
}

entries.sort((a, b) => b.date.localeCompare(a.date));
await writeFile(outputFile, `${JSON.stringify(entries, null, 2)}\n`);
console.log(`${entries.length} Artikel in redaktioneller_inhalt/artikel.json erfasst.`);
