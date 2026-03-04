'use client';

import { useMemo } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { SpendingPieChart } from '@/components/dashboard/SpendingPieChart';
import { IncomeExpenseChart } from '@/components/dashboard/IncomeExpenseChart';
import { TrendLineChart } from '@/components/dashboard/TrendLineChart';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { formatCurrency, getMonthKey } from '@/lib/utils';
import { CategorySpend, MonthlyData } from '@/types';
import { CATEGORIES, getCategoryMeta } from '@/lib/categories';
import { CategoryId } from '@/types';

function getMonthLabel(key: string) {
  const [y, m] = key.split('-');
  const date = new Date(parseInt(y), parseInt(m) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'short' });
}

export default function DashboardPage() {
  const { transactions, initialized } = useTransactions();

  const {
    totalIncome,
    totalExpenses,
    netSavings,
    savingsRate,
    categorySpends,
    monthlyData,
  } = useMemo(() => {
    const expenses = transactions.filter((t) => t.type === 'expense');
    const income = transactions.filter((t) => t.type === 'income');

    const totalIncome = income.reduce((s, t) => s + t.amount, 0);
    const totalExpenses = expenses.reduce((s, t) => s + t.amount, 0);
    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

    // Category breakdown
    const catMap: Partial<Record<CategoryId, number>> = {};
    for (const tx of expenses) {
      catMap[tx.category] = (catMap[tx.category] || 0) + tx.amount;
    }
    const categorySpends: CategorySpend[] = Object.entries(catMap)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .map(([cat, amt]) => {
        const meta = getCategoryMeta(cat as CategoryId);
        return {
          category: cat as CategoryId,
          label: meta.label,
          amount: amt as number,
          color: meta.color,
          percentage: totalExpenses > 0 ? ((amt as number) / totalExpenses) * 100 : 0,
        };
      });

    // Monthly data (last 6 months)
    const monthMap: Record<string, { income: number; expenses: number }> = {};
    for (const tx of transactions) {
      const key = getMonthKey(tx.date);
      if (!monthMap[key]) monthMap[key] = { income: 0, expenses: 0 };
      if (tx.type === 'income') monthMap[key].income += tx.amount;
      else monthMap[key].expenses += tx.amount;
    }
    const monthlyData: MonthlyData[] = Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, val]) => ({ month: getMonthLabel(key), ...val }));

    return { totalIncome, totalExpenses, netSavings, savingsRate, categorySpends, monthlyData };
  }, [transactions]);

  if (!initialized) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Your financial overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Income"
          value={formatCurrency(totalIncome)}
          icon={TrendingUp}
          color="bg-green-500"
          subtext="All time"
        />
        <KpiCard
          title="Total Expenses"
          value={formatCurrency(totalExpenses)}
          icon={TrendingDown}
          color="bg-red-400"
          subtext="All time"
        />
        <KpiCard
          title="Net Savings"
          value={formatCurrency(netSavings)}
          icon={Wallet}
          color={netSavings >= 0 ? 'bg-blue-500' : 'bg-orange-400'}
          trend={netSavings >= 0 ? 'up' : 'down'}
        />
        <KpiCard
          title="Savings Rate"
          value={`${savingsRate.toFixed(1)}%`}
          icon={DollarSign}
          color="bg-purple-500"
          trendLabel={savingsRate >= 20 ? '✓ Healthy savings rate' : 'Aim for 20%+'}
          trend={savingsRate >= 20 ? 'up' : 'neutral'}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SpendingPieChart data={categorySpends} />
        <IncomeExpenseChart data={monthlyData} />
      </div>

      {/* Trend line */}
      <TrendLineChart data={monthlyData} />
    </div>
  );
}
