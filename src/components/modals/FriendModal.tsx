import { useEffect, useState, type FormEvent } from 'react';
import { X, UserPlus } from 'lucide-react';

interface FriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; email: string }) => void;
  isSubmitting?: boolean;
}

export function FriendModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false
}: FriendModalProps) {
  const [formData, setFormData] = useState({ name: '', email: '' });

  useEffect(() => {
    setFormData({ name: '', email: '' });
  }, [isOpen]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSubmit(formData);
  };

  const handleChange = (field: 'name' | 'email', value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Add Friend</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="field">
            <label htmlFor="friend-name">Friend Name *</label>
            <input id="friend-name" type="text" placeholder="e.g. Rahul, Priya, Amit" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} required autoFocus />
          </div>

          <div className="field">
            <label htmlFor="friend-email">Email or Phone Number (optional)</label>
            <input id="friend-email" type="text" placeholder="e.g. 9876543210 or rahul@gmail.com" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} />
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" type="button" onClick={onClose} disabled={isSubmitting}>Cancel</button>
            <button className="btn btn-primary" type="submit" disabled={isSubmitting}><UserPlus size={16} /> Save Friend</button>
          </div>
        </form>
      </div>
    </div>
  );
}