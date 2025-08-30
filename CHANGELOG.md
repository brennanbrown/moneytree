# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] - 2025-08-29
### Added
- Budgets: store schema and DB helpers; UI at `/budgets/` with create form and list.
- Budget usage: compute current-month spend from transactions; dashboard summary widget.
- Transactions: account selector, transfer support (two linked entries with `transferId`), and client-side search/filter by description, category, and account.
- Service Worker: improved caching strategy — cache-first app shell, stale-while-revalidate for assets, network-first with cache fallback for other requests.
- Tests: unit tests for budgets (DB + UI), transactions (including transfers), dashboard, and service worker offline behavior with mocked caches/fetch.

### Changed
- Increased base typography for readability in `src/assets/css/main.css`.
- Dashboard now reads data from IndexedDB and shows budget summary.

### Fixed
- Test flakiness with IndexedDB by deleting the database in `beforeEach` across tests.
- Category seeding is now idempotent and concurrency-safe (`ensureSeedData` uses a Promise lock and `putCategory`).
- Transactions UI re-render is awaited to prevent race conditions in tests.

## [0.1.0] - 2025-08-29
### Added
- Eleventy + Tailwind + esbuild scaffold.
- PWA setup with service worker and manifest.
- IndexedDB scaffold with stores: transactions, categories, accounts, settings, receipts.
- Base layout (`src/_includes/layouts/base.njk`).
- Dashboard page (`src/pages/index.njk`).
- Build scripts in package.json and dev server wiring.
- Transactions MVP: page at `/transactions/` with add form and list, wired to IndexedDB.
- Accounts MVP: page at `/accounts/` with add form and list; navigation link added; unit tests for DB helpers.
- Categories MVP: page at `/categories/` with add form and list; seeded default categories; unit tests.
- Transactions category picker integrated with categories from IndexedDB.
- Dashboard wired to real data: account overview totals and recent transactions.
- Placeholder pages for Budgets (`/budgets/`) and Analytics (`/analytics/`).
- `CHANGELOG.md` created.
- Test setup with Vitest, happy-dom, and fake-indexeddb. Added unit tests for IndexedDB core and Transactions page.

### Fixed
- Eleventy config loading by moving to `.eleventy.cjs` and updating npm scripts.
- CSS link to use built bundle only.
- DB helpers now resolve actual values from IDBRequests to support tests and consumers.

