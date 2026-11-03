import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const contentDirectory = path.join(root, 'redaktioneller_inhalt');
const siteConfig = JSON.parse(await readFile(path.join(root, 'site.config.json'), 'utf8'));
const siteUrl = new URL(siteConfig.siteUrl).href.replace(/\/?$/, '/');
const siteName = 'Pfarrgemeinderat Oberbergkirchen';
const logoUrl = new URL('redaktioneller_inhalt/logo/logo.png', siteUrl).href;

if (!siteUrl.startsWith('https://')) throw new Error('siteUrl in site.config.json muss mit https:// beginnen.');

const escapeHtml = value => String(value)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const jsonForHtml = value => JSON.stringify(value, null, 2).replaceAll('<', '\\u003c');

function inlineMarkdown(text) {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}

function articleDescription(markdown) {
  const paragraph = markdown.split(/\n\s*\n/).map(part => part.trim())
    .find(part => part && !part.startsWith('#') && !part.startsWith('![') && !/^[-*]\s/.test(part));
  return (paragraph || 'Ein Bericht aus dem Gemeindeleben in Oberbergkirchen.')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*_`#]/g, '')
    .replace(/\s+/g, ' ').slice(0, 160);
}

function sourcePathForArticleImage(article, source) {
  if (/^(?:https?:|data:|\/)/i.test(source)) return source;
  return path.posix.normalize(path.posix.join(path.posix.dirname(article.file), source)).normalize('NFC');
}

function resolveArticleImage(article, source, manifest) {
  if (/^(?:https?:|data:)/i.test(source)) return source;
  const original = sourcePathForArticleImage(article, source);
  return new URL(manifest[original] || original, siteUrl).href;
}

function renderMarkdown(markdown, article, manifest) {
  const output = [];
  let paragraph = [];
  let list = [];
  const flushParagraph = () => {
    if (paragraph.length) output.push(`<p>${inlineMarkdown(paragraph.join(' '))}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (list.length) output.push(`<ul>${list.map(item => `<li>${inlineMarkdown(item)}</li>`).join('')}</ul>`);
    list = [];
  };

  for (const rawLine of markdown.replace(/\r/g, '').split('\n')) {
    const line = rawLine.trim();
    const image = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    const listItem = line.match(/^[-*]\s+(.+)$/);
    if (!line) { flushParagraph(); flushList(); continue; }
    if (image) {
      flushParagraph(); flushList();
      const source = escapeHtml(resolveArticleImage(article, image[2], manifest));
      const caption = escapeHtml(image[1]);
      output.push(`<figure><img src="${source}" alt="${caption}" loading="lazy" decoding="async">${caption ? `<figcaption>${caption}</figcaption>` : ''}</figure>`);
    } else if (heading) {
      flushParagraph(); flushList();
      const level = heading[1].length;
      output.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
    } else if (listItem) {
      flushParagraph(); list.push(listItem[1]);
    } else {
      flushList(); paragraph.push(line);
    }
  }
  flushParagraph(); flushList();
  return output.join('\n');
}

function articlePage(article, markdown, manifest) {
  const heading = markdown.match(/^#\s+(.+)$/m)?.[1].trim() || article.title;
  const description = articleDescription(markdown);
  const canonicalUrl = new URL(`artikel/${article.slug}/`, siteUrl).href;
  const imageMatch = markdown.match(/!\[[^\]]*\]\(([^)]+)\)/);
  const imageUrl = imageMatch ? resolveArticleImage(article, imageMatch[1], manifest) : null;
  const structuredData = {
    '@context': 'https://schema.org', '@type': 'Article', headline: heading, description,
    datePublished: article.date, dateModified: article.date, mainEntityOfPage: canonicalUrl,
    inLanguage: 'de-DE', author: { '@type': 'Organization', name: siteName, url: siteUrl },
    publisher: { '@type': 'Organization', name: siteName, logo: { '@type': 'ImageObject', url: logoUrl } },
    ...(imageUrl ? { image: [imageUrl] } : {})
  };
  const formattedDate = new Intl.DateTimeFormat('de-DE', {
    day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Europe/Berlin'
  }).format(new Date(`${article.date}T12:00:00+01:00`));

  return `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#fffaf3">
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}">
  <link rel="icon" type="image/png" href="${escapeHtml(logoUrl)}">
  <meta property="og:type" content="article">
  <meta property="og:locale" content="de_DE">
  <meta property="og:site_name" content="${siteName}">
  <meta property="og:title" content="${escapeHtml(heading)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}">
  ${imageUrl ? `<meta property="og:image" content="${escapeHtml(imageUrl)}">` : ''}
  <meta name="twitter:card" content="${imageUrl ? 'summary_large_image' : 'summary'}">
  <meta name="twitter:title" content="${escapeHtml(heading)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  ${imageUrl ? `<meta name="twitter:image" content="${escapeHtml(imageUrl)}">` : ''}
  <title>${escapeHtml(`${heading} | ${siteName}`)}</title>
  <link rel="stylesheet" href="${escapeHtml(new URL('styles.css?v=2.2.1', siteUrl).href)}">
  <script type="application/ld+json">${jsonForHtml(structuredData)}</script>
</head>
<body>
  <a class="skip-link" href="#artikelinhalt">Zum Inhalt springen</a>
  <header class="site-header">
    <a class="brand" href="${escapeHtml(siteUrl)}" aria-label="Zur Startseite">
      <img src="${escapeHtml(logoUrl)}" alt="Pfarrgemeinderat Oberbergkirchen – Kirche im Aufschwung">
    </a>
  </header>
  <main id="artikelinhalt" class="article-reader">
    <div class="reader-toolbar">
      <a class="reader-back" href="${escapeHtml(new URL('#artikel', siteUrl).href)}">← Zurück zu den Artikeln</a>
    </div>
    <article class="reader-content">
      <p class="reader-date"><time datetime="${escapeHtml(article.date)}">${escapeHtml(formattedDate)}</time></p>
      ${renderMarkdown(markdown, article, manifest)}
    </article>
  </main>
</body>
</html>`;
}

await rm(dist, { recursive: true, force: true });
await mkdir(path.join(dist, 'redaktioneller_inhalt'), { recursive: true });
const indexTemplate = await readFile(path.join(root, 'index.html'), 'utf8');
await writeFile(path.join(dist, 'index.html'), indexTemplate.replaceAll('__SITE_URL__', siteUrl));
for (const file of ['styles.css', 'app.js']) await cp(path.join(root, file), path.join(dist, file));
for (const file of ['artikel.json', 'slideshow.json', 'veranstaltungen.json', 'bildoptimierung.json']) {
  await cp(path.join(contentDirectory, file), path.join(dist, 'redaktioneller_inhalt', file));
}
await cp(path.join(contentDirectory, 'logo'), path.join(dist, 'redaktioneller_inhalt', 'logo'), { recursive: true });
await cp(path.join(contentDirectory, 'artikel'), path.join(dist, 'redaktioneller_inhalt', 'artikel'), { recursive: true });
await cp(path.join(contentDirectory, 'optimiert'), path.join(dist, 'redaktioneller_inhalt', 'optimiert'), { recursive: true });

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
await copyEventInformation(path.join(contentDirectory, 'veranstaltungen'));

const articleCatalog = JSON.parse(await readFile(path.join(contentDirectory, 'artikel.json'), 'utf8'));
const rawManifest = JSON.parse(await readFile(path.join(contentDirectory, 'bildoptimierung.json'), 'utf8'));
const imageManifest = Object.fromEntries(
  Object.entries(rawManifest).map(([source, optimized]) => [source.normalize('NFC'), optimized])
);
for (const article of articleCatalog) {
  const markdown = await readFile(path.join(root, article.file), 'utf8');
  const articleDirectory = path.join(dist, 'artikel', article.slug);
  await mkdir(articleDirectory, { recursive: true });
  await writeFile(path.join(articleDirectory, 'index.html'), articlePage(article, markdown, imageManifest));
}

const sitemapEntries = [
  `  <url><loc>${escapeHtml(siteUrl)}</loc></url>`,
  ...articleCatalog.map(article =>
    `  <url><loc>${escapeHtml(new URL(`artikel/${article.slug}/`, siteUrl).href)}</loc><lastmod>${article.date}</lastmod></url>`)
];
await writeFile(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries.join('\n')}\n</urlset>\n`);
await writeFile(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${new URL('sitemap.xml', siteUrl).href}\n`);
await writeFile(path.join(dist, '.nojekyll'), '');
console.log(`Veröffentlichungspaket unter dist/ erstellt (${articleCatalog.length} indexierbare Artikel).`);
