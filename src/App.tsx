import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Edit3,
  IndianRupee,
  LockKeyhole,
  LogOut,
  Plus,
  ReceiptText,
  Search,
  Trash2,
  Users
} from 'lucide-react';
import { spendwiseApi } from './api';
import type { Debt, DebtDirection, DebtPayload, Expense, ExpensePayload, Friend, Summary, User } from './types';

const today = new Date().toISOString().slice(0, 10);
const emptyExpense: ExpensePayload = { title: '', amount: 0, category: 'Food', date: today, notes: '' };
const emptyDebt: DebtPayload = {
  friendId: 0,
  title: '',
  amount: 0,
  direction: 'owes_me',
  date: today,
  notes: ''
};

function inr(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [loginForm, setLoginForm] = useState({ email: 'demo@spendwise.local', password: 'password123' });
  const [loginLoading, setLoginLoading] = useState(false);
  const [summary, setSummary] = useState<Summary>({
    totalSpending: 0,
    monthlySpending: 0,
    moneyIOwe: 0,
    moneyOwedToMe: 0
  });
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [expenseForm, setExpenseForm] = useState<ExpensePayload>(emptyExpense);
  const [debtForm, setDebtForm] = useState<DebtPayload>(emptyDebt);
  const [friendForm, setFriendForm] = useState({ name: '', email: '' });
  const [repaymentForm, setRepaymentForm] = useState({ debtId: 0, amount: 0, date: today, notes: '' });
  const [editingExpense, setEditingExpense] = useState<number | null>(null);
  const [editingDebt, setEditingDebt] = useState<number | null>(null);
  const [filters, setFilters] = useState({ search: '', category: '', from: '', to: '' });
  const [activeTab, setActiveTab] = useState<'expenses' | 'debts'>('expenses');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadData() {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    const query = params.toString() ? `?${params.toString()}` : '';
    const [summaryData, expenseData, friendData, debtData, categoryData] = await Promise.all([
      spendwiseApi.summary(),
      spendwiseApi.expenses(query),
      spendwiseApi.friends(),
      spendwiseApi.debts(),
      spendwiseApi.categories()
    ]);

    setSummary(summaryData);
    setExpenses(expenseData);
    setFriends(friendData);
    setDebts(debtData);
    setCategories(categoryData);
    setLoading(false);
  }

  useEffect(() => {
    const token = localStorage.getItem('spendwise_token');
    if (!token) {
      setAuthChecking(false);
      setLoading(false);
      return;
    }

    spendwiseApi
      .me()
      .then(setUser)
      .catch(() => localStorage.removeItem('spendwise_token'))
      .finally(() => setAuthChecking(false));
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    loadData().catch((err) => {
      setError(err.message);
      setLoading(false);
    });
  }, [filters, user]);

  useEffect(() => {
    if (friends.length && debtForm.friendId === 0) {
      setDebtForm((current) => ({ ...current, friendId: friends[0].id }));
    }
  }, [friends, debtForm.friendId]);

  const netBalance = useMemo(
    () => summary.moneyOwedToMe - summary.moneyIOwe,
    [summary.moneyIOwe, summary.moneyOwedToMe]
  );

  async function runAction(action: () => Promise<unknown>) {
    try {
      setError('');
      await action();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }

  function validateAmount(amount: number) {
    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      throw new Error('Amount must be greater than 0.');
    }
  }

  function validateText(value: string, label: string) {
    if (!value.trim()) throw new Error(`${label} is required.`);
  }

  async function saveExpense(event: FormEvent) {
    event.preventDefault();
    await runAction(async () => {
      validateText(expenseForm.title, 'Expense title');
      validateText(expenseForm.category, 'Category');
      validateAmount(Number(expenseForm.amount));
      if (editingExpense) {
        await spendwiseApi.updateExpense(editingExpense, expenseForm);
      } else {
        await spendwiseApi.createExpense(expenseForm);
      }
      setExpenseForm(emptyExpense);
      setEditingExpense(null);
    });
  }

  async function saveFriend(event: FormEvent) {
    event.preventDefault();
    await runAction(async () => {
      validateText(friendForm.name, 'Friend name');
      await spendwiseApi.createFriend(friendForm);
      setFriendForm({ name: '', email: '' });
    });
  }

  async function saveDebt(event: FormEvent) {
    event.preventDefault();
    await runAction(async () => {
      validateText(debtForm.title, 'Debt title');
      validateAmount(Number(debtForm.amount));
      if (!debtForm.friendId) throw new Error('Add or select a friend first.');

      if (editingDebt) {
        await spendwiseApi.updateDebt(editingDebt, debtForm);
      } else {
        await spendwiseApi.createDebt(debtForm);
      }
      setDebtForm({ ...emptyDebt, friendId: friends[0]?.id || 0 });
      setEditingDebt(null);
    });
  }

  async function saveRepayment(event: FormEvent) {
    event.preventDefault();
    await runAction(async () => {
      if (!repaymentForm.debtId) throw new Error('Choose a debt to record repayment.');
      validateAmount(Number(repaymentForm.amount));
      await spendwiseApi.addRepayment(repaymentForm.debtId, repaymentForm);
      setRepaymentForm({ debtId: 0, amount: 0, date: today, notes: '' });
    });
  }

  function startExpenseEdit(expense: Expense) {
    setEditingExpense(expense.id);
    setExpenseForm({
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
      notes: expense.notes
    });
  }

  function startDebtEdit(debt: Debt) {
    setEditingDebt(debt.id);
    setDebtForm({
      friendId: debt.friendId,
      title: debt.title,
      amount: debt.amount,
      direction: debt.direction,
      date: debt.date,
      notes: debt.notes
    });
  }

  async function login(event: FormEvent) {
    event.preventDefault();
    try {
      setLoginLoading(true);
      setError('');
      const session = await spendwiseApi.login(loginForm);
      localStorage.setItem('spendwise_token', session.token);
      setUser(session.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to log in.');
    } finally {
      setLoginLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem('spendwise_token');
    setUser(null);
    setExpenses([]);
    setFriends([]);
    setDebts([]);
    setCategories([]);
  }

  if (authChecking) {
    return (
      <main className="login-shell">
        <div className="empty-state">Checking your session...</div>
      </main>
    );
  }

  if (!user) {
    return (
      <LoginPage
        form={loginForm}
        loading={loginLoading}
        error={error}
        onChange={setLoginForm}
        onSubmit={login}
      />
    );
  }

  return (
    <main className="app-shell">
      <section className="topbar">
        <div>
          <p className="eyebrow">Personal finance ledger</p>
          <h1>SpendWise</h1>
        </div>
        <div className="topbar-actions">
          <div className="user-chip">
            <span>{user.name}</span>
            <strong>{user.email}</strong>
          </div>
          <div className={`net-pill ${netBalance >= 0 ? 'positive' : 'negative'}`}>
            Net {inr(Math.abs(netBalance))} {netBalance >= 0 ? 'ahead' : 'behind'}
          </div>
          <button className="icon-button" onClick={logout} aria-label="Log out" title="Log out">
            <LogOut size={18} />
          </button>
        </div>
      </section>

      {error && (
        <div className="toast" role="alert">
          {error}
        </div>
      )}

      <section className="metric-grid" aria-label="Financial summary">
        <Metric icon={<ReceiptText />} label="Total spending" value={inr(summary.totalSpending)} />
        <Metric icon={<IndianRupee />} label="This month" value={inr(summary.monthlySpending)} />
        <Metric icon={<ArrowUpRight />} label="I owe" value={inr(summary.moneyIOwe)} tone="warn" />
        <Metric icon={<ArrowDownLeft />} label="Owed to me" value={inr(summary.moneyOwedToMe)} tone="good" />
      </section>

      <section className="workbench">
        <div className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Expenses</p>
              <h2>{editingExpense ? 'Edit expense' : 'Add expense'}</h2>
            </div>
          </div>

          <form className="form-grid" onSubmit={saveExpense}>
            <label>
              Title
              <input value={expenseForm.title} onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })} />
            </label>
            <label>
              Amount
              <input
                type="number"
                min="1"
                step="0.01"
                value={expenseForm.amount || ''}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })}
              />
            </label>
            <label>
              Category
              <input
                list="categories"
                value={expenseForm.category}
                onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
              />
              <datalist id="categories">
                {categories.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </label>
            <label>
              Date
              <input type="date" value={expenseForm.date} onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })} />
            </label>
            <label className="span-2">
              Notes
              <textarea value={expenseForm.notes} onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })} />
            </label>
            <button className="primary span-2" type="submit">
              <Plus size={18} /> {editingExpense ? 'Save expense' : 'Add expense'}
            </button>
          </form>
        </div>

        <div className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Friends</p>
              <h2>Debts and repayments</h2>
            </div>
          </div>

          <form className="friend-form" onSubmit={saveFriend}>
            <input placeholder="Friend name" value={friendForm.name} onChange={(e) => setFriendForm({ ...friendForm, name: e.target.value })} />
            <input placeholder="Email optional" value={friendForm.email} onChange={(e) => setFriendForm({ ...friendForm, email: e.target.value })} />
            <button className="icon-button" type="submit" aria-label="Add friend" title="Add friend">
              <Users size={18} />
            </button>
          </form>

          <form className="form-grid compact" onSubmit={saveDebt}>
            <label>
              Friend
              <select value={debtForm.friendId} onChange={(e) => setDebtForm({ ...debtForm, friendId: Number(e.target.value) })}>
                <option value={0}>Select</option>
                {friends.map((friend) => (
                  <option key={friend.id} value={friend.id}>
                    {friend.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Direction
              <select
                value={debtForm.direction}
                onChange={(e) => setDebtForm({ ...debtForm, direction: e.target.value as DebtDirection })}
              >
                <option value="owes_me">Owes me</option>
                <option value="i_owe">I owe</option>
              </select>
            </label>
            <label>
              Title
              <input value={debtForm.title} onChange={(e) => setDebtForm({ ...debtForm, title: e.target.value })} />
            </label>
            <label>
              Amount
              <input
                type="number"
                min="1"
                step="0.01"
                value={debtForm.amount || ''}
                onChange={(e) => setDebtForm({ ...debtForm, amount: Number(e.target.value) })}
              />
            </label>
            <label>
              Date
              <input type="date" value={debtForm.date} onChange={(e) => setDebtForm({ ...debtForm, date: e.target.value })} />
            </label>
            <label>
              Notes
              <input value={debtForm.notes} onChange={(e) => setDebtForm({ ...debtForm, notes: e.target.value })} />
            </label>
            <button className="primary span-2" type="submit">
              <CheckCircle2 size={18} /> {editingDebt ? 'Save debt' : 'Record debt'}
            </button>
          </form>
        </div>
      </section>

      <section className="history">
        <div className="history-header">
          <div className="tabs">
            <button className={activeTab === 'expenses' ? 'active' : ''} onClick={() => setActiveTab('expenses')}>
              Expenses
            </button>
            <button className={activeTab === 'debts' ? 'active' : ''} onClick={() => setActiveTab('debts')}>
              Debts
            </button>
          </div>
          <div className="filters">
            <div className="searchbox">
              <Search size={16} />
              <input
                placeholder="Search transactions"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
            <input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
          </div>
        </div>

        {loading ? (
          <div className="empty-state">Loading your ledger...</div>
        ) : activeTab === 'expenses' ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>
                      <strong>{expense.title}</strong>
                      <span>{expense.notes || 'No notes'}</span>
                    </td>
                    <td>{expense.category}</td>
                    <td>{expense.date}</td>
                    <td>{inr(expense.amount)}</td>
                    <td className="actions">
                      <button className="icon-button" onClick={() => startExpenseEdit(expense)} aria-label="Edit expense" title="Edit expense">
                        <Edit3 size={16} />
                      </button>
                      <button
                        className="icon-button danger"
                        onClick={() => runAction(() => spendwiseApi.deleteExpense(expense.id))}
                        aria-label="Delete expense"
                        title="Delete expense"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="debt-grid">
            <form className="repayment-card" onSubmit={saveRepayment}>
              <h3>Record repayment</h3>
              <select value={repaymentForm.debtId} onChange={(e) => setRepaymentForm({ ...repaymentForm, debtId: Number(e.target.value) })}>
                <option value={0}>Choose open debt</option>
                {debts
                  .filter((debt) => debt.outstanding > 0)
                  .map((debt) => (
                    <option key={debt.id} value={debt.id}>
                      {debt.friendName} - {debt.title} ({inr(debt.outstanding)})
                    </option>
                  ))}
              </select>
              <input
                type="number"
                min="1"
                step="0.01"
                placeholder="Amount"
                value={repaymentForm.amount || ''}
                onChange={(e) => setRepaymentForm({ ...repaymentForm, amount: Number(e.target.value) })}
              />
              <input type="date" value={repaymentForm.date} onChange={(e) => setRepaymentForm({ ...repaymentForm, date: e.target.value })} />
              <input placeholder="Notes" value={repaymentForm.notes} onChange={(e) => setRepaymentForm({ ...repaymentForm, notes: e.target.value })} />
              <button className="primary" type="submit">
                <CheckCircle2 size={18} /> Save repayment
              </button>
            </form>

            {debts.map((debt) => (
              <article className="debt-card" key={debt.id}>
                <div>
                  <p className="eyebrow">{debt.direction === 'owes_me' ? 'Owes me' : 'I owe'}</p>
                  <h3>{debt.title}</h3>
                  <span>{debt.friendName} · {debt.date}</span>
                </div>
                <strong>{inr(debt.outstanding)}</strong>
                <progress value={debt.repaid} max={debt.amount}></progress>
                <div className="debt-meta">
                  <span>Paid {inr(debt.repaid)}</span>
                  <span>Total {inr(debt.amount)}</span>
                </div>
                <div className="actions">
                  <button className="icon-button" onClick={() => startDebtEdit(debt)} aria-label="Edit debt" title="Edit debt">
                    <Edit3 size={16} />
                  </button>
                  <button
                    className="icon-button danger"
                    onClick={() => runAction(() => spendwiseApi.deleteDebt(debt.id))}
                    aria-label="Delete debt"
                    title="Delete debt"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="friend-strip">
        {friends.map((friend) => (
          <article key={friend.id}>
            <div>
              <strong>{friend.name}</strong>
              <span>{friend.email || 'No email'}</span>
            </div>
            <b className={friend.balance >= 0 ? 'positive-text' : 'negative-text'}>
              {friend.balance >= 0 ? '+' : '-'}{inr(Math.abs(friend.balance))}
            </b>
          </article>
        ))}
      </section>
    </main>
  );
}

function LoginPage({
  form,
  loading,
  error,
  onChange,
  onSubmit
}: {
  form: { email: string; password: string };
  loading: boolean;
  error: string;
  onChange: (form: { email: string; password: string }) => void;
  onSubmit: (event: FormEvent) => void;
}) {
  return (
    <main className="login-shell">
      <section className="login-panel">
        <div className="login-copy">
          <p className="eyebrow">Secure local ledger</p>
          <h1>SpendWise</h1>
          <p>Sign in to view your expenses, balances, friends, debts, and repayments.</p>
        </div>

        <form className="login-card" onSubmit={onSubmit}>
          <div className="login-icon">
            <LockKeyhole size={22} />
          </div>
          <div>
            <p className="eyebrow">Welcome back</p>
            <h2>Login</h2>
          </div>

          {error && (
            <div className="toast" role="alert">
              {error}
            </div>
          )}

          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => onChange({ ...form, email: event.target.value })}
              autoComplete="email"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) => onChange({ ...form, password: event.target.value })}
              autoComplete="current-password"
            />
          </label>
          <button className="primary" type="submit" disabled={loading}>
            <LockKeyhole size={18} /> {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </section>
    </main>
  );
}

function Metric({ icon, label, value, tone = '' }: { icon: React.ReactNode; label: string; value: string; tone?: string }) {
  return (
    <article className={`metric ${tone}`}>
      <div className="metric-icon">{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
