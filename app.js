
function escapeHtml(value) {
  return value.replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[ch]));
}

function renderMarkdown(md) {
  const lines = md.replace(/\r/g, '').split('\n');
  let html = '';
  let inList = false;

  const inline = (text) => escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (/^\s*-\s+/.test(line)) {
      if (!inList) { html += '<ul>'; inList = true; }
      html += `<li>${inline(line.replace(/^\s*-\s+/, ''))}</li>`;
      continue;
    }
    if (inList) { html += '</ul>'; inList = false; }

    if (!line.trim()) continue;
    if (line.startsWith('### ')) html += `<h3>${inline(line.slice(4))}</h3>`;
    else if (line.startsWith('## ')) html += `<h2>${inline(line.slice(3))}</h2>`;
    else if (line.startsWith('# ')) html += `<h1>${inline(line.slice(2))}</h1>`;
    else html += `<p>${inline(line)}</p>`;
  }

  if (inList) html += '</ul>';
  return html;
}


const state = { slideIndex: 0, slides: [] };

async function loadJson(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Fehler beim Laden von ${path}`);
  return res.json();
}

function initMenu() {
  const btn = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
}

async function initSlides() {
  state.slides = await loadJson('content/slides.json');
  const slidesEl = document.querySelector('#slides');
  const dotsEl = document.querySelector('#dots');

  slidesEl.innerHTML = state.slides.map((s, i) => `
    <div class="slide">
      <img src="${s.image}" alt="${s.alt || s.caption || ''}">
      <div class="slide-caption">${s.caption || ''}</div>
    </div>
  `).join('');

  dotsEl.innerHTML = state.slides.map((_, i) =>
    `<button aria-label="Bild ${i + 1}" class="${i === 0 ? 'active' : ''}" data-index="${i}"></button>`
  ).join('');

  const update = () => {
    slidesEl.style.transform = `translateX(-${state.slideIndex * 100}%)`;
    dotsEl.querySelectorAll('button').forEach((b, i) => b.classList.toggle('active', i === state.slideIndex));
  };

  document.querySelector('.next').addEventListener('click', () => {
    state.slideIndex = (state.slideIndex + 1) % state.slides.length; update();
  });
  document.querySelector('.prev').addEventListener('click', () => {
    state.slideIndex = (state.slideIndex - 1 + state.slides.length) % state.slides.length; update();
  });
  dotsEl.addEventListener('click', e => {
    if (e.target.dataset.index) { state.slideIndex = Number(e.target.dataset.index); update(); }
  });

  let startX = null;
  slidesEl.addEventListener('touchstart', e => startX = e.touches[0].clientX, { passive: true });
  slidesEl.addEventListener('touchend', e => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 45) {
      state.slideIndex = dx < 0
        ? (state.slideIndex + 1) % state.slides.length
        : (state.slideIndex - 1 + state.slides.length) % state.slides.length;
      update();
    }
    startX = null;
  });

  setInterval(() => {
    state.slideIndex = (state.slideIndex + 1) % state.slides.length;
    update();
  }, 6500);
}

async function initArticles() {
  const articles = await loadJson('content/articles.json');

  const container = document.querySelector('#articles');
  const detailSection = document.querySelector('#articleDetailSection');
  const detail = document.querySelector('#articleDetail');
  const closeButton = document.querySelector('#articleDetailClose');

  container.innerHTML = articles.map((article, index) => `
    <article class="article-card" tabindex="0" data-index="${index}">
      <img src="${article.image}" alt="${article.title}">
      <div class="card-body">
        <div class="meta">${article.date || ''}</div>
        <h3>${article.title}</h3>
        <p>${article.summary || ''}</p>
      </div>
    </article>
  `).join('');

  async function openArticle(index) {
    const article = articles[index];

    const response = await fetch(article.file);

    if (!response.ok) {
      detail.innerHTML = `
        <p>Der Artikel konnte nicht geladen werden.</p>
      `;

      detailSection.hidden = false;
      detailSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });

      return;
    }

    const markdown = await response.text();

    detail.innerHTML = `
      <img
        class="article-detail-image"
        src="${article.image}"
        alt="${article.title}"
      >

      ${renderMarkdown(markdown)}
    `;

    detailSection.hidden = false;

    detailSection.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }

  function closeArticle() {
    detailSection.hidden = true;
    detail.innerHTML = '';

    document.querySelector('#aktuelles').scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }

  container.addEventListener('click', (event) => {
    const card = event.target.closest('.article-card');

    if (!card) {
      return;
    }

    openArticle(Number(card.dataset.index));
  });

  container.addEventListener('keydown', (event) => {
    const card = event.target.closest('.article-card');

    if (!card) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openArticle(Number(card.dataset.index));
    }
  });

  closeButton.addEventListener('click', closeArticle);
}

async function initGroups() {
  const groups = await loadJson('content/groups.json');
  document.querySelector('#groups').innerHTML = groups.map(g => `
    <article class="group-card">
      <div class="group-icon">${g.icon || '✦'}</div>
      <h3>${g.name}</h3>
      <p>${g.description}</p>
    </article>
  `).join('');
}

document.querySelector('#year').textContent = new Date().getFullYear();
initMenu();
Promise.all([initSlides(), initArticles(), initGroups()]).catch(err => console.error(err));


const legalTexts = {
  impressum: `
    <h1>Impressum</h1>
    <p><strong>Angaben zum Anbieter dieser privaten Informationsseite</strong></p>
    <p>
      Gerhard-Walter Schuster<br>
      Aubenham 6<br>
      84564 Oberbergkirchen
    </p>
    <p>E-Mail: <a href="mailto:acker-teig8s@icloud.com">acker-teig8s@icloud.com</a></p>
    <p>
      Diese Website ist eine private Informationsseite und kein offizieller Internetauftritt
      der Katholischen Pfarrgemeinde Oberbergkirchen, des Pfarrverbands Schönberg
      oder des Erzbistums München und Freising.
    </p>
    <p>
      Offizielle Informationen finden Sie auf der
      <a href="https://www2.erzbistum-muenchen.de/pfarrei/pv-schoenberg/cont/61843"
         target="_blank" rel="noopener noreferrer">offiziellen Seite der Pfarrei</a>.
    </p>
  `,
  datenschutz: `
    <h1>Datenschutz</h1>
    <p>
      Diese Website wird als private Informationsseite betrieben.
      Beim bloßen Aufruf dieser Seite werden von dieser Website selbst keine Cookies gesetzt,
      keine Analyse- oder Trackingdienste eingesetzt und keine Formulare betrieben.
    </p>
    <h2>Hosting über GitHub Pages</h2>
    <p>
      Die Website wird über GitHub Pages bereitgestellt. Beim Aufruf können technisch
      erforderliche Verbindungsdaten wie IP-Adresse, Zeitpunkt des Zugriffs und aufgerufene
      Ressource durch den Hostinganbieter verarbeitet bzw. protokolliert werden.
    </p>
    <h2>Externe Links</h2>
    <p>
      Beim Anklicken externer Links verlassen Sie diese Website.
      Für die Datenverarbeitung auf den verlinkten Seiten sind die jeweiligen Anbieter verantwortlich.
    </p>
    <h2>Kontakt</h2>
    <p>
      Bei einer Kontaktaufnahme per E-Mail werden die übermittelten Angaben nur zur Bearbeitung
      der jeweiligen Anfrage verwendet.
    </p>
    <p>
      Kontakt: <a href="mailto:acker-teig8s@icloud.com">acker-teig8s@icloud.com</a>
    </p>
  `
};

const legalDialog = document.querySelector('#legalDialog');
const legalDetail = document.querySelector('#legalDetail');

document.querySelectorAll('[data-legal]').forEach(btn => {
  btn.addEventListener('click', () => {
    legalDetail.innerHTML = legalTexts[btn.dataset.legal];
    legalDialog.showModal();
  });
});
document.querySelector('.legal-close').addEventListener('click', () => legalDialog.close());
legalDialog.addEventListener('click', e => {
  if (e.target === legalDialog) legalDialog.close();
});
