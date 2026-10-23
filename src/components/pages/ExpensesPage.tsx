import { useMemo, useState } from 'react';
import { Search, Plus, Edit3, Trash2, X } from 'lucide-react';
import type { Expense } from '../../types';
import { formatCurrency, formatDate, CATEGORIES } from '../../utils/format';

interface ExpensesPageProps {
  expenses: Expense[];
  isLoading: boolean;
  onAddExpense: () => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: number) => void;
}

const today = new Date().toISOString().slice(0, 10);

export function ExpensesPage({
  expenses,
  isLoading,
  onAddExpense,
  onEditExpense,
  onDeleteExpense
}: ExpensesPageProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'month'>('all');

  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      if (search) {
        const q = search.toLowerCase();
        const mTitle = exp.title.toLowerCase().includes(q);
        const mNote = exp.notes?.toLowerCase().includes(q);
        const mCat = exp.category?.toLowerCase().includes(q);
        if (!mTitle && !mNote && !mCat) return false;
      }
      if (categoryFilter && exp.category !== categoryFilter) return false;
      if (dateFilter === 'today' && exp.date !== today) return false;
      if (dateFilter === 'month' && exp.date.slice(0, 7) !== today.slice(0, 7)) return false;
      return true;
    });
  }, [expenses, search, categoryFilter, dateFilter]);

  const totalFiltered = useMemo(
    () => filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0),
    [filteredExpenses]
  );

  const handleClearFilters = () => {
    setSearch('');
    setCategoryFilter('');
    setDateFilter('all');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>My Daily Expenses</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
            Showing <strong>{filteredExpenses.length}</strong> expense{filteredExpenses.length !== 1 ? 's' : ''}{' '}
            · Total: <strong>{formatCurrency(totalFiltered)}</strong>
          </p>
        </div>
        <button className="btn btn-primary" onClick={onAddExpense}><Plus size={16} /> Add Expense</button>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: '16px', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
        <div className="search-wrap" style={{ flex: 1, minWidth: 240 }}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by name, note, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} className="icon-btn" aria-label="Clear search" style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)' }}>
              <X size={14} />
            </button>
          )}
        </div>

        <div className="pills" style={{ display: 'flex', gap: '4px' }}>
          {(['all', 'today', 'month'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setDateFilter(filter)}
              className={`pill ${dateFilter === filter ? 'active' : ''}`}
            >
              {filter === 'all' ? 'All Time' : filter === 'today' ? 'Today' : 'This Month'}
            </button>
          ))}
        </div>

        <div style={{ minWidth: 180, maxWidth: 220 }}>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="field"
            style={{ width: '100%' }}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {(search || categoryFilter || dateFilter !== 'all') && (
          <button className="btn btn-ghost btn-sm" onClick={handleClearFilters}>Clear Filters</button>
        )}
      </div>

      {/* Expenses Table */}
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Description</th>
              <th>Date</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '48px' }}>
                  <div className="loading"><div className="spinner" /></div>
                </td>
              </tr>
            ) : filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '48px' }}>
                  <div className="empty">
                    <Search size={36} />
                    <p>No expenses found</p>
                    <button className="btn btn-primary btn-sm" onClick={onAddExpense}><Plus size={14} /> Add Expense</button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredExpenses.map((exp) => (
                <tr key={exp.id}>
                  <td><span className="badge badge-primary">{exp.category}</span></td>
                  <td>
                    <p style={{ fontWeight: 500 }}>{exp.title}</p>
                    {exp.notes && <p className="list-item-meta">{exp.notes}</p>}
                  </td>
                  <td style={{ color: 'var(--text-dim)' }}>{formatDate(exp.date)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(exp.amount)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button className="icon-btn" onClick={() => onEditExpense(exp)} aria-label="Edit expense">
                        <Edit3 size={15} />
                      </button>
                      <button className="icon-btn" style={{ color: 'var(--danger)' }} onClick={() => onDeleteExpense(exp.id)} aria-label="Delete expense">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}