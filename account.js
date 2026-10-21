// Account (demo): any login opens the sample business account; nothing is checked, stored or sent except
// the login flag and edited company details, which stay in this browser.

const DASH_TABS = [
  ['overzicht', 'Overzicht'], ['bestellingen', 'Bestellingen'], ['facturen', 'Facturen'],
  ['adressen', 'Adressen'], ['gegevens', 'Bedrijfsgegevens'], ['prijslijst', 'Prijslijst'],
];
const SAMPLE_ORDERS = [
  { id: 'PU-24118', date: '29 september 2026', status: 'Onderweg', open: true, total: '€ 1.248' },
  { id: 'PU-23604', date: '12 juni 2026', status: 'Bezorgd', total: '€ 684' },
  { id: 'PU-22981', date: '3 februari 2026', status: 'Bezorgd', total: '€ 2.190' },
  { id: 'PU-21770', date: '18 maart 2025', status: 'Bezorgd', total: '€ 516' },
];
const INVOICES = [
  { id: 'F-2026-0412', due: '28 oktober 2026', status: 'Open', open: true, total: '€ 1.248' },
  { id: 'F-2026-0231', due: '12 juli 2026', status: 'Betaald', total: '€ 684' },
  { id: 'F-2026-0087', due: '5 maart 2026', status: 'Betaald', total: '€ 2.190' },
];
const MONTHS = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];

const $a = (id) => document.getElementById(id);
let dashTab = tabFromHash();

function tabFromHash() {
  const h = location.hash.slice(1);
  return DASH_TABS.some(([k]) => k === h) ? h : 'overzicht';
}

// Orders: the order placed in this browser (if any) comes first, then the sample history
function orders() {
  let last = null;
  try { last = JSON.parse(readStore('puas-last-order') || 'null'); } catch { last = null; }
  const list = [...SAMPLE_ORDERS];
  if (last && last.number) {
    const d = new Date(last.placedAt);
    list.unshift({ id: last.number, date: `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`, status: 'In behandeling', open: true, total: fmt(last.totals.total), link: 'bevestiging.html' });
  }
  return list;
}

function tableHtml(head, rows) {
  return `<div class="dash-row dash-row--head">${head.map((h) => `<span>${h}</span>`).join('')}</div>` + rows.join('');
}

function render() {
  const loggedIn = readStore('puas-logged-in') === '1';
  $a('logged-out').hidden = loggedIn;
  $a('logged-in').hidden = !loggedIn;
  if (!loggedIn) return;

  let company = null;
  try { company = JSON.parse(readStore('puas-company') || 'null'); } catch { company = null; }
  if (company) {
    Object.entries(company).forEach(([name, value]) => {
      const field = $a('company-form').elements[name];
      if (field) field.value = value;
    });
  }
  $a('account-company').textContent = $a('c-name').value.replace(/\s+B\.V\.$/, '');

  $a('dash-nav').innerHTML = DASH_TABS.map(([k, label]) =>
    `<a href="#${k}" class="dash-nav__item${k === dashTab ? ' is-active' : ''}">${label}</a>`).join('') +
    '<button type="button" class="dash-nav__item dash-nav__logout" id="logout">Uitloggen</button>';
  document.querySelectorAll('.dash-pane').forEach((p) => { p.hidden = !p.dataset.dash.split(' ').includes(dashTab); });

  const list = orders();
  $a('last-order-number').textContent = list[0].id;
  $a('last-order-status').textContent = list[0].link ? 'In behandeling · ' + list[0].total : 'Onderweg · bezorging wo 1 okt';
  $a('orders-table').innerHTML = tableHtml(['Nummer', 'Datum', 'Status', 'Totaal', ''], list.map((o) => `<div class="dash-row">
    <b>${o.id}</b><span class="dash-row__muted">${o.date}</span>
    <span class="dash-status"><i class="${o.open ? 'is-open' : ''}"></i>${o.status}</span><b>${o.total}</b>
    ${o.link ? `<a href="${o.link}" class="text-link text-link--small">Bekijk</a>` : '<span></span>'}
  </div>`));
  $a('invoices-table').innerHTML = tableHtml(['Factuur', 'Vervaldatum', 'Status', 'Bedrag', ''], INVOICES.map((f) => `<div class="dash-row">
    <b>${f.id}</b><span class="dash-row__muted">${f.due}</span>
    <span class="dash-status"><i class="${f.open ? 'is-open' : ''}"></i>${f.status}</span><b>${f.total}</b>
    <span class="dash-row__muted">PDF</span>
  </div>`));
}

$a('login-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!e.target.reportValidity()) return;
  e.target.reset(); // the password is never kept
  writeStore('puas-logged-in', '1');
  render();
  window.scrollTo(0, 0);
});

document.addEventListener('click', (e) => {
  if (e.target.id !== 'logout') return;
  writeStore('puas-logged-in', '0');
  history.replaceState(null, '', location.pathname);
  dashTab = 'overzicht';
  render();
});

$a('company-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!e.target.reportValidity()) return;
  writeStore('puas-company', JSON.stringify(Object.fromEntries(new FormData(e.target))));
  $a('company-note').textContent = 'Opgeslagen ✓';
  setTimeout(() => { $a('company-note').textContent = ''; }, 2500);
  render();
});

window.addEventListener('hashchange', () => { dashTab = tabFromHash(); render(); });
render();
