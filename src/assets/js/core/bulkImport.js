import { db, uid } from './db.js';

/**
 * Parse and import comprehensive CSV with multiple entity types
 * Supports: accounts, categories, budgets, transactions
 * 
 * CSV Format:
 * type,name,amount,date,description,category,account,color,icon,limit,month
 * 
 * Entity types:
 * - account: name, type (optional), balance (as amount), color
 * - category: name, color, icon
 * - budget: category, month, limit (as amount)
 * - transaction: date, type (expense/income/transfer), amount, category, account, description
 */

function splitCsvLine(line) {
  const fields = [];
  let i = 0;
  const n = line.length;
  while (i <= n) {
    if (i === n) { fields.push(''); break; }
    let ch = line[i];
    if (ch === '"') {
      i++;
      let buf = '';
      while (i < n) {
        const c = line[i];
        if (c === '"') {
          const next = line[i + 1];
          if (next === '"') {
            const nextNext = line[i + 2];
            if (nextNext === ',' || i + 2 === n) {
              buf += '"';
              i += 2;
              break;
            }
            buf += '"';
            i += 2;
            continue;
          }
          if (next === ',' || i + 1 === n) { i++; break; }
          buf += '"';
          i++;
        } else if (c === '\\' && line[i + 1] === '"') {
          buf += '"'; i += 2; continue;
        } else {
          buf += c; i++;
        }
      }
      if (line[i] === ',') i++;
      fields.push(buf);
    } else {
      let start = i;
      while (i < n && line[i] !== ',') i++;
      fields.push(line.slice(start, i));
      if (line[i] === ',') i++;
    }
    if (i >= n) break;
  }
  return fields;
}

export async function importBulkCSV(text) {
  const lines = (text || '').trim().split(/\r?\n/);
  if (!lines.length || !lines[0]) return { success: false, message: 'Empty CSV' };
  
  const headers = splitCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  const stats = {
    accounts: 0,
    categories: 0,
    budgets: 0,
    transactions: 0,
    errors: []
  };

  for (let lineNum = 1; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum];
    if (!line || !line.trim()) continue;
    
    try {
      const cols = splitCsvLine(line);
      const row = Object.create(null);
      headers.forEach((h, i) => (row[h] = (cols[i] ?? '').trim()));
      
      const entityType = (row.type || '').toLowerCase();
      
      if (entityType === 'account') {
        await db.addAccount({
          id: uid(),
          name: row.name || row.account || '',
          type: row.accounttype || row.subtype || 'checking',
          balance: Number(row.amount || row.balance || 0),
          color: row.color || '#3B82F6'
        });
        stats.accounts++;
      } 
      else if (entityType === 'category') {
        await db.putCategory({
          id: uid(),
          name: row.name || row.category || '',
          color: row.color || '#6B7280',
          icon: row.icon || '📁'
        });
        stats.categories++;
      }
      else if (entityType === 'budget') {
        await db.addBudget({
          id: uid(),
          category: row.category || row.name || '',
          month: row.month || new Date().toISOString().slice(0, 7),
          limit: Number(row.limit || row.amount || 0)
        });
        stats.budgets++;
      }
      else if (['expense', 'income', 'transfer'].includes(entityType)) {
        const rawAmt = Number(row.amount || row.amt || 0);
        await db.addTransaction({
          id: uid(),
          type: entityType,
          amount: Math.abs(rawAmt),
          date: row.date || new Date().toISOString().slice(0, 10),
          category: row.category || '',
          account: row.account || '',
          description: row.description || row.memo || ''
        });
        stats.transactions++;
      }
      else {
        stats.errors.push(`Line ${lineNum + 1}: Unknown type "${entityType}"`);
      }
    } catch (err) {
      stats.errors.push(`Line ${lineNum + 1}: ${err.message}`);
    }
  }

  return {
    success: true,
    stats,
    message: `Imported ${stats.accounts} accounts, ${stats.categories} categories, ${stats.budgets} budgets, ${stats.transactions} transactions`
  };
}
