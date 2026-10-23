import type { ButtonHTMLAttributes, ForwardRefExoticComponent, RefAttributes } from 'react';
import { X, ChevronDown } from 'lucide-react';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'danger' | 'active';
  size?: 'sm' | 'md';
  children?: React.ReactNode;
  icon?: React.ReactNode;
}

export const IconButton = (({
  variant = 'default',
  size = 'md',
  children,
  icon,
  className = '',
  ...props
}: IconButtonProps) => {
  const baseStyles =
    'inline-flex items-center justify-center rounded transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-app';

  const variants = {
    default: 'text-text-secondary hover:text-white hover:bg-white/8',
    danger: 'text-text-secondary hover:text-danger hover:bg-danger-bg',
    active: 'text-primary bg-primary-light'
  };

  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10'
  };

  const content = icon ?? children ?? <X size={16} />;

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {content}
    </button>
  );
}) as ForwardRefExoticComponent<IconButtonProps & RefAttributes<HTMLButtonElement>>;

IconButton.displayName = 'IconButton';

export const ChevronDownIcon = () => <ChevronDown size={14} className="text-text-muted" />;