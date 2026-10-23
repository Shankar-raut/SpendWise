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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Welcome & Net Status */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Welcome back</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Here&apos;s your financial overview</p>
        </div>
        <button
          className={`badge ${netBalance >= 0 ? 'badge-success' : 'badge-warning'}`}
          style={{ cursor: 'pointer' }}
        >
          {netBalance >= 0 ? '+' : ''}{formatCurrency(netBalance)}
          {netBalance >= 0 ? ' to receive' : ' to pay'}
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius)', background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Receipt size={20} style={{ color: 'var(--text-dim)' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 500 }}>Total Spending</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatCurrency(summary.totalSpending)}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>This month: {formatCurrency(summary.monthlySpending)}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius)', background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowDownLeft size={20} style={{ color: 'var(--success)' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 500 }}>Friends Owe You</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>+{formatCurrency(summary.moneyOwedToMe)}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Money to collect</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius)', background: 'var(--warning-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowUpRight size={20} style={{ color: 'var(--warning)' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 500 }}>You Owe Friends</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--warning)' }}>-{formatCurrency(summary.moneyIOwe)}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Money to return</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
        <p style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '12px' }}>Quick Actions</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <button className="btn btn-primary" onClick={onAddExpense}><Plus size={16} /> Add Expense</button>
          <button className="btn btn-secondary" onClick={onAddDebt}><Users size={16} /> Add Split</button>
          <button className="btn btn-success" onClick={onRecordPayment}><CheckCircle2 size={16} /> Record Payment</button>
          <button className="btn btn-ghost" onClick={onAddFriend}><UserPlus size={16} /> Add Friend</button>
        </div>
      </div>

      {/* Split: Recent Expenses & Friend Balances */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        {/* Recent Expenses */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Expenses</h2>
            <button className="btn btn-ghost btn-sm" onClick={onNavigateToExpenses}><ChevronRight size={14} /> View all</button>
          </div>
          {recentExpenses.length === 0 ? (
            <div className="empty">
              <Receipt size={36} />
              <p>No expenses yet</p>
              <button className="btn btn-primary btn-sm" onClick={onAddExpense}><Plus size={14} /> Add First Expense</button>
            </div>
          ) : (
            <div className="list">
              {recentExpenses.map((exp) => (
                <div key={exp.id} className="list-item">
                  <div className="list-item-main">
                    <span className="badge badge-primary">{exp.category}</span>
                    <div style={{ minWidth: 0 }}>
                      <p className="list-item-title">{exp.title}</p>
                      {exp.notes && <p className="list-item-meta">{exp.notes}</p>}
                    </div>
                  </div>
                  <div className="list-item-side">
                    <p style={{ fontWeight: 600 }}>{formatCurrency(exp.amount)}</p>
                    <p className="list-item-meta">{formatDate(exp.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Friend Balances */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Friends</h2>
            <button className="btn btn-ghost btn-sm" onClick={onNavigateToFriends}><ChevronRight size={14} /> View all</button>
          </div>
          {friends.length === 0 ? (
            <div className="empty">
              <Users size={36} />
              <p>No friends yet</p>
              <button className="btn btn-primary btn-sm" onClick={onAddFriend}><UserPlus size={14} /> Add First Friend</button>
            </div>
          ) : (
            <div className="list">
              {friends.map((friend) => {
                const balance = friend.balance;
                const isPositive = balance > 0;
                const isNegative = balance < 0;
                return (
                  <div key={friend.id} className="list-item">
                    <div className="list-item-main">
                      <div className="avatar">{friend.name.slice(0, 2).toUpperCase()}</div>
                      <div style={{ minWidth: 0 }}>
                        <p className="list-item-title">{friend.name}</p>
                        <p className="list-item-meta">{friend.email || 'Friend'}</p>
                      </div>
                    </div>
                    <div className="list-item-side">
                      <span className={`badge ${isPositive ? 'badge-success' : isNegative ? 'badge-warning' : 'badge-neutral'}`}>
                        {isPositive ? `+${formatCurrency(balance)}` : isNegative ? `-${formatCurrency(Math.abs(balance))}` : 'Settled'}
                      </span>
                      {balance !== 0 && (
                        <button className="btn btn-sm" style={{ background: isPositive ? 'var(--success-bg)' : 'var(--warning-bg)', color: isPositive ? 'var(--success)' : 'var(--warning)', borderColor: isPositive ? 'var(--success-border)' : 'var(--warning-border)' }} onClick={() => onRecordFriendPayment(friend)}>
                          {isPositive ? 'Received' : 'Paid'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}