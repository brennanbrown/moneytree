import { db, uid } from '../core/db.js';
import { ensureSeedData } from '../core/seed.js';

async function renderBudgets() {
  const list = document.getElementById('budget-list');
  const empty = document.getElementById('budget-empty');
  if (!list || !empty) return;
  const budgets = await db.listBudgets().catch(() => []);
  const txs = await db.listTransactions();
  list.innerHTML = '';
  if (!budgets.length) {
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');
  const [start, end] = monthRange();
  const withinMonth = (d) => {
    const t = new Date(d).getTime();
    return t >= start.getTime() && t <= end.getTime();
  };
  for (const b of budgets) {
    const spent = txs
      .filter((t) => t.category === b.category && t.type === 'expense' && withinMonth(t.date))
      .reduce((s, t) => s + Number(t.amount || 0), 0);
    const pct = Math.min(100, Math.round((spent / Number(b.amount || 1)) * 100));
    const li = document.createElement('li');
    li.className = 'py-2 flex items-center justify-between';
    li.innerHTML = `
      <span>${b.category} (${b.period})</span>
      <span class="text-sm ${pct >= 100 ? 'text-red-600' : 'text-gray-700'}">$${spent.toFixed(2)} / $${Number(b.amount).toFixed(2)}</span>
    `;
    list.appendChild(li);
  }
}

function monthRange(date = new Date()) {
  const y = date.getFullYear();
  const m = date.getMonth();
  const start = new Date(y, m, 1);
  const end = new Date(y, m + 1, 0, 23, 59, 59, 999);
  return [start, end];
}

function initForm() {
  const form = document.getElementById('budget-form');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const catEl = form.querySelector('select[name="category"]');
    const amtEl = form.querySelector('input[name="amount"]');
    const perEl = form.querySelector('select[name="period"]');
    const budget = {
      id: uid(),
      category: (catEl?.value || '').toString(),
      amount: Number(amtEl?.value || 0),
      period: (perEl?.value || 'monthly').toString()
    };
    if (!budget.category || !budget.amount) return;
    await db.addBudget(budget);
    form.reset();
    await renderBudgets();
  });
}

async function populateCategorySelect() {
  const sel = document.querySelector('#budget-form select[name="category"]');
  if (!sel) return;
  const cats = await db.listCategories();
  sel.innerHTML = '<option value="">Select category</option>';
  for (const c of cats) {
    const opt = document.createElement('option');
    opt.value = c.name;
    opt.textContent = c.name;
    sel.appendChild(opt);
  }
}

export async function initBudgetsPage() {
  if (document.getElementById('budget-form')) {
    await ensureSeedData();
    await populateCategorySelect();
    initForm();
    await renderBudgets();
  }
}

initBudgetsPage();
