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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Record Payment</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          {selectedDebt && (
            <div style={{ marginBottom: '16px', padding: '12px', borderRadius: 'var(--radius)', background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontWeight: 500 }}>{selectedDebt.title}</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>with {selectedDebt.friendName}</p>
              </div>
              <span className={`badge ${selectedDebt.direction === 'owes_me' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.75rem' }}>
                Remaining: {formatCurrency(selectedDebt.outstanding)}
              </span>
            </div>
          )}

          <div className="field">
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-dim)' }}>For which bill? *</label>
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
            >
              <option value={0}>Select a bill</option>
              {openDebts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.friendName} · {d.title} ({formatCurrency(d.outstanding)} remaining)
                </option>
              ))}
            </select>
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="payment-amount">How many rupees paid? (₹) *</label>
              <input id="payment-amount" type="number" min="0.01" max={selectedDebt?.outstanding || undefined} step="0.01" value={formData.amount || ''} onChange={(e) => handleChange('amount', Number(e.target.value))} required />
            </div>
            <div className="field">
              <label htmlFor="payment-date">Date Paid *</label>
              <input id="payment-date" type="date" value={formData.date} onChange={(e) => handleChange('date', e.target.value)} required />
            </div>
          </div>

          {selectedDebt && formData.amount !== selectedDebt.outstanding && (
            <button
              type="button"
              className="btn btn-secondary"
              style={{ borderStyle: 'dashed', width: '100%' }}
              onClick={() => setFormData((prev) => ({ ...prev, amount: selectedDebt.outstanding }))}
            >
              Pay Full Balance ({formatCurrency(selectedDebt.outstanding)})
            </button>
          )}

          <div className="field">
            <label htmlFor="payment-notes">Payment Note (optional)</label>
            <input id="payment-notes" type="text" placeholder="e.g. GPay, PhonePe, Cash, UPI" value={formData.notes} onChange={(e) => handleChange('notes', e.target.value)} />
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" type="button" onClick={onClose} disabled={isSubmitting}>Cancel</button>
            <button className="btn btn-primary" type="submit" disabled={isSubmitting}><CheckCircle2 size={16} /> Save Payment</button>
          </div>
        </form>
      </div>
    </div>
  );
}