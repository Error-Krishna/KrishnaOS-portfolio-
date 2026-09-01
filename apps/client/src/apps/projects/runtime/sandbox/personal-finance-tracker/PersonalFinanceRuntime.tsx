import type { FormEvent } from 'react';
import type { Project } from '@krishnaos/shared-types';
import { useState } from 'react';
import { usePersonalFinanceRuntime } from './usePersonalFinanceRuntime';

interface PersonalFinanceRuntimeProps {
  project: Project;
}

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export function PersonalFinanceRuntime({
  project,
}: PersonalFinanceRuntimeProps) {
  const {
    transactions,
    stats,
    spendingTrends,
    message,
    addIncome,
    addExpense,
    setBudget,
    reset,
  } = usePersonalFinanceRuntime();

  const [incomeSource, setIncomeSource] = useState('');
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeDate, setIncomeDate] = useState(
    new Date().toISOString().slice(0, 10),
  );

  const [expenseCategory, setExpenseCategory] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [expenseDescription, setExpenseDescription] = useState('');

  const [budgetInput, setBudgetInput] = useState(
    stats.monthlyBudget?.toString() ?? '',
  );

  const handleIncomeSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    addIncome({
      source: incomeSource,
      amount: Number(incomeAmount),
      date: incomeDate,
    });

    setIncomeSource('');
    setIncomeAmount('');
  };

  const handleExpenseSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    addExpense({
      category: expenseCategory,
      amount: Number(expenseAmount),
      date: expenseDate,
      description: expenseDescription,
    });

    setExpenseCategory('');
    setExpenseAmount('');
    setExpenseDescription('');
  };

  const handleBudgetSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setBudget(Number(budgetInput));
  };

  const maxTrend = Math.max(
    ...spendingTrends.map((item) => item.amount),
    1,
  );

  return (
    <div className="flex min-h-[560px] flex-col gap-os-4">
      <header className="flex flex-col gap-os-2">
        <div className="flex flex-wrap items-center justify-between gap-os-3">
          <div>
            <p className="text-os-caption font-medium text-[color:var(--color-os-accent)]">
              Personal Finance Runtime
            </p>
            <h2 className="text-os-title font-semibold text-[color:var(--color-os-text-primary)]">
              {project.title}
            </h2>
          </div>

          <span className="rounded-os-full border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] px-os-3 py-os-1.5 text-os-caption text-[color:var(--color-os-text-secondary)]">
            Sandbox simulation
          </span>
        </div>

        <p className="max-w-3xl text-os-caption text-[color:var(--color-os-text-secondary)]">
          Explore income, expenses, budgets, balances, and spending trends
          using isolated demo data. Nothing is sent to the original MongoDB
          backend.
        </p>
      </header>

      {message && (
        <div
          className={`rounded-os-md border px-os-3 py-os-2 text-os-caption ${
            message.type === 'error'
              ? 'border-red-500/30 bg-red-500/10 text-red-400'
              : message.type === 'success'
                ? 'border-green-500/30 bg-green-500/10 text-green-400'
                : 'border-[color:var(--color-os-accent)]/30 bg-[color:var(--color-os-accent)]/10 text-[color:var(--color-os-accent)]'
          }`}
          role="status"
        >
          {message.text}
        </div>
      )}

      <section className="grid grid-cols-2 gap-os-2 md:grid-cols-4">
        {[
          ['Total Income', stats.totalIncome],
          ['Total Expenses', stats.totalExpenses],
          ['Available Balance', stats.availableBalance],
          ['Remaining Budget', stats.remainingBudget],
        ].map(([label, value]) => (
          <div
            key={label as string}
            className="rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] p-os-4"
          >
            <p className="text-os-caption text-[color:var(--color-os-text-tertiary)]">
              {label as string}
            </p>
            <p className="mt-1 text-os-title font-semibold text-[color:var(--color-os-text-primary)]">
              {currency.format(value as number)}
            </p>
          </div>
        ))}
      </section>

      {stats.overBudget > 0 && (
        <div className="rounded-os-md border border-red-500/30 bg-red-500/10 px-os-4 py-os-3 text-os-caption text-red-400">
          Over budget by {currency.format(stats.overBudget)}
        </div>
      )}

      <section className="grid gap-os-4 lg:grid-cols-2">
        <form
          onSubmit={handleIncomeSubmit}
          className="rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] p-os-4"
        >
          <div className="mb-os-3">
            <p className="text-os-caption font-semibold">
              Add Income
            </p>
            <p className="text-os-caption text-[color:var(--color-os-text-tertiary)]">
              Record a new income source.
            </p>
          </div>

          <div className="grid gap-os-3">
            <input
              value={incomeSource}
              onChange={(event) => setIncomeSource(event.target.value)}
              placeholder="Source — salary, freelance..."
              className="rounded-os-md border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-surface)] px-os-3 py-os-2 text-os-caption outline-none focus:border-[color:var(--color-os-accent)]"
            />

            <div className="grid grid-cols-2 gap-os-2">
              <input
                type="number"
                min="0"
                step="0.01"
                value={incomeAmount}
                onChange={(event) => setIncomeAmount(event.target.value)}
                placeholder="Amount"
                className="rounded-os-md border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-surface)] px-os-3 py-os-2 text-os-caption outline-none focus:border-[color:var(--color-os-accent)]"
              />

              <input
                type="date"
                value={incomeDate}
                onChange={(event) => setIncomeDate(event.target.value)}
                className="rounded-os-md border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-surface)] px-os-3 py-os-2 text-os-caption outline-none focus:border-[color:var(--color-os-accent)]"
              />
            </div>

            <button
              type="submit"
              className="rounded-os-md bg-[color:var(--color-os-accent)] px-os-4 py-os-2 text-os-caption font-semibold text-white"
            >
              + Add Income
            </button>
          </div>
        </form>

        <form
          onSubmit={handleExpenseSubmit}
          className="rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] p-os-4"
        >
          <div className="mb-os-3">
            <p className="text-os-caption font-semibold">
              Add Expense
            </p>
            <p className="text-os-caption text-[color:var(--color-os-text-tertiary)]">
              Record a new expense.
            </p>
          </div>

          <div className="grid gap-os-3">
            <input
              value={expenseCategory}
              onChange={(event) => setExpenseCategory(event.target.value)}
              placeholder="Category — food, transport..."
              className="rounded-os-md border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-surface)] px-os-3 py-os-2 text-os-caption outline-none focus:border-[color:var(--color-os-accent)]"
            />

            <div className="grid grid-cols-2 gap-os-2">
              <input
                type="number"
                min="0"
                step="0.01"
                value={expenseAmount}
                onChange={(event) => setExpenseAmount(event.target.value)}
                placeholder="Amount"
                className="rounded-os-md border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-surface)] px-os-3 py-os-2 text-os-caption outline-none focus:border-[color:var(--color-os-accent)]"
              />

              <input
                type="date"
                value={expenseDate}
                onChange={(event) => setExpenseDate(event.target.value)}
                className="rounded-os-md border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-surface)] px-os-3 py-os-2 text-os-caption outline-none focus:border-[color:var(--color-os-accent)]"
              />
            </div>

            <input
              value={expenseDescription}
              onChange={(event) =>
                setExpenseDescription(event.target.value)
              }
              placeholder="Description (optional)"
              className="rounded-os-md border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-surface)] px-os-3 py-os-2 text-os-caption outline-none focus:border-[color:var(--color-os-accent)]"
            />

            <button
              type="submit"
              className="rounded-os-md bg-[color:var(--color-os-accent)] px-os-4 py-os-2 text-os-caption font-semibold text-white"
            >
              + Add Expense
            </button>
          </div>
        </form>
      </section>

      <section className="grid gap-os-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] p-os-4">
          <div className="mb-os-4">
            <p className="text-os-caption font-semibold">
              Spending Trends
            </p>
            <p className="text-os-caption text-[color:var(--color-os-text-tertiary)]">
              Expenses grouped by category.
            </p>
          </div>

          <div className="flex flex-col gap-os-3">
            {spendingTrends.length === 0 ? (
              <p className="text-os-caption text-[color:var(--color-os-text-tertiary)]">
                No spending data yet.
              </p>
            ) : (
              spendingTrends.map((trend) => (
                <div key={trend.category}>
                  <div className="mb-1 flex items-center justify-between gap-3 text-os-caption">
                    <span>{trend.category}</span>
                    <span className="text-[color:var(--color-os-text-tertiary)]">
                      {currency.format(trend.amount)}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-[color:var(--color-os-surface)]">
                    <div
                      className="h-full rounded-full bg-[color:var(--color-os-accent)] transition-all"
                      style={{
                        width: `${(trend.amount / maxTrend) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <form
          onSubmit={handleBudgetSubmit}
          className="rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] p-os-4"
        >
          <p className="text-os-caption font-semibold">
            Monthly Budget
          </p>

          <p className="mt-1 text-os-caption text-[color:var(--color-os-text-tertiary)]">
            {stats.monthlyBudget === null
              ? 'No budget configured.'
              : `Current: ${currency.format(stats.monthlyBudget)}`}
          </p>

          <input
            type="number"
            min="0"
            step="0.01"
            value={budgetInput}
            onChange={(event) => setBudgetInput(event.target.value)}
            placeholder="Enter budget"
            className="mt-os-3 w-full rounded-os-md border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-surface)] px-os-3 py-os-2 text-os-caption outline-none focus:border-[color:var(--color-os-accent)]"
          />

          <button
            type="submit"
            className="mt-os-2 w-full rounded-os-md border border-[color:var(--color-os-glass-border)] px-os-4 py-os-2 text-os-caption font-semibold hover:bg-[color:var(--color-os-glass-highlight)]"
          >
            Set Budget
          </button>

          <button
            type="button"
            onClick={reset}
            className="mt-2 w-full rounded-os-md px-os-4 py-os-2 text-os-caption text-[color:var(--color-os-text-tertiary)] hover:bg-[color:var(--color-os-glass-highlight)]"
          >
            Restore Demo Data
          </button>
        </form>
      </section>

      <section className="min-h-0 overflow-hidden rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)]">
        <div className="border-b border-[color:var(--color-os-glass-border)] px-os-4 py-os-3">
          <p className="text-os-caption font-semibold">
            Recent Transactions
          </p>
          <p className="text-os-caption text-[color:var(--color-os-text-tertiary)]">
            {transactions.length} transactions in this sandbox.
          </p>
        </div>

        <div className="max-h-[320px] overflow-auto">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between gap-os-3 border-b border-[color:var(--color-os-glass-border)] px-os-4 py-os-3 last:border-b-0"
            >
              <div className="min-w-0">
                <p className="truncate text-os-caption font-medium">
                  {transaction.type === 'income'
                    ? transaction.source
                    : transaction.category}
                </p>
                <p className="truncate text-os-caption text-[color:var(--color-os-text-tertiary)]">
                  {transaction.date}
                  {transaction.description
                    ? ` · ${transaction.description}`
                    : ''}
                </p>
              </div>

              <span
                className={`shrink-0 text-os-caption font-semibold ${
                  transaction.type === 'income'
                    ? 'text-green-400'
                    : 'text-red-400'
                }`}
              >
                {transaction.type === 'income' ? '+' : '-'}
                {currency.format(transaction.amount)}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
