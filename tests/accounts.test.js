import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../src/assets/js/core/db.js';

beforeEach(async () => {
  await new Promise((resolve, reject) => {
    const req = indexedDB.deleteDatabase('moneytree');
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    req.onblocked = () => resolve();
  });
});

describe('Accounts DB helpers', () => {
  it('adds and lists accounts', async () => {
    const a1 = { id: 'a1', name: 'Checking', type: 'checking', balance: 1000 };
    const a2 = { id: 'a2', name: 'Savings', type: 'savings', balance: 5000 };
    await db.addAccount(a1);
    await db.addAccount(a2);
    const all = await db.listAccounts();
    expect(all.length).toBe(2);
    expect(all.find(a => a.id === 'a2')?.name).toBe('Savings');
  });
});
