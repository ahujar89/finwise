'use client';

import { useState, useMemo } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { AddTransactionModal } from '@/components/transactions/AddTransactionModal';
import { CsvUploadModal } from '@/components/transactions/CsvUploadModal';
import { getCategoryMeta, CATEGORIES } from '@/lib/categories';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CategoryId, Transaction } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Upload, Trash2, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function TransactionsPage() {
  const { transactions, initialized, addTransaction, addTransactions, deleteTransaction } = useTransactions();
  const [showAdd, setShowAdd] = useState(false);
  const [showCsv, setShowCsv] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | CategoryId>('all');

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      const matchSearch = !search || tx.description.toLowerCase().includes(search.toLowerCase());
      const matchType = filterType === 'all' || tx.type === filterType;
      const matchCat = filterCategory === 'all' || tx.category === filterCategory;
      return matchSearch && matchType && matchCat;
    });
  }, [transactions, search, filterType, filterCategory]);

  if (!initialized) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12" />
        {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-14" />)}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground text-sm mt-1">{transactions.length} total transactions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowCsv(true)} className="gap-2">
            <Upload className="w-4 h-4" /> Import CSV
          </Button>
          <Button size="sm" onClick={() => setShowAdd(true)} className="gap-2 bg-green-600 hover:bg-green-700 text-white">
            <Plus className="w-4 h-4" /> Add
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search transactions..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filterType} onValueChange={(v) => setFilterType(v as typeof filterType)}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v as typeof filterCategory)}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.icon} {c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground text-sm">
            {transactions.length === 0 ? 'No transactions yet. Add one or import a CSV.' : 'No transactions match your filters.'}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Category</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Source</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((tx) => {
                const meta = getCategoryMeta(tx.category);
                return (
                  <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(tx.date)}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-[250px] truncate">{tx.description}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5">
                        <span className="text-base">{meta.icon}</span>
                        <span className="text-gray-600 text-xs">{meta.label}</span>
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-right font-semibold whitespace-nowrap ${tx.type === 'income' ? 'text-green-600' : 'text-gray-900'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs capitalize">{tx.source}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => { deleteTransaction(tx.id); toast.success('Transaction deleted'); }}
                        className="text-gray-300 hover:text-red-400 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <AddTransactionModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onAdd={(data) => addTransaction({ ...data, source: 'manual' })}
      />
      <CsvUploadModal
        open={showCsv}
        onClose={() => setShowCsv(false)}
        onImport={addTransactions}
      />
    </div>
  );
}
