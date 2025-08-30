import { describe, it, expect, beforeEach } from 'vitest';

function makeCachesMock() {
  const stores = new Map(); // cacheName -> Map(url -> response)
  function ensure(name) {
    if (!stores.has(name)) stores.set(name, new Map());
    return stores.get(name);
  }
  const api = {
    __stores: stores,
    async open(name) {
      const map = ensure(name);
      return {
        async addAll(urls) {
          for (const u of urls) {
            map.set(u, { body: `cached:${u}` });
          }
        },
        async put(request, response) {
          const key = typeof request === 'string' ? request : request.url || request;
          map.set(new URL(key, 'https://app.local').pathname, response);
        },
      };
    },
    async match(request) {
      const key = typeof request === 'string' ? request : request.url || request;
      const path = new URL(key, 'https://app.local').pathname;
      // search any cache
      for (const m of stores.values()) {
        if (m.has(path)) return m.get(path);
      }
      return undefined;
    },
    async keys() {
      return Array.from(stores.keys());
    },
    async delete(name) {
      return stores.delete(name);
    },
  };
  return api;
}

function makeEvent(requestLike) {
  const request = typeof requestLike === 'string' ? { url: `https://app.local${requestLike}` } : requestLike;
  let waited;
  const event = {
    request,
    respondWith(p) {
      event.responsePromise = Promise.resolve(p);
    },
    waitUntil(p) {
      waited = Promise.resolve(p);
    },
    get waited() { return waited; }
  };
  return event;
}

let cachesMock;

beforeEach(() => {
  // fresh SW global mocks
  cachesMock = makeCachesMock();
  globalThis.self = {
    location: { origin: 'https://app.local' },
    addEventListener(type, handler) {
      self.listeners[type] = handler;
    },
    listeners: {},
  };
  globalThis.caches = cachesMock;
  // default fetch succeeds
  globalThis.fetch = async (req) => ({ ok: true, url: typeof req === 'string' ? req : req.url, clone() { return this; } });
});

describe('Service Worker caching', () => {
  it('caches app shell on install and cleans old caches on activate', async () => {
    // seed an old cache to be cleaned
    cachesMock.__stores.set('old-cache', new Map([['/old', { body: 'old' }]]));
    await import('../src/assets/workers/sw.js?ts=' + Math.random());

    // trigger install
    const installEvt = makeEvent('/');
    self.listeners.install(installEvt);
    await installEvt.waited; // wait for addAll

    // app shell should be cached in the current cache name
    // We don't know the name here, but we can assert that '/' is present somewhere
    const cachedRoot = await caches.match('https://app.local/');
    expect(cachedRoot).toBeTruthy();

    // trigger activate
    const actEvt = makeEvent('/');
    self.listeners.activate(actEvt);
    await actEvt.waited;
    // old cache removed
    const keys = await caches.keys();
    expect(keys.includes('old-cache')).toBe(false);
  });

  it('serves cached asset when offline (stale-while-revalidate/assets)', async () => {
    await import('../src/assets/workers/sw.js?ts=' + Math.random());

    // put a cached asset
    const cache = await caches.open('moneytree-shell-v2');
    await cache.put('/assets/app.js', { body: 'cached:/assets/app.js' });

    // offline
    globalThis.fetch = async () => { throw new Error('offline'); };

    const evt = makeEvent('/assets/app.js');
    self.listeners.fetch(evt);
    const resp = await evt.responsePromise;
    expect(resp?.body).toBe('cached:/assets/app.js');
  });
});
