// Service: three tabs (shipping & returns, batik care, FAQ), selectable via #verzenden / #onderhoud / #vragen.

const SERVICE_FAQ = [
  { q: 'Wat is het verschil tussen batik tulis en batik cap?', a: 'Tulis is met de hand getekend met een canting; één doek kost weken. Cap wordt gestempeld met een koperen stempel: sneller, betaalbaarder, nog steeds handwerk.' },
  { q: 'Waarom zijn geen twee producten precies hetzelfde?', a: 'Elk doek wordt met de hand gemaakt en in kleine baden geverfd. De foto geeft een goede indruk, geen exacte kopie.' },
  { q: 'Kan ik een product eerst zien?', a: 'Ja, in de showroom in Amsterdam, op afspraak. Zakelijke klanten kunnen samples laten opsturen.' },
  { q: 'Kan ik als particulier bestellen?', a: 'Nee, PUAS levert alleen aan winkels, horeca en interieurontwerpers: per doos van 6, met staffelprijzen, franco vanaf € 500 en betalen op factuur. Vraag een zakelijk account aan.' },
  { q: 'Wat zit er in het pakket?', a: 'Je bestelling verpakt in gerecycled papier, met een handgeschreven kaartje en de uitleg van het motief. Vanaf € 100 gaat een armbandje Manik mee.' },
];
const TABS = ['verzenden', 'onderhoud', 'vragen'];
let faqOpen = 0;

function showTab(name) {
  const tab = TABS.includes(name) ? name : TABS[0];
  document.querySelectorAll('.service-tab').forEach((t) => {
    const on = t.dataset.tab === tab;
    t.classList.toggle('is-active', on);
    t.setAttribute('aria-selected', String(on));
    // On narrow screens the tab row scrolls sideways: bring the active tab into view
    if (on) t.parentElement.scrollLeft = t.offsetLeft - t.parentElement.offsetLeft - 24;
  });
  document.querySelectorAll('.service-pane').forEach((p) => { p.hidden = p.dataset.pane !== tab; });
}

function renderServiceFaq() {
  document.getElementById('service-faq').innerHTML = SERVICE_FAQ.map((f, i) => `<div class="acc acc--service">
    <button type="button" class="acc__head" data-sfaq="${i}" aria-expanded="${faqOpen === i}"><span>${f.q}</span><span>${faqOpen === i ? '−' : '+'}</span></button>
    ${faqOpen === i ? `<p>${esc(f.a)}</p>` : ''}
  </div>`).join('');
}

document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-sfaq]');
  if (!t) return;
  const i = Number(t.dataset.sfaq);
  faqOpen = faqOpen === i ? -1 : i;
  renderServiceFaq();
});

// Tabs are plain #links: the hash decides which tab shows (also from footer links on other pages)
window.addEventListener('hashchange', () => showTab(location.hash.slice(1)));
showTab(location.hash.slice(1));
renderServiceFaq();
