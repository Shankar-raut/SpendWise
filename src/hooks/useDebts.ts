import { useApi } from './useApi';
import { spendwiseApi } from '../api/spendwise';
import type { Debt, DebtPayload, Repayment } from '../types';

export function useDebts() {
  const { data: debts, isLoading, error, execute: refetch } = useApi(
    () => spendwiseApi.debts.list(),
    { immediate: true }
  );

  const createDebt = async (debt: DebtPayload) => {
    const newDebt = await spendwiseApi.debts.create(debt);
    await refetch();
    return newDebt;
  };

  const updateDebt = async (id: number, debt: DebtPayload) => {
    await spendwiseApi.debts.update(id, debt);
    await refetch();
  };

  const deleteDebt = async (id: number) => {
    await spendwiseApi.debts.delete(id);
    await refetch();
  };

  const getRepayments = async (debtId: number) => {
    return spendwiseApi.debts.repayments.list(debtId);
  };

  const addRepayment = async (
    debtId: number,
    repayment: { amount: number; date: string; notes: string }
  ) => {
    await spendwiseApi.debts.repayments.create(debtId, repayment);
    await refetch();
  };

  const deleteRepayment = async (id: number) => {
    await spendwiseApi.debts.repayments.delete(id);
    await refetch();
  };

  return {
    debts: debts ?? [],
    isLoading,
    error,
    refetch,
    createDebt,
    updateDebt,
    deleteDebt,
    getRepayments,
    addRepayment,
    deleteRepayment
  };
}