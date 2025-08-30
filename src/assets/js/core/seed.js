import { db } from './db.js';

const DEFAULT_CATEGORIES = [
  { id: 'cat-food', name: 'Food', color: '#EF4444', icon: '🍔' },
  { id: 'cat-transport', name: 'Transportation', color: '#3B82F6', icon: '🚌' },
  { id: 'cat-entertain', name: 'Entertainment', color: '#A855F7', icon: '🎮' },
  { id: 'cat-groceries', name: 'Groceries', color: '#10B981', icon: '🛒' },
  { id: 'cat-bills', name: 'Bills & Utilities', color: '#F59E0B', icon: '💡' },
  { id: 'cat-income', name: 'Income', color: '#22C55E', icon: '💼' }
];

let seedingPromise;
export async function ensureSeedData() {
  if (seedingPromise) return seedingPromise;
  seedingPromise = (async () => {
    const existing = await db.listCategories();
    if (!existing || existing.length === 0) {
      for (const c of DEFAULT_CATEGORIES) {
        try { await db.putCategory(c); } catch {}
      }
    }
  })();
  try {
    await seedingPromise;
  } finally {
    seedingPromise = undefined;
  }
}

export { DEFAULT_CATEGORIES };
