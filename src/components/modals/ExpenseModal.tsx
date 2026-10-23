import { useEffect, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import type { ExpensePayload } from '../../types';
import { CATEGORIES, getTodayISO } from '../../utils/format';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ExpensePayload) => void;
  initialData?: Partial<ExpensePayload>;
  isEditing?: boolean;
  isSubmitting?: boolean;
}

const emptyExpense: ExpensePayload = {
  title: '',
  amount: 0,
  category: 'Food',
  date: getTodayISO(),
  notes: ''
};

export function ExpenseModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false,
  isSubmitting = false
}: ExpenseModalProps) {
  const [formData, setFormData] = useState<ExpensePayload>(() => ({
    ...emptyExpense,
    ...initialData
  }));

  useEffect(() => {
    setFormData({ ...emptyExpense, ...initialData });
  }, [initialData, isEditing]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    if (Number(formData.amount) <= 0) return;
    onSubmit(formData);
  };

  const handleChange = (field: keyof ExpensePayload, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{isEditing ? 'Edit Expense' : 'Add My Expense'}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="field">
            <label htmlFor="expense-title">What did you spend on? *</label>
            <input id="expense-title" type="text" placeholder="e.g. Lunch, Groceries, Petrol, Coffee" value={formData.title} onChange={(e) => handleChange('title', e.target.value)} required autoFocus />
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="expense-amount">Amount (₹) *</label>
              <input id="expense-amount" type="number" min="0.01" step="0.01" placeholder="Rupees" value={formData.amount || ''} onChange={(e) => handleChange('amount', Number(e.target.value))} required />
            </div>
            <div className="field">
              <label htmlFor="expense-date">Date *</label>
              <input id="expense-date" type="date" value={formData.date} onChange={(e) => handleChange('date', e.target.value)} required />
            </div>
          </div>

          <div className="field">
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-dim)' }}>Category *</label>
            <div className="chips">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`chip ${formData.category === c ? 'active' : ''}`}
                  onClick={() => handleChange('category', c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label htmlFor="expense-notes">Note (optional)</label>
            <input id="expense-notes" type="text" placeholder="Any details or payment mode..." value={formData.notes} onChange={(e) => handleChange('notes', e.target.value)} />
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" type="button" onClick={onClose} disabled={isSubmitting}>Cancel</button>
            <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
              {isEditing ? 'Save Changes' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}