import type { AuthSession, Debt, DebtPayload, Expense, ExpensePayload, Friend, Repayment, Summary, User } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:4000/api';

type ApiEnvelope<T> = { data: T };

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('spendwise_token');
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ error: 'Request failed.' }));
    throw new Error(payload.error || 'Request failed.');
  }

  if (response.status === 204) return undefined as T;
  const payload = (await response.json()) as ApiEnvelope<T>;
  return payload.data;
}

export const spendwiseApi = {
  login: (credentials: { email: string; password: string }) =>
    api<AuthSession>('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  me: () => api<User>('/auth/me'),
  summary: () => api<Summary>('/summary'),
  expenses: (query = '') => api<Expense[]>(`/expenses${query}`),
  categories: () => api<string[]>('/expenses/categories'),
  createExpense: (expense: ExpensePayload) =>
    api<Expense>('/expenses', { method: 'POST', body: JSON.stringify(expense) }),
  updateExpense: (id: number, expense: ExpensePayload) =>
    api<Expense>(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify(expense) }),
  deleteExpense: (id: number) => api<void>(`/expenses/${id}`, { method: 'DELETE' }),
  friends: () => api<Friend[]>('/friends'),
  createFriend: (friend: { name: string; email: string }) =>
    api<Friend>('/friends', { method: 'POST', body: JSON.stringify(friend) }),
  deleteFriend: (id: number) => api<void>(`/friends/${id}`, { method: 'DELETE' }),
  debts: () => api<Debt[]>('/debts'),
  createDebt: (debt: DebtPayload) =>
    api<Debt>('/debts', { method: 'POST', body: JSON.stringify(debt) }),
  updateDebt: (id: number, debt: DebtPayload) =>
    api<Debt>(`/debts/${id}`, { method: 'PUT', body: JSON.stringify(debt) }),
  deleteDebt: (id: number) => api<void>(`/debts/${id}`, { method: 'DELETE' }),
  addRepayment: (debtId: number, repayment: { amount: number; date: string; notes: string }) =>
    api<Repayment>(`/debts/${debtId}/repayments`, { method: 'POST', body: JSON.stringify(repayment) }),
  getRepayments: (debtId: number) => api<Repayment[]>(`/debts/${debtId}/repayments`),
  deleteRepayment: (id: number) => api<void>(`/debts/repayments/${id}`, { method: 'DELETE' })
};
