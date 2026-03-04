'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MonthlyData } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface Props {
  data: MonthlyData[];
}

export function IncomeExpenseChart({ data }: Props) {
  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Income vs Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} barCategoryGap="30%" barGap={4}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
            <Tooltip
              formatter={(value, name) => [formatCurrency(value as number), name as string]}
              contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
            />
            <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: '11px', color: '#6b7280' }}>{v}</span>} />
            <Bar dataKey="income" name="Income" fill="#16a34a" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" name="Expenses" fill="#f87171" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
