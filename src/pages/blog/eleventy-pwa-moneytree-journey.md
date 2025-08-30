---
layout: layouts/base.njk
title: Building Moneytree: An 11ty + IndexedDB PWA Journey
date: 2025-08-29
description: How I built a privacy-first personal finance PWA with Eleventy, Tailwind, IndexedDB, and a Service Worker—what worked, what broke, and how to test PWAs effectively.
---

# Building Moneytree: An 11ty + IndexedDB PWA Journey

Moneytree is a privacy-first, offline-capable personal finance PWA. It runs entirely in the browser using IndexedDB—no servers, no trackers.

This post walks through the journey: the architecture decisions, what made transfers tricky, how to test a service worker, and strategies to tame IndexedDB test flakiness. If you're building an Eleventy PWA or want to peek into my engineering process, read on.

## Why Eleventy (11ty) for a PWA?

- **Simplicity**: 11ty gives a fast static site pipeline and flexible templates (Nunjucks). No client framework lock-in.
- **Performance**: Small JS surface + Tailwind CSS + esbuild bundling.
- **Control**: Perfect for a privacy-first app; everything is local.

The stack:

- Eleventy for pages (`src/pages/`)
- Tailwind for styling (`src/assets/css/main.css`)
- Vanilla JS for UI pages under `src/assets/js/pages/`
- IndexedDB helpers in `src/assets/js/core/db.js`
- Service worker in `src/assets/workers/sw.js`
- Vitest + happy-dom + fake-indexeddb for tests

## Core Features Implemented

- **Transactions**: expenses/income with category, account, date, description.
- **Transfers**: double-entry—two transactions linked by `transferId` (outflow/inflow) for reliability and clarity.
- **Filters**: search description, filter by category and account.
- **Budgets**: create monthly budgets per category; compute usage from current-month transactions; show a dashboard summary.
- **PWA**: cache-first app shell, stale-while-revalidate for assets, network-first fallback for other requests.

## Transfers: the Tricky Bits

I represent a transfer as two transactions:

- Outflow from the source account `{ type: 'transfer', direction: 'out', account: from, amount }`
- Inflow to the destination account `{ type: 'transfer', direction: 'in', account: to, amount }`
- Both share the same `transferId` (from `uid()` in `db.js`).

This enables simple rendering and filtering without special logic—each list item is still “a transaction.” A bug surfaced where the account filter used `fromAccount`/`toAccount`; I fixed it to use the stored `account` field for transfers in `src/assets/js/pages/transactions.js`.

## IndexedDB: Testing Without Tears

Two things made tests stable:

1. **Clean DB between tests**: Each `beforeEach` deletes the `moneytree` DB with `indexedDB.deleteDatabase('moneytree')` to avoid duplicate key `ConstraintError`s.
2. **Idempotent seeding**: `ensureSeedData()` now uses a promise lock and `db.putCategory()` so parallel inits don't double-insert.

Result: deterministic tests across pages using IndexedDB.

## Service Worker: Caching Strategy and Testing

`src/assets/workers/sw.js` implements:

- Cache name `moneytree-shell-v2` with an app shell list (`/`, `/assets/app.js`, `/assets/main.css`, `/manifest.json`).
- **Install**: cache app shell (cache-first for shell routes).
- **Activate**: delete old caches.
- **Fetch**:
  - Shell: cache-first
  - Assets: stale-while-revalidate
  - Others: network-first with cache fallback

Testing SWs can be awkward. I mocked `self`, `caches`, and `fetch` in `tests/sw.test.js`:

- Verified install populates the cache.
- Verified activate cleans old caches.
- Verified an offline fetch of an asset returns the cached copy.

This keeps the PWA behavior verifiable in CI without a browser.

## UI Timing and Flakes

DOM-based tests can race with async initialization. Two fixes helped:

- Await `renderList()` after submit in `transactions.js`.
- In tests, wait for auto-init and then call page renderers explicitly (e.g., `renderCategories()`).

Also, avoid double-initializing pages (don’t call `init` twice), which can register duplicate event handlers and cause duplicate entries.

## Developer Experience

- Tailwind + esbuild keep builds fast.
- 11ty’s file-based pages (`src/pages/.../index.njk`) make it easy to evolve features.
- Tests run with `happy-dom` and `fake-indexeddb`, so no external services are required.

## What I’d Build Next

- **Edit/Delete for Transactions**: including paired behavior for transfers.
- **CSV Import**: bulk transaction entry.
- **Receipts**: attach/upload images and link to transactions.
- **Dashboard Balances**: compute from transactions, not stored balances.
- **Background Sync**: queue changes offline (future-friendly design).

## Takeaways for 11ty PWA Builders

- Keep your service worker small and testable; mock `caches`/`fetch` in unit tests.
- Make seeding idempotent; parallel init is common in tests and in apps.
- For transfers, model with normal transactions plus linkage to simplify rendering/filters.
- Delete IndexedDB between tests to avoid lingering state.
- Await UI updates after async mutations to avoid flakes.

## Final Thoughts

I built Moneytree to showcase a privacy-first PWA architecture with real-world features. The result is a lean, testable, and offline-friendly finance tracker that demonstrates practical 11ty + IndexedDB + SW patterns.

If this aligns with what you’re building—or if you’re hiring for PWA-heavy roles—let’s talk.
