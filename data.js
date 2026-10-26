// Shared product data and price helpers (demo data from the design).

// 1-5 pieces are sold at a single-piece price; from a box of 6 the box price applies, then volume tiers
const TIER_STEPS = [
  { min: 1, max: 5, range: '1 – 5', name: 'Losse prijs', short: 'los' },
  { min: 6, max: 11, range: '6 – 11', name: 'Doosprijs', short: 'doosprijs' },
  { min: 12, max: 23, range: '12 – 23', name: 'Staffel −7%', short: '−7%' },
  { min: 24, max: 47, range: '24 – 47', name: 'Staffel −14%', short: '−14%' },
  { min: 48, max: Infinity, range: '48+', name: 'Staffel −20%', short: '−20%' },
];
const TIER_FACTORS = [1.15, 1, 0.93, 0.86, 0.8];
const MOQ = 1; // smallest order quantity
const BOX = 6; // pieces per box

const PRODUCTS = [
  {
    slug: 'kussenhoes-parang', img: 'img/p-kussenhoes-parang.webp', name: 'Kussenhoes Parang', detail: 'Katoen, 50 × 50 cm',
    ex: 29.5, cmp: 35.5, tiersEx: [34, 29.5, 27.5, 25.5, 23.5], rrp: 59, label: 'Batik tulis', sub: 'kussen', motief: 'Parang', mat: 'Katoen',
    kleur: 'Sogan bruin', stock: 40, nieuw: true, eyebrow: 'Woonaccessoires · Textiel',
    subline: 'Handgetekende batik tulis · Katoen · 50 × 50 cm',
    colors: [{ name: 'Sogan bruin', hex: '#8B4A1F' }, { name: 'Indigo', hex: '#2E3A59' }, { name: 'Zand', hex: '#D9C7A7' }],
    sizes: ['40 × 40 cm', '50 × 50 cm', '60 × 60 cm'], defaultSize: 1,
    description: 'Kussenhoes van stevig katoen met het parang-motief in sogan-bruin en gebroken wit. De rits zit verborgen aan de onderkant, de naden zijn dubbel gestikt. De achterkant is effen.',
    care: 'Wassen op 30 graden, binnenstebuiten, met een mild wasmiddel. De eerste keer apart, want batik kan in het begin wat kleur afgeven. Niet in de droger, en strijken aan de achterkant.',
  },
  { slug: 'tafelloper-kawung', img: 'img/p-tafelloper-kawung.webp', name: 'Tafelloper Kawung', detail: 'Katoen, 40 × 180 cm', ex: 41.5, rrp: 69, label: 'Batik cap', sub: 'tafel', motief: 'Kawung', mat: 'Katoen', kleur: 'Sogan bruin', stock: 18, eyebrow: 'Woonaccessoires · Tafeltextiel' },
  { slug: 'ata-mand-met-deksel', img: 'img/p-ata-mand.webp', name: 'Ata-mand met deksel', detail: 'Ata-riet, ø 28 cm', ex: 52, cmp: 65, rrp: 89, label: 'Handgevlochten', sub: 'mand', motief: 'Effen', mat: 'Ata-riet', kleur: 'Naturel', stock: 3, eyebrow: 'Woonaccessoires · Manden' },
  { slug: 'wierook-cendana', img: 'img/p-wierook-cendana.webp', name: 'Wierook Cendana', detail: 'Sandelhout, 40 stokjes', ex: 7.25, rrp: 14.5, label: 'Handgerold', sub: 'geur', motief: 'Effen', mat: 'Sandelhout', kleur: 'Naturel', stock: 60, nieuw: true, eyebrow: 'Woonaccessoires · Geur' },
  { slug: 'vaas-sekar-jagad', img: 'img/cat-woonaccessoires.webp', name: 'Vaas Sekar Jagad', detail: 'Keramiek, h 32 cm', ex: 78, rrp: 129, label: 'Handbeschilderd', sub: 'keramiek', motief: 'Sekar Jagad', mat: 'Keramiek', kleur: 'Zwart', stock: 9, eyebrow: 'Woonaccessoires · Keramiek' },
  { slug: 'kussenhoes-truntum', img: 'img/foto-volgt.svg', noPhoto: true, name: 'Kussenhoes Truntum', detail: 'Katoen, 45 × 45 cm', ex: 27.5, label: 'Batik cap', sub: 'kussen', motief: 'Truntum', mat: 'Katoen', kleur: 'Indigo', stock: 22, eyebrow: 'Woonaccessoires · Textiel' },
  { slug: 'plaid-sogan', img: 'img/foto-volgt.svg', noPhoto: true, name: 'Plaid Sogan', detail: 'Katoen, 130 × 180 cm', ex: 64, label: 'Batik tulis', sub: 'kussen', motief: 'Parang', mat: 'Katoen', kleur: 'Sogan bruin', stock: 5, eyebrow: 'Woonaccessoires · Textiel' },
  { slug: 'broodmand-ata', img: 'img/foto-volgt.svg', noPhoto: true, name: 'Broodmand Ata', detail: 'Ata-riet, 32 × 22 cm', ex: 31, label: 'Handgevlochten', sub: 'mand', motief: 'Effen', mat: 'Ata-riet', kleur: 'Naturel', stock: 14, eyebrow: 'Woonaccessoires · Manden' },
  { slug: 'schaal-manik', img: 'img/foto-volgt.svg', noPhoto: true, name: 'Schaal Manik', detail: 'Keramiek, ø 24 cm', ex: 36, cmp: 42, label: 'Handbeschilderd', sub: 'keramiek', motief: 'Kawung', mat: 'Keramiek', kleur: 'Zwart', stock: 11, eyebrow: 'Woonaccessoires · Keramiek' },
];

const MOTIFS = {
  Parang: {
    text: [
      'Schuine golven die over het hele doek doorlopen. Parang is een van de oudste patronen van Java, en je herkent het meteen.',
      'Geen twee exemplaren zijn precies gelijk. Je kiest uit sogan-bruin, indigo en zand, en in elke doos zitten kaartjes met uitleg over het motief voor bij je kassa.',
    ],
  },
  Kawung: {
    text: [
      'Vier ovalen rond een punt, steeds herhaald. Rustig en regelmatig, en daardoor makkelijk te combineren met effen stoffen of hout.',
      'Los te bestellen of per doos van zes, met kaartjes over het motief voor in de winkel.',
    ],
  },
  Truntum: {
    text: [
      'Kleine sterren op donkere grond. Het fijnste patroon van de drie, en het mooist als accent naast Parang of Kawung.',
      'Los te bestellen of per doos van zes, met kaartjes over het motief voor in de winkel.',
    ],
  },
};

const findProduct = (slug) => PRODUCTS.find((p) => p.slug === slug);
const productUrl = (p) => 'product.html?p=' + p.slug;
// 600px version for grids, thumbnails and the cart (the placeholder SVG has no small version)
const thumbOf = (p) => p.img.replace(/\.webp$/, '-sm.webp');

// Excl. VAT unit price per tier for a product
function tierPrices(p) {
  // Single-piece price is rounded up to the nearest 50 cents
  return p.tiersEx || TIER_FACTORS.map((f) => (f > 1 ? Math.ceil(p.ex * f * 2) / 2 : Math.round(p.ex * f * 100) / 100));
}
function tierIndex(qty) {
  return Math.max(0, TIER_STEPS.findIndex((t) => qty >= t.min && qty <= t.max));
}
function unitEx(p, qty) {
  return tierPrices(p)[tierIndex(qty)];
}

const fmt = (n) => '€ ' + n.toFixed(2).replace('.', ',');
const withVat = (n, incl) => Math.round((incl ? n * 1.21 : n) * 100) / 100;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
