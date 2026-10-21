// Order confirmation: reads the order saved by checkout.js in this browser.

const $b = (id) => document.getElementById(id);
let order = null;
try { order = JSON.parse(readStore('puas-last-order') || 'null'); } catch { order = null; }

const DAYS_NL = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
const MONTHS_NL = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];

// Next working day after `date` (skips Saturday and Sunday)
function nextWorkday(date) {
  const d = new Date(date);
  do { d.setDate(d.getDate() + 1); } while (d.getDay() === 0 || d.getDay() === 6);
  return d;
}
const capital = (s) => s.charAt(0).toUpperCase() + s.slice(1);

if (!order || !order.lines || !order.lines.length) {
  $b('order-found').hidden = true;
  $b('order-missing').hidden = false;
  $b('order-number').textContent = 'Bestelling';
} else {
  const c = order.customer;
  const placed = new Date(order.placedAt);
  const shipDay = nextWorkday(placed);
  const deliveryDay = nextWorkday(nextWorkday(shipDay));
  const deliveryText = `${capital(DAYS_NL[deliveryDay.getDay()])} ${deliveryDay.getDate()} ${MONTHS_NL[deliveryDay.getMonth()]}`;

  document.title = 'Bestelling ' + order.number + ' · PUAS';
  $b('order-number').textContent = 'Bestelling ' + order.number;
  $b('thanks-title').textContent = 'Terima kasih, ' + c.voornaam;

  const steps = order.shipping.pickup
    ? [
      { id: 'Vandaag', title: 'Inpakken', text: 'We zetten je dozen klaar, met kaartjes over de motieven erin.' },
      { id: capital(DAYS_NL[shipDay.getDay()]), title: 'Klaar om op te halen', text: 'Je krijgt een mail zodra alles klaarstaat.' },
      { id: 'Showroom', title: 'Van Diemenstraat 214', text: 'Ophalen in Amsterdam, op afspraak. Bel even voor je komt.' },
    ]
    : [
      { id: 'Vandaag', title: 'Inpakken', text: 'We pakken je dozen in, met kaartjes over de motieven erin.' },
      { id: capital(DAYS_NL[shipDay.getDay()]), title: 'Onderweg', text: `${order.shipping.name.startsWith('PostNL') ? 'PostNL' : 'De bezorger'} neemt alles mee. De track-and-trace-link krijg je per mail.` },
      { id: capital(DAYS_NL[deliveryDay.getDay()]), title: 'Bezorging', text: `Verwacht op ${deliveryText.toLowerCase()}, op ${c.straat} in ${c.plaats}.` },
    ];
  $b('timeline').innerHTML = steps.map((s) =>
    `<div class="timeline__card"><div class="timeline__id">${esc(s.id)}</div><div class="timeline__title">${esc(s.title)}</div><p>${esc(s.text)}</p></div>`).join('');

  const lines = order.lines.map((l) => {
    const p = findProduct(l.slug);
    if (!p) return '';
    return `<div class="done-line">
      <div class="done-line__img"><img src="${thumbOf(p)}" alt=""></div>
      <div><div class="co-line__label">${esc(p.label)}</div><div class="done-line__name">${esc(p.name)}</div>
      <div class="co-line__detail">${esc(l.variant || p.detail)} · ${l.qty} stuks à ${fmt(l.unitEx)}</div></div>
      <div class="done-line__price">${fmt(Math.round(l.unitEx * l.qty * 100) / 100)}</div>
    </div>`;
  });
  if (order.gift) {
    lines.push(`<div class="done-line">
      <div class="done-line__img"><img src="img/cat-sieraden-sm.webp" alt=""></div>
      <div><div class="co-line__label">Cadeau</div><div class="done-line__name">Armbandje Manik</div><div class="co-line__detail">Glaskralen · cadeau vanaf € 100</div></div>
      <div class="done-line__price">€ 0</div>
    </div>`);
  }
  $b('order-lines').innerHTML = lines.join('');

  const t = order.totals;
  $b('order-totals').innerHTML = `
    <div><span>Subtotaal (excl. btw)</span><span>${fmt(t.subEx)}</span></div>
    <div><span>Verzending</span><span>${t.shipEx === 0 ? (order.shipping.pickup ? 'Gratis' : 'Franco') : fmt(t.shipEx)}</span></div>
    <div><span>Btw 21%</span><span>${fmt(t.vat)}</span></div>
    <div class="done-totals__total"><span>Totaal (incl. btw)</span><span>${fmt(t.total)}</span></div>`;

  $b('address-label').textContent = order.shipping.pickup ? 'Ophalen door' : 'Bezorgadres';
  $b('order-address').innerHTML = [
    c.bedrijf ? `<b>${esc(c.bedrijf)}</b>` : '',
    `<b>${esc(c.voornaam)} ${esc(c.achternaam)}</b>`,
    order.shipping.pickup ? 'Showroom Van Diemenstraat 214, Amsterdam' : `${esc(c.straat)}<br>${esc(c.postcode)} ${esc(c.plaats)}`,
  ].filter(Boolean).join('<br>');
  $b('order-payment').textContent = order.payment + (order.paid ? ' · betaald' : ' · factuur volgt per e-mail');

  // Motif card: first ordered product with a known motif, otherwise a general note
  const withMotif = order.lines.map((l) => findProduct(l.slug)).find((p) => p && MOTIFS[p.motief]);
  if (withMotif) {
    $b('motif-title').textContent = withMotif.motief + ', jouw motief';
    $b('motif-text').textContent = MOTIFS[withMotif.motief].text[0] + ' De uitlegkaartjes voor bij je kassa zitten in de doos.';
  } else {
    $b('motif-title').textContent = 'Met de hand gemaakt';
    $b('motif-text').textContent = 'Geen stuk is precies gelijk aan de foto, en dat is ook de bedoeling. Productbladen en foto\'s voor je winkel sturen we je graag.';
  }
}
