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
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="expense-modal-title">
      <div className="modal max-w-[480px]" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 id="expense-modal-title" className="modal-title">{isEditing ? 'Edit Expense' : 'Add My Expense'}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close modal"><X size={20} aria-hidden="true" /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="input-wrapper">
            <label htmlFor="expense-title" className="input-label">What did you spend on? <span className="text-danger" aria-hidden="true">*</span></label>
            <input
              id="expense-title"
              type="text"
              placeholder="e.g. Lunch, Groceries, Petrol, Coffee"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
              autoFocus
              className="input-field"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="input-wrapper flex-1">
              <label htmlFor="expense-amount" className="input-label">Amount (₹) <span className="text-danger" aria-hidden="true">*</span></label>
              <input
                id="expense-amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Rupees"
                value={formData.amount || ''}
                onChange={(e) => handleChange('amount', Number(e.target.value))}
                required
                className="input-field"
              />
            </div>
            <div className="input-wrapper flex-1">
              <label htmlFor="expense-date" className="input-label">Date <span className="text-danger" aria-hidden="true">*</span></label>
              <input
                id="expense-date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                required
                className="input-field"
              />
            </div>
          </div>

          <div className="input-wrapper">
            <label className="input-label">Category <span className="text-danger" aria-hidden="true">*</span></label>
            <div className="chips-comp" role="radiogroup" aria-label="Select category">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={formData.category === c}
                  className={`chip-comp ${formData.category === c ? 'active' : ''}`}
                  onClick={() => handleChange('category', c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="input-wrapper">
            <label htmlFor="expense-notes" className="input-label">Note (optional)</label>
            <input
              id="expense-notes"
              type="text"
              placeholder="Any details or payment mode..."
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="input-field"
            />
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary btn-size-md" type="button" onClick={onClose} disabled={isSubmitting}>Cancel</button>
            <button className="btn btn-primary btn-size-md" type="submit" disabled={isSubmitting}>
              {isEditing ? 'Save Changes' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}