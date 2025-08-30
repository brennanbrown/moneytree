/* IndexedDB scaffold for Moneytree */
const DB_NAME = 'moneytree';
const DB_VERSION = 2;

const STORES = {
  transactions: { keyPath: 'id' },
  categories: { keyPath: 'id' },
  accounts: { keyPath: 'id' },
  settings: { keyPath: 'key' },
  receipts: { keyPath: 'id' }
};

// Add new stores for newer versions
STORES.budgets = { keyPath: 'id' };

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      // Create stores if not exist
      for (const [name, opts] of Object.entries(STORES)) {
        if (!db.objectStoreNames.contains(name)) {
          db.createObjectStore(name, opts);
        }
      }
      // Example indexes
      const txStore = request.transaction.objectStore('transactions');
      if (!txStore.indexNames.contains('date')) txStore.createIndex('date', 'date');
      if (!txStore.indexNames.contains('category')) txStore.createIndex('category', 'category');
      if (!txStore.indexNames.contains('account')) txStore.createIndex('account', 'account');
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function awaitRequest(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function withStore(storeName, mode, fn) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    let valuePromise;
    try {
      const request = fn(store);
      // If fn returns an IDBRequest, await its result
      if (request && typeof request === 'object' && 'onsuccess' in request) {
        valuePromise = awaitRequest(request);
      } else {
        valuePromise = Promise.resolve(request);
      }
    } catch (e) {
      tx.abort();
      reject(e);
      return;
    }
    tx.oncomplete = async () => {
      try {
        const val = await valuePromise;
        resolve(val);
      } catch (e) {
        reject(e);
      }
    };
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

// Basic CRUD API examples
export const db = {
  addTransaction: (tx) => withStore('transactions', 'readwrite', (s) => s.add(tx)),
  listTransactions: () => withStore('transactions', 'readonly', (s) => s.getAll()),
  putTransaction: (tx) => withStore('transactions', 'readwrite', (s) => s.put(tx)),
  deleteTransaction: (id) => withStore('transactions', 'readwrite', (s) => s.delete(id)),

  addCategory: (c) => withStore('categories', 'readwrite', (s) => s.add(c)),
  listCategories: () => withStore('categories', 'readonly', (s) => s.getAll()),
  putCategory: (c) => withStore('categories', 'readwrite', (s) => s.put(c)),

  addAccount: (a) => withStore('accounts', 'readwrite', (s) => s.add(a)),
  listAccounts: () => withStore('accounts', 'readonly', (s) => s.getAll()),

  // Budgets
  addBudget: (b) => withStore('budgets', 'readwrite', (s) => s.add(b)),
  listBudgets: () => withStore('budgets', 'readonly', (s) => s.getAll()),

  getSetting: (key) => withStore('settings', 'readonly', (s) => s.get(key)),
  setSetting: (key, value) => withStore('settings', 'readwrite', (s) => s.put({ key, value })),

  // Receipts
  addReceipt: (r) => withStore('receipts', 'readwrite', (s) => s.add(r)),
  putReceipt: (r) => withStore('receipts', 'readwrite', (s) => s.put(r)),
  deleteReceipt: (id) => withStore('receipts', 'readwrite', (s) => s.delete(id)),
  listReceipts: () => withStore('receipts', 'readonly', (s) => s.getAll()),
};

// Simple ID helper
export const uid = () => crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
