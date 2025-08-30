import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../src/assets/js/core/db.js';

function setDOM() {
  document.body.innerHTML = `
    <section>
      <form id="budget-form">
        <select name="category"></select>
        <input name="amount" />
        <select name="period"><option value="monthly">Monthly</option></select>
        <button type="submit">Add</button>
      </form>
      <div id="budget-empty"></div>
      <ul id="budget-list"></ul>
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

describe('Budgets page', () => {
  it('adds a budget and renders usage', async () => {
    setDOM();
    const mod = await import('../src/assets/js/pages/budgets.js?ts=' + Math.random());
    // Seed categories and a transaction
    await db.addCategory({ id: 'c1', name: 'Food', color: '#f00', icon: '🍔' });
    await db.addBudget({ id: 'b1', category: 'Food', amount: 100, period: 'monthly' });
    await db.addTransaction({ id: 't1', amount: 25, date: new Date().toISOString().slice(0,10), type: 'expense', category: 'Food', description: 'Lunch' });
    await mod.initBudgetsPage();
    const list = document.getElementById('budget-list');
    expect(list.textContent).toContain('Food');
    expect(list.textContent).toContain('$25.00 / $100.00');
  });
});
