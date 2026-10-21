// Search: live filter over the shared product list; the query is kept in the URL (?q=...).

const SUGGESTIONS = ['kussenhoes', 'parang', 'mand', 'wierook', 'keramiek'];
const $s = (id) => document.getElementById(id);
const input = $s('search-input');

const haystack = (p) => [p.name, p.detail, p.label, p.motief, p.mat, p.kleur, p.eyebrow].join(' ').toLowerCase();

// Every word of the query has to appear somewhere in the product's text
function search(q) {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  return PRODUCTS.filter((p) => words.every((w) => haystack(p).includes(w)));
}

function render() {
  const q = input.value.trim();
  const results = q ? search(q) : PRODUCTS;
  const incl = window.puasBtw.incl;

  $s('search-clear').hidden = !q;
  $s('search-count').textContent = q
    ? `${results.length} ${results.length === 1 ? 'resultaat' : 'resultaten'} voor “${q}”`
    : `${PRODUCTS.length} producten · prijzen ${incl ? 'incl.' : 'excl.'} btw`;
  $s('search-empty').hidden = results.length > 0;
  $s('search-empty-title').textContent = `Niets gevonden voor “${q}”`;

  $s('search-grid').innerHTML = results.map((p) => `
    <article class="product">
      <a href="${productUrl(p)}" class="product__photo"><img src="${thumbOf(p)}" alt="${esc(p.name)}" loading="lazy"><span class="product__label">${esc(p.label)}</span></a>
      <div class="product__info">
        <div><a href="${productUrl(p)}" class="product__name">${esc(p.name)}</a><div class="product__detail">${esc(p.detail)}</div></div>
        <div class="product__price">
          <div class="price${p.cmp ? ' price--sale' : ''}">${fmt(withVat(p.ex, incl))}</div>
          ${p.cmp ? `<div class="price-compare">${fmt(withVat(p.cmp, incl))}</div>` : ''}
        </div>
      </div>
      <button type="button" class="btn-pattern" data-add-box="${p.slug}">In winkelmand</button>
    </article>`).join('');

  const url = q ? '?q=' + encodeURIComponent(q) : location.pathname;
  history.replaceState(null, '', url);
}

$s('suggestions').innerHTML = SUGGESTIONS.map((s) => `<button type="button" class="suggest" data-suggest="${s}">${s}</button>`).join('');

document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-suggest]');
  if (!t) return;
  input.value = t.dataset.suggest;
  render();
});
$s('search-clear').addEventListener('click', () => { input.value = ''; render(); input.focus(); });
$s('search-form').addEventListener('submit', (e) => { e.preventDefault(); render(); });
input.addEventListener('input', render);
document.addEventListener('puas:btw', render);

input.value = new URLSearchParams(location.search).get('q') || '';
render();
input.focus();
