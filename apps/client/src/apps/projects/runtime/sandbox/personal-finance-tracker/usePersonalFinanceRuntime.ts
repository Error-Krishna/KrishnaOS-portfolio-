import { useCallback, useEffect, useMemo, useState } from 'react';

export type FinanceTransactionType = 'income' | 'expense';

export interface FinanceTransaction {
  id: string;
  type: FinanceTransactionType;
  source?: string;
  category?: string;
  amount: number;
  date: string;
  description?: string;
}

const STORAGE_KEY = 'krishnaos:personal-finance-tracker';

const DEFAULT_TRANSACTIONS: FinanceTransaction[] = [
  {
    id: 'income-1',
    type: 'income',
    source: 'Internship',
    amount: 45000,
    date: '2026-08-01',
    description: 'Monthly income',
  },
  {
    id: 'income-2',
    type: 'income',
    source: 'Freelance',
    amount: 12000,
    date: '2026-08-08',
    description: 'Frontend project',
  },
  {
    id: 'expense-1',
    type: 'expense',
    category: 'Food',
    amount: 4200,
    date: '2026-08-03',
    description: 'Groceries and meals',
  },
  {
    id: 'expense-2',
    type: 'expense',
    category: 'Transport',
    amount: 1800,
    date: '2026-08-06',
    description: 'Metro and cabs',
  },
  {
    id: 'expense-3',
    type: 'expense',
    category: 'Entertainment',
    amount: 2400,
    date: '2026-08-12',
    description: 'Movies and subscriptions',
  },
  {
    id: 'expense-4',
    type: 'expense',
    category: 'Shopping',
    amount: 5600,
    date: '2026-08-15',
    description: 'Personal purchases',
  },
];

interface PersistedFinanceState {
  transactions: FinanceTransaction[];
  budget: number | null;
}

interface FinanceStats {
  totalIncome: number;
  totalExpenses: number;
  availableBalance: number;
  monthlyBudget: number | null;
  remainingBudget: number;
  overBudget: number;
}

function loadState(): PersistedFinanceState {
  if (typeof window === 'undefined') {
    return {
      transactions: DEFAULT_TRANSACTIONS,
      budget: 30000,
    };
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return {
        transactions: DEFAULT_TRANSACTIONS,
        budget: 30000,
      };
    }

    const parsed = JSON.parse(stored) as PersistedFinanceState;

    if (
      !Array.isArray(parsed.transactions) ||
      (parsed.budget !== null && typeof parsed.budget !== 'number')
    ) {
      throw new Error('Invalid persisted finance state');
    }

    return parsed;
  } catch {
    return {
      transactions: DEFAULT_TRANSACTIONS,
      budget: 30000,
    };
  }
}

export function usePersonalFinanceRuntime() {
  const [state, setState] = useState<PersistedFinanceState>(loadState);

  const [message, setMessage] = useState<{
    text: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (!message) {
      return;
    }

    const timer = window.setTimeout(() => {
      setMessage(null);
    }, 3000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [message]);

  const stats = useMemo<FinanceStats>(() => {
    const totalIncome = state.transactions
      .filter((transaction) => transaction.type === 'income')
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    const totalExpenses = state.transactions
      .filter((transaction) => transaction.type === 'expense')
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    const remainingBudget =
      state.budget === null
        ? 0
        : Math.max(0, state.budget - totalExpenses);

    const overBudget =
      state.budget === null
        ? 0
        : Math.max(0, totalExpenses - state.budget);

    return {
      totalIncome,
      totalExpenses,
      availableBalance: totalIncome - totalExpenses,
      monthlyBudget: state.budget,
      remainingBudget,
      overBudget,
    };
  }, [state]);

  const spendingTrends = useMemo(() => {
    const totals = new Map<string, number>();

    state.transactions
      .filter((transaction) => transaction.type === 'expense')
      .forEach((transaction) => {
        const category = transaction.category || 'Other';

        totals.set(
          category,
          (totals.get(category) || 0) + transaction.amount,
        );
      });

    return Array.from(totals.entries())
      .map(([category, amount]) => ({
        category,
        amount,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [state.transactions]);

  const addIncome = useCallback(
    (input: {
      source: string;
      amount: number;
      date: string;
    }) => {
      if (!input.source.trim()) {
        setMessage({
          text: 'Income source is required.',
          type: 'error',
        });
        return;
      }

      if (!Number.isFinite(input.amount) || input.amount <= 0) {
        setMessage({
          text: 'Income amount must be positive.',
          type: 'error',
        });
        return;
      }

      const transaction: FinanceTransaction = {
        id: `income-${Date.now()}`,
        type: 'income',
        source: input.source.trim(),
        amount: input.amount,
        date: input.date,
      };

      setState((current) => ({
        ...current,
        transactions: [transaction, ...current.transactions],
      }));

      setMessage({
        text: 'Income added successfully.',
        type: 'success',
      });
    },
    [],
  );

  const addExpense = useCallback(
    (input: {
      category: string;
      amount: number;
      date: string;
      description: string;
    }) => {
      if (!input.category.trim()) {
        setMessage({
          text: 'Expense category is required.',
          type: 'error',
        });
        return;
      }

      if (!Number.isFinite(input.amount) || input.amount <= 0) {
        setMessage({
          text: 'Expense amount must be positive.',
          type: 'error',
        });
        return;
      }

      const transaction: FinanceTransaction = {
        id: `expense-${Date.now()}`,
        type: 'expense',
        category: input.category.trim(),
        amount: input.amount,
        date: input.date,
        description: input.description.trim(),
      };

      setState((current) => ({
        ...current,
        transactions: [transaction, ...current.transactions],
      }));

      setMessage({
        text: 'Expense added successfully.',
        type: 'success',
      });
    },
    [],
  );

  const setBudget = useCallback((budget: number) => {
    if (!Number.isFinite(budget) || budget < 0) {
      setMessage({
        text: 'Budget must be zero or greater.',
        type: 'error',
      });
      return;
    }

    setState((current) => ({
      ...current,
      budget,
    }));

    setMessage({
      text: 'Monthly budget updated.',
      type: 'success',
    });
  }, []);

  const reset = useCallback(() => {
    setState({
      transactions: DEFAULT_TRANSACTIONS,
      budget: 30000,
    });

    setMessage({
      text: 'Demo data restored.',
      type: 'info',
    });
  }, []);

  return {
    transactions: state.transactions,
    stats,
    spendingTrends,
    message,
    addIncome,
    addExpense,
    setBudget,
    reset,
  };
}
