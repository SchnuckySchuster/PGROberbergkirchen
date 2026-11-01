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

const slideshow = document.querySelector('.slideshow');
const slideshowTrack = document.querySelector('#slideshowTrack');
const previousSlideButton = document.querySelector('#previousSlide');
const nextSlideButton = document.querySelector('#nextSlide');
const toggleSlideshowButton = document.querySelector('#toggleSlideshow');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const slideshowState = {
  images: [],
  index: 0,
  manuallyPaused: reducedMotion.matches,
  pauseUntil: 0,
  touchStartX: null
};

function berlinToday() {
  return new Intl.DateTimeFormat('sv-SE', {
    year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Europe/Berlin'
  }).format(new Date());
}

function weightedImageOrder(images) {
  const pool = [...images];
  const ordered = [];
  const today = new Date(`${berlinToday()}T12:00:00Z`);
  let previousSource = null;

  while (pool.length) {
    const alternatives = pool.filter(image => image.source !== previousSource);
    const candidates = alternatives.length ? alternatives : pool;
    const weighted = candidates.map(image => {
      const ageDays = Math.max(0, (today - new Date(`${image.date}T12:00:00Z`)) / 86400000);
      return { image, weight: .18 + Math.exp(-ageDays / 180) };
    });
    const total = weighted.reduce((sum, entry) => sum + entry.weight, 0);
    let draw = Math.random() * total;
    let selected = weighted.at(-1).image;
    for (const entry of weighted) {
      draw -= entry.weight;
      if (draw <= 0) { selected = entry.image; break; }
    }
    ordered.push(selected);
    previousSource = selected.source;
    pool.splice(pool.indexOf(selected), 1);
  }
  return ordered;
}

function showSlide(index) {
  if (!slideshowState.images.length) return;
  slideshowState.index = (index + slideshowState.images.length) % slideshowState.images.length;
  slideshowTrack.querySelectorAll('.slide').forEach((slide, slideIndex) => {
    const active = slideIndex === slideshowState.index;
    slide.classList.toggle('active', active);
    slide.setAttribute('aria-hidden', String(!active));
  });
}

function pauseAfterInteraction() {
  slideshowState.pauseUntil = Date.now() + 15000;
}

function changeSlide(step) {
  pauseAfterInteraction();
  showSlide(slideshowState.index + step);
}

function updatePauseButton() {
  const paused = slideshowState.manuallyPaused;
  toggleSlideshowButton.setAttribute('aria-pressed', String(paused));
  toggleSlideshowButton.setAttribute('aria-label', paused ? 'Diashow fortsetzen' : 'Diashow anhalten');
  toggleSlideshowButton.querySelector('[aria-hidden]').textContent = paused ? '▶' : 'Ⅱ';
}

async function loadSlideshow() {
  const response = await fetch('redaktioneller_inhalt/slideshow.json');
  if (!response.ok) throw new Error('Der Bilderkatalog konnte nicht geladen werden.');
  const today = berlinToday();
  const catalog = (await response.json()).filter(image => image.date <= today);
  slideshowState.images = weightedImageOrder(catalog);

  if (!slideshowState.images.length) {
    slideshow.hidden = true;
    return;
  }

  slideshowTrack.innerHTML = slideshowState.images.map((image, index) => `
    <div class="slide${index === 0 ? ' active' : ''}" aria-hidden="${index === 0 ? 'false' : 'true'}">
      <img src="${escapeHtml(image.image)}" alt="${escapeHtml(image.title)}" ${index === 0 ? 'fetchpriority="high"' : 'loading="lazy"'}>
    </div>
  `).join('');
  slideshow.classList.toggle('single-slide', slideshowState.images.length === 1);
  updatePauseButton();
}

previousSlideButton.addEventListener('click', () => changeSlide(-1));
nextSlideButton.addEventListener('click', () => changeSlide(1));
toggleSlideshowButton.addEventListener('click', () => {
  slideshowState.manuallyPaused = !slideshowState.manuallyPaused;
  slideshowState.pauseUntil = 0;
  updatePauseButton();
});
slideshowTrack.addEventListener('touchstart', event => {
  slideshowState.touchStartX = event.touches[0].clientX;
}, { passive: true });
slideshowTrack.addEventListener('touchend', event => {
  if (slideshowState.touchStartX === null) return;
  const distance = event.changedTouches[0].clientX - slideshowState.touchStartX;
  if (Math.abs(distance) > 45) changeSlide(distance < 0 ? 1 : -1);
  slideshowState.touchStartX = null;
}, { passive: true });
setInterval(() => {
  if (!slideshowState.manuallyPaused && Date.now() >= slideshowState.pauseUntil && !document.hidden) {
    showSlide(slideshowState.index + 1);
  }
}, 6500);

loadSlideshow().catch(error => {
  console.error(error);
  slideshow.hidden = true;
});

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

const eventRail = document.querySelector('#eventRail');
const eventDialog = document.querySelector('#eventDialog');
const eventDialogImage = document.querySelector('#eventDialogImage');

async function loadEvents() {
  const response = await fetch('redaktioneller_inhalt/veranstaltungen.json');
  if (!response.ok) throw new Error('Der Veranstaltungskatalog konnte nicht geladen werden.');
  const upcomingEvents = (await response.json()).filter(event => event.date >= berlinToday());

  if (!upcomingEvents.length) {
    eventRail.innerHTML = '<p class="event-empty">Im Moment sind keine kommenden Veranstaltungen eingetragen.</p>';
    return;
  }

  const events = await Promise.all(upcomingEvents.map(async event => {
    if (!event.information) return { ...event, preview: '' };
    const informationResponse = await fetch(event.information);
    const markdown = informationResponse.ok ? await informationResponse.text() : '';
    return { ...event, preview: articlePreview(markdown) };
  }));

  eventRail.innerHTML = events.map(event => `
    <article class="event-card">
      ${event.poster ? `
        <button class="event-poster" type="button" data-event-poster="${escapeHtml(event.poster)}" data-event-title="${escapeHtml(event.title)}" aria-label="Plakat zu ${escapeHtml(event.title)} vergrößern">
          <img src="${escapeHtml(event.poster)}" alt="Plakat: ${escapeHtml(event.title)}" loading="lazy">
        </button>
      ` : '<div class="event-card-color" aria-hidden="true"></div>'}
      <div class="event-card-body">
        <time datetime="${escapeHtml(event.date)}">${escapeHtml(formatDate(event.date))}</time>
        <h3>${escapeHtml(event.title)}</h3>
        ${event.preview ? `<p>${escapeHtml(event.preview)}</p>` : ''}
        ${event.poster ? '<span>Plakat öffnen <span aria-hidden="true">↗</span></span>' : ''}
      </div>
    </article>
  `).join('');
}

eventRail.addEventListener('click', event => {
  const trigger = event.target.closest('[data-event-poster]');
  if (!trigger) return;
  eventDialogImage.src = trigger.dataset.eventPoster;
  eventDialogImage.alt = `Plakat: ${trigger.dataset.eventTitle}`;
  eventDialog.showModal();
});
document.querySelector('.event-dialog-close').addEventListener('click', () => eventDialog.close());
eventDialog.addEventListener('click', event => { if (event.target === eventDialog) eventDialog.close(); });

loadEvents().catch(error => {
  console.error(error);
  eventRail.innerHTML = '<p class="event-empty">Die kommenden Termine konnten leider nicht geladen werden.</p>';
});

let optimizationManifest = {};

async function loadOptimizationManifest() {
  const response = await fetch('redaktioneller_inhalt/bildoptimierung.json');
  if (response.ok) optimizationManifest = await response.json();
}

function resolveArticleAsset(article, source) {
  if (/^(?:https?:|data:|\/)/i.test(source)) return source;
  const base = new URL(article.file, window.location.href);
  const originalUrl = new URL(source, base);
  const marker = 'redaktioneller_inhalt/';
  const markerIndex = originalUrl.pathname.indexOf(marker);
  if (markerIndex >= 0) {
    const originalPath = decodeURIComponent(originalUrl.pathname.slice(markerIndex));
    const optimizedPath = optimizationManifest[originalPath];
    if (optimizedPath) return new URL(optimizedPath, document.baseURI).href;
  }
  return originalUrl.href;
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

loadOptimizationManifest().then(loadArticles).catch(error => {
  console.error(error);
  articleRail.innerHTML = '<p class="loading-message">Die Artikel konnten leider nicht geladen werden.</p>';
});

const legalTexts = {
  impressum: `
    <h1 id="legalTitle">Impressum</h1>
    <h2>Anbieter dieser Website</h2>
    <p>Gerhard-Walter Schuster<br>Aubenham 6<br>84564 Oberbergkirchen</p>
    <p><strong>Kontakt</strong><br>E-Mail: <a href="mailto:acker-teig8s@icloud.com">acker-teig8s@icloud.com</a></p>
    <h2>Verantwortlich für den Inhalt</h2>
    <p>Verantwortlich im Sinne des § 18 Abs. 2 Medienstaatsvertrag (MStV):</p>
    <p>Gerhard-Walter Schuster<br>Aubenham 6<br>84564 Oberbergkirchen</p>
    <h2>Hinweis zum Angebot</h2>
    <p>Diese Website ist eine private Informationsseite über die Arbeit des Pfarrgemeinderats Oberbergkirchen. Sie ist kein offizieller Internetauftritt des Pfarrverbands Schönberg oder des Erzbistums München und Freising.</p>
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
