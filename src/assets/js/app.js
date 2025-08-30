import './core/db.js';
import './pages/transactions.js';
import './pages/accounts.js';
import './pages/categories.js';
import './pages/dashboard.js';
import './pages/budgets.js';

// Service worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('SW registration failed', err);
    });
  });
}

// (no placeholder overrides)//
