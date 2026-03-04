'use client';

import { useState } from 'react';
import { useGoals } from '@/hooks/useGoals';
import { Goal, GoalType } from '@/types';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency, generateId } from '@/lib/utils';
import { Plus, Trash2, Pencil, Target } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const GOAL_TYPES: { value: GoalType; label: string; icon: string }[] = [
  { value: 'savings', label: 'General Savings', icon: '💰' },
  { value: 'emergency_fund', label: 'Emergency Fund', icon: '🛡️' },
  { value: 'debt_payoff', label: 'Debt Payoff', icon: '📉' },
  { value: 'vacation', label: 'Vacation', icon: '✈️' },
  { value: 'home', label: 'Home Purchase', icon: '🏠' },
  { value: 'retirement', label: 'Retirement', icon: '🏖️' },
  { value: 'other', label: 'Other', icon: '🎯' },
];

const GOAL_COLORS = ['#16a34a', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316'];

const DEFAULT_FORM = {
  name: '',
  type: 'savings' as GoalType,
  targetAmount: '',
  currentAmount: '',
  targetDate: '',
  color: GOAL_COLORS[0],
};

function GoalCard({ goal, onEdit, onDelete }: { goal: Goal; onEdit: (g: Goal) => void; onDelete: (id: string) => void }) {
  const pct = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  const remaining = goal.targetAmount - goal.currentAmount;
  const typeInfo = GOAL_TYPES.find((t) => t.value === goal.type);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl" style={{ backgroundColor: goal.color + '20' }}>
            {typeInfo?.icon ?? '🎯'}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{goal.name}</h3>
            <p className="text-xs text-muted-foreground">{typeInfo?.label}</p>
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={() => onEdit(goal)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDelete(goal.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-gray-900">{formatCurrency(goal.currentAmount)}</span>
          <span className="text-muted-foreground">{formatCurrency(goal.targetAmount)}</span>
        </div>
        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, backgroundColor: goal.color }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{pct.toFixed(0)}% complete</span>
          <span>{remaining > 0 ? `${formatCurrency(remaining)} to go` : '🎉 Goal reached!'}</span>
        </div>
      </div>

      {goal.targetDate && (
        <p className="text-xs text-muted-foreground">Target: {new Date(goal.targetDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
      )}
    </div>
  );
}

export default function GoalsPage() {
  const { goals, initialized, addGoal, updateGoal, deleteGoal } = useGoals();
  const [showModal, setShowModal] = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);

  function openAdd() {
    setEditGoal(null);
    setForm(DEFAULT_FORM);
    setShowModal(true);
  }

  function openEdit(goal: Goal) {
    setEditGoal(goal);
    setForm({
      name: goal.name,
      type: goal.type,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      targetDate: goal.targetDate || '',
      color: goal.color,
    });
    setShowModal(true);
  }

  function handleDelete(id: string) {
    deleteGoal(id);
    toast.success('Goal deleted');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      name: form.name,
      type: form.type,
      targetAmount: parseFloat(form.targetAmount),
      currentAmount: parseFloat(form.currentAmount) || 0,
      targetDate: form.targetDate || undefined,
      color: form.color,
    };
    if (!data.name || isNaN(data.targetAmount) || data.targetAmount <= 0) {
      toast.error('Please fill in required fields');
      return;
    }
    if (editGoal) {
      updateGoal(editGoal.id, data);
      toast.success('Goal updated');
    } else {
      addGoal(data);
      toast.success('Goal created');
    }
    setShowModal(false);
  }

  if (!initialized) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Goals</h1>
          <p className="text-muted-foreground text-sm mt-1">Track your financial milestones</p>
        </div>
        <Button onClick={openAdd} className="gap-2 bg-green-600 hover:bg-green-700 text-white" size="sm">
          <Plus className="w-4 h-4" /> New Goal
        </Button>
      </div>

      {goals.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-20 text-center">
          <Target className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-muted-foreground">No goals yet. Create your first financial goal!</p>
          <Button onClick={openAdd} className="mt-4 gap-2 bg-green-600 hover:bg-green-700 text-white" size="sm">
            <Plus className="w-4 h-4" /> Create Goal
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} onEdit={openEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editGoal ? 'Edit Goal' : 'New Goal'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Goal Name</Label>
              <Input placeholder="e.g. Emergency Fund" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v as GoalType }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {GOAL_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.icon} {t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Target Amount ($)</Label>
                <Input type="number" min="1" step="1" placeholder="10000" value={form.targetAmount} onChange={(e) => setForm((f) => ({ ...f, targetAmount: e.target.value }))} required />
              </div>
              <div className="space-y-1.5">
                <Label>Current Amount ($)</Label>
                <Input type="number" min="0" step="0.01" placeholder="0" value={form.currentAmount} onChange={(e) => setForm((f) => ({ ...f, currentAmount: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Target Date (optional)</Label>
              <Input type="date" value={form.targetDate} onChange={(e) => setForm((f) => ({ ...f, targetDate: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Color</Label>
              <div className="flex gap-2">
                {GOAL_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, color: c }))}
                    className={`w-7 h-7 rounded-full transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                {editGoal ? 'Save Changes' : 'Create Goal'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
