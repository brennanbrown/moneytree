# Moneytree

A privacy-first, offline-capable personal finance PWA built with Eleventy (11ty), Tailwind CSS, and IndexedDB. Supports transactions with accounts and transfers, budgets with monthly usage, and robust offline caching via a service worker.

## Getting Started

Prereqs: Node 18+ recommended.

```bash
npm install
npm run dev
```

- App runs at http://localhost:8080 by default (Eleventy dev server)
- CSS/JS bundles are emitted to `src/assets/dist/`
- PWA service worker is served from `src/assets/workers/sw.js` and caches the app shell for offline

## Scripts

- `npm run dev` — Start Eleventy dev server + watch Tailwind and JS (esbuild)
- `npm run build` — Production build (minified CSS/JS) + Eleventy output in `_site/`
- `npm run test` — Run unit tests once
- `npm run test:watch` — Run unit tests in watch mode

## Structure

- `src/_includes/layouts/` — Nunjucks layouts
- `src/pages/` — App pages
- `src/assets/css/main.css` — Tailwind entry
- `src/assets/js/app.js` — App JS entry
- `src/assets/js/core/db.js` — IndexedDB helpers and stores (transactions, categories, accounts, settings, receipts, budgets)
- `src/assets/workers/sw.js` — Service worker
- `src/manifest.json` — PWA manifest
 - `tests/` — Vitest tests (happy-dom + fake-indexeddb)

Key pages:

- `src/pages/index.njk` — Dashboard (account overview, recent transactions, budget summary)
- `src/pages/transactions/index.njk` — Transactions (add, list, filters; supports transfers)
- `src/pages/budgets/index.njk` — Budgets (create, list, monthly usage)
- `src/pages/categories/index.njk` — Categories (seeded defaults, add)
- `src/pages/accounts/index.njk` — Accounts (add, list)

## Features

- Transactions: expenses/income with category, account, date, description
- Transfers: create two linked entries (outflow/inflow) with shared `transferId`
- Filters: search by description, filter by category and account
- Budgets: create monthly budgets per category; usage computed from current-month transactions
- Dashboard: account overview, recent transactions, budget summary
- PWA: offline-first app shell; stale-while-revalidate for assets; network-first with cache fallback

## Testing

Uses Vitest with `happy-dom` and `fake-indexeddb`.

```bash
npm run test
```

Tests include:

- DB helpers for transactions, categories, accounts, budgets
- Transactions page (add, filters) and transfer linkage
- Dashboard rendering
- Service worker offline caching behavior

## Development Notes

- Data is stored locally in IndexedDB — privacy-first, no external APIs.
- Seeding uses idempotent helpers to avoid duplicate categories in tests.
- Make sure to hard-refresh to update the service worker after changes.
