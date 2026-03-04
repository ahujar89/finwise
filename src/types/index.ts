export type CategoryId =
  | 'housing'
  | 'food'
  | 'transport'
  | 'entertainment'
  | 'healthcare'
  | 'shopping'
  | 'utilities'
  | 'education'
  | 'travel'
  | 'subscriptions'
  | 'income'
  | 'savings'
  | 'other';

export type GoalType =
  | 'savings'
  | 'debt_payoff'
  | 'emergency_fund'
  | 'vacation'
  | 'home'
  | 'retirement'
  | 'other';

export interface Transaction {
  id: string;
  date: string; // "YYYY-MM-DD"
  description: string;
  amount: number; // always positive
  type: 'income' | 'expense';
  category: CategoryId;
  source: 'manual' | 'csv';
  createdAt: string;
}

export interface Goal {
  id: string;
  name: string;
  type: GoalType;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  color: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export interface Insight {
  id: string;
  type: 'spike' | 'savings' | 'subscription' | 'positive' | 'warning';
  title: string;
  description: string;
  value?: number;
  category?: CategoryId;
}

export interface MonthlyData {
  month: string; // "Jan", "Feb", etc.
  income: number;
  expenses: number;
}

export interface CategorySpend {
  category: CategoryId;
  label: string;
  amount: number;
  color: string;
  percentage: number;
}
