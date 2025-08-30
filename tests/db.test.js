import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../src/assets/js/core/db.js';

// Clean DB before each by deleting it entirely; db.js will recreate stores on open
beforeEach(async () => {
  await new Promise((resolve, reject) => {
    const req = indexedDB.deleteDatabase('moneytree');
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    req.onblocked = () => resolve(); // ignore
  });
});

describe('IndexedDB core db helpers', () => {
  it('adds and lists transactions', async () => {
    const t1 = { id: 't1', amount: 12.34, date: '2025-08-01', type: 'expense', category: 'Food', description: 'Lunch' };
    const t2 = { id: 't2', amount: 50, date: '2025-08-02', type: 'income', category: 'Salary', description: 'Refund' };
    await db.addTransaction(t1);
    await db.addTransaction(t2);
    const all = await db.listTransactions();
    expect(Array.isArray(all)).toBe(true);
    expect(all.length).toBe(2);
    expect(all.find(t => t.id === 't1')?.amount).toBe(12.34);
  });

  it('updates and deletes a transaction', async () => {
    const t = { id: 't3', amount: 5, date: '2025-08-03', type: 'expense' };
    await db.addTransaction(t);
    t.amount = 7.5;
    await db.putTransaction(t);
    let all = await db.listTransactions();
    expect(all.find(x => x.id === 't3')?.amount).toBe(7.5);
    await db.deleteTransaction('t3');
    all = await db.listTransactions();
    expect(all.find(x => x.id === 't3')).toBeUndefined();
  });
});
