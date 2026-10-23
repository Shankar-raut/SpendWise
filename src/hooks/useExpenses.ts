import { useMemo } from 'react';
import { useApi } from './useApi';
import { spendwiseApi } from '../api/spendwise';
import type { Expense, ExpensePayload } from '../types';

export function useExpenses() {
  const { data: expenses, isLoading, error, execute: refetch } = useApi(
    () => spendwiseApi.expenses.list(),
    { immediate: true }
  );

  const createExpense = async (expense: ExpensePayload) => {
    await spendwiseApi.expenses.create(expense);
    await refetch();
  };

  const updateExpense = async (id: number, expense: ExpensePayload) => {
    await spendwiseApi.expenses.update(id, expense);
    await refetch();
  };

  const deleteExpense = async (id: number) => {
    await spendwiseApi.expenses.delete(id);
    await refetch();
  };

  const categories = useApi(() => spendwiseApi.expenses.categories(), { immediate: true });

  return {
    expenses: expenses ?? [],
    isLoading,
    error,
    refetch,
    createExpense,
    updateExpense,
    deleteExpense,
    categories: categories.data ?? []
  };
}