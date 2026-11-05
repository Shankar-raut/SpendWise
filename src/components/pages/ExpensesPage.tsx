import { useMemo, useState } from 'react';
import { Search, Plus, Edit3, Trash2, X, Filter } from 'lucide-react';
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

  const hasActiveFilters = search || categoryFilter || dateFilter !== 'all';

  const handleClearFilters = () => {
    setSearch('');
    setCategoryFilter('');
    setDateFilter('all');
  };

  return (
    <div className="flex flex-col gap-6" role="main" aria-label="Expenses">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">My Daily Expenses</h1>
          <p className="text-dim text-base">
            Showing <strong>{filteredExpenses.length}</strong> expense{filteredExpenses.length !== 1 ? 's' : ''}{' '}
            · Total: <strong>{formatCurrency(totalFiltered)}</strong>
          </p>
        </div>
        <button className="btn btn-primary btn-size-md w-full sm:w-auto" onClick={onAddExpense} aria-label="Add a new expense">
          <Plus size={16} aria-hidden="true" />
          Add Expense
        </button>
      </header>

      {/* Filter Toolbar */}
      <section className="card-variant-default card-padding-md rounded-xl border border-border" aria-labelledby="filters-heading">
        <h2 id="filters-heading" className="sr-only">Filters</h2>
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="search-wrap relative flex-1 min-w-[240px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search by name, note, or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 bg-bg-input border border-border rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-muted transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              aria-label="Search expenses"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="icon-btn absolute right-2 top-1/2 -translate-y-1/2"
                aria-label="Clear search"
              >
                <X size={14} aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Date Filter Pills */}
          <div className="pills flex gap-1 bg-bg-elevated p-1 rounded-lg border border-border">
            {(['all', 'today', 'month'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setDateFilter(filter)}
                className={`pill px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${dateFilter === filter ? 'bg-primary text-white' : 'text-dim hover:text-white'}`}
                aria-pressed={dateFilter === filter}
              >
                {filter === 'all' ? 'All Time' : filter === 'today' ? 'Today' : 'This Month'}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <div className="min-w-[180px] max-w-[220px]">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full appearance-none bg-bg-input border border-border rounded-lg px-4 py-2.5 pr-10 text-sm text-white transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              aria-label="Filter by category"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button className="btn btn-ghost btn-size-sm" onClick={handleClearFilters} aria-label="Clear all filters">
              <Filter size={14} className="mr-1" aria-hidden="true" />
              Clear Filters
            </button>
          )}
        </div>
      </section>

      {/* Expenses Table */}
      <section className="card-variant-default card-padding-none rounded-xl border border-border overflow-hidden">
        <div className="table-wrap overflow-x-auto">
          <table className="table w-full border-collapse" role="table" aria-label="Expenses list">
            <thead>
              <tr>
                <th scope="col" className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted border-b border-border bg-bg">Category</th>
                <th scope="col" className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted border-b border-border bg-bg">Description</th>
                <th scope="col" className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted border-b border-border bg-bg">Date</th>
                <th scope="col" className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted border-b border-border bg-bg text-right">Amount</th>
                <th scope="col" className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted border-b border-border bg-bg text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-3 py-12 text-center">
                    <div className="loading flex flex-col items-center justify-center gap-3">
                      <div className="spinner" aria-hidden="true" />
                      <span className="text-muted">Loading expenses...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-12 text-center">
                    <div className="empty" role="status">
                      <Search size={36} aria-hidden="true" />
                      <p>No expenses found</p>
                      <button className="btn btn-primary btn-size-sm" onClick={onAddExpense} aria-label="Add an expense">
                        <Plus size={14} aria-hidden="true" /> Add Expense
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-bg transition-colors">
                    <td className="px-3 py-3 border-b border-border">
                      <span className="badge badge-primary">{exp.category}</span>
                    </td>
                    <td className="px-3 py-3 border-b border-border">
                      <p className="font-medium truncate max-w-[300px]">{exp.title}</p>
                      {exp.notes && <p className="list-item-meta truncate max-w-[300px]">{exp.notes}</p>}
                    </td>
                    <td className="px-3 py-3 border-b border-border text-dim">{formatDate(exp.date)}</td>
                    <td className="px-3 py-3 border-b border-border text-right font-semibold">{formatCurrency(exp.amount)}</td>
                    <td className="px-3 py-3 border-b border-border text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className="icon-btn"
                          onClick={() => onEditExpense(exp)}
                          aria-label={`Edit expense: ${exp.title}`}
                        >
                          <Edit3 size={15} aria-hidden="true" />
                        </button>
                        <button
                          className="icon-btn text-danger"
                          onClick={() => onDeleteExpense(exp.id)}
                          aria-label={`Delete expense: ${exp.title}`}
                        >
                          <Trash2 size={15} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}