import Papa from 'papaparse';
import { Transaction } from '@/types';
import { classifyCategory } from './categories';
import { generateId } from './utils';

type RawRow = Record<string, string>;

function detectBankFormat(headers: string[]): 'chase' | 'bofa' | 'wells' | 'generic' {
  const h = headers.map((s) => s.toLowerCase().trim());
  if (h.includes('transaction date') && h.includes('post date')) return 'chase';
  if (h.includes('date') && h.includes('description') && h.includes('amount') && h.includes('running bal.')) return 'bofa';
  if (h.includes('date') && h.includes('amount') && h.includes('* debit') && h.includes('* credit')) return 'wells';
  return 'generic';
}

function normalizeDate(raw: string): string {
  if (!raw) return new Date().toISOString().substring(0, 10);
  // Handle MM/DD/YYYY
  const mmddyyyy = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (mmddyyyy) {
    const [, m, d, y] = mmddyyyy;
    const year = y.length === 2 ? `20${y}` : y;
    return `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  // Handle YYYY-MM-DD
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return raw;
  return new Date().toISOString().substring(0, 10);
}

function parseAmount(raw: string): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/[$,\s]/g, '');
  return Math.abs(parseFloat(cleaned) || 0);
}

function parseRow(row: RawRow, format: ReturnType<typeof detectBankFormat>): Omit<Transaction, 'id' | 'createdAt'> | null {
  try {
    let date = '';
    let description = '';
    let amount = 0;
    let type: 'income' | 'expense' = 'expense';

    if (format === 'chase') {
      date = normalizeDate(row['Transaction Date'] || row['transaction date'] || '');
      description = row['Description'] || row['description'] || '';
      const raw = row['Amount'] || row['amount'] || '0';
      const parsed = parseFloat(raw.replace(/[$,\s]/g, ''));
      amount = Math.abs(parsed);
      type = parsed >= 0 ? 'income' : 'expense';
    } else if (format === 'bofa') {
      date = normalizeDate(row['Date'] || row['date'] || '');
      description = row['Description'] || row['description'] || '';
      const raw = row['Amount'] || row['amount'] || '0';
      const parsed = parseFloat(raw.replace(/[$,\s]/g, ''));
      amount = Math.abs(parsed);
      type = parsed >= 0 ? 'income' : 'expense';
    } else if (format === 'wells') {
      date = normalizeDate(row['Date'] || row['date'] || '');
      description = row['Description'] || row['description'] || '';
      const debit = parseAmount(row['* Debit'] || row['Debit'] || '');
      const credit = parseAmount(row['* Credit'] || row['Credit'] || '');
      if (credit > 0) {
        amount = credit;
        type = 'income';
      } else {
        amount = debit;
        type = 'expense';
      }
    } else {
      // generic: look for common column names
      const dateCol = Object.keys(row).find((k) => /date/i.test(k));
      const descCol = Object.keys(row).find((k) => /desc|memo|name|payee/i.test(k));
      const amtCol = Object.keys(row).find((k) => /amount|amt/i.test(k));
      const creditCol = Object.keys(row).find((k) => /credit/i.test(k));
      const debitCol = Object.keys(row).find((k) => /debit/i.test(k));

      date = normalizeDate(dateCol ? row[dateCol] : '');
      description = descCol ? row[descCol] : Object.values(row)[1] || '';

      if (creditCol && debitCol) {
        const credit = parseAmount(creditCol ? row[creditCol] : '');
        const debit = parseAmount(debitCol ? row[debitCol] : '');
        if (credit > 0) { amount = credit; type = 'income'; }
        else { amount = debit; type = 'expense'; }
      } else if (amtCol) {
        const raw = row[amtCol];
        const parsed = parseFloat(raw.replace(/[$,\s]/g, ''));
        amount = Math.abs(parsed);
        type = parsed >= 0 ? 'income' : 'expense';
      }
    }

    if (!description || amount === 0) return null;

    const category = type === 'income' ? 'income' : classifyCategory(description);

    return { date, description, amount, type, category, source: 'csv' };
  } catch {
    return null;
  }
}

export interface ParsedCSVResult {
  transactions: Omit<Transaction, 'id' | 'createdAt'>[];
  errors: number;
  format: string;
}

export function parseCSV(csvText: string): ParsedCSVResult {
  const result = Papa.parse<RawRow>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  const headers = result.meta.fields || [];
  const format = detectBankFormat(headers);
  let errors = 0;

  const transactions: Omit<Transaction, 'id' | 'createdAt'>[] = [];
  for (const row of result.data) {
    const tx = parseRow(row, format);
    if (tx) {
      transactions.push(tx);
    } else {
      errors++;
    }
  }

  return { transactions, errors, format };
}
