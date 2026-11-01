import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const editorialRoot = path.join(root, 'redaktioneller_inhalt');
const eventRoot = path.join(editorialRoot, 'veranstaltungen');
const imageRoot = path.join(editorialRoot, 'bilder');
const articleRoot = path.join(editorialRoot, 'artikel');
const errors = [];
const warnings = [];
const datedNamePattern = /^(?<title>.+?)(?:__|-)(?<date>\d{4}-\d{2}-\d{2})$/;
const articlePattern = /^(?<title>[A-Za-z0-9ÄÖÜäöüß]+)__(?<date>\d{4}-\d{2}-\d{2})\.md$/;
const imagePattern = /\.(?:jpe?g|png|webp)$/i;
const today = new Intl.DateTimeFormat('sv-SE', {
  year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Europe/Berlin'
}).format(new Date());

function validDate(value) {
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

async function exists(file) {
  try { await access(file); return true; } catch { return false; }
}

for (const folder of await readdir(eventRoot, { withFileTypes: true })) {
  if (!folder.isDirectory()) continue;
  const match = folder.name.match(datedNamePattern);
  if (!match) {
    errors.push(`Veranstaltungsordner ohne Datum: ${folder.name}`);
    continue;
  }
  if (!validDate(match.groups.date)) errors.push(`Ungültiges Veranstaltungsdatum: ${folder.name}`);
  const files = await readdir(path.join(eventRoot, folder.name));
  if (match.groups.date >= today && !files.some(file => /^plakat\.(?:jpe?g|png|webp)$/i.test(file))) {
    warnings.push(`Nicht in der Terminansicht (kein Plakat): ${folder.name}`);
  }
}

for (const file of await readdir(imageRoot, { withFileTypes: true })) {
  if (!file.isFile() || !imagePattern.test(file.name)) continue;
  const match = path.parse(file.name).name.match(datedNamePattern);
  if (!match) errors.push(`Freies Bild ohne Datum: ${file.name}`);
  else {
    if (!validDate(match.groups.date)) errors.push(`Ungültiges Datum beim freien Bild: ${file.name}`);
  }
}

for (const file of await readdir(articleRoot, { withFileTypes: true })) {
  if (!file.isFile() || path.extname(file.name).toLowerCase() !== '.md') continue;
  const match = file.name.match(articlePattern);
  if (!match) {
    errors.push(`Artikelname entspricht nicht dem Muster: ${file.name}`);
    continue;
  }
  if (!validDate(match.groups.date)) errors.push(`Ungültiges Artikeldatum: ${file.name}`);

  const articleFile = path.join(articleRoot, file.name);
  const markdown = await readFile(articleFile, 'utf8');
  for (const imageMatch of markdown.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)) {
    const source = imageMatch[1];
    if (/^(?:https?:|data:|\/)/i.test(source)) continue;
    const imageFile = path.resolve(path.dirname(articleFile), source);
    if (!await exists(imageFile)) errors.push(`Fehlendes Artikelbild in ${file.name}: ${source}`);
  }
}

for (const catalogName of ['artikel.json', 'slideshow.json', 'veranstaltungen.json']) {
  const catalogFile = path.join(editorialRoot, catalogName);
  if (!await exists(catalogFile)) errors.push(`Fehlender Katalog: redaktioneller_inhalt/${catalogName}`);
}

if (warnings.length) {
  console.log('\nHinweise:');
  warnings.forEach(message => console.log(`  • ${message}`));
}

if (errors.length) {
  console.error('\nFehler:');
  errors.forEach(message => console.error(`  • ${message}`));
  console.error(`\n${errors.length} Fehler gefunden. Aktualisierung abgebrochen.`);
  process.exitCode = 1;
} else {
  console.log(`Inhaltsprüfung erfolgreich${warnings.length ? ` (${warnings.length} Hinweise)` : ''}.`);
}
