import { Plus, Users, CheckCircle2, UserPlus, ChevronRight, ArrowUpRight, ArrowDownLeft, Receipt } from 'lucide-react';
import type { Expense, Friend, Summary } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';

interface HomePageProps {
  summary: Summary;
  expenses: Expense[];
  friends: Friend[];
  onAddExpense: () => void;
  onAddDebt: () => void;
  onAddFriend: () => void;
  onRecordPayment: () => void;
  onNavigateToExpenses: () => void;
  onNavigateToFriends: () => void;
  onRecordFriendPayment: (friend: Friend) => void;
}

export function HomePage({
  summary,
  expenses,
  friends,
  onAddExpense,
  onAddDebt,
  onAddFriend,
  onRecordPayment,
  onNavigateToExpenses,
  onNavigateToFriends,
  onRecordFriendPayment
}: HomePageProps) {
  const netBalance = summary.moneyOwedToMe - summary.moneyIOwe;
  const recentExpenses = expenses.slice(0, 5);

  return (
    <div className="flex flex-col gap-6" role="main" aria-label="Dashboard">
      {/* Welcome & Net Status */}
      <section aria-labelledby="welcome-heading">
        <div className="flex flex-col items-start gap-3">
          <div>
            <h1 id="welcome-heading" className="text-3xl font-bold">Welcome back</h1>
            <p className="text-dim text-base">Here's your financial overview</p>
          </div>
          <button
            className={`badge ${netBalance >= 0 ? 'badge-success' : 'badge-warning'} cursor-pointer`}
            aria-label={`Net balance: ${netBalance >= 0 ? '+' : ''}${formatCurrency(Math.abs(netBalance))} ${netBalance >= 0 ? 'to receive' : 'to pay'}`}
          >
            {netBalance >= 0 ? '+' : ''}{formatCurrency(netBalance)}
            <span className="hidden sm:inline"> {netBalance >= 0 ? 'to receive' : 'to pay'}</span>
          </button>
        </div>
      </section>

      {/* Summary Cards */}
      <section aria-labelledby="summary-heading" className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <h2 id="summary-heading" className="sr-only">Financial Summary</h2>

        <article className="card-variant-default card-padding-md rounded-xl border border-border">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-bg border border-border flex items-center justify-center">
              <Receipt size={20} className="text-dim" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs text-dim font-medium">Total Spending</p>
              <p className="text-2xl font-bold">{formatCurrency(summary.totalSpending)}</p>
              <p className="text-xs text-muted">This month: {formatCurrency(summary.monthlySpending)}</p>
            </div>
          </div>
        </article>

        <article className="card-variant-default card-padding-md rounded-xl border border-border">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-success-bg flex items-center justify-center">
              <ArrowDownLeft size={20} className="text-success" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs text-dim font-medium">Friends Owe You</p>
              <p className="text-2xl font-bold text-success">+{formatCurrency(summary.moneyOwedToMe)}</p>
              <p className="text-xs text-muted">Money to collect</p>
            </div>
          </div>
        </article>

        <article className="card-variant-default card-padding-md rounded-xl border border-border">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-warning-bg flex items-center justify-center">
              <ArrowUpRight size={20} className="text-warning" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs text-dim font-medium">You Owe Friends</p>
              <p className="text-2xl font-bold text-warning">-{formatCurrency(summary.moneyIOwe)}</p>
              <p className="text-xs text-muted">Money to return</p>
            </div>
          </div>
        </article>
      </section>

      {/* Quick Actions */}
      <section aria-labelledby="actions-heading" className="card-variant-default card-padding-md rounded-xl border border-border bg-bg">
        <h2 id="actions-heading" className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-primary btn-size-md" onClick={onAddExpense} aria-label="Add a new expense">
            <Plus size={16} aria-hidden="true" />
            Add Expense
          </button>
          <button className="btn btn-secondary btn-size-md" onClick={onAddDebt} aria-label="Add a new split with friends">
            <Users size={16} aria-hidden="true" />
            Add Split
          </button>
          <button className="btn btn-success btn-size-md" onClick={onRecordPayment} aria-label="Record a payment received">
            <CheckCircle2 size={16} aria-hidden="true" />
            Record Payment
          </button>
          <button className="btn btn-ghost btn-size-md" onClick={onAddFriend} aria-label="Add a new friend">
            <UserPlus size={16} aria-hidden="true" />
            Add Friend
          </button>
        </div>
      </section>

      {/* Split: Recent Expenses & Friend Balances */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Expenses */}
        <article className="card-variant-default card-padding-md rounded-xl border border-border">
          <header className="flex items-center justify-between mb-4">
            <h2 className="card-title-comp">Recent Expenses</h2>
            <button
              className="btn btn-ghost btn-size-sm"
              onClick={onNavigateToExpenses}
              aria-label="View all expenses"
            >
              <ChevronRight size={14} aria-hidden="true" />
              <span className="hidden sm:inline">View all</span>
            </button>
          </header>

          {recentExpenses.length === 0 ? (
            <div className="empty" role="status">
              <Receipt size={36} aria-hidden="true" />
              <p>No expenses yet</p>
              <button className="btn btn-primary btn-size-sm" onClick={onAddExpense} aria-label="Add your first expense">
                <Plus size={14} aria-hidden="true" /> Add First Expense
              </button>
            </div>
          ) : (
            <ul className="list" role="list" aria-label="Recent expenses">
              {recentExpenses.map((exp) => (
                <li key={exp.id} className="list-item">
                  <div className="list-item-main">
                    <span className="badge badge-primary">{exp.category}</span>
                    <div className="min-w-0">
                      <p className="list-item-title truncate">{exp.title}</p>
                      {exp.notes && <p className="list-item-meta truncate">{exp.notes}</p>}
                    </div>
                  </div>
                  <div className="list-item-side">
                    <p className="font-semibold">{formatCurrency(exp.amount)}</p>
                    <p className="list-item-meta">{formatDate(exp.date)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>

        {/* Friend Balances */}
        <article className="card-variant-default card-padding-md rounded-xl border border-border">
          <header className="flex items-center justify-between mb-4">
            <h2 className="card-title-comp">Friends</h2>
            <button
              className="btn btn-ghost btn-size-sm"
              onClick={onNavigateToFriends}
              aria-label="View all friends"
            >
              <ChevronRight size={14} aria-hidden="true" />
              <span className="hidden sm:inline">View all</span>
            </button>
          </header>

          {friends.length === 0 ? (
            <div className="empty" role="status">
              <Users size={36} aria-hidden="true" />
              <p>No friends yet</p>
              <button className="btn btn-primary btn-size-sm" onClick={onAddFriend} aria-label="Add your first friend">
                <UserPlus size={14} aria-hidden="true" /> Add First Friend
              </button>
            </div>
          ) : (
            <ul className="list" role="list" aria-label="Friend balances">
              {friends.map((friend) => {
                const balance = friend.balance;
                const isPositive = balance > 0;
                const isNegative = balance < 0;
                return (
                  <li key={friend.id} className="list-item">
                    <div className="list-item-main">
                      <div className="avatar" aria-hidden="true">{friend.name.slice(0, 2).toUpperCase()}</div>
                      <div className="min-w-0">
                        <p className="list-item-title truncate">{friend.name}</p>
                        <p className="list-item-meta truncate">{friend.email || 'Friend'}</p>
                      </div>
                    </div>
                    <div className="list-item-side">
                      <span className={`badge ${isPositive ? 'badge-success' : isNegative ? 'badge-warning' : 'badge-neutral'}`}>
                        {isPositive ? `+${formatCurrency(balance)}` : isNegative ? `-${formatCurrency(Math.abs(balance))}` : 'Settled'}
                      </span>
                      {balance !== 0 && (
                        <button
                          className="btn btn-size-sm"
                          style={{
                            background: isPositive ? 'var(--success-bg)' : 'var(--warning-bg)',
                            color: isPositive ? 'var(--success)' : 'var(--warning)',
                            borderColor: isPositive ? 'var(--success-border)' : 'var(--warning-border)'
                          }}
                          onClick={() => onRecordFriendPayment(friend)}
                          aria-label={isPositive ? `Record payment received from ${friend.name}` : `Record payment to ${friend.name}`}
                        >
                          {isPositive ? 'Received' : 'Paid'}
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </article>
      </section>
    </div>
  );
}