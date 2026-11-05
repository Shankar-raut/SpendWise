import { useEffect, useState, type FormEvent } from 'react';
import { ArrowDownLeft, ArrowUpRight, X, UserPlus } from 'lucide-react';
import type { DebtPayload, Friend } from '../../types';
import { getTodayISO } from '../../utils/format';

interface DebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DebtPayload) => void;
  friends: Friend[];
  initialData?: Partial<DebtPayload>;
  isEditing?: boolean;
  isSubmitting?: boolean;
  onAddFriend?: () => void;
}

const emptyDebt: DebtPayload = {
  friendId: 0,
  title: '',
  amount: 0,
  direction: 'owes_me',
  date: getTodayISO(),
  notes: ''
};

export function DebtModal({
  isOpen,
  onClose,
  onSubmit,
  friends,
  initialData,
  isEditing = false,
  isSubmitting = false,
  onAddFriend
}: DebtModalProps) {
  const [formData, setFormData] = useState<DebtPayload>(() => ({
    ...emptyDebt,
    ...initialData,
    friendId: initialData?.friendId || friends[0]?.id || 0
  }));

  useEffect(() => {
    setFormData({
      ...emptyDebt,
      ...initialData,
      friendId: initialData?.friendId || friends[0]?.id || 0
    });
  }, [initialData, isEditing, friends]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.friendId) return;
    if (!formData.title.trim()) return;
    if (Number(formData.amount) <= 0) return;
    onSubmit(formData);
  };

  const handleChange = (field: keyof DebtPayload, value: string | number) => {
    setFormData((prev: DebtPayload) => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="debt-modal-title">
      <div className="modal max-w-[480px]" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 id="debt-modal-title" className="modal-title">{isEditing ? 'Edit Bill / Split' : 'Add Bill / Split With Friend'}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close modal"><X size={20} aria-hidden="true" /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="input-wrapper">
            <label className="input-label">Select Friend <span className="text-danger" aria-hidden="true">*</span></label>
            <div className="flex gap-2">
              <div className="flex-1">
                <select
                  value={formData.friendId}
                  onChange={(e) => handleChange('friendId', Number(e.target.value))}
                  required
                  className="select-field"
                  aria-label="Select friend"
                >
                  <option value={0}>-- Choose Friend --</option>
                  {friends.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
              {onAddFriend && (
                <button className="btn btn-secondary btn-size-sm" type="button" onClick={onAddFriend} aria-label="Add a new friend">
                  <UserPlus size={14} aria-hidden="true" /> + New Friend
                </button>
              )}
            </div>
          </div>

          <div className="input-wrapper">
            <label className="input-label">Who paid the bill? <span className="text-danger" aria-hidden="true">*</span></label>
            <div className="dir-toggle" role="radiogroup" aria-label="Payment direction">
              <button
                type="button"
                role="radio"
                aria-checked={formData.direction === 'owes_me'}
                className={`dir-btn ${formData.direction === 'owes_me' ? 'active-owe' : ''}`}
                onClick={() => handleChange('direction', 'owes_me')}
              >
                <ArrowDownLeft size={14} aria-hidden="true" /> Friend owes me
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={formData.direction === 'i_owe'}
                className={`dir-btn ${formData.direction === 'i_owe' ? 'active-owed' : ''}`}
                onClick={() => handleChange('direction', 'i_owe')}
              >
                <ArrowUpRight size={14} aria-hidden="true" /> I owe friend
              </button>
            </div>
          </div>

          <div className="input-wrapper">
            <label htmlFor="debt-title" className="input-label">What was this bill for? <span className="text-danger" aria-hidden="true">*</span></label>
            <input
              id="debt-title"
              type="text"
              placeholder="e.g. Dinner, Uber ride, Movie tickets, Grocery share"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
              className="input-field"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="input-wrapper flex-1">
              <label htmlFor="debt-amount" className="input-label">Amount (₹) <span className="text-danger" aria-hidden="true">*</span></label>
              <input
                id="debt-amount"
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
              <label htmlFor="debt-date" className="input-label">Date <span className="text-danger" aria-hidden="true">*</span></label>
              <input
                id="debt-date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                required
                className="input-field"
              />
            </div>
          </div>

          <div className="input-wrapper">
            <label htmlFor="debt-notes" className="input-label">Note (optional)</label>
            <input
              id="debt-notes"
              type="text"
              placeholder="Any details..."
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="input-field"
            />
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary btn-size-md" type="button" onClick={onClose} disabled={isSubmitting}>Cancel</button>
            <button className="btn btn-primary btn-size-md" type="submit" disabled={isSubmitting}>
              {isEditing ? 'Save Changes' : 'Save Split'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}