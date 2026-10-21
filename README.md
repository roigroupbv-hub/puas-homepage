# PUAS homepage

Statische homepage (HTML/CSS/JS, geen build-stap), nagebouwd uit het Claude Design-ontwerp `Puas Homepage v2`.

## Lokaal bekijken

```bash
python3 -m http.server 8790 --directory ~/puas-homepage
```

Open daarna http://localhost:8790.

## Mappen

- `index.html`: homepage
- `assortiment.html` + `assortiment.js`: categoriepagina (Woonaccessoires) met filters, sorteren, btw-toggle
- `product.html` + `product.js`: productpagina, één pagina voor alle producten via `product.html?p=<slug>`
- `winkelwagen.html` + `checkout.js`: winkelmand en afrekenen in 4 stappen (winkelmand, gegevens, verzending, betaling)
- `bevestiging.html` + `bevestiging.js`: orderbevestiging, leest de laatst geplaatste bestelling uit de browser
- `zakelijk.html` + `zakelijk.js`: zakelijke voorwaarden, staffeltabel (uit data.js) en aanvraagformulier (verstuurt nog niets)
- `contact.html` + `contact.js`: contactgegevens, bedrijfsgegevens (voorbeeldwaarden uit het ontwerp), berichtformulier (verstuurt nog niets) en veelgestelde vragen
- `service.html` + `service.js`: klantenservice met tabbladen (`#verzenden`, `#onderhoud`, `#vragen`); de footerlinks openen direct het juiste tabblad
- `zoeken.html` + `zoeken.js`: zoeken in de productlijst, zoekterm in de link (`zoeken.html?q=parang`)
- `data.js`: productlijst en prijsregels (staffels, btw), gedeeld door alle pagina's
- `styles.css`, `script.js`: gedeeld door alle pagina's (menu, btw-voorkeur, winkelmand-lade, meldingen, nieuwsbrief)
- `img/`: logo, patroontegel en foto's (omgezet naar JPG)
- `design-referentie/`: het originele ontwerp en de handoff-README (niet in git, zie `.gitignore`)

Links naar Account staan nog op `#`; die pagina's bestaan nog niet. De winkelmand wordt alleen in de browser bewaard; er wordt niets echt besteld of betaald.

Na een wijziging aan een css/js-bestand: verhoog `?v=N` in alle html-bestanden, anders laden browsers via de cache een mix van oud en nieuw.
