// Shared product data and price helpers (demo data from the design).

const TIER_STEPS = [
  { min: 6, max: 11, range: '6 – 11' },
  { min: 12, max: 23, range: '12 – 23' },
  { min: 24, max: 47, range: '24 – 47' },
  { min: 48, max: Infinity, range: '48+' },
];
const TIER_FACTORS = [1, 0.93, 0.86, 0.8];
const MOQ = 6;

const PRODUCTS = [
  {
    slug: 'kussenhoes-parang', img: 'img/p-kussenhoes-parang.jpg', name: 'Kussenhoes Parang', detail: 'Katoen, 50 × 50 cm',
    ex: 29.5, cmp: 35.5, tiersEx: [29.5, 27.5, 25.5, 23.5], rrp: 59, label: 'Batik tulis', sub: 'kussen', motief: 'Parang', mat: 'Katoen',
    kleur: 'Sogan bruin', stock: 40, nieuw: true, eyebrow: 'Woonaccessoires · Textiel',
    subline: 'Handgetekende batik tulis · Katoen · 50 × 50 cm',
    colors: [{ name: 'Sogan bruin', hex: '#8B4A1F' }, { name: 'Indigo', hex: '#2E3A59' }, { name: 'Zand', hex: '#D9C7A7' }],
    sizes: ['40 × 40 cm', '50 × 50 cm', '60 × 60 cm'], defaultSize: 1,
    description: 'Kussenhoes van dichtgeweven katoen primissima met handgetekend parang-motief in sogan-bruin en gebroken wit. Verborgen rits aan de onderzijde, dubbel gestikte naden. Achterzijde in effen linnenlook.',
    care: '100% katoen. Wassen op 30°C op de hand of in een waszak, binnenstebuiten, met kleurvriendelijk wasmiddel. Niet in de droger; strijken aan de achterzijde. Natuurlijke wasresten trekken na de eerste wasbeurt weg.',
  },
  { slug: 'tafelloper-kawung', img: 'img/p-tafelloper-kawung.jpg', name: 'Tafelloper Kawung', detail: 'Katoen, 40 × 180 cm', ex: 41.5, rrp: 69, label: 'Batik cap', sub: 'tafel', motief: 'Kawung', mat: 'Katoen', kleur: 'Sogan bruin', stock: 18, eyebrow: 'Woonaccessoires · Tafeltextiel' },
  { slug: 'ata-mand-met-deksel', img: 'img/p-ata-mand.jpg', name: 'Ata-mand met deksel', detail: 'Ata-riet, ø 28 cm', ex: 52, cmp: 65, rrp: 89, label: 'Handgevlochten', sub: 'mand', motief: 'Effen', mat: 'Ata-riet', kleur: 'Naturel', stock: 3, eyebrow: 'Woonaccessoires · Manden' },
  { slug: 'wierook-cendana', img: 'img/p-wierook-cendana.jpg', name: 'Wierook Cendana', detail: 'Sandelhout, 40 stokjes', ex: 7.25, rrp: 14.5, label: 'Handgerold', sub: 'geur', motief: 'Effen', mat: 'Sandelhout', kleur: 'Naturel', stock: 60, nieuw: true, eyebrow: 'Woonaccessoires · Geur' },
  { slug: 'vaas-sekar-jagad', img: 'img/cat-woonaccessoires.jpg', name: 'Vaas Sekar Jagad', detail: 'Keramiek, h 32 cm', ex: 78, rrp: 129, label: 'Handbeschilderd', sub: 'keramiek', motief: 'Sekar Jagad', mat: 'Keramiek', kleur: 'Zwart', stock: 9, eyebrow: 'Woonaccessoires · Keramiek' },
  { slug: 'kussenhoes-truntum', img: 'img/foto-volgt.svg', noPhoto: true, name: 'Kussenhoes Truntum', detail: 'Katoen, 45 × 45 cm', ex: 27.5, label: 'Batik cap', sub: 'kussen', motief: 'Truntum', mat: 'Katoen', kleur: 'Indigo', stock: 22, eyebrow: 'Woonaccessoires · Textiel' },
  { slug: 'plaid-sogan', img: 'img/foto-volgt.svg', noPhoto: true, name: 'Plaid Sogan', detail: 'Katoen, 130 × 180 cm', ex: 64, label: 'Batik tulis', sub: 'kussen', motief: 'Parang', mat: 'Katoen', kleur: 'Sogan bruin', stock: 5, eyebrow: 'Woonaccessoires · Textiel' },
  { slug: 'broodmand-ata', img: 'img/foto-volgt.svg', noPhoto: true, name: 'Broodmand Ata', detail: 'Ata-riet, 32 × 22 cm', ex: 31, label: 'Handgevlochten', sub: 'mand', motief: 'Effen', mat: 'Ata-riet', kleur: 'Naturel', stock: 14, eyebrow: 'Woonaccessoires · Manden' },
  { slug: 'schaal-manik', img: 'img/foto-volgt.svg', noPhoto: true, name: 'Schaal Manik', detail: 'Keramiek, ø 24 cm', ex: 36, cmp: 42, label: 'Handbeschilderd', sub: 'keramiek', motief: 'Kawung', mat: 'Keramiek', kleur: 'Zwart', stock: 11, eyebrow: 'Woonaccessoires · Keramiek' },
];

const MOTIFS = {
  Parang: {
    text: [
      'Diagonale golflijnen, een van de oudste Javaanse motieven. Handgetekend in was (tulis) op katoen primissima, in kleine baden geverfd.',
      'Elk exemplaar verschilt een fractie in lijn en kleur. Leverbaar in indigo, terracotta en oker; per 6 stuks verpakt, inclusief motiefkaartjes voor in de winkel.',
    ],
  },
  Kawung: {
    text: [
      'Geometrisch raster van vier ovalen. Rustig patroon, geschikt voor grotere vlakken en series.',
      'Per 6 stuks verpakt, inclusief motiefkaartjes voor in de winkel.',
    ],
  },
  Truntum: {
    text: [
      'Fijn sterrenpatroon op donkere grond. Kleinste rapport, combineert goed met Parang en Kawung.',
      'Per 6 stuks verpakt, inclusief motiefkaartjes voor in de winkel.',
    ],
  },
};

const findProduct = (slug) => PRODUCTS.find((p) => p.slug === slug);
const productUrl = (p) => 'product.html?p=' + p.slug;

// Excl. VAT unit price per tier for a product
function tierPrices(p) {
  return p.tiersEx || TIER_FACTORS.map((f) => Math.round(p.ex * f * 100) / 100);
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
