import type {
  AuthSession,
  Debt,
  DebtPayload,
  Expense,
  ExpensePayload,
  Friend,
  Repayment,
  Summary,
  User
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:4000/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ApiEnvelope<T> {
  data: T;
  error?: string;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('spendwise_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ error: 'Request failed.' }));
    throw new ApiError(payload.error || 'Request failed.', response.status);
  }

  if (response.status === 204) return undefined as T;
  const payload = (await response.json()) as ApiEnvelope<T>;
  return payload.data;
}

export const spendwiseApi = {
  auth: {
    login: (credentials: { email: string; password: string }) =>
      request<AuthSession>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      }),
    me: () => request<User>('/auth/me')
  },
  summary: () => request<Summary>('/summary'),
  expenses: {
    list: (query?: string) => request<Expense[]>(`/expenses${query ? `?${query}` : ''}`),
    categories: () => request<string[]>('/expenses/categories'),
    create: (expense: ExpensePayload) =>
      request<Expense>('/expenses', { method: 'POST', body: JSON.stringify(expense) }),
    update: (id: number, expense: ExpensePayload) =>
      request<Expense>(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify(expense) }),
    delete: (id: number) => request<void>(`/expenses/${id}`, { method: 'DELETE' })
  },
  friends: {
    list: () => request<Friend[]>('/friends'),
    create: (friend: { name: string; email: string }) =>
      request<Friend>('/friends', { method: 'POST', body: JSON.stringify(friend) }),
    delete: (id: number) => request<void>(`/friends/${id}`, { method: 'DELETE' })
  },
  debts: {
    list: () => request<Debt[]>('/debts'),
    create: (debt: DebtPayload) =>
      request<Debt>('/debts', { method: 'POST', body: JSON.stringify(debt) }),
    update: (id: number, debt: DebtPayload) =>
      request<Debt>(`/debts/${id}`, { method: 'PUT', body: JSON.stringify(debt) }),
    delete: (id: number) => request<void>(`/debts/${id}`, { method: 'DELETE' }),
    repayments: {
      list: (debtId: number) => request<Repayment[]>(`/debts/${debtId}/repayments`),
      create: (debtId: number, repayment: { amount: number; date: string; notes: string }) =>
        request<Repayment>(`/debts/${debtId}/repayments`, {
          method: 'POST',
          body: JSON.stringify(repayment)
        }),
      delete: (id: number) => request<void>(`/debts/repayments/${id}`, { method: 'DELETE' })
    }
  }
};