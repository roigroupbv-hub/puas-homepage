// Shared across pages: storage, mobile menu, VAT preference, cart (drawer, toasts, remove-confirm), newsletter.
// Needs data.js loaded first.

function readStore(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}
function writeStore(key, value) {
  try { localStorage.setItem(key, value); } catch { /* storage unavailable: keep in-page only */ }
}

// ---------- Mobile menu ----------
const menuButton = document.querySelector('.header__menu');
const nav = document.querySelector('.nav');
menuButton.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', String(open));
});

// ---------- VAT preference (shared by all pages) ----------
window.puasBtw = {
  incl: readStore('puas-btw') === '1',
  set(incl) {
    this.incl = incl;
    writeStore('puas-btw', incl ? '1' : '0');
    document.dispatchEvent(new CustomEvent('puas:btw'));
  },
};

// ---------- Cart ----------
// Demo cart kept in this browser only; lines are { slug, variant, qty }.
const SHIPPING_EX = 19.5;
const FRANCO_EX = 500;
const GIFT_EX = 100;

function loadLines() {
  try {
    const lines = JSON.parse(readStore('puas-cart-lines') || '[]');
    return Array.isArray(lines) ? lines.filter((l) => findProduct(l.slug) && l.qty >= MOQ) : [];
  } catch { return []; }
}

const cart = {
  lines: loadLines(),
  save() {
    writeStore('puas-cart-lines', JSON.stringify(this.lines));
    renderCart();
  },
  count() { return this.lines.reduce((a, l) => a + l.qty, 0); },
  find(slug, variant) { return this.lines.find((l) => l.slug === slug && l.variant === variant); },
  add(slug, qty, variant = '') {
    const line = this.find(slug, variant);
    if (line) line.qty += qty;
    else this.lines.unshift({ slug, variant, qty });
    this.save();
  },
  setQty(index, qty) {
    this.lines[index].qty = Math.max(MOQ, qty);
    this.save();
  },
  remove(index) {
    const [line] = this.lines.splice(index, 1);
    this.save();
    return line;
  },
  restore(line, index) {
    this.lines.splice(Math.min(index, this.lines.length), 0, line);
    this.save();
  },
  totals() {
    const subEx = this.lines.reduce((a, l) => a + unitEx(findProduct(l.slug), l.qty) * l.qty, 0);
    const shipEx = subEx >= FRANCO_EX || subEx === 0 ? 0 : SHIPPING_EX;
    const vat = Math.round((subEx + shipEx) * 0.21 * 100) / 100;
    return { subEx, shipEx, vat, total: Math.round((subEx + shipEx + vat) * 100) / 100 };
  },
};
window.puasCart = cart;

const CART_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>';

document.body.insertAdjacentHTML('beforeend', `
  <div class="scrim" id="cart-scrim"></div>
  <aside class="drawer" id="cart-drawer" aria-label="Je bestelling" aria-hidden="true">
    <div class="drawer__head">
      <div><div class="drawer__title">Je bestelling</div><div class="drawer__sub" id="cart-sub"></div></div>
      <button type="button" class="icon-btn" data-cart-close aria-label="Sluiten">×</button>
    </div>
    <div class="drawer__body">
      <div id="cart-lines"></div>
      <div class="gift" id="cart-gift"></div>
      <div class="upsells" id="cart-upsells"></div>
      <div class="franco">
        <div class="franco__row"><span id="franco-note"></span><span id="franco-pct"></span></div>
        <div class="franco__bar"><div id="franco-fill"></div></div>
      </div>
    </div>
    <div class="drawer__foot">
      <div class="sumrow"><span id="sum-sub-label"></span><span id="sum-sub"></span></div>
      <div class="sumrow" id="sum-gift-row"><span>Cadeau: kralenarmband Manik</span><span class="sumrow__free">Gratis</span></div>
      <div class="sumrow"><span>Verzending</span><span id="sum-ship"></span></div>
      <div class="sumrow sumrow--vat"><span>Btw 21%</span><span id="sum-vat"></span></div>
      <div class="sumrow sumrow--total"><span>Totaal incl. btw</span><span id="sum-total"></span></div>
      <a href="winkelwagen.html" class="btn-dark">Bestelling afronden</a>
      <div class="drawer__note"><span>Betaling op factuur, 30 dagen</span><button type="button" class="link-btn" data-cart-close>Verder winkelen</button></div>
    </div>
  </aside>

  <div class="toast" id="toast" role="status">
    <div class="toast__check">✓</div>
    <div class="toast__body">
      <div class="toast__title">Terima kasih! <span>Dank je wel</span></div>
      <div class="toast__text" id="toast-text"></div>
      <div class="toast__actions"><button type="button" class="toast__primary" data-cart-open>Bekijk bestelling</button><button type="button" class="link-btn link-btn--dark" data-toast-close>Verder winkelen</button></div>
    </div>
    <div class="toast__img"><img id="toast-img" alt=""></div>
  </div>

  <div class="toast" id="regret" role="status">
    <div class="toast__check toast__check--outline">–</div>
    <div class="toast__body">
      <div class="toast__title" id="regret-title"></div>
      <div class="toast__text">Van gedachten veranderd? Je kunt het nog even terugzetten.</div>
      <div class="toast__actions"><button type="button" class="toast__primary" id="regret-undo">Terugzetten</button><button type="button" class="link-btn link-btn--dark" data-regret-close>Sluiten</button></div>
    </div>
  </div>

  <div class="modal-scrim" id="confirm-scrim"></div>
  <div class="modal" id="confirm" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
    <div class="modal__row">
      <div class="thumb thumb--lg"><img id="confirm-img" alt=""></div>
      <div>
        <div class="modal__title" id="confirm-title">Weet je het zeker?</div>
        <p id="confirm-text"></p>
      </div>
    </div>
    <div class="modal__actions">
      <button type="button" class="btn-dark" id="confirm-keep">Toch bewaren</button>
      <button type="button" class="btn-ghost" id="confirm-remove">Ja, verwijder</button>
    </div>
  </div>
`);

const $id = (id) => document.getElementById(id);
const badge = $id('cart-count');
const UPSELLS = [
  { slug: 'wierook-cendana', reason: 'Klein prijsje, doet het goed bij de kassa' },
  { slug: 'ata-mand-met-deksel', reason: 'Handig om kussens in te presenteren' },
  { slug: 'tafelloper-kawung', reason: 'Dezelfde warme bruintinten als de Parang' },
];

let lastCount = null;
function renderCart() {
  const incl = window.puasBtw.incl;
  const btwLabel = incl ? 'incl. btw' : 'excl. btw';
  const t = cart.totals();
  badge.textContent = String(cart.count());
  badge.hidden = cart.count() === 0;
  // Let the cart icon wiggle when something was added
  if (lastCount !== null && cart.count() > lastCount) {
    const icon = badge.closest('.cart');
    icon.classList.remove('is-bumping');
    void icon.offsetWidth; // restart the animation
    icon.classList.add('is-bumping');
  }
  lastCount = cart.count();

  $id('cart-sub').textContent = `${cart.count()} stuks · ${btwLabel}`;
  $id('cart-lines').innerHTML = cart.lines.length ? cart.lines.map((l, i) => {
    const p = findProduct(l.slug);
    const ti = tierIndex(l.qty);
    const unit = withVat(unitEx(p, l.qty), incl);
    return `<div class="line">
      <a href="${productUrl(p)}" class="thumb"><img src="${thumbOf(p)}" alt=""></a>
      <div class="line__main">
        <a href="${productUrl(p)}" class="line__name">${esc(p.name)}</a>
        <div class="line__meta">${esc(l.variant || p.detail)}</div>
        <div class="line__meta">${ti === 0 ? 'Basisstaffel · vanaf 12 st. −7%' : 'Staffel ' + (ti + 1) + ' actief'}</div>
        <div class="line__controls">
          <div class="stepper stepper--sm"><button type="button" data-line-dec="${i}" aria-label="Minder">−</button><span>${l.qty}</span><button type="button" data-line-inc="${i}" aria-label="Meer">+</button></div>
          <button type="button" class="link-btn link-btn--muted" data-line-remove="${i}">Verwijder</button>
        </div>
      </div>
      <div class="line__price"><div>${fmt(Math.round(unit * l.qty * 100) / 100)}</div><span>${fmt(unit)} / st.</span></div>
    </div>`;
  }).join('') : '<div class="drawer__empty">Nog niets in je bestelling.</div>';

  const gift = t.subEx >= GIFT_EX;
  const giftEl = $id('cart-gift');
  giftEl.classList.toggle('is-unlocked', gift);
  giftEl.innerHTML = `<div class="gift__img"><img src="img/cat-sieraden-sm.webp" alt=""></div>
    <div class="gift__text"><div>${gift ? 'Je armbandje gaat mee' : 'Nog ' + fmt(GIFT_EX - t.subEx) + ' tot een armbandje cadeau'}</div>
    <span>${gift ? 'Een handgeregen kralenarmband Manik, als bedankje.' : 'Vanaf € 100 excl. btw doen we er een handgeregen kralenarmband Manik bij.'}</span></div>
    ${gift ? '<span class="gift__badge">Cadeau</span>' : ''}`;

  const ups = UPSELLS.filter((u) => !cart.lines.some((l) => l.slug === u.slug));
  $id('cart-upsells').innerHTML = ups.length ? `<div class="eyebrow-dash">Past hierbij</div>` + ups.map((u) => {
    const p = findProduct(u.slug);
    return `<div class="upsell">
      <div class="thumb thumb--sm"><img src="${thumbOf(p)}" alt=""></div>
      <div class="upsell__text"><div class="upsell__name">${esc(p.name)}</div><div class="upsell__reason">${esc(u.reason)}</div>
      <div class="upsell__price"><b>${fmt(withVat(p.ex, incl))}</b> / st. · doos van ${MOQ}</div></div>
      <button type="button" class="btn-small" data-upsell="${p.slug}">+ ${MOQ}</button>
    </div>`;
  }).join('') : '';

  const pct = Math.min(100, Math.round(t.subEx / FRANCO_EX * 100));
  $id('franco-note').textContent = t.subEx >= FRANCO_EX ? 'Franco levering bereikt' : 'Nog ' + fmt(FRANCO_EX - t.subEx) + ' excl. btw tot franco levering';
  $id('franco-pct').textContent = pct + '%';
  $id('franco-fill').style.width = pct + '%';

  $id('sum-sub-label').textContent = `Subtotaal (${btwLabel})`;
  $id('sum-sub').textContent = fmt(withVat(t.subEx, incl));
  $id('sum-gift-row').hidden = !gift;
  $id('sum-ship').textContent = t.shipEx === 0 ? 'Franco' : fmt(withVat(t.shipEx, incl));
  $id('sum-vat').textContent = fmt(t.vat);
  $id('sum-total').textContent = fmt(t.total);
}

function setCartOpen(open) {
  document.body.classList.toggle('cart-is-open', open);
  $id('cart-drawer').setAttribute('aria-hidden', String(!open));
  if (open) hideToast('toast');
}

const toastTimers = {};
function showToast(id, ms) {
  $id(id).classList.add('is-visible');
  clearTimeout(toastTimers[id]);
  toastTimers[id] = setTimeout(() => hideToast(id), ms);
}
function hideToast(id) {
  clearTimeout(toastTimers[id]);
  $id(id).classList.remove('is-visible');
}

// Add to cart + confirmation toast; used by every page.
window.puasAdd = (slug, qty, variant = '') => {
  const p = findProduct(slug);
  cart.add(slug, qty, variant);
  hideToast('regret');
  $id('toast-text').textContent = `${qty} × ${p.name}${variant ? ' (' + variant + ')' : ''} staat in je bestelling.`;
  $id('toast-img').src = thumbOf(p);
  showToast('toast', 4500);
};

// Removing asks first; afterwards an undo toast stays for 6s.
let pendingRemove = null;
let lastRemoved = null;
function setConfirmOpen(open) {
  document.body.classList.toggle('confirm-is-open', open);
}

document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-cart-open],[data-cart-close],[data-toast-close],[data-regret-close],[data-line-inc],[data-line-dec],[data-line-remove],[data-upsell],.cart,#cart-scrim');
  if (!t) return;
  if (t.matches('.cart, [data-cart-open]')) { e.preventDefault(); setCartOpen(true); }
  else if (t.matches('[data-cart-close], #cart-scrim')) setCartOpen(false);
  else if (t.matches('[data-toast-close]')) hideToast('toast');
  else if (t.matches('[data-regret-close]')) hideToast('regret');
  else if (t.dataset.lineInc !== undefined) { const i = Number(t.dataset.lineInc); cart.setQty(i, cart.lines[i].qty + 1); }
  else if (t.dataset.lineDec !== undefined) { const i = Number(t.dataset.lineDec); cart.setQty(i, cart.lines[i].qty - 1); }
  else if (t.dataset.upsell !== undefined) cart.add(t.dataset.upsell, MOQ);
  else if (t.dataset.lineRemove !== undefined) {
    const i = Number(t.dataset.lineRemove);
    const line = cart.lines[i];
    const p = findProduct(line.slug);
    pendingRemove = i;
    $id('confirm-img').src = thumbOf(p);
    $id('confirm-text').innerHTML = `Je verwijdert <strong>${esc(p.name)}</strong> (${line.qty} st.) uit je bestelling. ` +
      (tierIndex(line.qty) > 0 ? 'Let op: hiermee vervalt je staffelkorting op dit artikel.' : 'Je kunt het daarna nog even terugzetten.');
    setConfirmOpen(true);
  }
});

$id('confirm-keep').addEventListener('click', () => setConfirmOpen(false));
$id('confirm-scrim').addEventListener('click', () => setConfirmOpen(false));
$id('confirm-remove').addEventListener('click', () => {
  const line = cart.remove(pendingRemove);
  lastRemoved = { line, index: pendingRemove };
  setConfirmOpen(false);
  hideToast('toast');
  $id('regret-title').textContent = `${findProduct(line.slug).name} is uit je bestelling`;
  showToast('regret', 6000);
});
$id('regret-undo').addEventListener('click', () => {
  if (lastRemoved) cart.restore(lastRemoved.line, lastRemoved.index);
  lastRemoved = null;
  hideToast('regret');
});

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (document.body.classList.contains('confirm-is-open')) setConfirmOpen(false);
  else setCartOpen(false);
});
document.addEventListener('puas:btw', renderCart);
renderCart();

// ---------- Static product prices (homepage): filled from data.js, follow the VAT choice ----------
function renderStaticPrices() {
  const incl = window.puasBtw.incl;
  document.querySelectorAll('.js-price').forEach((el) => {
    const p = findProduct(el.dataset.price);
    el.textContent = fmt(withVat(p.ex, incl));
    el.classList.toggle('price--sale', !!p.cmp);
  });
  document.querySelectorAll('.js-price-compare').forEach((el) => {
    const p = findProduct(el.dataset.price);
    el.textContent = p.cmp ? fmt(withVat(p.cmp, incl)) : '';
  });
  document.querySelectorAll('.js-btw-note').forEach((el) => {
    el.textContent = `Inkoopprijzen per stuk, ${incl ? 'incl.' : 'excl.'} btw · per doos van 6`;
  });
}
document.addEventListener('puas:btw', renderStaticPrices);
renderStaticPrices();

// ---------- Simple "add a box" buttons (homepage, related products) ----------
document.addEventListener('click', (e) => {
  const button = e.target.closest('[data-add-box]');
  if (!button) return;
  window.puasAdd(button.dataset.addBox, MOQ);
  const label = button.dataset.label || button.textContent;
  button.dataset.label = label;
  button.textContent = 'Toegevoegd ✓';
  button.classList.add('is-added');
  clearTimeout(button._timer);
  button._timer = setTimeout(() => {
    button.textContent = label;
    button.classList.remove('is-added');
  }, 1800);
});

// ---------- Newsletter: no backend yet, just confirm in place ----------
document.querySelector('.newsletter').addEventListener('submit', (event) => {
  event.preventDefault();
  event.target.querySelector('button').textContent = 'Dank je ✓';
  event.target.querySelector('input').value = '';
});
