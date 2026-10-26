// Product page: gallery, tier prices, colour/size, quantity (min. 6), add to order, sticky buy bar.
// Product comes from ?p=<slug>; unknown or missing slug falls back to Kussenhoes Parang.

const product = findProduct(new URLSearchParams(location.search).get('p')) || PRODUCTS[0];
const gallery = product.gallery || [product.img];

const ACCORDIONS = [
  { title: 'Beschrijving', body: product.description || `${product.name}, ${product.detail.toLowerCase()}. ${product.label}, met de hand gemaakt in Indonesië. Je bestelt per doos van zes.` },
  { title: 'Materiaal & onderhoud', body: product.care || `Gemaakt van ${product.mat.toLowerCase()}. Vraag ons gerust om het productblad, daar staat het onderhoudsadvies op.` },
  { title: 'Herkomst', body: 'Met de hand gemaakt in Indonesië, in kleine oplages. Daardoor is geen stuk precies gelijk aan de foto: een lijn loopt net anders, een kleur valt iets warmer uit. Dat hoort erbij.' },
  { title: 'Levering & betaling', body: 'Je bestelt al vanaf één stuk; per doos van zes betaal je de voordeligere doosprijs. Vanaf € 500 excl. btw leveren we franco in Nederland en België, daaronder kost het € 19,50. Betalen op factuur kan binnen 30 dagen, zodra je zakelijke account is goedgekeurd. Blijft er iets liggen? Onverkochte voorraad ruil je binnen 90 dagen om voor een ander motief.' },
  { title: 'Voor in je winkel', body: 'Productbladen, foto\'s in hoge resolutie en uitlegkaartjes over het motief sturen we je op verzoek. De kaartjes zitten ook in elke doos.' },
];


const pdp = { img: 0, color: 0, size: product.defaultSize || 0, qty: BOX, open: 0 };
const $p = (id) => document.getElementById(id);
const all = (sel) => document.querySelectorAll(sel);

function variant() {
  const parts = [];
  if (product.colors) parts.push(product.colors[pdp.color].name);
  if (product.sizes) parts.push(product.sizes[pdp.size]);
  return parts.join(' · ');
}

// Static parts: set once
document.title = product.name + ' · PUAS';
$p('crumb-name').textContent = product.name;
$p('main-label').textContent = product.label;
$p('eyebrow').textContent = product.eyebrow;
$p('name').textContent = product.name;
$p('subline').textContent = product.subline || `${product.label} · ${product.detail}`;
$p('stock-usp').textContent = `Voorraad: ${product.stock * BOX} stuks · levertijd 2–3 werkdagen`;
$p('sticky-img').src = thumbOf(product);
$p('sticky-name').textContent = product.name;

const motif = MOTIFS[product.motief];
if (motif) {
  $p('motif-block').hidden = false;
  $p('motif-name').textContent = product.motief;
  $p('motif-text').innerHTML = motif.text.map((t) => `<p>${esc(t)}</p>`).join('');
  $p('motif-img').src = product.img;
  document.querySelector('.motif-block__photo').hidden = !!product.noPhoto;
  document.querySelector('.motif-block__circle').classList.add('motif__circle--' + product.motief.toLowerCase());
}


$p('related').innerHTML = PRODUCTS.filter((p) => p.slug !== product.slug).slice(0, 4).map((p) => `
  <article class="product">
    <a href="${productUrl(p)}" class="product__photo"><img src="${thumbOf(p)}" alt="${esc(p.name)}" loading="lazy"><span class="product__label">${esc(p.label)}</span></a>
    <div class="product__info">
      <div><a href="${productUrl(p)}" class="product__name">${esc(p.name)}</a><div class="product__detail">${esc(p.detail)}</div></div>
      <div class="product__price"><div class="price${p.cmp ? ' price--sale' : ''} js-related-price" data-ex="${p.ex}"></div></div>
    </div>
    <button type="button" class="btn-pattern" data-add-box="${p.slug}">In winkelmand</button>
  </article>`).join('');

function render() {
  const incl = window.puasBtw.incl;
  const btwLabel = incl ? 'incl. btw' : 'excl. btw';
  const prices = tierPrices(product);
  const ti = tierIndex(pdp.qty);
  const unit = withVat(prices[ti], incl);
  const total = Math.round(unit * pdp.qty * 100) / 100;
  const saved = (withVat(prices[0], incl) - unit) * pdp.qty;

  $p('main-img').src = gallery[pdp.img];
  $p('main-img').alt = product.name;
  $p('thumbs').hidden = gallery.length < 2;
  document.querySelector('.pdp').classList.toggle('pdp--single', gallery.length < 2);
  $p('thumbs').innerHTML = gallery.length < 2 ? '' : gallery.map((src, i) =>
    `<button type="button" class="pdp__thumb${i === pdp.img ? ' is-active' : ''}" data-img="${i}" aria-label="Foto ${i + 1}"><img src="${src}" alt=""></button>`).join('');

  $p('unit-price').textContent = fmt(unit);
  $p('unit-label').textContent = 'per stuk · ' + btwLabel;
  $p('btw-toggle').classList.toggle('is-on', incl);
  $p('btw-toggle').setAttribute('aria-pressed', String(incl));
  $p('btw-toggle-label').textContent = incl ? 'Toon excl. btw' : 'Toon incl. btw';
  const margin = product.rrp ? Math.round((1 - prices[ti] / (product.rrp / 1.21)) * 100) : null;
  $p('price-note').textContent = (product.rrp ? `Adviesverkoopprijs ${fmt(product.rrp).replace(',00', '')} · Marge ${margin}% · ` : '') + 'Los vanaf 1 stuk, voordeliger per doos van 6';

  $p('tiers').innerHTML = TIER_STEPS.map((t, i) => `<button type="button" class="tier${i === ti ? ' is-active' : ''}" data-tier="${i}">
    <span>${t.range} st.</span><b>${fmt(withVat(prices[i], incl))}</b><em>${t.short}</em></button>`).join('');
  $p('mini-tiers').innerHTML = TIER_STEPS.map((t, i) =>
    `<button type="button" class="mini-tier${i === ti ? ' is-active' : ''}" data-tier="${i}">${t.range} st.</button>`).join('');

  if (product.colors) {
    $p('color-block').hidden = false;
    $p('color-name').textContent = product.colors[pdp.color].name;
    $p('colors').innerHTML = product.colors.map((c, i) =>
      `<button type="button" class="swatch${i === pdp.color ? ' is-active' : ''}" data-color="${i}" title="${c.name}" aria-label="${c.name}"><span style="background:${c.hex}"></span></button>`).join('');
  }
  if (product.sizes) {
    $p('size-block').hidden = false;
    $p('sizes').innerHTML = product.sizes.map((s, i) =>
      `<button type="button" class="size${i === pdp.size ? ' is-active' : ''}" data-size="${i}">${s}</button>`).join('');
  }

  all('.js-qty').forEach((el) => { el.textContent = pdp.qty; });
  all('.js-unit').forEach((el) => { el.textContent = fmt(unit); });
  all('.js-total').forEach((el) => { el.textContent = fmt(total); });
  all('.js-btw').forEach((el) => { el.textContent = btwLabel; });
  $p('savings').textContent = saved > 0 ? '· je bespaart ' + fmt(saved) + ' t.o.v. losse stuks' : '';
  $p('sticky-variant').textContent = [variant(), product.label].filter(Boolean).join(' · ');

  $p('accordions').innerHTML = ACCORDIONS.map((a, i) => `<div class="acc">
    <button type="button" class="acc__head" data-acc="${i}" aria-expanded="${pdp.open === i}">${a.title}<span>${pdp.open === i ? '−' : '+'}</span></button>
    ${pdp.open === i ? `<p>${esc(a.body)}</p>` : ''}
  </div>`).join('');

  all('.js-related-price').forEach((el) => { el.textContent = fmt(withVat(Number(el.dataset.ex), incl)); });
}

let addedTimer;
function addToOrder() {
  window.puasAdd(product.slug, pdp.qty, variant());
  all('.js-add').forEach((b) => { b.textContent = 'Toegevoegd ✓'; b.classList.add('is-added'); });
  clearTimeout(addedTimer);
  addedTimer = setTimeout(() => all('.js-add').forEach((b) => { b.textContent = 'In bestelling'; b.classList.remove('is-added'); }), 1800);
}

document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-img],[data-tier],[data-color],[data-size],[data-qty],[data-acc],.js-add');
  if (!t) return;
  if (t.dataset.img !== undefined) pdp.img = Number(t.dataset.img);
  else if (t.dataset.tier !== undefined) pdp.qty = TIER_STEPS[Number(t.dataset.tier)].min;
  else if (t.dataset.color !== undefined) pdp.color = Number(t.dataset.color);
  else if (t.dataset.size !== undefined) pdp.size = Number(t.dataset.size);
  else if (t.dataset.qty !== undefined) pdp.qty = Math.min(999, Math.max(MOQ, pdp.qty + Number(t.dataset.qty)));
  else if (t.dataset.acc !== undefined) pdp.open = pdp.open === Number(t.dataset.acc) ? -1 : Number(t.dataset.acc);
  else if (t.classList.contains('js-add')) return addToOrder();
  render();
});

$p('btw-toggle').addEventListener('click', () => window.puasBtw.set(!window.puasBtw.incl));
document.addEventListener('puas:btw', render);

// Sticky buy bar shows once the main buy button has scrolled out of view
const sticky = $p('sticky-buy');
function updateSticky() {
  const show = $p('buy').getBoundingClientRect().bottom < 0;
  if (show === sticky.classList.contains('is-visible')) return;
  sticky.classList.toggle('is-visible', show);
  sticky.setAttribute('aria-hidden', String(!show));
}
window.addEventListener('scroll', updateSticky, { passive: true });
updateSticky();

render();
