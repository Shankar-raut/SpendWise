import { useApi } from './useApi';
import { spendwiseApi } from '../api/spendwise';
import type { Summary } from '../types';

export function useSummary() {
  const { data: summary, isLoading, error, execute: refetch } = useApi(
    () => spendwiseApi.summary(),
    { immediate: true }
  );

  return {
    summary: summary ?? {
      totalSpending: 0,
      monthlySpending: 0,
      moneyIOwe: 0,
      moneyOwedToMe: 0
    },
    isLoading,
    error,
    refetch
  };
}