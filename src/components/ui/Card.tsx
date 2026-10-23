import type { HTMLAttributes, ForwardRefExoticComponent, RefAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const variantStyles = {
  default: 'bg-bg-card border border-border',
  elevated: 'bg-bg-card shadow-lg',
  outlined: 'bg-transparent border-2 border-border'
};

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6'
};

export const Card = (({
  variant = 'default',
  padding = 'md',
  className = '',
  children,
  ...props
}: CardProps) => (
  <div
    className={`rounded-xl ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
    {...props}
  >
    {children}
  </div>
)) as ForwardRefExoticComponent<CardProps & RefAttributes<HTMLDivElement>>;

Card.displayName = 'Card';

export const CardHeader = (({
  className = '',
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={`flex items-center justify-between mb-4 ${className}`} {...props}>
    {children}
  </div>
)) as ForwardRefExoticComponent<HTMLAttributes<HTMLDivElement> & RefAttributes<HTMLDivElement>>;

CardHeader.displayName = 'CardHeader';

export const CardTitle = (({
  className = '',
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={`text-lg font-semibold ${className}`} {...props}>
    {children}
  </h3>
)) as ForwardRefExoticComponent<HTMLAttributes<HTMLHeadingElement> & RefAttributes<HTMLHeadingElement>>;

CardTitle.displayName = 'CardTitle';