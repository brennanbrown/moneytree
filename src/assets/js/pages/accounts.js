import { db, uid } from '../core/db.js';

async function renderAccounts() {
  const list = document.getElementById('acct-list');
  const empty = document.getElementById('acct-empty');
  if (!list || !empty) return;
  const items = await db.listAccounts();
  list.innerHTML = '';
  if (!items.length) {
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');
  for (const a of items) {
    const li = document.createElement('li');
    li.className = 'py-3 flex items-center justify-between';
    li.innerHTML = `
      <div class="flex items-center gap-3">
        <span class="inline-block w-3 h-3 rounded-full" style="background:${a.color || '#3B82F6'}"></span>
        <div>
          <div class="font-medium">${a.name}</div>
          <div class="text-xs text-gray-500">${a.type || ''}</div>
        </div>
      </div>
      <div class="text-sm text-gray-700">$${Number(a.balance || 0).toFixed(2)}</div>
    `;
    list.appendChild(li);
  }
}

function initForm() {
  const form = document.getElementById('acct-form');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const acct = {
      id: uid(),
      name: (data.get('name') || '').toString().trim(),
      type: (data.get('type') || '').toString(),
      balance: Number(data.get('balance') || 0),
      color: (data.get('color') || '#3B82F6').toString()
    };
    if (!acct.name) return;
    await db.addAccount(acct);
    form.reset();
    renderAccounts();
  });
}

export function initAccountsPage() {
  if (document.getElementById('acct-form')) {
    initForm();
    renderAccounts();
  }
}

initAccountsPage();
