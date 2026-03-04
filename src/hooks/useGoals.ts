'use client';

import { useLocalStorage } from './useLocalStorage';
import { Goal, GoalType } from '@/types';
import { generateId } from '@/lib/utils';

const SEED_GOALS: Goal[] = [
  {
    id: '1',
    name: 'Emergency Fund',
    type: 'emergency_fund',
    targetAmount: 10000,
    currentAmount: 3500,
    color: '#16a34a',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Vacation to Japan',
    type: 'vacation',
    targetAmount: 5000,
    currentAmount: 1200,
    targetDate: '2025-12-01',
    color: '#3b82f6',
    createdAt: new Date().toISOString(),
  },
];

export function useGoals() {
  const [goals, setGoals, initialized] = useLocalStorage<Goal[]>('finwise_goals', SEED_GOALS);

  function addGoal(data: Omit<Goal, 'id' | 'createdAt'>) {
    const goal: Goal = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setGoals((prev) => [...prev, goal]);
    return goal;
  }

  function updateGoal(id: string, data: Partial<Omit<Goal, 'id' | 'createdAt'>>) {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...data } : g)));
  }

  function deleteGoal(id: string) {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }

  return { goals, initialized, addGoal, updateGoal, deleteGoal };
}
