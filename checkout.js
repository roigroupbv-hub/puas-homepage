// Cart & checkout: 4 steps (cart, details, shipping, payment), order summary aside.
// Uses the shared cart from script.js; placing the order stores a summary and goes to bevestiging.html.

const SHIPPING = [
  { name: 'PostNL', desc: '2–3 werkdagen · franco vanaf € 500', cost: (subEx) => (subEx >= FRANCO_EX ? 0 : SHIPPING_EX) },
  { name: 'PostNL avond', desc: 'Morgen tussen 18.00 en 22.00', cost: () => 9.95 },
  { name: 'Ophalen', desc: 'Showroom Van Diemenstraat 214, Amsterdam', cost: () => 0, pickup: true },
];
const PAYMENTS = [
  { name: 'iDEAL', desc: 'Via je eigen bank' },
  { name: 'Creditcard', desc: 'Visa, Mastercard, Amex' },
  { name: 'Bancontact', desc: 'Voor België' },
  { name: 'Op factuur', desc: 'Binnen 30 dagen · zakelijke accounts', businessOnly: true },
];
const STEPS = ['Winkelmand', 'Gegevens', 'Verzending', 'Betaling'];
const CO_UPSELLS = ['tafelloper-kawung', 'wierook-cendana', 'schaal-manik', 'ata-mand-met-deksel', 'kussenhoes-parang'];

const co = { step: 1, reached: 1, business: false, ship: 0, pay: 0 };
const $c = (id) => document.getElementById(id);

function totals() {
  const t = window.puasCart.totals();
  const shipEx = t.subEx === 0 ? 0 : SHIPPING[co.ship].cost(t.subEx);
  const vat = Math.round((t.subEx + shipEx) * 0.21 * 100) / 100;
  return { subEx: t.subEx, shipEx, vat, total: Math.round((t.subEx + shipEx + vat) * 100) / 100 };
}

function optionHtml(o, i, selected, kind, right, disabled) {
  return `<button type="button" class="option${i === selected ? ' is-active' : ''}" data-${kind}="${i}"${disabled ? ' disabled' : ''}>
    <span class="option__radio"><span></span></span>
    <span class="option__text"><b>${o.name}</b><span>${o.desc}</span></span>
    <span class="option__right">${right}</span>
  </button>`;
}

function render() {
  const lines = window.puasCart.lines;
  const t = totals();
  const empty = lines.length === 0;

  // Step tabs: go back always, forward only to steps already reached
  $c('steps').innerHTML = STEPS.map((label, i) => {
    const n = i + 1;
    const state = n === co.step ? ' is-active' : n < co.step ? ' is-done' : '';
    return `<button type="button" class="step${state}" data-step="${n}"${n > co.reached || empty ? ' disabled' : ''}><span>${n}</span>${label}</button>`;
  }).join('');
  document.querySelectorAll('[data-pane]').forEach((p) => { p.hidden = Number(p.dataset.pane) !== co.step; });

  // Step 1: lines
  $c('co-empty').hidden = !empty;
  $c('co-filled').hidden = empty;
  $c('co-lines').innerHTML = lines.map((l, i) => {
    const p = findProduct(l.slug);
    const unit = unitEx(p, l.qty);
    const ti = tierIndex(l.qty);
    return `<div class="co-line">
      <a href="${productUrl(p)}" class="co-line__img"><img src="${p.img}" alt=""></a>
      <div>
        <div class="co-line__label">${esc(p.label)}</div>
        <a href="${productUrl(p)}" class="co-line__name">${esc(p.name)}</a>
        <div class="co-line__detail">${esc(l.variant || p.detail)} · ${ti === 0 ? 'basisstaffel' : 'staffel ' + (ti + 1)}</div>
        <button type="button" class="link-btn link-btn--muted co-line__remove" data-line-remove="${i}">Verwijderen</button>
      </div>
      <div class="stepper stepper--sm stepper--co"><button type="button" data-line-dec="${i}" aria-label="Minder">−</button><span>${l.qty}</span><button type="button" data-line-inc="${i}" aria-label="Meer">+</button></div>
      <div class="co-line__price"><b>${fmt(Math.round(unit * l.qty * 100) / 100)}</b><span>${fmt(unit)} p/st · excl. btw</span></div>
    </div>`;
  }).join('');

  const gift = t.subEx >= GIFT_EX;
  $c('co-gift-text').textContent = gift ? 'Het armbandje Manik gaat gratis mee.' : 'Nog ' + fmt(GIFT_EX - t.subEx) + ' excl. btw tot je gratis armbandje Manik.';
  $c('co-gift-fill').style.width = Math.min(100, Math.round(t.subEx / GIFT_EX * 100)) + '%';

  $c('co-upsells').innerHTML = CO_UPSELLS.filter((s) => !lines.some((l) => l.slug === s)).slice(0, 3).map((s) => {
    const p = findProduct(s);
    return `<div class="co-upsell">
      <a href="${productUrl(p)}" class="co-upsell__img"><img src="${p.img}" alt=""></a>
      <div><div class="co-upsell__name">${esc(p.name)}</div><div class="co-upsell__price">${fmt(p.ex)} <span>p/st · doos van ${MOQ}</span></div>
      <button type="button" class="btn-pattern btn-pattern--xs" data-co-add="${p.slug}">Toevoegen</button></div>
    </div>`;
  }).join('');

  // Step 2: business fields
  document.querySelectorAll('[data-business-field]').forEach((f) => {
    f.hidden = !co.business;
    f.querySelector('input').required = co.business;
  });
  $c('seg-private').classList.toggle('is-active', !co.business);
  $c('seg-business').classList.toggle('is-active', co.business);

  // Step 3 & 4: options
  $c('ship-options').innerHTML = SHIPPING.map((o, i) => {
    const cost = o.cost(t.subEx);
    return optionHtml(o, i, co.ship, 'ship', cost === 0 ? (o.pickup ? 'Gratis' : 'Franco') : fmt(cost) + ' excl. btw');
  }).join('');
  if (PAYMENTS[co.pay].businessOnly && !co.business) co.pay = 0;
  $c('pay-options').innerHTML = PAYMENTS.map((o, i) =>
    optionHtml(o, i, co.pay, 'pay', o.businessOnly && !co.business ? 'Alleen zakelijk' : '', o.businessOnly && !co.business)).join('');
  $c('bank-field').hidden = co.pay !== 0;
  $c('place-order').textContent = 'Bestelling plaatsen · ' + fmt(t.total);

  // Aside
  $c('sum-lines').innerHTML = lines.map((l) => {
    const p = findProduct(l.slug);
    return `<div><span>${l.qty} × ${esc(p.name)}</span><span>${fmt(Math.round(unitEx(p, l.qty) * l.qty * 100) / 100)}</span></div>`;
  }).join('') + (gift ? '<div class="sum-gift"><span>Armbandje Manik · cadeau</span><span>€ 0</span></div>' : '');
  $c('aside-sub').textContent = fmt(t.subEx);
  $c('aside-ship').textContent = t.shipEx === 0 ? (SHIPPING[co.ship].pickup ? 'Gratis' : 'Franco') : fmt(t.shipEx);
  $c('aside-vat').textContent = fmt(t.vat);
  $c('aside-total').textContent = fmt(t.total);
}

function goTo(step) {
  co.step = step;
  co.reached = Math.max(co.reached, step);
  render();
  window.scrollTo({ top: $c('checkout').offsetTop - 24, behavior: 'smooth' });
}

function placeOrder() {
  const form = $c('details-form');
  if (!form.checkValidity()) { goTo(2); form.reportValidity(); return; }
  if (!$c('terms').checked) { $c('terms').reportValidity(); return; }
  const f = Object.fromEntries(new FormData(form));
  const t = totals();
  const ship = SHIPPING[co.ship];
  const pay = PAYMENTS[co.pay];
  const order = {
    number: 'PU-' + String(Math.floor(24200 + Math.random() * 700)),
    placedAt: new Date().toISOString(),
    lines: window.puasCart.lines.map((l) => ({ ...l, unitEx: unitEx(findProduct(l.slug), l.qty) })),
    customer: f,
    business: co.business,
    shipping: { name: ship.name, pickup: !!ship.pickup },
    payment: pay.name + (co.pay === 0 ? ' · ' + $c('bank').value : ''),
    paid: !pay.businessOnly,
    gift: t.subEx >= GIFT_EX,
    totals: t,
  };
  writeStore('puas-last-order', JSON.stringify(order));
  window.puasCart.lines = [];
  window.puasCart.save();
  location.href = 'bevestiging.html';
}

document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-step],[data-next],[data-prev],[data-ship],[data-pay],[data-co-add],#seg-private,#seg-business,#place-order');
  if (!t || t.disabled) return;
  if (t.dataset.step) goTo(Number(t.dataset.step));
  else if (t.dataset.next !== undefined) {
    // Details must be valid before moving on
    if (co.step === 2 && !$c('details-form').reportValidity()) return;
    goTo(co.step + 1);
  }
  else if (t.dataset.prev !== undefined) goTo(co.step - 1);
  else if (t.dataset.ship !== undefined) { co.ship = Number(t.dataset.ship); render(); }
  else if (t.dataset.pay !== undefined) { co.pay = Number(t.dataset.pay); render(); }
  else if (t.dataset.coAdd) window.puasCart.add(t.dataset.coAdd, MOQ);
  else if (t.id === 'seg-private') { co.business = false; render(); }
  else if (t.id === 'seg-business') { co.business = true; render(); }
  else if (t.id === 'place-order') placeOrder();
});
$c('details-form').addEventListener('submit', (e) => e.preventDefault());
$c('coupon').addEventListener('submit', (e) => {
  e.preventDefault();
  $c('coupon-note').textContent = 'Deze code kennen we niet.';
});

// Re-render whenever the shared cart changes (stepper, remove, undo in this page or the drawer)
const saveCart = window.puasCart.save.bind(window.puasCart);
window.puasCart.save = () => { saveCart(); render(); };

render();
