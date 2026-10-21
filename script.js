// Mobile menu
const menuButton = document.querySelector('.header__menu');
const nav = document.querySelector('.nav');
menuButton.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', String(open));
});

// "In winkelmand": show "Toegevoegd ✓" for 1.8s and bump the cart badge
const badge = document.getElementById('cart-count');
document.querySelectorAll('.btn-pattern').forEach((button) => {
  const label = button.textContent;
  let timer;
  button.addEventListener('click', () => {
    badge.textContent = String(Number(badge.textContent) + 1);
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
  const button = event.target.querySelector('button');
  button.textContent = 'Dank je ✓';
  event.target.querySelector('input').value = '';
});
