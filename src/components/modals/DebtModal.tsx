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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{isEditing ? 'Edit Bill / Split' : 'Add Bill / Split With Friend'}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="field">
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-dim)' }}>Select Friend *</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ flex: 1 }}>
                <select
                  value={formData.friendId}
                  onChange={(e) => handleChange('friendId', Number(e.target.value))}
                  required
                >
                  <option value={0}>-- Choose Friend --</option>
                  {friends.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
              {onAddFriend && (
                <button className="btn btn-secondary btn-sm" type="button" onClick={onAddFriend}><UserPlus size={14} /> + New Friend</button>
              )}
            </div>
          </div>

          <div className="field">
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-dim)' }}>Who paid the bill? *</label>
            <div className="dir-toggle">
              <button
                type="button"
                className={`dir-btn ${formData.direction === 'owes_me' ? 'active-owe' : ''}`}
                onClick={() => handleChange('direction', 'owes_me')}
              >
                <ArrowDownLeft size={14} /> Friend owes me
              </button>
              <button
                type="button"
                className={`dir-btn ${formData.direction === 'i_owe' ? 'active-owed' : ''}`}
                onClick={() => handleChange('direction', 'i_owe')}
              >
                <ArrowUpRight size={14} /> I owe friend
              </button>
            </div>
          </div>

          <div className="field">
            <label htmlFor="debt-title">What was this bill for? *</label>
            <input id="debt-title" type="text" placeholder="e.g. Dinner, Uber ride, Movie tickets, Grocery share" value={formData.title} onChange={(e) => handleChange('title', e.target.value)} required />
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="debt-amount">Amount (₹) *</label>
              <input id="debt-amount" type="number" min="0.01" step="0.01" placeholder="Rupees" value={formData.amount || ''} onChange={(e) => handleChange('amount', Number(e.target.value))} required />
            </div>
            <div className="field">
              <label htmlFor="debt-date">Date *</label>
              <input id="debt-date" type="date" value={formData.date} onChange={(e) => handleChange('date', e.target.value)} required />
            </div>
          </div>

          <div className="field">
            <label htmlFor="debt-notes">Note (optional)</label>
            <input id="debt-notes" type="text" placeholder="Any details..." value={formData.notes} onChange={(e) => handleChange('notes', e.target.value)} />
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" type="button" onClick={onClose} disabled={isSubmitting}>Cancel</button>
            <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
              {isEditing ? 'Save Changes' : 'Save Split'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}