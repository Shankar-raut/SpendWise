import { useEffect, useState, type FormEvent } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import type { Debt } from '../../types';
import { formatCurrency, getTodayISO } from '../../utils/format';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { debtId: number; amount: number; date: string; notes: string }) => void;
  debts: Debt[];
  initialDebtId?: number;
  isSubmitting?: boolean;
}

export function PaymentModal({
  isOpen,
  onClose,
  onSubmit,
  debts,
  initialDebtId,
  isSubmitting = false
}: PaymentModalProps) {
  const [formData, setFormData] = useState<{
    debtId: number;
    amount: number;
    date: string;
    notes: string;
  }>({
    debtId: initialDebtId || 0,
    amount: 0,
    date: getTodayISO(),
    notes: ''
  });

  const selectedDebt = debts.find((d) => d.id === formData.debtId);

  useEffect(() => {
    if (initialDebtId) {
      const debt = debts.find((d) => d.id === initialDebtId);
      setFormData({
        debtId: initialDebtId,
        amount: debt?.outstanding || 0,
        date: getTodayISO(),
        notes: ''
      });
    }
  }, [initialDebtId, debts]);

  useEffect(() => {
    if (selectedDebt && formData.amount !== selectedDebt.outstanding) {
      setFormData((prev) => ({ ...prev, amount: selectedDebt.outstanding }));
    }
  }, [selectedDebt]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.debtId) return;
    if (Number(formData.amount) <= 0) return;
    if (selectedDebt && Number(formData.amount) > selectedDebt.outstanding) return;
    onSubmit(formData);
  };

  const handleChange = (field: 'debtId' | 'amount' | 'date' | 'notes', value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const openDebts = debts.filter((d) => d.outstanding > 0);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="payment-modal-title">
      <div className="modal max-w-[480px]" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 id="payment-modal-title" className="modal-title">Record Payment</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close modal"><X size={20} aria-hidden="true" /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          {selectedDebt && (
            <div className="mb-4 p-3 rounded-lg bg-bg border border-border flex items-center justify-between" role="status" aria-live="polite">
              <div>
                <p className="font-medium">{selectedDebt.title}</p>
                <p className="text-sm text-muted">with {selectedDebt.friendName}</p>
              </div>
              <span className={`badge ${selectedDebt.direction === 'owes_me' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.75rem' }}>
                Remaining: {formatCurrency(selectedDebt.outstanding)}
              </span>
            </div>
          )}

          <div className="input-wrapper">
            <label className="input-label">For which bill? <span className="text-danger" aria-hidden="true">*</span></label>
            <select
              value={formData.debtId}
              onChange={(e) => {
                const id = Number(e.target.value);
                const debt = debts.find((d) => d.id === id);
                setFormData((prev) => ({
                  ...prev,
                  debtId: id,
                  amount: debt ? debt.outstanding : 0
                }));
              }}
              required
              className="select-field"
              aria-label="Select bill"
            >
              <option value={0}>Select a bill</option>
              {openDebts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.friendName} · {d.title} ({formatCurrency(d.outstanding)} remaining)
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="input-wrapper flex-1">
              <label htmlFor="payment-amount" className="input-label">How many rupees paid? (₹) <span className="text-danger" aria-hidden="true">*</span></label>
              <input
                id="payment-amount"
                type="number"
                min="0.01"
                max={selectedDebt?.outstanding || undefined}
                step="0.01"
                value={formData.amount || ''}
                onChange={(e) => handleChange('amount', Number(e.target.value))}
                required
                className="input-field"
              />
            </div>
            <div className="input-wrapper flex-1">
              <label htmlFor="payment-date" className="input-label">Date Paid <span className="text-danger" aria-hidden="true">*</span></label>
              <input
                id="payment-date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                required
                className="input-field"
              />
            </div>
          </div>

          {selectedDebt && formData.amount !== selectedDebt.outstanding && (
            <button
              type="button"
              className="btn btn-secondary w-full border-dashed"
              onClick={() => setFormData((prev) => ({ ...prev, amount: selectedDebt.outstanding }))}
            >
              Pay Full Balance ({formatCurrency(selectedDebt.outstanding)})
            </button>
          )}

          <div className="input-wrapper">
            <label htmlFor="payment-notes" className="input-label">Payment Note (optional)</label>
            <input
              id="payment-notes"
              type="text"
              placeholder="e.g. GPay, PhonePe, Cash, UPI"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="input-field"
            />
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary btn-size-md" type="button" onClick={onClose} disabled={isSubmitting}>Cancel</button>
            <button className="btn btn-primary btn-size-md" type="submit" disabled={isSubmitting}>
              <CheckCircle2 size={16} aria-hidden="true" /> Save Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}