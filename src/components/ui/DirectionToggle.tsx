import type { ReactNode } from 'react';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export type DebtDirection = 'owes_me' | 'i_owe';

export interface DirectionToggleProps {
  value: DebtDirection;
  onChange: (direction: DebtDirection) => void;
  className?: string;
}

export function DirectionToggle({ value, onChange, className = '' }: DirectionToggleProps) {
  const options: { value: DebtDirection; icon: ReactNode; label: string }[] = [
    { value: 'owes_me', icon: <ArrowDownLeft size={16} />, label: 'I paid (Friend will pay me back)' },
    { value: 'i_owe', icon: <ArrowUpRight size={16} />, label: 'Friend paid (I will pay him back)' }
  ];

  return (
    <div className={`grid grid-cols-2 gap-2 ${className}`}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium border transition-all duration-150
            ${
              value === opt.value
                ? opt.value === 'owes_me'
                  ? 'bg-positive-bg border-positive-border text-positive'
                  : 'bg-warning-bg border-warning-border text-warning'
                : 'bg-white/3 border-border text-text-secondary hover:bg-white/5'
            }`}
        >
          {opt.icon} {opt.label}
        </button>
      ))}
    </div>
  );
}