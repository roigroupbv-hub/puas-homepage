// Contact: message form with topics (demo, nothing is sent) and FAQ accordion.

const TOPICS = [
  { label: 'Prijslijst', ph: 'Voor welk type winkel of project wil je de prijslijst ontvangen?' },
  { label: 'Samples', ph: 'Welke artikelen wil je als sample zien, en in welke aantallen denk je?' },
  { label: 'Showroom', ph: 'Wanneer komt een bezoek je uit? Noem gerust twee opties.' },
  { label: 'Anders', ph: 'Waar kunnen we je mee helpen?' },
];
const FAQS = [
  { q: 'Wat is de minimale afname voor zakelijke klanten?', a: 'Zes stuks per artikel, dat is één doos. Vanaf € 500 excl. btw leveren we franco in Nederland en België. Wil je veel meer, of een eigen kleur? Dan maken we een offerte.' },
  { q: 'Kan ik op factuur betalen?', a: 'Ja. Zodra je zakelijke account is goedgekeurd, betaal je binnen 30 dagen op factuur.' },
  { q: 'Hoe snel wordt er geleverd?', a: 'Wat op voorraad is, gaat binnen 2 à 3 werkdagen de deur uit. Maatwerk duurt een stuk langer; de precieze levertijd spreken we per opdracht af.' },
  { q: 'Kan ik niet-verkochte voorraad omruilen?', a: 'Ja, binnen 90 dagen ruil je onbeschadigde artikelen om voor een ander motief of een andere maat. Handig als iets in jouw winkel minder loopt dan je dacht.' },
  { q: 'Krijg ik materiaal voor in de winkel?', a: 'In elke doos zitten uitlegkaartjes over het motief. Productteksten en foto\'s in hoge resolutie sturen we je op verzoek.' },
];

const ct = { topic: 0, open: 0 };
const $k = (id) => document.getElementById(id);

function renderTopics() {
  $k('topics').innerHTML = TOPICS.map((t, i) =>
    `<button type="button" class="topic${i === ct.topic ? ' is-active' : ''}" data-topic="${i}" aria-pressed="${i === ct.topic}">${t.label}</button>`).join('');
  $k('m-message').placeholder = TOPICS[ct.topic].ph;
}

function renderFaq() {
  $k('faq').innerHTML = FAQS.map((f, i) => `<div class="acc acc--faq">
    <button type="button" class="acc__head" data-faq="${i}" aria-expanded="${ct.open === i}">${f.q}<span>${ct.open === i ? '−' : '+'}</span></button>
    ${ct.open === i ? `<p>${esc(f.a)}</p>` : ''}
  </div>`).join('');
}

document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-topic],[data-faq]');
  if (!t) return;
  if (t.dataset.topic !== undefined) { ct.topic = Number(t.dataset.topic); renderTopics(); }
  else { const i = Number(t.dataset.faq); ct.open = ct.open === i ? -1 : i; renderFaq(); }
});

$k('msg-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!e.target.reportValidity()) return;
  $k('msg-sent-title').textContent = 'Dank je wel, ' + $k('m-name').value.trim().split(' ')[0];
  $k('msg-sent-text').textContent = `Je bericht is binnen. Lisa neemt binnen één werkdag contact met je op via ${$k('m-email').value.trim()}.`;
  $k('msg-form-wrap').hidden = true;
  $k('msg-sent').hidden = false;
});

$k('msg-reset').addEventListener('click', () => {
  $k('msg-form').reset();
  $k('msg-sent').hidden = true;
  $k('msg-form-wrap').hidden = false;
});

renderTopics();
renderFaq();
