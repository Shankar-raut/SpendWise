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
    <div className={`chips-comp ${className}`}>
      {categories.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onSelect(c)}
          className={`chip-comp ${selected === c ? 'active' : ''}`}
        >
          {c}
        </button>
      ))}
      {children}
    </div>
  );
}