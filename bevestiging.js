// Order confirmation: reads the order saved by checkout.js in this browser.

const $b = (id) => document.getElementById(id);
let order = null;
try { order = JSON.parse(readStore('puas-last-order') || 'null'); } catch { order = null; }

const DAYS_NL = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
const DAYS_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
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
      { id: 'Hari ini', title: 'Vandaag', text: 'We pakken je bestelling in, met een kaartje over het motief.' },
      { id: 'Besok', title: capital(DAYS_NL[shipDay.getDay()]), text: 'Klaar om op te halen. Je krijgt een e-mail zodra alles klaarstaat.' },
      { id: 'Showroom', title: 'Van Diemenstraat 214', text: 'Ophalen in de showroom in Amsterdam, op afspraak.' },
    ]
    : [
      { id: 'Hari ini', title: 'Vandaag', text: 'Ingepakt in Amsterdam, met een kaartje over het motief.' },
      { id: 'Besok', title: capital(DAYS_NL[shipDay.getDay()]), text: `${order.shipping.name.startsWith('PostNL') ? 'PostNL' : 'De bezorger'} neemt het mee. Track & trace per e-mail.` },
      { id: DAYS_ID[deliveryDay.getDay()], title: deliveryText, text: `Bezorgd op ${c.straat}, ${c.plaats}.` },
    ];
  $b('timeline').innerHTML = steps.map((s) =>
    `<div class="timeline__card"><div class="timeline__id">${esc(s.id)}</div><div class="timeline__title">${esc(s.title)}</div><p>${esc(s.text)}</p></div>`).join('');

  const lines = order.lines.map((l) => {
    const p = findProduct(l.slug);
    if (!p) return '';
    return `<div class="done-line">
      <div class="done-line__img"><img src="${p.img}" alt=""></div>
      <div><div class="co-line__label">${esc(p.label)}</div><div class="done-line__name">${esc(p.name)}</div>
      <div class="co-line__detail">${esc(l.variant || p.detail)} · ${l.qty} stuks à ${fmt(l.unitEx)}</div></div>
      <div class="done-line__price">${fmt(Math.round(l.unitEx * l.qty * 100) / 100)}</div>
    </div>`;
  });
  if (order.gift) {
    lines.push(`<div class="done-line">
      <div class="done-line__img"><img src="img/cat-sieraden.jpg" alt=""></div>
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
    order.business && c.bedrijf ? `<b>${esc(c.bedrijf)}</b>` : '',
    `<b>${esc(c.voornaam)} ${esc(c.achternaam)}</b>`,
    order.shipping.pickup ? 'Showroom Van Diemenstraat 214, Amsterdam' : `${esc(c.straat)}<br>${esc(c.postcode)} ${esc(c.plaats)}`,
  ].filter(Boolean).join('<br>');
  $b('order-payment').textContent = order.payment + (order.paid ? ' · betaald' : ' · factuur volgt per e-mail');

  // Motif card: first ordered product with a known motif, otherwise a general note
  const withMotif = order.lines.map((l) => findProduct(l.slug)).find((p) => p && MOTIFS[p.motief]);
  if (withMotif) {
    $b('motif-title').textContent = withMotif.motief + ', jouw motief';
    $b('motif-text').textContent = MOTIFS[withMotif.motief].text[0] + ' Motiefkaartjes voor in de winkel zitten in de doos.';
  } else {
    $b('motif-title').textContent = 'Handgemaakt, dus uniek';
    $b('motif-text').textContent = 'Elk stuk verschilt een fractie van de foto. Productbladen en foto\'s voor in je winkel vraag je op bij je accountmanager.';
  }
}
