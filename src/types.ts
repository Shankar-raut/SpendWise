export type Summary = {
  totalSpending: number;
  monthlySpending: number;
  moneyIOwe: number;
  moneyOwedToMe: number;
};

export type User = {
  id: number;
  name: string;
  email: string;
};

export type AuthSession = {
  token: string;
  user: User;
};

export type Expense = {
  id: number;
  title: string;
  amount: number;
  category: string;
  date: string;
  notes: string;
};

export type Friend = {
  id: number;
  name: string;
  email: string;
  balance: number;
};

export type DebtDirection = 'i_owe' | 'owes_me';

export type Debt = {
  id: number;
  friendId: number;
  friendName: string;
  title: string;
  amount: number;
  repaid: number;
  outstanding: number;
  direction: DebtDirection;
  date: string;
  notes: string;
};

export type ExpensePayload = Omit<Expense, 'id'>;

export type DebtPayload = {
  friendId: number;
  title: string;
  amount: number;
  direction: DebtDirection;
  date: string;
  notes: string;
};
