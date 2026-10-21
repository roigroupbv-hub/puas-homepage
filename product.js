// Product page: gallery, tier prices, colour/size, quantity (min. 6), add to order, sticky buy bar.
// Product comes from ?p=<slug>; unknown or missing slug falls back to Kussenhoes Parang.

const product = findProduct(new URLSearchParams(location.search).get('p')) || PRODUCTS[0];
const gallery = product.gallery || [product.img];

const ACCORDIONS = [
  { title: 'Beschrijving', body: product.description || `${product.name}: ${product.detail}. ${product.label}, handgemaakt en per doos van 6 stuks geleverd.` },
  { title: 'Materiaal & onderhoud', body: product.care || `${product.mat}. Onderhoudsadvies staat op het productblad, op te vragen bij je accountmanager.` },
  { title: 'Herkomst', body: 'Handgemaakt op Java, Indonesië. Rechtstreeks ingekocht via onze WFTO-partner. Elk doek is uniek en kan licht afwijken van de foto.' },
  { title: 'Levering & betaling', body: 'Levering per doos van 6 stuks, franco vanaf € 500 in NL en BE. Betaling op factuur binnen 30 dagen na goedkeuring van je zakelijke account. Niet-verkochte voorraad kan binnen 90 dagen omgeruild worden voor andere motieven.' },
  { title: 'Downloads voor retailers', body: 'Productblad met EAN-codes, hoge-resolutiefoto\'s, motiefkaartjes voor in de winkel en productteksten: download via je account of vraag ze op bij je accountmanager.' },
];

const REVIEWS = [
  { stars: '★★★★★', title: 'Mooier dan op de foto', date: '12 augustus 2026', body: 'De stof is stevig en het motief is echt met de hand getekend — je ziet kleine variaties in de lijnen. Past prachtig op onze linnen bank.', author: 'Marieke, Utrecht' },
  { stars: '★★★★★', title: 'Fijn dat het verhaal erbij zit', date: '3 juli 2026', body: 'Er zat een kaartje bij over de werkplaats en de betekenis van parang. Cadeau gegeven aan mijn moeder, ze was er stil van.', author: 'Daan, Gent' },
  { stars: '★★★★☆', title: 'Kleur iets warmer dan verwacht', date: '21 juni 2026', body: 'Prachtige kwaliteit. Het bruin is in het echt iets roder dan op mijn scherm, maar bij ons interieur werkt dat juist goed.', author: 'Sanne, Haarlem' },
];
const BARS = [{ n: 5, c: 31, w: 84 }, { n: 4, c: 4, w: 11 }, { n: 3, c: 2, w: 5 }, { n: 2, c: 0, w: 0 }, { n: 1, c: 0, w: 0 }];

const pdp = { img: 0, color: 0, size: product.defaultSize || 0, qty: MOQ, open: 0 };
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
$p('rating').innerHTML = product.rating
  ? `<span class="stars">★★★★★</span><span>${product.rating.score} · ${product.rating.count} beoordelingen van retailers</span>`
  : '';
$p('rating').hidden = !product.rating;
$p('stock-usp').textContent = `Voorraad: ${product.stock * MOQ} stuks · levertijd 2–3 werkdagen`;
$p('sticky-img').src = product.img;
$p('sticky-name').textContent = product.name;

const motif = MOTIFS[product.motief];
if (motif) {
  $p('motif-block').hidden = false;
  $p('motif-name').textContent = product.motief;
  $p('motif-text').innerHTML = motif.text.map((t) => `<p>${esc(t)}</p>`).join('');
  $p('motif-img').src = product.img;
  document.querySelector('.motif-block__circle').classList.add('motif__circle--' + product.motief.toLowerCase());
}

if (product.rating) {
  $p('reviews').hidden = false;
  $p('review-bars').innerHTML = BARS.map((b) =>
    `<div class="bar"><span>${b.n}</span><div class="bar__track"><div style="width:${b.w}%"></div></div><span>${b.c}</span></div>`).join('');
  $p('review-list').innerHTML = REVIEWS.map((r) => `<div class="review">
    <div class="review__head"><div><span class="stars">${r.stars}</span><b>${esc(r.title)}</b></div><span>${r.date}</span></div>
    <p>${esc(r.body)}</p>
    <div class="review__author">${esc(r.author)} · Geverifieerde koper</div>
  </div>`).join('');
}

$p('related').innerHTML = PRODUCTS.filter((p) => p.slug !== product.slug).slice(0, 4).map((p) => `
  <article class="product">
    <a href="${productUrl(p)}" class="product__photo"><img src="${p.img}" alt="${esc(p.name)}" loading="lazy"><span class="product__label">${esc(p.label)}</span></a>
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
  $p('thumbs').innerHTML = gallery.length < 2 ? '' : gallery.map((src, i) =>
    `<button type="button" class="pdp__thumb${i === pdp.img ? ' is-active' : ''}" data-img="${i}" aria-label="Foto ${i + 1}"><img src="${src}" alt=""></button>`).join('');

  $p('unit-price').textContent = fmt(unit);
  $p('unit-label').textContent = 'per stuk · ' + btwLabel;
  $p('btw-toggle').classList.toggle('is-on', incl);
  $p('btw-toggle').setAttribute('aria-pressed', String(incl));
  $p('btw-toggle-label').textContent = incl ? 'Toon excl. btw' : 'Toon incl. btw';
  const margin = product.rrp ? Math.round((1 - prices[ti] / (product.rrp / 1.21)) * 100) : null;
  $p('price-note').textContent = (product.rrp ? `Adviesverkoopprijs ${fmt(product.rrp).replace(',00', '')} · Marge ${margin}% · ` : '') + 'Minimale afname 6 stuks';

  $p('tiers').innerHTML = TIER_STEPS.map((t, i) => `<button type="button" class="tier${i === ti ? ' is-active' : ''}" data-tier="${i}">
    <span>${t.range} st.</span><b>${fmt(withVat(prices[i], incl))}</b><em>${i === 0 ? 'basisprijs' : '−' + Math.round((1 - prices[i] / prices[0]) * 100) + '%'}</em></button>`).join('');
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
  $p('savings').textContent = saved > 0 ? '· je bespaart ' + fmt(saved) + ' t.o.v. de basisstaffel' : '';
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
