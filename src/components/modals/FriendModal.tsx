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
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="friend-modal-title">
      <div className="modal max-w-[400px]" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 id="friend-modal-title" className="modal-title">Add Friend</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close modal"><X size={20} aria-hidden="true" /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="input-wrapper">
            <label htmlFor="friend-name" className="input-label">Friend Name <span className="text-danger" aria-hidden="true">*</span></label>
            <input
              id="friend-name"
              type="text"
              placeholder="e.g. Rahul, Priya, Amit"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
              autoFocus
              className="input-field"
            />
          </div>

          <div className="input-wrapper">
            <label htmlFor="friend-email" className="input-label">Email or Phone Number (optional)</label>
            <input
              id="friend-email"
              type="text"
              placeholder="e.g. 9876543210 or rahul@gmail.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="input-field"
            />
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary btn-size-md" type="button" onClick={onClose} disabled={isSubmitting}>Cancel</button>
            <button className="btn btn-primary btn-size-md" type="submit" disabled={isSubmitting}>
              <UserPlus size={16} aria-hidden="true" /> Save Friend
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}