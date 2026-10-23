import { useEffect, type ReactNode, type ForwardRefExoticComponent, type RefAttributes } from 'react';
import { X } from 'lucide-react';
import { IconButton } from './IconButton';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal = (({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  maxWidth = 'md'
}: ModalProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={`w-full ${maxWidthStyles[maxWidth]} bg-bg-card-solid border border-border rounded-xl shadow-xl animate-scale-up ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h3 id="modal-title" className="text-lg font-semibold">
            {title}
          </h3>
          <IconButton variant="default" size="md" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </IconButton>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}) as ForwardRefExoticComponent<ModalProps & RefAttributes<HTMLDivElement>>;

Modal.displayName = 'Modal';