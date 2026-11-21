# carRental Module (Sinfonia)

Client-side UI for the Arpeggio car rental domain: admin panel pages (reservations, fleet, blocks, categories, extras, locations, settings) and the public rental site.

Types and validators come from **armonia**; API calls target **maestro** routes under `/api/carRental/`.

Enable via `VITE_ENABLED_MODULES=carRental` (or leave unset to load all present modules). Its public pages run in the portal (`npm run dev -- up carRental`): under `/car-rental` on a company's own site, `/car-rental/<slug>` on the apex.

The portal contribution's `prefetch` (D173) loads a pointed-at link's page code and the rental config for that company, so its pages open at once.

## Directory layout

```
carRental/
├── assets/languages/<locale>/     # dictionaries in 5 locales
├── clients/client/public/         # public site pages (search, book, manage)
├── clients/portal/                # portal contribution and account section
└── clients/panel/                 # panel pages, sidebar and route contributions
```
