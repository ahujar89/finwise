'use client';

import { useMemo } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { generateInsights } from '@/lib/insights';
import { Skeleton } from '@/components/ui/skeleton';
import { Insight } from '@/types';
import { getCategoryMeta } from '@/lib/categories';
import {
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, RefreshCw, Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';

const TYPE_CONFIG = {
  positive: { icon: CheckCircle2, color: 'bg-green-50 border-green-200 text-green-700', iconColor: 'text-green-500', label: 'Good news' },
  warning: { icon: AlertTriangle, color: 'bg-amber-50 border-amber-200 text-amber-700', iconColor: 'text-amber-500', label: 'Heads up' },
  spike: { icon: TrendingUp, color: 'bg-red-50 border-red-200 text-red-700', iconColor: 'text-red-500', label: 'Spike detected' },
  savings: { icon: TrendingDown, color: 'bg-blue-50 border-blue-200 text-blue-700', iconColor: 'text-blue-500', label: 'Savings' },
  subscription: { icon: RefreshCw, color: 'bg-purple-50 border-purple-200 text-purple-700', iconColor: 'text-purple-500', label: 'Subscriptions' },
};

function InsightCard({ insight }: { insight: Insight }) {
  const config = TYPE_CONFIG[insight.type];
  const Icon = config.icon;
  const catMeta = insight.category ? getCategoryMeta(insight.category) : null;

  return (
    <div className={cn('rounded-xl border p-5 space-y-2', config.color)}>
      <div className="flex items-start gap-3">
        <Icon className={cn('w-5 h-5 mt-0.5 shrink-0', config.iconColor)} />
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium opacity-70 uppercase tracking-wide">{config.label}</span>
            {catMeta && <span className="text-base">{catMeta.icon}</span>}
          </div>
          <h3 className="font-semibold mt-0.5">{insight.title}</h3>
          <p className="text-sm mt-1 opacity-80">{insight.description}</p>
        </div>
      </div>
    </div>
  );
}

export default function InsightsPage() {
  const { transactions, initialized } = useTransactions();
  const insights = useMemo(() => generateInsights(transactions), [transactions]);

  if (!initialized) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Insights</h1>
        <p className="text-muted-foreground text-sm mt-1">AI-powered analysis of your spending patterns</p>
      </div>

      {insights.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-20 text-center">
          <Lightbulb className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-muted-foreground">Add more transactions to generate insights</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      )}
    </div>
  );
}
