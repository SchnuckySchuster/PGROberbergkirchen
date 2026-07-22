
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
    `<button aria-label="Bild ${i+1}" class="${i===0?'active':''}" data-index="${i}"></button>`
  ).join('');

  const update = () => {
    slidesEl.style.transform = `translateX(-${state.slideIndex * 100}%)`;
    dotsEl.querySelectorAll('button').forEach((b,i) => b.classList.toggle('active', i === state.slideIndex));
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
  slidesEl.addEventListener('touchstart', e => startX = e.touches[0].clientX, {passive:true});
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
  container.innerHTML = articles.map((a, i) => `
    <article class="article-card" tabindex="0" data-index="${i}">
      <img src="${a.image}" alt="">
      <div class="card-body">
        <div class="meta">${a.date || ''}</div>
        <h3>${a.title}</h3>
        <p>${a.summary || ''}</p>
      </div>
    </article>
  `).join('');

  const dialog = document.querySelector('#articleDialog');
  const detail = document.querySelector('#articleDetail');

  async function openArticle(index) {
    const a = articles[index];
    const res = await fetch(a.file);
    if (!res.ok) return;
    const md = await res.text();
    detail.innerHTML = marked.parse(md);
    dialog.showModal();
  }

  container.addEventListener('click', e => {
    const card = e.target.closest('.article-card');
    if (card) openArticle(card.dataset.index);
  });
  container.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('article-card')) {
      openArticle(e.target.dataset.index);
    }
  });

  document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
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
