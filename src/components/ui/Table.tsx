import type { HTMLAttributes, ForwardRefExoticComponent, RefAttributes, ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T, index: number) => ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string | number;
  isLoading?: boolean;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  rowClassName?: (row: T) => string;
  className?: string;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyMessage = 'No data found.',
  emptyIcon,
  rowClassName,
  className = ''
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-3 border-white/10 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-text-muted">
        {emptyIcon && <div className="mb-3 text-text-muted/50">{emptyIcon}</div>}
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto rounded-xl border border-border ${className}`}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-white/5 border-b border-border">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left font-medium text-xs uppercase tracking-wider text-text-muted ${col.headerClassName || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {data.map((row, rowIndex) => (
            <tr
              key={keyExtractor(row)}
              className={`hover:bg-white/5 transition-colors ${rowClassName?.(row) || ''}`}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-4 py-3 ${col.className || ''}`}
                >
                  {col.render ? col.render(row, rowIndex) : String((row as Record<string, unknown>)[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}