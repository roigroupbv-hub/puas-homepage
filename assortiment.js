// Assortiment: subcategories, filters with live counts, sort, VAT toggle, add per box of 6.

const SUBCATS = [
  { label: 'Alles', key: null },
  { label: 'Kussens', key: 'kussen' },
  { label: 'Tafeltextiel', key: 'tafel' },
  { label: 'Manden', key: 'mand' },
  { label: 'Keramiek', key: 'keramiek' },
  { label: 'Geur', key: 'geur' },
];

const PRODUCTS = [
  { id: 1, img: 'img/p-kussenhoes-parang.jpg', name: 'Kussenhoes Parang', detail: 'Katoen, 50 × 50 cm', ex: 29.5, cmp: 35.5, label: 'Batik tulis', sub: 'kussen', motief: 'Parang', mat: 'Katoen', kleur: 'Sogan bruin', stock: 40, nieuw: true },
  { id: 2, img: 'img/p-tafelloper-kawung.jpg', name: 'Tafelloper Kawung', detail: 'Katoen, 40 × 180 cm', ex: 41.5, label: 'Batik cap', sub: 'tafel', motief: 'Kawung', mat: 'Katoen', kleur: 'Sogan bruin', stock: 18 },
  { id: 3, img: 'img/p-ata-mand.jpg', name: 'Ata-mand met deksel', detail: 'Ata-riet, ø 28 cm', ex: 52, cmp: 65, label: 'Handgevlochten', sub: 'mand', motief: 'Effen', mat: 'Ata-riet', kleur: 'Naturel', stock: 3 },
  { id: 4, img: 'img/p-wierook-cendana.jpg', name: 'Wierook Cendana', detail: 'Sandelhout, 40 stokjes', ex: 7.25, label: 'Handgerold', sub: 'geur', motief: 'Effen', mat: 'Sandelhout', kleur: 'Naturel', stock: 60, nieuw: true },
  { id: 5, img: 'img/cat-woonaccessoires.jpg', name: 'Vaas Sekar Jagad', detail: 'Keramiek, h 32 cm', ex: 78, label: 'Handbeschilderd', sub: 'keramiek', motief: 'Sekar Jagad', mat: 'Keramiek', kleur: 'Zwart', stock: 9 },
  { id: 6, img: 'img/hero.jpg', name: 'Kussenhoes Truntum', detail: 'Katoen, 45 × 45 cm', ex: 27.5, label: 'Batik cap', sub: 'kussen', motief: 'Truntum', mat: 'Katoen', kleur: 'Indigo', stock: 22 },
  { id: 7, img: 'img/cat-kleding.jpg', name: 'Plaid Sogan', detail: 'Katoen, 130 × 180 cm', ex: 64, label: 'Batik tulis', sub: 'kussen', motief: 'Parang', mat: 'Katoen', kleur: 'Sogan bruin', stock: 5 },
  { id: 8, img: 'img/cat-tassen.jpg', name: 'Broodmand Ata', detail: 'Ata-riet, 32 × 22 cm', ex: 31, label: 'Handgevlochten', sub: 'mand', motief: 'Effen', mat: 'Ata-riet', kleur: 'Naturel', stock: 14 },
  { id: 9, img: 'img/cat-sieraden.jpg', name: 'Schaal Manik', detail: 'Keramiek, ø 24 cm', ex: 36, cmp: 42, label: 'Handbeschilderd', sub: 'keramiek', motief: 'Kawung', mat: 'Keramiek', kleur: 'Zwart', stock: 11 },
];

const GROUPS = [
  { key: 'motief', title: 'Motief', field: 'motief' },
  { key: 'materiaal', title: 'Materiaal', field: 'mat' },
  { key: 'kleur', title: 'Kleur', field: 'kleur' },
  { key: 'prijs', title: 'Inkoopprijs', field: 'prijs' },
];

const SORTS = ['Aanbevolen', 'Prijs ↑', 'Nieuw'];

const state = {
  sub: 0,
  sort: 0,
  btw: readStore('puas-btw') === '1',
  open: { motief: true, materiaal: true, kleur: false, prijs: false },
  sel: new Set(), // "group:value"
  added: new Set(),
};

const $ = (id) => document.getElementById(id);
const fmt = (n) => '€ ' + n.toFixed(2).replace('.', ',');
const vat = (n) => Math.round((state.btw ? n * 1.21 : n) * 100) / 100;
const priceBand = (p) => p.ex < 20 ? 'Tot € 20' : p.ex < 40 ? '€ 20 – 40' : p.ex < 60 ? '€ 40 – 60' : 'Vanaf € 60';
const valueOf = (p, field) => field === 'prijs' ? priceBand(p) : p[field];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function bySub() {
  const key = SUBCATS[state.sub].key;
  return PRODUCTS.filter((p) => !key || p.sub === key);
}

// A product passes when, for every group (except skipField), it matches one of the selected options.
function passes(p, skipField) {
  return GROUPS.every((g) => {
    if (g.field === skipField) return true;
    const chosen = [...state.sel].filter((k) => k.startsWith(g.key + ':')).map((k) => k.slice(g.key.length + 1));
    return chosen.length === 0 || chosen.includes(valueOf(p, g.field));
  });
}

function visibleProducts() {
  let list = bySub().filter((p) => passes(p));
  if (state.sort === 1) list = [...list].sort((a, b) => a.ex - b.ex);
  if (state.sort === 2) list = [...list].sort((a, b) => (b.nieuw ? 1 : 0) - (a.nieuw ? 1 : 0));
  return list;
}

function render() {
  const base = bySub();
  const list = visibleProducts();
  const label = list.length + (list.length === 1 ? ' artikel' : ' artikelen');

  $('subcats').innerHTML = SUBCATS.map((c, i) => {
    const count = PRODUCTS.filter((p) => !c.key || p.sub === c.key).length;
    return `<button type="button" class="pill${i === state.sub ? ' is-active' : ''}" data-sub="${i}">${c.label} <span>${count}</span></button>`;
  }).join('');

  $('filter-groups').innerHTML = GROUPS.map((g) => {
    const options = [...new Set(base.map((p) => valueOf(p, g.field)))];
    const open = state.open[g.key];
    const rows = options.map((o) => {
      const k = g.key + ':' + o;
      const on = state.sel.has(k);
      const count = base.filter((p) => valueOf(p, g.field) === o && passes(p, g.field)).length;
      return `<button type="button" class="opt${on ? ' is-on' : ''}" data-opt="${esc(k)}" aria-pressed="${on}">
        <span class="opt__box">${on ? '✓' : ''}</span><span class="opt__label">${esc(o)}</span><span class="opt__count">${count}</span>
      </button>`;
    }).join('');
    return `<div class="fgroup">
      <button type="button" class="fgroup__head" data-group="${g.key}" aria-expanded="${open}">${g.title}<span>${open ? '−' : '+'}</span></button>
      ${open ? `<div class="fgroup__opts">${rows}</div>` : ''}
    </div>`;
  }).join('');

  $('result-count').textContent = label;
  $('filters-show').textContent = 'Toon ' + label;

  $('active-chips').innerHTML = [...state.sel].map((k) =>
    `<button type="button" class="chip" data-opt="${esc(k)}">${esc(k.split(':')[1])}<span aria-hidden="true">×</span></button>`
  ).join('');

  $('btw-toggle').classList.toggle('is-on', state.btw);
  $('btw-toggle').setAttribute('aria-pressed', String(state.btw));
  $('btw-label').textContent = state.btw ? 'incl. btw' : 'excl. btw';

  $('sorts').innerHTML = SORTS.map((s, i) =>
    `<button type="button" class="sort${i === state.sort ? ' is-active' : ''}" data-sort="${i}">${s}</button>`
  ).join('');

  $('grid').innerHTML = list.map((p) => {
    const added = state.added.has(p.id);
    const discount = p.cmp ? '−' + Math.round((1 - p.ex / p.cmp) * 100) + '%' : '';
    return `<article class="card">
      <a href="#" class="card__link">
        <div class="card__photo">
          <img src="${p.img}" alt="${esc(p.name)}" loading="lazy">
          <span class="card__label">${esc(p.label)}</span>
          ${p.cmp ? `<span class="card__discount">${discount}</span>` : ''}
          ${p.stock <= 5 ? `<span class="card__stock">Nog ${p.stock} dozen</span>` : ''}
        </div>
        <div class="card__info">
          <div class="card__text"><div class="card__name">${esc(p.name)}</div><div class="card__detail">${esc(p.detail)}</div></div>
          <div class="card__price">
            <div class="price${p.cmp ? ' price--sale' : ''}">${fmt(vat(p.ex))}</div>
            ${p.cmp ? `<div class="price-compare">${fmt(vat(p.cmp))}</div>` : ''}
          </div>
        </div>
      </a>
      <div class="card__tier">Per doos van 6 · vanaf 12 st. −7%, vanaf 24 st. −14%</div>
      <button type="button" class="btn-pattern btn-pattern--sm${added ? ' is-added' : ''}" data-add="${p.id}">${added ? 'Toegevoegd ✓' : 'Doos van 6 bestellen'}</button>
    </article>`;
  }).join('');

  $('empty').hidden = list.length > 0;
}

function clearAll() {
  state.sel.clear();
  state.sub = 0;
  render();
}

function setFiltersOpen(open) {
  document.body.classList.toggle('filters-is-open', open);
}

document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-sub],[data-opt],[data-group],[data-sort],[data-add],[data-clear]');
  if (!t) return;
  if (t.dataset.sub !== undefined) { state.sub = Number(t.dataset.sub); render(); }
  else if (t.dataset.opt !== undefined) {
    const k = t.dataset.opt;
    state.sel.has(k) ? state.sel.delete(k) : state.sel.add(k);
    render();
  }
  else if (t.dataset.group !== undefined) { state.open[t.dataset.group] = !state.open[t.dataset.group]; render(); }
  else if (t.dataset.sort !== undefined) { state.sort = Number(t.dataset.sort); render(); }
  else if (t.dataset.clear !== undefined) clearAll();
  else if (t.dataset.add !== undefined) {
    // Update only the button, so the product photos are not rebuilt
    const id = Number(t.dataset.add);
    window.puasCart.add(6);
    state.added.add(id);
    t.classList.add('is-added');
    t.textContent = 'Toegevoegd ✓';
    setTimeout(() => {
      state.added.delete(id);
      const button = document.querySelector(`[data-add="${id}"]`);
      if (button) { button.classList.remove('is-added'); button.textContent = 'Doos van 6 bestellen'; }
    }, 1800);
  }
});

$('btw-toggle').addEventListener('click', () => {
  state.btw = !state.btw;
  writeStore('puas-btw', state.btw ? '1' : '0');
  render();
});

$('filters-open').addEventListener('click', () => setFiltersOpen(true));
$('filters-show').addEventListener('click', () => setFiltersOpen(false));
$('filters-scrim').addEventListener('click', () => setFiltersOpen(false));

render();
