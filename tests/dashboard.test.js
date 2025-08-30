import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../src/assets/js/core/db.js';

function setDOM() {
  document.body.innerHTML = `
    <section>
      <div id="account-overview"></div>
      <ul id="recent-transactions"></ul>
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

describe('Dashboard rendering', () => {
  it('shows empty states when no data', async () => {
    setDOM();
    await import('../src/assets/js/pages/dashboard.js?ts=' + Math.random());
    // allow async renders
    await new Promise(r => setTimeout(r, 10));
    expect(document.getElementById('account-overview').textContent).toContain('No accounts yet');
    expect(document.getElementById('recent-transactions').children.length).toBe(1);
  });

  it('renders account totals and recent transactions', async () => {
    setDOM();
    const mod = await import('../src/assets/js/pages/dashboard.js?ts=' + Math.random());
    await db.addAccount({ id: 'a1', name: 'Checking', type: 'checking', balance: 123.45 });
    // Transactions drive balances on the dashboard now
    await db.addTransaction({ id: 't0', amount: 123.45, date: '2025-08-09', type: 'income', account: 'Checking', category: 'Income', description: 'Deposit' });
    await db.addTransaction({ id: 't1', amount: 9.99, date: '2025-08-10', type: 'expense', account: 'Checking', category: 'Food', description: 'Lunch' });
    await mod.initDashboardPage();
    const overview = document.getElementById('account-overview').textContent;
    expect(overview).toContain('Accounts: 1');
    expect(overview).toContain('Total Balance: $113.46');
    const recent = document.getElementById('recent-transactions');
    expect(recent.children.length).toBeGreaterThan(0);
    expect(recent.textContent).toContain('Lunch');
  });
});
