const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');
const menuLabel = menuButton.querySelector('.sr-only');

function closeMenu() {
  navigation.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuLabel.textContent = 'Menü öffnen';
}

menuButton.addEventListener('click', () => {
  const open = navigation.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuLabel.textContent = open ? 'Menü schließen' : 'Menü öffnen';
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
document.querySelector('#year').textContent = new Date().getFullYear();

const slides = [
  ['../redaktioneller_inhalt/optimiert/veranstaltungen/2026-11-11-Seniorennachmittag/PfarrerMitGästen.webp', 'Begegnung im großen Saal'],
  ['../redaktioneller_inhalt/optimiert/veranstaltungen/2026-11-11-Seniorennachmittag/GeselligesBeisammensein.webp', 'Zeit für Gemeinschaft und Gespräche'],
  ['../redaktioneller_inhalt/optimiert/veranstaltungen/2026-11-11-Seniorennachmittag/Küchenteam.webp', 'Die Küche im Einsatz'],
  ['../redaktioneller_inhalt/optimiert/veranstaltungen/2026-11-11-Seniorennachmittag/Musikteam.webp', 'Raum für Musik und Veranstaltungen']
];
const slideshowTrack = document.querySelector('#slideshowTrack');
let currentSlide = 0;

slideshowTrack.innerHTML = slides.map(([source, caption], index) => `
  <figure class="slide${index === 0 ? ' active' : ''}" aria-hidden="${index === 0 ? 'false' : 'true'}">
    <img src="${source}" alt="${caption}" ${index === 0 ? 'fetchpriority="high"' : 'loading="lazy"'}>
    <figcaption class="slide-caption">${caption}</figcaption>
  </figure>
`).join('');

function showSlide(index) {
  currentSlide = (index + slides.length) % slides.length;
  slideshowTrack.querySelectorAll('.slide').forEach((slide, slideIndex) => {
    const active = slideIndex === currentSlide;
    slide.classList.toggle('active', active);
    slide.setAttribute('aria-hidden', String(!active));
  });
}

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  window.setInterval(() => {
    if (!document.hidden) showSlide(currentSlide + 1);
  }, 6500);
}
