import { describe, it, expect, beforeEach } from 'vitest';
import { parseTransactionsCSV } from '../src/assets/js/pages/transactions.js';

beforeEach(async () => {
  // Reset DOM per test (parser doesn't need it but staying consistent)
  document.body.innerHTML = '';
});

describe('CSV Import Parser', () => {
  it('parses basic CSV with headers', () => {
    const csv = `date,description,amount,type,category,account\n2025-08-10,Lunch,9.99,expense,Food,Checking`;
    const rows = parseTransactionsCSV(csv);
    expect(rows.length).toBe(1);
    expect(rows[0]).toMatchObject({
      date: '2025-08-10',
      description: 'Lunch',
      amount: 9.99,
      type: 'expense',
      category: 'Food',
      account: 'Checking',
    });
  });

  it('infers type from sign and normalizes amount to absolute', () => {
    const csv = `date,description,amount,category,account\n2025-08-09,Deposit,123.45,Income,Checking\n2025-08-10,Coffee,-4.50,Food,Checking`;
    const rows = parseTransactionsCSV(csv);
    expect(rows.length).toBe(2);
    const dep = rows[0];
    const cof = rows[1];
    expect(dep.type).toBe('income');
    expect(dep.amount).toBe(123.45);
    expect(cof.type).toBe('expense');
    expect(cof.amount).toBe(4.5);
  });

  it('handles quoted commas and escaped quotes', () => {
    const csv = `date,description,amount\n2025-08-11,"Dinner, with \"friends\"",19.00`;
    const rows = parseTransactionsCSV(csv);
    expect(rows[0].description).toBe('Dinner, with "friends"');
  });
});
