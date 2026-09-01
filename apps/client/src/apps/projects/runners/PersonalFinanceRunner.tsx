import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { PlusGlyph, TrashGlyph } from '@/os/icons';
import { RunnerLoadingSkeleton } from '../ProjectRunnerShell';

interface Expense {
  id: number;
  description: string;
  category: string;
  amount: number;
}

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Others'];
const CATEGORY_COLORS: Record<string, string> = {
  Food: '#facc15',
  Transport: '#38bdf8',
  Shopping: '#a78bfa',
  Bills: '#f87171',
  Others: '#4ade80',
};

const SEED_EXPENSES: Expense[] = [
  { id: 1, description: 'Groceries', category: 'Food', amount: 1450 },
  { id: 2, description: 'Metro card top-up', category: 'Transport', amount: 500 },
  { id: 3, description: 'New headphones', category: 'Shopping', amount: 2200 },
  { id: 4, description: 'Electricity bill', category: 'Bills', amount: 1800 },
];

let idSeq = SEED_EXPENSES.length + 1;

/**
 * Personal Finance Tracker's live demo: an actually-working expense
 * ledger, not a static illustration of one. Adding an expense (with
 * real validation) recomputes the balance and the category breakdown
 * bars live; deleting one does too. This is the fullest "genuinely
 * interactive" runner since the real project *is* exactly this kind of
 * form-driven CRUD app.
 */
export function PersonalFinanceRunner() {
  const [loading, setLoading] = useState(true);
  const [income, setIncome] = useState(54600);
  const [expenses, setExpenses] = useState<Expense[]>(SEED_EXPENSES);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const balance = income - totalExpenses;

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of expenses) map.set(e.category, (map.get(e.category) ?? 0) + e.amount);
    return CATEGORIES.map((c) => ({ category: c, amount: map.get(c) ?? 0 })).filter((c) => c.amount > 0);
  }, [expenses]);

  function addExpense(e: FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (!description.trim()) {
      setError('Add a description for this expense.');
      return;
    }
    if (!value || value <= 0) {
      setError('Enter an amount greater than 0.');
      return;
    }
    setExpenses((prev) => [{ id: idSeq++, description: description.trim(), category, amount: value }, ...prev]);
    setDescription('');
    setAmount('');
    setError(null);
  }

  function removeExpense(id: number) {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }

  if (loading) return <RunnerLoadingSkeleton label="Loading your ledger…" />;

  return (
    <div className="flex flex-col gap-os-4">
      <div className="grid grid-cols-1 gap-os-3 sm:grid-cols-3">
        <div className="rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] p-os-4">
          <label className="text-os-caption text-[color:var(--color-os-text-tertiary)]" htmlFor="finance-income">
            Monthly income
          </label>
          <div className="flex items-center gap-os-1">
            <span className="text-os-body text-[color:var(--color-os-text-secondary)]">₹</span>
            <input
              id="finance-income"
              type="number"
              value={income}
              onChange={(e) => setIncome(Number(e.target.value) || 0)}
              className="w-full bg-transparent text-os-title font-bold text-[#4ade80] outline-none"
            />
          </div>
        </div>
        <div className="rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] p-os-4">
          <p className="text-os-caption text-[color:var(--color-os-text-tertiary)]">Expenses</p>
          <p className="text-os-title font-bold text-[#f87171]">₹{totalExpenses.toLocaleString('en-IN')}</p>
        </div>
        <div className="rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] p-os-4">
          <p className="text-os-caption text-[color:var(--color-os-text-tertiary)]">Balance</p>
          <p className={`text-os-title font-bold ${balance >= 0 ? 'text-[#38bdf8]' : 'text-[#f87171]'}`}>
            ₹{balance.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      <form
        onSubmit={addExpense}
        className="flex flex-wrap items-end gap-os-2 rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] p-os-4"
      >
        <label className="flex min-w-[140px] flex-1 flex-col gap-os-1 text-os-caption text-[color:var(--color-os-text-tertiary)]">
          Description
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Movie tickets"
            className="rounded-os-sm border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-surface-elevated)] px-os-2 py-1 text-os-caption text-[color:var(--color-os-text-primary)]"
          />
        </label>
        <label className="flex flex-col gap-os-1 text-os-caption text-[color:var(--color-os-text-tertiary)]">
          Category
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-os-sm border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-surface-elevated)] px-os-2 py-1 text-os-caption text-[color:var(--color-os-text-primary)]"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="flex w-28 flex-col gap-os-1 text-os-caption text-[color:var(--color-os-text-tertiary)]">
          Amount
          <input
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="₹0"
            className="rounded-os-sm border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-surface-elevated)] px-os-2 py-1 text-os-caption text-[color:var(--color-os-text-primary)]"
          />
        </label>
        <button
          type="submit"
          className="flex items-center gap-os-2 rounded-os-full bg-[color:var(--color-os-accent)] px-os-4 py-os-2 text-os-caption font-medium text-white transition-opacity hover:opacity-90"
        >
          <PlusGlyph className="h-3.5 w-3.5" />
          Add expense
        </button>
      </form>
      {error && <p className="text-os-caption text-[#f87171]">{error}</p>}

      <div className="grid grid-cols-1 gap-os-4 lg:grid-cols-[1fr_260px]">
        <div className="flex flex-col gap-os-2 rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] p-os-4">
          <p className="text-os-caption font-semibold text-[color:var(--color-os-text-primary)]">Recent expenses</p>
          {expenses.length === 0 ? (
            <p className="py-os-4 text-center text-os-caption text-[color:var(--color-os-text-tertiary)]">
              No expenses yet — add your first one above.
            </p>
          ) : (
            expenses.map((e) => (
              <div key={e.id} className="flex items-center justify-between gap-os-2 text-os-caption">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: CATEGORY_COLORS[e.category] }}
                />
                <span className="flex-1 truncate text-[color:var(--color-os-text-secondary)]">{e.description}</span>
                <span className="text-[color:var(--color-os-text-tertiary)]">{e.category}</span>
                <span className="text-[color:var(--color-os-text-primary)]">₹{e.amount.toLocaleString('en-IN')}</span>
                <button
                  type="button"
                  aria-label={`Delete ${e.description}`}
                  onClick={() => removeExpense(e.id)}
                  className="text-[color:var(--color-os-text-tertiary)] hover:text-[#f87171]"
                >
                  <TrashGlyph className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="flex flex-col gap-os-2 rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] p-os-4">
          <p className="text-os-caption font-semibold text-[color:var(--color-os-text-primary)]">
            Spending by category
          </p>
          {byCategory.length === 0 ? (
            <p className="text-os-caption text-[color:var(--color-os-text-tertiary)]">Nothing to show yet.</p>
          ) : (
            byCategory.map((c) => {
              const pct = totalExpenses > 0 ? Math.round((c.amount / totalExpenses) * 100) : 0;
              return (
                <div key={c.category} className="flex flex-col gap-os-1">
                  <div className="flex items-center justify-between text-os-caption text-[color:var(--color-os-text-secondary)]">
                    <span>{c.category}</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-os-full bg-[color:var(--color-os-glass-border)]">
                    <div
                      className="h-full rounded-os-full"
                      style={{ width: `${pct}%`, backgroundColor: CATEGORY_COLORS[c.category] }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
