import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../src/assets/js/core/db.js';

function setDOM() {
  document.body.innerHTML = `
    <section>
      <form id="tx-form"></form>
      <div id="tx-empty" class="hidden"></div>
      <ul id="tx-list"></ul>
      <input id="tx-filter-q" />
      <select id="tx-filter-category"></select>
      <select id="tx-filter-account"></select>
    </section>`;
}

beforeEach(async () => {
  document.body.innerHTML = '';
  await new Promise((resolve, reject) => {
    const req = indexedDB.deleteDatabase('moneytree');
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    req.onblocked = () => resolve();
  });
});

describe('Receipts rendering', () => {
  it('shows a paperclip icon when a receipt is attached', async () => {
    setDOM();
    const mod = await import('../src/assets/js/pages/transactions.js?ts=' + Math.random());
    await db.addTransaction({ id: 't1', amount: 5, date: '2025-08-10', type: 'expense', account: 'Checking', category: 'Food', description: 'Snack' });
    await db.addReceipt({ id: 'r1', transactionId: 't1', mimeType: 'image/png', dataUrl: 'data:image/png;base64,xxx', createdAt: new Date().toISOString() });
    // trigger render
    await mod.initTransactionsPage();
    // allow async
    await new Promise(r => setTimeout(r, 10));
    const list = document.getElementById('tx-list');
    expect(list.textContent).toContain('Snack');
    expect(list.textContent).toContain('📎');
  });
});
