import type { ButtonHTMLAttributes, ForwardRefExoticComponent, RefAttributes, ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'settle';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: ReactNode;
}

export const Button = (({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  children,
  icon,
  className = '',
  ...props
}: ButtonProps) => {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-app';

  const variants = {
    primary: 'bg-primary text-white shadow-[0_2px_8px_rgba(99,102,241,0.3)] hover:bg-primary-hover hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed',
    secondary: 'bg-white/6 text-white border border-border hover:bg-white/10 hover:border-white/18 disabled:opacity-50 disabled:cursor-not-allowed',
    ghost: 'bg-transparent border border-border text-text-secondary hover:bg-white/5 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed',
    danger: 'bg-danger-bg border border-danger-border text-danger hover:bg-danger-bg/80 disabled:opacity-50 disabled:cursor-not-allowed',
    settle: 'bg-positive-bg border border-positive-border text-positive hover:bg-positive-bg/80 disabled:opacity-50 disabled:cursor-not-allowed'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Loading...
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  );
}) as ForwardRefExoticComponent<ButtonProps & RefAttributes<HTMLButtonElement>>;

Button.displayName = 'Button';