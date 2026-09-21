import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

export interface TableColumn<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
  onHeaderClick?: () => void
  className?: string
}

interface TableProps<T> {
  columns: TableColumn<T>[]
  rows: T[]
  rowKey: (row: T) => string
  onRowClick?: (row: T) => void
  emptyState?: ReactNode
}

/** Tabela densa e genérica: cabeçalho fixo, linha clicável, colunas configuráveis. */
export function Table<T>({ columns, rows, rowKey, onRowClick, emptyState }: TableProps<T>) {
  if (rows.length === 0 && emptyState) {
    return <>{emptyState}</>
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
      <table className="w-full min-w-full border-collapse text-sm">
        <thead className="sticky top-0 bg-[var(--color-surface)]">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={col.onHeaderClick}
                className={cn(
                  'border-b border-[var(--color-border)] px-3 py-2 text-left text-xs font-semibold text-[var(--color-text-secondary)]',
                  col.onHeaderClick && 'cursor-pointer select-none hover:text-[var(--color-text-primary)]',
                  col.className,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={() => onRowClick?.(row)}
              className={cn(
                'border-b border-[var(--color-border)] last:border-b-0',
                onRowClick && 'cursor-pointer hover:bg-[var(--color-surface-hover)]',
              )}
            >
              {columns.map((col) => (
                <td key={col.key} className={cn('px-3 py-2.5 text-[var(--color-text-primary)]', col.className)}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
