import { db, uid } from '../core/db.js';
import { ensureSeedData } from '../core/seed.js';

export async function renderCategories() {
  const list = document.getElementById('cat-list');
  const empty = document.getElementById('cat-empty');
  if (!list || !empty) return;
  const items = await db.listCategories();
  list.innerHTML = '';
  if (!items.length) {
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');
  for (const c of items) {
    const li = document.createElement('li');
    li.className = 'py-3 flex items-center justify-between';
    li.innerHTML = `
      <div class="flex items-center gap-3">
        <span class="inline-flex items-center justify-center w-6 h-6 rounded-full border" style="background:${c.color || '#10B981'}">${c.icon || ''}</span>
        <span class="font-medium">${c.name}</span>
      </div>
    `;
    list.appendChild(li);
  }
}

function initForm() {
  const form = document.getElementById('cat-form');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nameEl = form.querySelector('input[name="name"]');
    const colorEl = form.querySelector('input[name="color"]');
    const iconEl = form.querySelector('input[name="icon"]');
    const cat = {
      id: uid(),
      name: (nameEl?.value || '').toString().trim(),
      color: (colorEl?.value || '#10B981').toString(),
      icon: (iconEl?.value || '').toString().trim()
    };
    if (!cat.name) return;
    await db.addCategory(cat);
    form.reset();
    await renderCategories();
  });
}

export async function initCategoriesPage() {
  if (document.getElementById('cat-form')) {
    await ensureSeedData();
    initForm();
    renderCategories();
  }
}

initCategoriesPage();
