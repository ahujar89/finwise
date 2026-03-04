import { Transaction, Goal } from '@/types';
import { getCategoryMeta } from './categories';
import { formatCurrency, getMonthKey } from './utils';

export function buildSystemPrompt(transactions: Transaction[], goals: Goal[]): string {
  const now = new Date();
  const last30 = new Date();
  last30.setDate(last30.getDate() - 30);

  const recent = transactions.filter((t) => new Date(t.date) >= last30);
  const income = recent.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = recent.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

  // Category breakdown
  const catMap: Record<string, number> = {};
  for (const tx of recent.filter((t) => t.type === 'expense')) {
    catMap[tx.category] = (catMap[tx.category] || 0) + tx.amount;
  }
  const catBreakdown = Object.entries(catMap)
    .sort(([, a], [, b]) => b - a)
    .map(([cat, amt]) => `  - ${getCategoryMeta(cat as any).label}: ${formatCurrency(amt)}`)
    .join('\n');

  // Last 30 transactions
  const last30Txs = transactions.slice(0, 30);
  const txList = last30Txs
    .map((t) => `  ${t.date} | ${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)} | ${t.description} | ${getCategoryMeta(t.category).label}`)
    .join('\n');

  // Goals
  const goalList = goals
    .map((g) => {
      const pct = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;
      return `  - ${g.name}: ${formatCurrency(g.currentAmount)} / ${formatCurrency(g.targetAmount)} (${pct.toFixed(0)}%)${g.targetDate ? ` by ${g.targetDate}` : ''}`;
    })
    .join('\n');

  return `You are FinWise, a helpful AI personal finance advisor. You have access to the user's real financial data below.

## User's Financial Summary (Last 30 Days)
- Total Income: ${formatCurrency(income)}
- Total Expenses: ${formatCurrency(expenses)}
- Net Savings: ${formatCurrency(income - expenses)}
- Savings Rate: ${savingsRate.toFixed(1)}%

## Spending by Category (Last 30 Days)
${catBreakdown || '  No expense data available'}

## Last 30 Transactions
${txList || '  No transactions recorded'}

## Active Financial Goals
${goalList || '  No goals set'}

## Instructions
- Answer questions about the user's finances using the data above
- Be specific with numbers from their actual data
- Give actionable, personalized advice
- Keep responses concise but helpful
- If asked about something not in the data, say so honestly
- Today's date is ${now.toISOString().substring(0, 10)}`;
}
