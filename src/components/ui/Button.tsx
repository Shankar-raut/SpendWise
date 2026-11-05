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
    primary: 'btn-variant-primary hover:-translate-y-0.5',
    secondary: 'btn-variant-secondary',
    ghost: 'btn-variant-ghost',
    danger: 'btn-variant-danger',
    settle: 'btn-variant-settle'
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