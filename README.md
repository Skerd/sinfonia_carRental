# carRental Module (Sinfonia)

Client-side UI for the Arpeggio car rental domain: admin panel pages (reservations, fleet, blocks, categories, extras, locations, settings) and the public rental site.

Types and validators come from **armonia**; API calls target **maestro** routes under `/api/carRental/`.

Enable via `VITE_ENABLED_MODULES=carRental` (or leave unset to load all present modules). Run the public site with `npm run rental`.

## Directory layout

```
carRental/
├── apps/rental/                   # public site entry (search, book, manage)
├── assets/languages/<locale>/     # dictionaries in 5 locales
├── clients/client/public/         # public site pages
└── clients/panel/                 # panel pages, sidebar and route contributions
```
