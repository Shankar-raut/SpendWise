import type { InputHTMLAttributes, ForwardRefExoticComponent, RefAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = (({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}: InputProps) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-text-secondary mb-1.5">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full bg-bg-input border rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-text-muted transition-colors
          ${error ? 'border-danger focus:border-danger focus:ring-1 focus:ring-danger' : 'border-border focus:border-primary focus:ring-1 focus:ring-primary'}
          ${className}`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="mt-1.5 text-sm text-danger" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${inputId}-helper`} className="mt-1.5 text-sm text-text-muted">
          {helperText}
        </p>
      )}
    </div>
  );
}) as ForwardRefExoticComponent<InputProps & RefAttributes<HTMLInputElement>>;

Input.displayName = 'Input';