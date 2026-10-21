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
- `styles.css`, `script.js`: gedeeld door alle pagina's (menu, winkelmand-teller, nieuwsbrief)
- `img/`: logo, patroontegel en foto's (omgezet naar JPG)
- `design-referentie/`: het originele ontwerp en de handoff-README (niet in git, zie `.gitignore`)

Links naar Zakelijk, Contact, productpagina's enz. staan nog op `#`; die pagina's bestaan nog niet. De winkelmand is een teller in de browser, er wordt niets echt besteld.
