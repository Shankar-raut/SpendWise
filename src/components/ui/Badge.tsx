import type { HTMLAttributes, ForwardRefExoticComponent, RefAttributes } from 'react';

export type BadgeVariant = 'default' | 'positive' | 'negative' | 'warning' | 'settled' | 'primary';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-white/10 text-text-secondary border border-border',
  positive: 'bg-positive-bg text-positive border-positive-border',
  negative: 'bg-warning-bg text-warning border-warning-border',
  warning: 'bg-warning-bg text-warning border-warning-border',
  settled: 'bg-white/5 text-text-muted border-border',
  primary: 'bg-primary-light text-primary border-primary/30'
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm'
};

export const Badge = (({
  variant = 'default',
  size = 'md',
  className = '',
  children,
  ...props
}: BadgeProps) => (
  <span
    className={`inline-flex items-center gap-1 font-medium rounded-full border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    {...props}
  >
    {children}
  </span>
)) as ForwardRefExoticComponent<BadgeProps & RefAttributes<HTMLSpanElement>>;

Badge.displayName = 'Badge';