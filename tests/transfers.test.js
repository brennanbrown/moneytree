import { describe, it, expect, beforeEach } from 'vitest';

function setDOM() {
  document.body.innerHTML = `
    <section>
      <form id="tx-form">
        <input name="amount" type="number" />
        <input name="date" type="date" />
        <select name="type">
          <option value="expense">Expense</option>
          <option value="income">Income</option>
          <option value="transfer">Transfer</option>
        </select>
        <select name="category" id="tx-category"><option value="">Uncategorized</option></select>
        <select name="account" id="tx-account"></select>
        <div id="tx-transfer-from-wrap"><select name="fromAccount" id="tx-transfer-from"></select></div>
        <div id="tx-transfer-to-wrap"><select name="toAccount" id="tx-transfer-to"></select></div>
        <input name="description" type="text" />
        <button type="submit">Add</button>
      </form>
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

describe('Transfers', () => {
  it('creates two linked entries (out/in) and renders them', async () => {
    // Seed accounts before importing the page (auto-init will populate selects)
    const { db } = await import('../src/assets/js/core/db.js');
    await db.addAccount({ id: 'a1', name: 'Checking' });
    await db.addAccount({ id: 'a2', name: 'Savings' });
    setDOM();
    await import('../src/assets/js/pages/transactions.js?ts=' + Math.random());
    // Wait for auto-init to populate selects
    await new Promise(r => setTimeout(r, 50));

    const form = document.getElementById('tx-form');
    form.querySelector('input[name="amount"]').value = '50';
    form.querySelector('input[name="date"]').value = '2025-08-10';
    form.querySelector('select[name="type"]').value = 'transfer';
    form.querySelector('#tx-transfer-from').value = 'Checking';
    form.querySelector('#tx-transfer-to').value = 'Savings';

    const submitEvent = new Event('submit');
    await form.dispatchEvent(submitEvent);
    await new Promise(r => setTimeout(r, 30));

    // Should render two list items for the two sides
    const list = document.getElementById('tx-list');
    expect(list.children.length).toBe(2);
  });
});
