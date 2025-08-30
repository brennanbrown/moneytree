import { describe, it, expect, beforeEach, vi } from 'vitest';

// We'll dynamically import the page script after setting up DOM

function setDOM() {
  document.body.innerHTML = `
    <section>
      <form id="tx-form">
        <input name="amount" type="number" />
        <input name="date" type="date" />
        <select name="type">
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <select name="category" id="tx-category"><option value="">Uncategorized</option><option value="Food">Food</option></select>
        <input name="description" type="text" />
        <button type="submit">Add</button>
      </form>
      <div id="tx-empty" class="hidden"></div>
      <ul id="tx-list"></ul>
    </section>`;
}

async function importPage() {
  // Ensure a fresh copy each test
  const mod = await import('../src/assets/js/pages/transactions.js?update=' + Math.random());
  return mod;
}

beforeEach(async () => {
  // reset DOM
  document.body.innerHTML = '';
  // clear DB to prevent seed duplication
  await new Promise((resolve, reject) => {
    const req = indexedDB.deleteDatabase('moneytree');
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    req.onblocked = () => resolve();
  });
});

describe('Transactions page', () => {
  it('initializes form date and renders empty state', async () => {
    setDOM();
    await importPage();
    const dateInput = document.querySelector('input[name="date"]');
    expect(dateInput.value).toMatch(/\d{4}-\d{2}-\d{2}/);
    const list = document.getElementById('tx-list');
    expect(list.children.length).toBe(0);
  });

  it('adds a transaction and renders it in the list', async () => {
    setDOM();
    const { } = await importPage();
    const form = document.getElementById('tx-form');
    form.querySelector('input[name="amount"]').value = '9.99';
    form.querySelector('input[name="date"]').value = '2025-08-10';
    form.querySelector('select[name="type"]').value = 'expense';
    form.querySelector('select[name="category"]').value = 'Food';
    form.querySelector('input[name="description"]').value = 'Test Lunch';

    const submitEvent = new Event('submit');
    await form.dispatchEvent(submitEvent);

    // Allow promises to flush
    await new Promise(r => setTimeout(r, 10));

    const list = document.getElementById('tx-list');
    expect(list.children.length).toBe(1);
    expect(list.textContent).toContain('Test Lunch');
    expect(list.textContent).toContain('$9.99');
  });
});
