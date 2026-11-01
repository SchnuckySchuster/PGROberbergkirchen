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
document.querySelector('.dialog-close').addEventListener('click', () => legalDialog.close());
legalDialog.addEventListener('click', event => { if (event.target === legalDialog) legalDialog.close(); });
