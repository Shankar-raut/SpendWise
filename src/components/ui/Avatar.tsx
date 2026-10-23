import type { HTMLAttributes, ForwardRefExoticComponent, RefAttributes } from 'react';

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeStyles = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl'
};

export const Avatar = (({
  name,
  size = 'md',
  className = '',
  ...props
}: AvatarProps) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full border border-border bg-gradient-to-br from-slate-700 to-slate-900 ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {initials}
    </div>
  );
}) as ForwardRefExoticComponent<AvatarProps & RefAttributes<HTMLDivElement>>;

Avatar.displayName = 'Avatar';