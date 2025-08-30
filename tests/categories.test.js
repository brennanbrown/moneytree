import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../src/assets/js/core/db.js';

function setDOM() {
  document.body.innerHTML = `
    <section>
      <form id="cat-form">
        <input name="name" />
        <input name="color" />
        <input name="icon" />
        <button type="submit">Add</button>
      </form>
      <div id="cat-empty" class="hidden"></div>
      <ul id="cat-list"></ul>
    </section>`;
}

beforeEach(async () => {
  // fresh DOM and DB
  document.body.innerHTML = '';
  await new Promise((resolve, reject) => {
    const req = indexedDB.deleteDatabase('moneytree');
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    req.onblocked = () => resolve();
  });
});

describe('Categories page', () => {
  it('seeds default categories and renders list', async () => {
    setDOM();
    const mod = await import('../src/assets/js/pages/categories.js?ts=' + Math.random());
    // allow async seed and force render
    await new Promise(r => setTimeout(r, 20));
    await mod.renderCategories();
    const list = document.getElementById('cat-list');
    expect(list.children.length).toBeGreaterThan(0);
  });

  it('adds a category and renders it', async () => {
    setDOM();
    const mod = await import('../src/assets/js/pages/categories.js?ts=' + Math.random());
    // add directly via DB helper to avoid submit quirks in test DOM
    await db.addCategory({ id: 'cat-pets', name: 'Pets', color: '#000000', icon: '🐶' });
    await mod.renderCategories();
    const list = document.getElementById('cat-list');
    expect(list.textContent).toContain('Pets');
  });
});
