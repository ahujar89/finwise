'use client';

import { useLocalStorage } from './useLocalStorage';
import { Transaction } from '@/types';
import { generateId, today } from '@/lib/utils';

const SEED_TRANSACTIONS: Transaction[] = [
  { id: '1', date: '2025-02-01', description: 'Direct Deposit - Payroll', amount: 4200, type: 'income', category: 'income', source: 'manual', createdAt: new Date().toISOString() },
  { id: '2', date: '2025-02-03', description: 'Rent Payment', amount: 1500, type: 'expense', category: 'housing', source: 'manual', createdAt: new Date().toISOString() },
  { id: '3', date: '2025-02-05', description: 'Whole Foods Market', amount: 120.50, type: 'expense', category: 'food', source: 'manual', createdAt: new Date().toISOString() },
  { id: '4', date: '2025-02-07', description: 'Netflix Subscription', amount: 15.99, type: 'expense', category: 'subscriptions', source: 'manual', createdAt: new Date().toISOString() },
  { id: '5', date: '2025-02-08', description: 'Uber Ride', amount: 22.00, type: 'expense', category: 'transport', source: 'manual', createdAt: new Date().toISOString() },
  { id: '6', date: '2025-02-10', description: 'Starbucks', amount: 6.50, type: 'expense', category: 'food', source: 'manual', createdAt: new Date().toISOString() },
  { id: '7', date: '2025-02-12', description: 'Electric Bill', amount: 85.00, type: 'expense', category: 'utilities', source: 'manual', createdAt: new Date().toISOString() },
  { id: '8', date: '2025-02-14', description: 'Amazon Shopping', amount: 67.20, type: 'expense', category: 'shopping', source: 'manual', createdAt: new Date().toISOString() },
  { id: '9', date: '2025-02-15', description: 'Direct Deposit - Payroll', amount: 4200, type: 'income', category: 'income', source: 'manual', createdAt: new Date().toISOString() },
  { id: '10', date: '2025-02-18', description: 'Chipotle', amount: 14.75, type: 'expense', category: 'food', source: 'manual', createdAt: new Date().toISOString() },
  { id: '11', date: '2025-02-20', description: 'Spotify Premium', amount: 9.99, type: 'expense', category: 'subscriptions', source: 'manual', createdAt: new Date().toISOString() },
  { id: '12', date: '2025-02-22', description: 'Doctor Copay', amount: 40.00, type: 'expense', category: 'healthcare', source: 'manual', createdAt: new Date().toISOString() },
  { id: '13', date: '2025-02-25', description: 'Gas Station', amount: 55.00, type: 'expense', category: 'transport', source: 'manual', createdAt: new Date().toISOString() },
  { id: '14', date: '2025-02-27', description: 'Target', amount: 89.35, type: 'expense', category: 'shopping', source: 'manual', createdAt: new Date().toISOString() },
  { id: '15', date: '2025-03-01', description: 'Direct Deposit - Payroll', amount: 4200, type: 'income', category: 'income', source: 'manual', createdAt: new Date().toISOString() },
  { id: '16', date: '2025-03-02', description: 'Rent Payment', amount: 1500, type: 'expense', category: 'housing', source: 'manual', createdAt: new Date().toISOString() },
  { id: '17', date: '2025-03-05', description: 'Trader Joes', amount: 95.40, type: 'expense', category: 'food', source: 'manual', createdAt: new Date().toISOString() },
  { id: '18', date: '2025-03-07', description: 'Gym Membership', amount: 45.00, type: 'expense', category: 'subscriptions', source: 'manual', createdAt: new Date().toISOString() },
  { id: '19', date: '2025-03-10', description: 'Internet Bill', amount: 75.00, type: 'expense', category: 'utilities', source: 'manual', createdAt: new Date().toISOString() },
  { id: '20', date: '2025-03-12', description: 'DoorDash', amount: 38.50, type: 'expense', category: 'food', source: 'manual', createdAt: new Date().toISOString() },
];

export function useTransactions() {
  const [transactions, setTransactions, initialized] = useLocalStorage<Transaction[]>(
    'finwise_transactions',
    SEED_TRANSACTIONS
  );

  function addTransaction(data: Omit<Transaction, 'id' | 'createdAt'>) {
    const tx: Transaction = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [tx, ...prev]);
    return tx;
  }

  function addTransactions(data: Omit<Transaction, 'id' | 'createdAt'>[]) {
    const txs: Transaction[] = data.map((d) => ({
      ...d,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }));
    setTransactions((prev) => [...txs, ...prev]);
    return txs;
  }

  function updateTransaction(id: string, data: Partial<Omit<Transaction, 'id' | 'createdAt'>>) {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === id ? { ...tx, ...data } : tx))
    );
  }

  function deleteTransaction(id: string) {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  }

  function clearAll() {
    setTransactions([]);
  }

  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));

  return {
    transactions: sorted,
    rawTransactions: transactions,
    initialized,
    addTransaction,
    addTransactions,
    updateTransaction,
    deleteTransaction,
    clearAll,
  };
}
