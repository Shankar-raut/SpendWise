import type { ReactNode } from 'react';

export interface CategoryChipsProps {
  categories: readonly string[];
  selected: string;
  onSelect: (category: string) => void;
  className?: string;
  children?: ReactNode;
}

export function CategoryChips({
  categories,
  selected,
  onSelect,
  className = '',
  children
}: CategoryChipsProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {categories.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onSelect(c)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 border
            ${
              selected === c
                ? 'bg-primary border-primary text-white shadow-[0_2px_6px_rgba(99,102,241,0.35)]'
                : 'bg-white/5 border-border text-text-secondary hover:bg-white/10 hover:text-white'
            }`}
        >
          {c}
        </button>
      ))}
      {children}
    </div>
  );
}