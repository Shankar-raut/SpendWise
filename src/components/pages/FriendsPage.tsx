import { useMemo, useState } from 'react';
import { Users, Plus, UserPlus, Clock, CheckCircle2, History, Edit3, Trash2, X, ChevronRight, ChevronDown } from 'lucide-react';
import type { Friend, Debt, Repayment } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';

interface FriendsPageProps {
  friends: Friend[];
  debts: Debt[];
  isLoading: boolean;
  filterFriendId: number | null;
  setFilterFriendId: (id: number | null) => void;
  debtFilterTab: 'all' | 'he_owes' | 'i_owe' | 'settled';
  setDebtFilterTab: (tab: 'all' | 'he_owes' | 'i_owe' | 'settled') => void;
  expandedDebtId: number | null;
  setExpandedDebtId: (id: number | null) => void;
  repaymentsCache: Record<number, Repayment[]>;
  onAddFriend: () => void;
  onAddDebt: (friendId?: number) => void;
  onEditDebt: (debt: Debt) => void;
  onDeleteDebt: (id: number) => void;
  onRecordPayment: (debt: Debt) => void;
  onDeleteRepayment: (repaymentId: number, debtId: number) => void;
  onLoadRepayments: (debtId: number) => Promise<void>;
}

const DEBT_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'he_owes', label: 'Friend Owes Me' },
  { id: 'i_owe', label: 'I Owe Friend' },
  { id: 'settled', label: 'Cleared' }
] as const;

export function FriendsPage({
  friends,
  debts,
  isLoading,
  filterFriendId,
  setFilterFriendId,
  debtFilterTab,
  setDebtFilterTab,
  expandedDebtId,
  setExpandedDebtId,
  repaymentsCache,
  onAddFriend,
  onAddDebt,
  onEditDebt,
  onDeleteDebt,
  onRecordPayment,
  onDeleteRepayment,
  onLoadRepayments
}: FriendsPageProps) {
  const filteredDebts = useMemo(() => {
    return debts.filter((d) => {
      if (filterFriendId !== null && d.friendId !== filterFriendId) return false;
      if (debtFilterTab === 'he_owes') return d.direction === 'owes_me' && d.outstanding > 0;
      if (debtFilterTab === 'i_owe') return d.direction === 'i_owe' && d.outstanding > 0;
      if (debtFilterTab === 'settled') return d.outstanding === 0;
      return true;
    });
  }, [debts, filterFriendId, debtFilterTab]);

  const handleToggleHistory = async (debtId: number) => {
    if (expandedDebtId === debtId) {
      setExpandedDebtId(null);
      return;
    }
    setExpandedDebtId(debtId);
    if (!repaymentsCache[debtId]) {
      await onLoadRepayments(debtId);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Friends & Money</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
            See what friends owe you and what you owe them
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={onAddFriend}><UserPlus size={16} /> Add Friend</button>
          <button className="btn btn-primary" onClick={() => onAddDebt(filterFriendId || undefined)}><Plus size={16} /> Add Bill / Split</button>
        </div>
      </div>

      {/* Friend Cards */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
          Your Friends ({friends.length})
        </span>
        {filterFriendId && (
          <button className="btn btn-ghost btn-sm" onClick={() => setFilterFriendId(null)}>Clear filter</button>
        )}
      </div>

      {friends.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <Users size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
          <p style={{ color: 'var(--text-dim)', marginBottom: '16px' }}>No friends added yet.</p>
          <button className="btn btn-primary" onClick={onAddFriend}><UserPlus size={16} /> Add Your First Friend</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {friends.map((friend) => {
            const isSelected = filterFriendId === friend.id;
            const balance = friend.balance;
            const hasToGive = balance > 0;
            const youOwe = balance < 0;

            return (
              <div key={friend.id} className="card" style={{ display: 'flex', flexDirection: 'column', borderColor: isSelected ? 'var(--primary)' : 'var(--border)', background: isSelected ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-elevated)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="avatar avatar-lg">{friend.name.slice(0, 2).toUpperCase()}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{friend.name}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{friend.email || 'Friend'}</p>
                  </div>
                </div>

                <div style={{ marginTop: '16px', padding: '16px', borderRadius: 'var(--radius)', background: 'var(--bg)', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '4px' }}>Current Status</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700, color: hasToGive ? 'var(--success)' : youOwe ? 'var(--warning)' : 'var(--text-dim)' }}>
                    {hasToGive ? `+${formatCurrency(balance)}` : youOwe ? `-${formatCurrency(Math.abs(balance))}` : '₹0'}
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                    {hasToGive
                      ? `${friend.name} has to pay you`
                      : youOwe
                      ? `You have to pay ${friend.name}`
                      : 'All clear! Nobody owes anything'}
                  </p>
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', gap: '8px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                  {balance !== 0 ? (
                    <button
                      className="btn flex-1"
                      style={{ background: hasToGive ? 'var(--success-bg)' : 'var(--warning-bg)', color: hasToGive ? 'var(--success)' : 'var(--warning)', borderColor: hasToGive ? 'var(--success-border)' : 'var(--warning-border)' }}
                      onClick={() => {
                        const friendDebt = debts.find((d) => d.friendId === friend.id && d.outstanding > 0);
                        if (friendDebt) onRecordPayment(friendDebt);
                      }}
                    >
                      <CheckCircle2 size={14} />
                      {hasToGive ? `${friend.name} Paid Me` : `I Paid ${friend.name}`}
                    </button>
                  ) : (
                    <button className="btn btn-secondary flex-1" onClick={() => onAddDebt(friend.id)}>
                      <Plus size={14} /> New Split
                    </button>
                  )}
                  <button className={`btn ${isSelected ? 'btn-primary' : 'btn-ghost'} btn-sm flex-1`} onClick={() => setFilterFriendId(isSelected ? null : friend.id)}>
                    {isSelected ? 'Filtered' : 'Filter Bills'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Debts Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
              {filterFriendId
                ? `Bills with ${friends.find((f) => f.id === filterFriendId)?.name}`
                : 'All Bills & Shared Expenses'}
            </h3>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
              Showing {filteredDebts.length} record{filteredDebts.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="pills">
            {DEBT_FILTERS.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setDebtFilterTab(filter.id as typeof debtFilterTab)}
                className={`pill ${debtFilterTab === filter.id ? 'active' : ''}`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {filteredDebts.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <Clock size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
            <p style={{ color: 'var(--text-dim)' }}>No bills found for this view.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '16px' }}>
            {filteredDebts.map((debt) => {
              const isSettled = debt.outstanding === 0;
              const friendOwesMe = debt.direction === 'owes_me';
              const progressPercent = debt.amount > 0 ? Math.round((debt.repaid / debt.amount) * 100) : 0;
              const isExpanded = expandedDebtId === debt.id;
              const historyList = repaymentsCache[debt.id];

              return (
                <div key={debt.id} className="card" style={{ display: 'flex', flexDirection: 'column', opacity: isSettled ? 0.7 : 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className={`badge ${friendOwesMe ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.7rem' }}>
                      {friendOwesMe
                        ? `${debt.friendName} owes you`
                        : `You owe ${debt.friendName}`}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(debt.date)}</span>
                  </div>

                  <div style={{ marginTop: '16px', flex: 1 }}>
                    <h4 style={{ fontWeight: 600 }}>{debt.title}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Friend: <strong>{debt.friendName}</strong></p>
                    {debt.notes && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>{debt.notes}</p>}
                  </div>

                  <div style={{ marginTop: '16px', padding: '16px', borderRadius: 'var(--radius)', background: 'var(--bg)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Remaining to pay:</span>
                      <strong style={{ fontSize: '1.25rem', color: isSettled ? 'var(--text-muted)' : friendOwesMe ? 'var(--success)' : 'var(--warning)' }}>
                        {isSettled ? 'All Cleared' : formatCurrency(debt.outstanding)}
                      </strong>
                    </div>

                    <div className="progress" style={{ height: '6px' }}>
                      <div className={`progress-fill ${friendOwesMe ? 'progress-fill-success' : 'progress-fill-warning'}`} style={{ width: `${progressPercent}%` }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>Paid: {formatCurrency(debt.repaid)}</span>
                      <span>Total Bill: {formatCurrency(debt.amount)}</span>
                    </div>
                  </div>

                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                    {!isSettled ? (
                      <button
                        className="btn flex-1"
                        style={{ background: friendOwesMe ? 'var(--success-bg)' : 'var(--warning-bg)', color: friendOwesMe ? 'var(--success)' : 'var(--warning)', borderColor: friendOwesMe ? 'var(--success-border)' : 'var(--warning-border)' }}
                        onClick={() => onRecordPayment(debt)}
                      >
                        <CheckCircle2 size={15} />
                        {friendOwesMe ? 'Record Money Received' : 'Record Money Paid'}
                      </button>
                    ) : (
                      <span className="badge badge-success" style={{ flex: 1, justifyContent: 'center' }}>
                        <CheckCircle2 size={14} /> Cleared
                      </span>
                    )}

                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button className="icon-btn btn-sm" onClick={() => handleToggleHistory(debt.id)} aria-label="View payment history">
                        <History size={15} />
                      </button>
                      <button className="icon-btn btn-sm" onClick={() => onEditDebt(debt)} aria-label="Edit bill">
                        <Edit3 size={15} />
                      </button>
                      <button className="icon-btn btn-sm" style={{ color: 'var(--danger)' }} onClick={() => onDeleteDebt(debt.id)} aria-label="Delete bill">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                      <div style={{ padding: '16px', borderRadius: 'var(--radius)', background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <p style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Payment History:</p>
                        {!historyList ? (
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading payments...</div>
                        ) : historyList.length === 0 ? (
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No payments recorded yet.</div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {historyList.map((item) => (
                              <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: 'var(--radius)', background: 'rgba(255,255,255,0.03)' }}>
                                <div>
                                  <strong>{formatCurrency(item.amount)}</strong>
                                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.notes || 'No note'}</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                                  <span>{formatDate(item.date)}</span>
                                  <button className="icon-btn btn-sm" style={{ color: 'var(--danger)' }} onClick={() => onDeleteRepayment(item.id, debt.id)} aria-label="Delete this payment">
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}