const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');
const menuLabel = menuButton.querySelector('.sr-only');

function closeMenu() {
  navigation.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuLabel.textContent = 'Menü öffnen';
}

menuButton.addEventListener('click', () => {
  const isOpen = navigation.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuLabel.textContent = isOpen ? 'Menü schließen' : 'Menü öffnen';
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
document.querySelector('#year').textContent = new Date().getFullYear();

function escapeHtml(value = '') {
  return value.replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  })[character]);
}

function formatDate(value) {
  return new Intl.DateTimeFormat('de-DE', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Berlin'
  }).format(new Date(`${value}T12:00:00+01:00`));
}

function resolveArticleAsset(article, source) {
  if (/^(?:https?:|data:|\/)/i.test(source)) return source;
  const base = new URL(article.file, window.location.href);
  return new URL(source, base).href;
}

function inlineMarkdown(text) {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}

function renderMarkdown(markdown, article) {
  const lines = markdown.replace(/\r/g, '').split('\n');
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

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const image = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    const listItem = line.match(/^[-*]\s+(.+)$/);

    if (!line) { flushParagraph(); flushList(); continue; }
    if (image) {
      flushParagraph(); flushList();
      const source = escapeHtml(resolveArticleAsset(article, image[2]));
      const caption = escapeHtml(image[1]);
      output.push(`<figure><img src="${source}" alt="${caption}">${caption ? `<figcaption>${caption}</figcaption>` : ''}</figure>`);
    } else if (heading) {
      flushParagraph(); flushList();
      const level = heading[1].length;
      output.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
    } else if (listItem) {
      flushParagraph();
      list.push(listItem[1]);
    } else {
      flushList();
      paragraph.push(line);
    }
  }
  flushParagraph(); flushList();
  return output.join('');
}

function articlePreview(markdown) {
  const paragraphs = markdown.split(/\n\s*\n/)
    .map(part => part.trim())
    .filter(part => part && !part.startsWith('#') && !part.startsWith('![') && !/^\*.*\*$/.test(part));
  return (paragraphs[0] || 'Artikel öffnen und weiterlesen.')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`#]/g, '')
    .slice(0, 190);
}

function firstArticleImage(markdown, article) {
  const match = markdown.match(/!\[[^\]]*\]\(([^)]+)\)/);
  return match ? resolveArticleAsset(article, match[1]) : null;
}

const articleState = { articles: [], previousHash: '#artikel' };
const articleRail = document.querySelector('#articleRail');
const articleReader = document.querySelector('#articleReader');
const articleContent = document.querySelector('#articleContent');
const articleIndexDialog = document.querySelector('#articleIndexDialog');
const articleIndex = document.querySelector('#articleIndex');

async function loadArticles() {
  const response = await fetch('redaktioneller_inhalt/artikel.json');
  if (!response.ok) throw new Error('Der Artikelkatalog konnte nicht geladen werden.');
  const catalog = await response.json();

  articleState.articles = await Promise.all(catalog.map(async article => {
    const markdownResponse = await fetch(article.file);
    if (!markdownResponse.ok) throw new Error(`Artikel konnte nicht geladen werden: ${article.file}`);
    const markdown = await markdownResponse.text();
    return {
      ...article,
      markdown,
      preview: articlePreview(markdown),
      image: firstArticleImage(markdown, article)
    };
  }));

  articleRail.innerHTML = articleState.articles.map(article => `
    <article class="article-card">
      ${article.image ? `<img src="${escapeHtml(article.image)}" alt="">` : '<div class="article-card-color" aria-hidden="true"></div>'}
      <div class="article-card-body">
        <time datetime="${escapeHtml(article.date)}">${escapeHtml(formatDate(article.date))}</time>
        <h3>${escapeHtml(article.title)}</h3>
        <p>${escapeHtml(article.preview)}${article.preview.length === 190 ? ' …' : ''}</p>
        <button type="button" data-article="${escapeHtml(article.slug)}">Artikel lesen <span aria-hidden="true">→</span></button>
      </div>
    </article>
  `).join('');

  articleIndex.innerHTML = articleState.articles.map(article => `
    <button type="button" data-article="${escapeHtml(article.slug)}">
      <span>${escapeHtml(article.title)}</span>
      <time datetime="${escapeHtml(article.date)}">${escapeHtml(formatDate(article.date))}</time>
    </button>
  `).join('');

  const requestedSlug = decodeURIComponent(window.location.hash.replace(/^#artikel\//, ''));
  if (window.location.hash.startsWith('#artikel/') && requestedSlug) openArticle(requestedSlug, false);
}

function openArticle(slug, updateHash = true) {
  const article = articleState.articles.find(entry => entry.slug === slug);
  if (!article) return;
  if (!document.body.classList.contains('article-open')) articleState.previousHash = window.location.hash || '#artikel';
  articleContent.innerHTML = `
    <p class="reader-date"><time datetime="${escapeHtml(article.date)}">${escapeHtml(formatDate(article.date))}</time></p>
    ${renderMarkdown(article.markdown, article)}
  `;
  document.body.classList.add('article-open');
  articleReader.hidden = false;
  if (articleIndexDialog.open) articleIndexDialog.close();
  if (updateHash) history.pushState({ article: slug }, '', `#artikel/${encodeURIComponent(slug)}`);
  window.scrollTo({ top: 0, behavior: 'auto' });
  document.querySelector('#closeArticle').focus({ preventScroll: true });
}

function closeArticle(updateHistory = true) {
  document.body.classList.remove('article-open');
  articleReader.hidden = true;
  articleContent.innerHTML = '';
  if (updateHistory) history.pushState({}, '', articleState.previousHash || '#artikel');
  document.querySelector('#artikel').scrollIntoView({ block: 'start' });
}

document.addEventListener('click', event => {
  const trigger = event.target.closest('[data-article]');
  if (trigger) openArticle(trigger.dataset.article);
});
document.querySelector('#closeArticle').addEventListener('click', () => closeArticle());
document.querySelector('#randomArticle').addEventListener('click', () => {
  if (!articleState.articles.length) return;
  openArticle(articleState.articles[Math.floor(Math.random() * articleState.articles.length)].slug);
});
document.querySelector('#openArticleIndex').addEventListener('click', () => articleIndexDialog.showModal());
document.querySelector('.article-index-close').addEventListener('click', () => articleIndexDialog.close());
articleIndexDialog.addEventListener('click', event => { if (event.target === articleIndexDialog) articleIndexDialog.close(); });
window.addEventListener('popstate', () => {
  if (window.location.hash.startsWith('#artikel/')) {
    openArticle(decodeURIComponent(window.location.hash.replace('#artikel/', '')), false);
  } else if (document.body.classList.contains('article-open')) {
    closeArticle(false);
  }
});

loadArticles().catch(error => {
  console.error(error);
  articleRail.innerHTML = '<p class="loading-message">Die Artikel konnten leider nicht geladen werden.</p>';
});

const legalTexts = {
  impressum: `
    <h1 id="legalTitle">Impressum</h1>
    <p><strong>Angaben zum Anbieter dieser Informationsseite</strong></p>
    <p>Gerhard-Walter Schuster<br>Aubenham 6<br>84564 Oberbergkirchen</p>
    <p>E-Mail: <a href="mailto:acker-teig8s@icloud.com">acker-teig8s@icloud.com</a></p>
    <p>Diese Website informiert über die Arbeit des Pfarrgemeinderats Oberbergkirchen. Sie ist kein offizieller Internetauftritt des Pfarrverbands Schönberg oder des Erzbistums München und Freising.</p>
    <p>Offizielle Informationen finden Sie auf der <a href="https://www2.erzbistum-muenchen.de/pfarrei/pv-schoenberg/cont/61843" target="_blank" rel="noopener noreferrer">Website des Pfarrverbands Schönberg</a>.</p>
  `,
  datenschutz: `
    <h1 id="legalTitle">Datenschutz</h1>
    <p>Diese Website setzt selbst keine Cookies ein und verwendet keine Analyse- oder Trackingdienste.</p>
    <h2>Hosting über GitHub Pages</h2>
    <p>Beim Aufruf können technisch erforderliche Verbindungsdaten wie IP-Adresse, Zeitpunkt und aufgerufene Ressource durch den Hostinganbieter verarbeitet werden.</p>
    <h2>Externe Links</h2>
    <p>Beim Öffnen externer Links verlassen Sie diese Website. Für die dortige Datenverarbeitung sind die jeweiligen Anbieter verantwortlich.</p>
    <h2>Kontakt</h2>
    <p>Bei einer Kontaktaufnahme per E-Mail werden die übermittelten Angaben nur zur Bearbeitung der Anfrage verwendet.</p>
    <p>E-Mail: <a href="mailto:acker-teig8s@icloud.com">acker-teig8s@icloud.com</a></p>
  `
};
const legalDialog = document.querySelector('#legalDialog');
const legalDetail = document.querySelector('#legalDetail');
document.querySelectorAll('[data-legal]').forEach(button => {
  button.addEventListener('click', () => {
    legalDetail.innerHTML = legalTexts[button.dataset.legal];
    legalDialog.showModal();
  });
});
document.querySelector('.dialog-close:not(.article-index-close)').addEventListener('click', () => legalDialog.close());
legalDialog.addEventListener('click', event => { if (event.target === legalDialog) legalDialog.close(); });
