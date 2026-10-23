import type { SelectHTMLAttributes, ForwardRefExoticComponent, RefAttributes } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = (({
  label,
  error,
  options,
  placeholder,
  className = '',
  id,
  children,
  ...props
}: SelectProps) => {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-text-secondary mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={`w-full appearance-none bg-bg-input border rounded-lg px-4 py-2.5 pr-10 text-sm text-white transition-colors
            ${error ? 'border-danger focus:border-danger focus:ring-1 focus:ring-danger' : 'border-border focus:border-primary focus:ring-1 focus:ring-primary'}
            ${className}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${selectId}-error` : undefined}
          {...props}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={14} />
      </div>
      {error && (
        <p id={`${selectId}-error`} className="mt-1.5 text-sm text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}) as ForwardRefExoticComponent<SelectProps & RefAttributes<HTMLSelectElement>>;

Select.displayName = 'Select';