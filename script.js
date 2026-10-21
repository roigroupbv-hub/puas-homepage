// Shared across pages: storage helpers, mobile menu, cart badge, newsletter.

function readStore(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}
function writeStore(key, value) {
  try { localStorage.setItem(key, value); } catch { /* storage unavailable: keep in-page only */ }
}

// Mobile menu
const menuButton = document.querySelector('.header__menu');
const nav = document.querySelector('.nav');
menuButton.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', String(open));
});

// Cart badge (demo only: a count remembered in this browser, no real orders)
const badge = document.getElementById('cart-count');
window.puasCart = {
  count: Number(readStore('puas-cart')) || 2,
  add(n) {
    this.count += n;
    writeStore('puas-cart', String(this.count));
    badge.textContent = String(this.count);
  },
};
badge.textContent = String(window.puasCart.count);

// Homepage "In winkelmand": show "Toegevoegd ✓" for 1.8s and bump the cart badge
document.querySelectorAll('.btn-pattern[data-home-add]').forEach((button) => {
  const label = button.textContent;
  let timer;
  button.addEventListener('click', () => {
    window.puasCart.add(1);
    button.textContent = 'Toegevoegd ✓';
    button.classList.add('is-added');
    clearTimeout(timer);
    timer = setTimeout(() => {
      button.textContent = label;
      button.classList.remove('is-added');
    }, 1800);
  });
});

// Newsletter: no backend yet, just confirm in place
document.querySelector('.newsletter').addEventListener('submit', (event) => {
  event.preventDefault();
  event.target.querySelector('button').textContent = 'Dank je ✓';
  event.target.querySelector('input').value = '';
});
