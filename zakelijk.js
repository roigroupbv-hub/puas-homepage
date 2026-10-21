// Zakelijk: tier price table from the shared product data, account request form (demo, nothing is sent).

const TABLE_PRODUCTS = ['kussenhoes-parang', 'tafelloper-kawung', 'ata-mand-met-deksel', 'wierook-cendana'];
const $z = (id) => document.getElementById(id);

$z('price-table').innerHTML =
  `<div class="price-table__row price-table__row--head"><span>Product</span>${TIER_STEPS.map((t) => `<span>${t.range} st.</span>`).join('')}</div>` +
  TABLE_PRODUCTS.map((slug) => {
    const p = findProduct(slug);
    return `<div class="price-table__row"><a href="${productUrl(p)}">${esc(p.name)}</a>${tierPrices(p).map((n) => `<span>${fmt(n)}</span>`).join('')}</div>`;
  }).join('');

document.querySelectorAll('.type-chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.type-chip').forEach((c) => {
      c.classList.toggle('is-active', c === chip);
      c.setAttribute('aria-pressed', String(c === chip));
    });
  });
});

$z('apply-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!e.target.reportValidity()) return;
  e.target.hidden = true;
  $z('apply-sent').hidden = false;
});
