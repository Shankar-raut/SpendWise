import type { HTMLAttributes, ForwardRefExoticComponent, RefAttributes } from 'react';

export type ProgressVariant = 'positive' | 'warning' | 'primary';

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  variant?: ProgressVariant;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const variantStyles: Record<ProgressVariant, string> = {
  positive: 'bg-positive',
  warning: 'bg-warning',
  primary: 'bg-primary'
};

const sizeStyles = {
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3'
};

export const ProgressBar = (({
  value,
  max = 100,
  variant = 'primary',
  size = 'md',
  showLabel = false,
  className = '',
  ...props
}: ProgressBarProps) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={`w-full ${className}`} {...props}>
      <div className={`w-full bg-white/10 rounded-full overflow-hidden ${sizeStyles[size]}`}>
        <div
          className={`${variantStyles[variant]} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={`Progress: ${Math.round(percentage)}%`}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1 text-xs text-text-muted">
          <span>{value}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
}) as ForwardRefExoticComponent<ProgressBarProps & RefAttributes<HTMLDivElement>>;

ProgressBar.displayName = 'ProgressBar';