import { useCallback, useState } from 'react';
import { LockKeyhole, IndianRupee, X, Check } from 'lucide-react';
import { Navbar, type Tab } from './components/layout';
import { HomePage, ExpensesPage, FriendsPage } from './components/pages';
import { ExpenseModal, DebtModal, PaymentModal, FriendModal } from './components/modals';
import { useAuth } from './hooks/useAuth';
import { useExpenses } from './hooks/useExpenses';
import { useFriends } from './hooks/useFriends';
import { useDebts } from './hooks/useDebts';
import { useSummary } from './hooks/useSummary';
import { useToast } from './hooks/useToast';
import type { Expense, ExpensePayload, Friend, Debt, DebtPayload, Repayment } from './types';
import { formatCurrency } from './utils/format';
import './index.css';

function LoginScreen({ onLogin }: { onLogin: (email: string, password: string) => Promise<unknown> }) {
  const [email, setEmail] = useState('demo@spendwise.local');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await onLogin(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid login credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-brand">
          <IndianRupee size={24} />
          <div>
            <div className="auth-title">SpendWise</div>
            <div className="auth-subtitle">Daily expenses & friend money tracker</div>
          </div>
        </div>

        {error && <div className="toast toast-error" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
            {isLoading ? 'Opening...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-hint">
          <span>Demo:</span> <code>demo@spendwise.local</code> / <code>password123</code>
        </div>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="loading">
      <div className="spinner" />
      <span>Loading...</span>
    </div>
  );
}

export default function App() {
  const { user, isLoading: authLoading, login, logout } = useAuth();
  const { toasts, showToast, dismissToast } = useToast();

  const { expenses, isLoading: expensesLoading, createExpense, updateExpense, deleteExpense, refetch: refetchExpenses } = useExpenses();
  const { friends, isLoading: friendsLoading, createFriend, deleteFriend, refetch: refetchFriends } = useFriends();
  const { debts, isLoading: debtsLoading, createDebt, updateDebt, deleteDebt, getRepayments, addRepayment, deleteRepayment, refetch: refetchDebts } = useDebts();
  const { summary, isLoading: summaryLoading, refetch: refetchSummary } = useSummary();

  const [activeTab, setActiveTab] = useState<Tab>('home');

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<number | null>(null);

  const [showDebtModal, setShowDebtModal] = useState(false);
  const [editingDebtId, setEditingDebtId] = useState<number | null>(null);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentDebtId, setPaymentDebtId] = useState<number | null>(null);

  const [showFriendModal, setShowFriendModal] = useState(false);

  const [filterFriendId, setFilterFriendId] = useState<number | null>(null);
  const [debtFilterTab, setDebtFilterTab] = useState<'all' | 'he_owes' | 'i_owe' | 'settled'>('all');
  const [expandedDebtId, setExpandedDebtId] = useState<number | null>(null);
  const [repaymentsCache, setRepaymentsCache] = useState<Record<number, Repayment[]>>({});

  const isLoading = authLoading || expensesLoading || friendsLoading || debtsLoading || summaryLoading;
  const netBalance = summary.moneyOwedToMe - summary.moneyIOwe;

  const refetchAll = useCallback(async () => {
    await Promise.all([refetchExpenses(), refetchFriends(), refetchDebts(), refetchSummary()]);
  }, [refetchExpenses, refetchFriends, refetchDebts, refetchSummary]);

  const handleAddExpense = useCallback(() => { setEditingExpenseId(null); setShowExpenseModal(true); }, []);
  const handleEditExpense = useCallback((expense: Expense) => { setEditingExpenseId(expense.id); setShowExpenseModal(true); }, []);

  const handleSaveExpense = useCallback(async (data: ExpensePayload) => {
    try {
      if (editingExpenseId) { await updateExpense(editingExpenseId, data); showToast('Expense updated.'); }
      else { await createExpense(data); showToast('Expense saved!'); }
      setShowExpenseModal(false); setEditingExpenseId(null);
    } catch (err) { showToast(err instanceof Error ? err.message : 'Failed to save expense.', 'error'); }
  }, [editingExpenseId, createExpense, updateExpense, showToast]);

  const handleDeleteExpense = useCallback(async (id: number) => {
    try { await deleteExpense(id); showToast('Expense deleted.'); }
    catch (err) { showToast(err instanceof Error ? err.message : 'Failed to delete expense.', 'error'); }
  }, [deleteExpense, showToast]);

  const handleAddFriend = useCallback(() => { setShowFriendModal(true); }, []);
  const handleSaveFriend = useCallback(async (data: { name: string; email: string }) => {
    try { await createFriend(data); showToast(`Friend "${data.name}" added!`); setShowFriendModal(false); }
    catch (err) { showToast(err instanceof Error ? err.message : 'Failed to add friend.', 'error'); }
  }, [createFriend, showToast]);

  const handleAddDebt = useCallback((friendId?: number) => { setEditingDebtId(null); setShowDebtModal(true); }, []);
  const handleEditDebt = useCallback((debt: Debt) => { setEditingDebtId(debt.id); setShowDebtModal(true); }, []);
  const handleSaveDebt = useCallback(async (data: DebtPayload) => {
    try {
      if (editingDebtId) { await updateDebt(editingDebtId, data); showToast('Record updated.'); }
      else { await createDebt(data); showToast('Split record added!'); }
      setShowDebtModal(false); setEditingDebtId(null);
    } catch (err) { showToast(err instanceof Error ? err.message : 'Failed to save split.', 'error'); }
  }, [editingDebtId, createDebt, updateDebt, showToast]);

  const handleDeleteDebt = useCallback(async (id: number) => {
    try { await deleteDebt(id); showToast('Bill deleted.'); }
    catch (err) { showToast(err instanceof Error ? err.message : 'Failed to delete bill.', 'error'); }
  }, [deleteDebt, showToast]);

  const handleRecordPayment = useCallback((debt: Debt) => { setPaymentDebtId(debt.id); setShowPaymentModal(true); }, []);
  const handleRecordFriendPayment = useCallback((friend: Friend) => {
    const friendDebts = debts.filter((d) => d.friendId === friend.id && d.outstanding > 0);
    if (friendDebts.length === 0) { showToast(`All accounts with ${friend.name} are already cleared!`); return; }
    const top = [...friendDebts].sort((a, b) => b.outstanding - a.outstanding)[0];
    handleRecordPayment(top);
  }, [debts, showToast, handleRecordPayment]);

  const handleSavePayment = useCallback(async (data: { debtId: number; amount: number; date: string; notes: string }) => {
    try {
      await addRepayment(data.debtId, { amount: data.amount, date: data.date, notes: data.notes });
      showToast(`Payment of ${formatCurrency(data.amount)} recorded!`);
      setShowPaymentModal(false); setPaymentDebtId(null);
      setRepaymentsCache((prev) => { const next = { ...prev }; delete next[data.debtId]; return next; });
    } catch (err) { showToast(err instanceof Error ? err.message : 'Failed to record payment.', 'error'); }
  }, [addRepayment, showToast]);

  const handleLoadRepayments = useCallback(async (debtId: number) => {
    try { const history = await getRepayments(debtId); setRepaymentsCache((prev) => ({ ...prev, [debtId]: history })); }
    catch (err) { console.error('Failed to load past payments', err); }
  }, [getRepayments]);

  const handleDeleteRepayment = useCallback(async (repaymentId: number, debtId: number) => {
    try { await deleteRepayment(repaymentId); const updated = await getRepayments(debtId); setRepaymentsCache((prev) => ({ ...prev, [debtId]: updated })); showToast('Payment entry removed.'); }
    catch (err) { showToast(err instanceof Error ? err.message : 'Failed to delete payment.', 'error'); }
  }, [deleteRepayment, getRepayments, showToast]);

  if (authLoading) return <LoadingScreen />;
  if (!user) return <LoginScreen onLogin={login} />;

  return (
    <div className="app">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} user={user} onLogout={logout} netBalance={netBalance} />

      <div className="toasts">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`} role="alert">
            {toast.type === 'success' && <Check size={16} />}
            <span>{toast.message}</span>
            <button onClick={() => dismissToast(toast.id)}><X size={14} /></button>
          </div>
        ))}
      </div>

      <main className="main">
        {isLoading ? <LoadingScreen /> : (
          <>
            {activeTab === 'home' && (
              <HomePage
                summary={summary}
                expenses={expenses}
                friends={friends}
                onAddExpense={handleAddExpense}
                onAddDebt={handleAddDebt}
                onAddFriend={handleAddFriend}
                onRecordPayment={() => {
                  const openDebt = debts.find((d) => d.outstanding > 0);
                  if (!openDebt) { showToast('No pending payments to record right now!'); return; }
                  handleRecordPayment(openDebt);
                }}
                onNavigateToExpenses={() => setActiveTab('expenses')}
                onNavigateToFriends={() => setActiveTab('friends')}
                onRecordFriendPayment={handleRecordFriendPayment}
              />
            )}

            {activeTab === 'expenses' && (
              <ExpensesPage
                expenses={expenses}
                isLoading={expensesLoading}
                onAddExpense={handleAddExpense}
                onEditExpense={handleEditExpense}
                onDeleteExpense={handleDeleteExpense}
              />
            )}

            {activeTab === 'friends' && (
              <FriendsPage
                friends={friends}
                debts={debts}
                isLoading={debtsLoading}
                filterFriendId={filterFriendId}
                setFilterFriendId={setFilterFriendId}
                debtFilterTab={debtFilterTab}
                setDebtFilterTab={setDebtFilterTab}
                expandedDebtId={expandedDebtId}
                setExpandedDebtId={setExpandedDebtId}
                repaymentsCache={repaymentsCache}
                onAddFriend={handleAddFriend}
                onAddDebt={handleAddDebt}
                onEditDebt={handleEditDebt}
                onDeleteDebt={handleDeleteDebt}
                onRecordPayment={handleRecordPayment}
                onDeleteRepayment={handleDeleteRepayment}
                onLoadRepayments={handleLoadRepayments}
              />
            )}
          </>
        )}
      </main>

      <ExpenseModal isOpen={showExpenseModal} onClose={() => setShowExpenseModal(false)} onSubmit={handleSaveExpense} initialData={editingExpenseId ? expenses.find((e) => e.id === editingExpenseId) : undefined} isEditing={!!editingExpenseId} />
      <DebtModal isOpen={showDebtModal} onClose={() => setShowDebtModal(false)} onSubmit={handleSaveDebt} friends={friends} initialData={editingDebtId ? debts.find((d) => d.id === editingDebtId) : { friendId: filterFriendId || friends[0]?.id || 0 }} isEditing={!!editingDebtId} onAddFriend={() => { setShowDebtModal(false); setShowFriendModal(true); }} />
      <PaymentModal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} onSubmit={handleSavePayment} debts={debts} initialDebtId={paymentDebtId || undefined} />
      <FriendModal isOpen={showFriendModal} onClose={() => setShowFriendModal(false)} onSubmit={handleSaveFriend} />
    </div>
  );
}