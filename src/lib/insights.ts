import { Transaction, Insight, CategoryId } from '@/types';
import { getCategoryMeta } from './categories';
import { getMonthKey } from './utils';

function groupByMonth(transactions: Transaction[]) {
  const map: Record<string, Transaction[]> = {};
  for (const tx of transactions) {
    const key = getMonthKey(tx.date);
    if (!map[key]) map[key] = [];
    map[key].push(tx);
  }
  return map;
}

function groupByCategory(transactions: Transaction[]) {
  const map: Record<CategoryId, number> = {} as Record<CategoryId, number>;
  for (const tx of transactions.filter((t) => t.type === 'expense')) {
    map[tx.category] = (map[tx.category] || 0) + tx.amount;
  }
  return map;
}

export function generateInsights(transactions: Transaction[]): Insight[] {
  if (transactions.length === 0) return [];

  const insights: Insight[] = [];
  const byMonth = groupByMonth(transactions);
  const months = Object.keys(byMonth).sort();
  const recentMonths = months.slice(-3);

  // 1. Savings rate
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);
  const recent = transactions.filter((t) => new Date(t.date) >= last30Days);
  const recentIncome = recent.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const recentExpense = recent.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  if (recentIncome > 0) {
    const savingsRate = ((recentIncome - recentExpense) / recentIncome) * 100;
    if (savingsRate >= 20) {
      insights.push({
        id: 'savings-rate-good',
        type: 'positive',
        title: 'Strong Savings Rate',
        description: `You saved ${savingsRate.toFixed(0)}% of your income in the last 30 days. Keep it up!`,
        value: savingsRate,
      });
    } else if (savingsRate < 5) {
      insights.push({
        id: 'savings-rate-low',
        type: 'warning',
        title: 'Low Savings Rate',
        description: `You only saved ${savingsRate.toFixed(0)}% of your income recently. Consider reducing discretionary spending.`,
        value: savingsRate,
      });
    }
  }

  // 2. Spending spike detection (compare last 2 months by category)
  if (recentMonths.length >= 2) {
    const prev = byMonth[recentMonths[recentMonths.length - 2]] || [];
    const curr = byMonth[recentMonths[recentMonths.length - 1]] || [];
    const prevBycat = groupByCategory(prev);
    const currBycat = groupByCategory(curr);

    for (const [cat, currAmt] of Object.entries(currBycat) as [CategoryId, number][]) {
      const prevAmt = prevBycat[cat] || 0;
      if (prevAmt > 0 && currAmt > prevAmt * 1.5 && currAmt - prevAmt > 50) {
        const meta = getCategoryMeta(cat);
        insights.push({
          id: `spike-${cat}`,
          type: 'spike',
          title: `${meta.label} Spending Spike`,
          description: `Your ${meta.label.toLowerCase()} spending increased by ${(((currAmt - prevAmt) / prevAmt) * 100).toFixed(0)}% compared to last month ($${prevAmt.toFixed(0)} → $${currAmt.toFixed(0)}).`,
          value: currAmt - prevAmt,
          category: cat,
        });
      }
    }
  }

  // 3. Subscription detection
  const subscriptionKeywords = ['netflix', 'spotify', 'hulu', 'disney', 'apple', 'amazon prime', 'gym', 'membership', 'subscription'];
  const possibleSubs = transactions.filter(
    (t) =>
      t.type === 'expense' &&
      subscriptionKeywords.some((kw) => t.description.toLowerCase().includes(kw))
  );
  const uniqueSubs = [...new Set(possibleSubs.map((t) => t.description))];
  if (uniqueSubs.length > 0) {
    const totalSubCost = possibleSubs.reduce((s, t) => s + t.amount, 0) / Math.max(recentMonths.length, 1);
    insights.push({
      id: 'subscriptions',
      type: 'subscription',
      title: `${uniqueSubs.length} Active Subscriptions Detected`,
      description: `You have subscriptions including ${uniqueSubs.slice(0, 3).join(', ')}${uniqueSubs.length > 3 ? ', and more' : ''}. Estimated monthly cost: $${totalSubCost.toFixed(2)}.`,
      value: totalSubCost,
    });
  }

  // 4. Top spending category
  const allExpenses = transactions.filter((t) => t.type === 'expense');
  if (allExpenses.length > 0) {
    const byCategory = groupByCategory(allExpenses);
    const [topCat, topAmt] = Object.entries(byCategory).sort(([, a], [, b]) => b - a)[0] as [CategoryId, number];
    const meta = getCategoryMeta(topCat);
    insights.push({
      id: 'top-category',
      type: 'warning',
      title: `Biggest Expense: ${meta.label}`,
      description: `${meta.label} is your largest spending category at $${topAmt.toFixed(2)} total across all recorded transactions.`,
      value: topAmt,
      category: topCat,
    });
  }

  // 5. Monthly trend
  if (recentMonths.length >= 2) {
    const monthExpenses = recentMonths.map((m) => ({
      month: m,
      total: (byMonth[m] || []).filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    }));
    const first = monthExpenses[0].total;
    const last = monthExpenses[monthExpenses.length - 1].total;
    if (last < first * 0.9 && first - last > 100) {
      insights.push({
        id: 'trend-down',
        type: 'positive',
        title: 'Spending Trend Improving',
        description: `Your monthly expenses have decreased by $${(first - last).toFixed(0)} over the last ${recentMonths.length} months. Great progress!`,
        value: first - last,
      });
    }
  }

  return insights;
}
