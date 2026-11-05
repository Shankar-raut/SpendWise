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
    <div className="flex flex-col gap-6" role="main" aria-label="Friends and money">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Friends & Money</h1>
          <p className="text-dim text-base">See what friends owe you and what you owe them</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button className="btn btn-secondary btn-size-md" onClick={onAddFriend} aria-label="Add a new friend">
            <UserPlus size={16} aria-hidden="true" />
            Add Friend
          </button>
          <button className="btn btn-primary btn-size-md" onClick={() => onAddDebt(filterFriendId || undefined)} aria-label="Add a new bill or split">
            <Plus size={16} aria-hidden="true" />
            Add Bill / Split
          </button>
        </div>
      </header>

      {/* Friend Cards */}
      <section aria-labelledby="friends-heading" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="friends-heading" className="text-xs font-semibold uppercase tracking-wider text-muted">
            Your Friends ({friends.length})
          </h2>
          {filterFriendId && (
            <button className="btn btn-ghost btn-size-sm" onClick={() => setFilterFriendId(null)} aria-label="Clear friend filter">
              Clear filter
            </button>
          )}
        </div>

        {friends.length === 0 ? (
          <article className="card-variant-default card-padding-lg rounded-xl border border-border text-center" role="status">
            <Users size={48} className="mx-auto text-muted mb-4" aria-hidden="true" />
            <p className="text-dim mb-4">No friends added yet.</p>
            <button className="btn btn-primary" onClick={onAddFriend} aria-label="Add your first friend">
              <UserPlus size={16} aria-hidden="true" />
              Add Your First Friend
            </button>
          </article>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" role="list" aria-label="Friends list">
            {friends.map((friend) => {
              const isSelected = filterFriendId === friend.id;
              const balance = friend.balance;
              const hasToGive = balance > 0;
              const youOwe = balance < 0;

              return (
                <article
                  key={friend.id}
                  className={`card-variant-default rounded-xl border transition-all ${isSelected ? 'border-primary bg-primary-bg/20' : 'border-border bg-bg-elevated'}`}
                  role="listitem"
                  aria-selected={isSelected}
                >
                  <div className="card-padding-md">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="avatar avatar-lg" aria-hidden="true">{friend.name.slice(0, 2).toUpperCase()}</div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold truncate">{friend.name}</h3>
                        <p className="text-sm text-muted truncate">{friend.email || 'Friend'}</p>
                      </div>
                    </div>

                    <div className="mb-4 p-4 rounded-lg bg-bg text-center">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">Current Status</p>
                      <p className="text-2xl font-bold {hasToGive ? 'text-success' : youOwe ? 'text-warning' : 'text-dim'}">
                        {hasToGive ? `+${formatCurrency(balance)}` : youOwe ? `-${formatCurrency(Math.abs(balance))}` : '₹0'}
                      </p>
                      <p className="text-sm text-dim mt-1">
                        {hasToGive
                          ? `${friend.name} has to pay you`
                          : youOwe
                          ? `You have to pay ${friend.name}`
                          : 'All clear! Nobody owes anything'}
                      </p>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-border">
                      {balance !== 0 ? (
                        <button
                          className="btn flex-1"
                          style={{
                            background: hasToGive ? 'var(--success-bg)' : 'var(--warning-bg)',
                            color: hasToGive ? 'var(--success)' : 'var(--warning)',
                            borderColor: hasToGive ? 'var(--success-border)' : 'var(--warning-border)'
                          }}
                          onClick={() => {
                            const friendDebt = debts.find((d) => d.friendId === friend.id && d.outstanding > 0);
                            if (friendDebt) onRecordPayment(friendDebt);
                          }}
                          aria-label={hasToGive ? `Record payment received from ${friend.name}` : `Record payment to ${friend.name}`}
                        >
                          <CheckCircle2 size={14} aria-hidden="true" />
                          {hasToGive ? `${friend.name} Paid Me` : `I Paid ${friend.name}`}
                        </button>
                      ) : (
                        <button className="btn btn-secondary flex-1" onClick={() => onAddDebt(friend.id)} aria-label={`Add a new split with ${friend.name}`}>
                          <Plus size={14} aria-hidden="true" /> New Split
                        </button>
                      )}
                      <button
                        className={`btn btn-size-sm flex-1 ${isSelected ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setFilterFriendId(isSelected ? null : friend.id)}
                        aria-pressed={isSelected}
                        aria-label={isSelected ? `Clear filter for ${friend.name}` : `Filter bills for ${friend.name}`}
                      >
                        {isSelected ? 'Filtered' : 'Filter Bills'}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Debts Section */}
      <section aria-labelledby="bills-heading" className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <div>
            <h2 id="bills-heading" className="text-2xl font-semibold">
              {filterFriendId
                ? `Bills with ${friends.find((f) => f.id === filterFriendId)?.name}`
                : 'All Bills & Shared Expenses'}
            </h2>
            <p className="text-dim text-sm">Showing {filteredDebts.length} record{filteredDebts.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="pills flex gap-1 bg-bg-elevated p-1 rounded-lg border border-border" role="tablist" aria-label="Filter bills">
            {DEBT_FILTERS.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setDebtFilterTab(filter.id as typeof debtFilterTab)}
                className={`pill px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${debtFilterTab === filter.id ? 'bg-primary text-white' : 'text-dim hover:text-white'}`}
                role="tab"
                aria-selected={debtFilterTab === filter.id}
                aria-controls={`${filter.id}-panel`}
                id={`${filter.id}-tab`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {filteredDebts.length === 0 ? (
          <article className="card-variant-default card-padding-lg rounded-xl border border-border text-center" role="status">
            <Clock size={48} className="mx-auto text-muted mb-4" aria-hidden="true" />
            <p className="text-dim">No bills found for this view.</p>
          </article>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" role="list" aria-label="Bills and shared expenses">
            {filteredDebts.map((debt) => {
              const isSettled = debt.outstanding === 0;
              const friendOwesMe = debt.direction === 'owes_me';
              const progressPercent = debt.amount > 0 ? Math.round((debt.repaid / debt.amount) * 100) : 0;
              const isExpanded = expandedDebtId === debt.id;
              const historyList = repaymentsCache[debt.id];

              return (
                <article
                  key={debt.id}
                  className={`card-variant-default rounded-xl border transition-opacity ${isSettled ? 'opacity-70' : ''}`}
                  role="listitem"
                  style={{ opacity: isSettled ? 0.7 : 1 }}
                >
                  <div className="card-padding-md">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`badge ${friendOwesMe ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.7rem' }}>
                        {friendOwesMe
                          ? `${debt.friendName} owes you`
                          : `You owe ${debt.friendName}`}
                      </span>
                      <span className="text-xs text-muted">{formatDate(debt.date)}</span>
                    </div>

                    <div className="mb-4 flex-1">
                      <h3 className="font-semibold">{debt.title}</h3>
                      <p className="text-sm text-dim">Friend: <strong>{debt.friendName}</strong></p>
                      {debt.notes && <p className="text-sm text-muted mt-1">{debt.notes}</p>}
                    </div>

                    <div className="mb-4 p-4 rounded-lg bg-bg flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-dim">Remaining to pay:</span>
                        <strong className={`text-xl ${isSettled ? 'text-muted' : friendOwesMe ? 'text-success' : 'text-warning'}`}>
                          {isSettled ? 'All Cleared' : formatCurrency(debt.outstanding)}
                        </strong>
                      </div>

                      <div className="progress-comp h-1.5">
                        <div
                          className={`progress-fill-comp ${friendOwesMe ? 'progress-fill-success-comp' : 'progress-fill-warning-comp'}`}
                          style={{ width: `${progressPercent}%` }}
                          role="progressbar"
                          aria-valuenow={progressPercent}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label="Payment progress"
                        />
                      </div>

                      <div className="flex justify-between text-xs text-muted">
                        <span>Paid: {formatCurrency(debt.repaid)}</span>
                        <span>Total Bill: {formatCurrency(debt.amount)}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-border">
                      {!isSettled ? (
                        <button
                          className="btn flex-1 min-w-[160px]"
                          style={{
                            background: friendOwesMe ? 'var(--success-bg)' : 'var(--warning-bg)',
                            color: friendOwesMe ? 'var(--success)' : 'var(--warning)',
                            borderColor: friendOwesMe ? 'var(--success-border)' : 'var(--warning-border)'
                          }}
                          onClick={() => onRecordPayment(debt)}
                          aria-label={friendOwesMe ? `Record money received for ${debt.title}` : `Record money paid for ${debt.title}`}
                        >
                          <CheckCircle2 size={15} aria-hidden="true" />
                          {friendOwesMe ? 'Record Money Received' : 'Record Money Paid'}
                        </button>
                      ) : (
                        <span className="badge badge-success flex-1 justify-center min-w-[160px]">
                          <CheckCircle2 size={14} aria-hidden="true" /> Cleared
                        </span>
                      )}

                      <div className="flex gap-1">
                        <button
                          className="icon-btn btn-size-sm"
                          onClick={() => handleToggleHistory(debt.id)}
                          aria-label={isExpanded ? `Hide payment history for ${debt.title}` : `View payment history for ${debt.title}`}
                          aria-expanded={isExpanded}
                        >
                          {isExpanded ? <ChevronDown size={15} aria-hidden="true" /> : <History size={15} aria-hidden="true" />}
                        </button>
                        <button
                          className="icon-btn btn-size-sm"
                          onClick={() => onEditDebt(debt)}
                          aria-label={`Edit bill: ${debt.title}`}
                        >
                          <Edit3 size={15} aria-hidden="true" />
                        </button>
                        <button
                          className="icon-btn btn-size-sm text-danger"
                          onClick={() => onDeleteDebt(debt.id)}
                          aria-label={`Delete bill: ${debt.title}`}
                        >
                          <Trash2 size={15} aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-border" role="region" aria-label="Payment history">
                        <div className="p-4 rounded-lg bg-bg border border-border flex flex-col gap-2">
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Payment History:</p>
                          {!historyList ? (
                            <div className="text-muted text-sm">Loading payments...</div>
                          ) : historyList.length === 0 ? (
                            <div className="text-muted text-sm">No payments recorded yet.</div>
                          ) : (
                            <div className="flex flex-col gap-2" role="list" aria-label="Payment history">
                              {historyList.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                                  role="listitem"
                                >
                                  <div>
                                    <strong>{formatCurrency(item.amount)}</strong>
                                    <p className="text-xs text-muted">{item.notes || 'No note'}</p>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-dim">
                                    <span>{formatDate(item.date)}</span>
                                    <button
                                      className="icon-btn btn-size-sm text-danger"
                                      onClick={() => onDeleteRepayment(item.id, debt.id)}
                                      aria-label={`Delete payment of ${formatCurrency(item.amount)} on ${formatDate(item.date)}`}
                                    >
                                      <Trash2 size={12} aria-hidden="true" />
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
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}