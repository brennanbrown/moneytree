import { db } from '../core/db.js';

async function renderAccountOverview() {
  const el = document.getElementById('account-overview');
  if (!el) return;
  // Show placeholder immediately; will be replaced if accounts exist
  el.innerHTML = '<div class="text-gray-500">No accounts yet</div>';
  const accounts = await db.listAccounts();
  const txs = await db.listTransactions();
  if (!accounts.length) return;
  // Compute balances from transactions
  const balances = Object.create(null);
  for (const a of accounts) balances[a.name] = 0;
  for (const t of txs) {
    const acc = t.account || '';
    if (!acc || !(acc in balances)) continue; // ignore transactions for unknown accounts
    if (t.type === 'income') balances[acc] += Number(t.amount || 0);
    else if (t.type === 'expense') balances[acc] -= Number(t.amount || 0);
    else if (t.type === 'transfer') {
      if (t.direction === 'out') balances[acc] -= Number(t.amount || 0);
      else if (t.direction === 'in') balances[acc] += Number(t.amount || 0);
    }
  }
  const total = Object.values(balances).reduce((s, v) => s + Number(v || 0), 0);
  const chips = accounts
    .map(
      (a) => `
        <div class="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-gray-700 bg-gray-50">
          <span class="inline-block h-2 w-2 rounded-full bg-indigo-500"></span>
          <span class="font-medium">${a.name}</span>
          <span class="text-gray-500">$${Number(balances[a.name] || 0).toFixed(2)}</span>
        </div>`
    )
    .join(' ');

  el.innerHTML = `
    <div class="space-y-3">
      <div class="text-sm text-gray-600">Accounts: ${accounts.length}</div>
      <div class="text-2xl font-semibold tracking-tight">Total Balance: $${total.toFixed(2)}</div>
      <div class="flex flex-wrap gap-2">${chips}</div>
    </div>
  `;
}

function byDateDesc(a, b) {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
}

async function renderRecentTransactions() {
  const list = document.getElementById('recent-transactions');
  if (!list) return;
  // Show empty state immediately; will be replaced if transactions exist
  list.innerHTML = '';
  const placeholder = document.createElement('li');
  placeholder.className = 'py-2 text-gray-500';
  placeholder.textContent = 'No transactions yet';
  list.appendChild(placeholder);
  const txs = await db.listTransactions();
  if (!txs.length) return;
  txs.sort(byDateDesc);
  for (const t of txs.slice(0, 5)) {
    const li = document.createElement('li');
    li.className = 'py-2 flex items-center justify-between';
    const sign = t.type === 'income' ? '+' : t.type === 'expense' ? '-' : '';
    const dateStr = new Date(t.date).toLocaleDateString();
    const meta = [t.category || 'Uncategorized'];
    if (t.account) meta.push(t.account);
    meta.push(dateStr);
    li.innerHTML = `
      <div class="min-w-0">
        <div class="font-medium text-gray-900 truncate">${t.description || '(No description)'}</div>
        <div class="text-xs text-gray-500">${meta.join(' • ')}</div>
      </div>
      <div class="ml-4 shrink-0 inline-flex items-center rounded-full px-2 py-1 text-xs ${
        t.type === 'income' ? 'bg-green-50 text-green-700' : t.type === 'expense' ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-700'
      }">${sign}$${Number(t.amount).toFixed(2)}</div>
    `;
    if (placeholder.parentNode === list) list.removeChild(placeholder);
    list.appendChild(li);
  }
}

export async function initDashboardPage() {
  if (
    document.getElementById('account-overview') ||
    document.getElementById('recent-transactions') ||
    document.getElementById('budget-status') ||
    document.getElementById('quick-stats')
  ) {
    await renderAccountOverview();
    await renderRecentTransactions();
    await renderBudgetSummary();
    await renderQuickStats();
  }
}

initDashboardPage();

function monthRange(date = new Date()) {
  const y = date.getFullYear();
  const m = date.getMonth();
  const start = new Date(y, m, 1);
  const end = new Date(y, m + 1, 0, 23, 59, 59, 999);
  return [start, end];
}

async function renderBudgetSummary() {
  const el = document.getElementById('budget-status');
  if (!el) return;
  const budgets = await db.listBudgets().catch(() => []);
  const txs = await db.listTransactions();
  if (!budgets.length) {
    el.innerHTML = '<div class="text-gray-500">No budgets yet</div>';
    return;
  }
  const [start, end] = monthRange();
  const withinMonth = (d) => {
    const t = new Date(d).getTime();
    return t >= start.getTime() && t <= end.getTime();
  };
  const summary = budgets.map((b) => {
    const spent = txs
      .filter((t) => t.category === b.category && t.type === 'expense' && withinMonth(t.date))
      .reduce((s, t) => s + Number(t.amount || 0), 0);
    const pct = Math.min(100, Math.round((spent / Number(b.amount || 1)) * 100));
    return { ...b, spent, pct };
  });
  el.innerHTML = summary
    .map(
      (s) => `
        <div class="py-2">
          <div class="flex items-center justify-between mb-1">
            <span class="text-sm font-medium text-gray-800">${s.category}</span>
            <span class="text-xs ${s.pct >= 100 ? 'text-red-600' : 'text-gray-600'}">$${s.spent.toFixed(2)} / $${Number(s.amount).toFixed(2)}</span>
          </div>
          <div class="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
            <div class="h-full ${s.pct >= 100 ? 'bg-red-500' : 'bg-emerald-500'}" style="width:${s.pct}%"></div>
          </div>
        </div>`
    )
    .join('');
}

async function renderQuickStats() {
  const el = document.getElementById('quick-stats');
  if (!el) return;
  const txs = await db.listTransactions();
  const [start, end] = monthRange();
  const withinMonth = (d) => {
    const t = new Date(d).getTime();
    return t >= start.getTime() && t <= end.getTime();
  };
  let income = 0;
  let expense = 0;
  for (const t of txs) {
    if (!withinMonth(t.date)) continue;
    if (t.type === 'income') income += Number(t.amount || 0);
    if (t.type === 'expense') expense += Number(t.amount || 0);
  }
  el.innerHTML = `
    <div class="grid grid-cols-2 gap-3">
      <div class="rounded-lg bg-green-50 border border-green-100 p-3">
        <div class="text-xs text-green-700">Income (mo)</div>
        <div class="text-lg font-semibold text-green-700">$${income.toFixed(2)}</div>
      </div>
      <div class="rounded-lg bg-red-50 border border-red-100 p-3">
        <div class="text-xs text-red-700">Expenses (mo)</div>
        <div class="text-lg font-semibold text-red-700">$${expense.toFixed(2)}</div>
      </div>
    </div>
  `;
}
