import { SkeletonLoader } from './SkeletonLoader'
import './feedback.css'

export interface TableSkeletonProps {
  rows?: number
  columns?: number
  hasHeader?: boolean
  hasSelection?: boolean
  hasActions?: boolean
  className?: string
  compact?: boolean
}

export interface TableSkeletonRowsProps {
  rows?: number
  columns?: number
  hasSelection?: boolean
  hasActions?: boolean
}

/**
 * Renders only `<tr>` rows for embedding directly inside an existing `<tbody>`
 */
export function TableSkeletonRows({
  rows = 5,
  columns = 5,
  hasSelection = false,
  hasActions = false,
}: TableSkeletonRowsProps) {
  // Staggered column widths for realistic data variation
  const widths = ['35%', '65%', '50%', '40%', '75%', '45%']

  return (
    <>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <tr key={rIdx}>
          {hasSelection && (
            <td style={{ width: 40, textAlign: 'center' }}>
              <SkeletonLoader variant="rounded" width={16} height={16} />
            </td>
          )}
          {Array.from({ length: columns }).map((_, cIdx) => (
            <td key={cIdx}>
              <SkeletonLoader
                variant="text"
                width={widths[cIdx % widths.length]}
                height={16}
              />
            </td>
          ))}
          {hasActions && (
            <td style={{ textAlign: 'right', width: 90 }}>
              <div style={{ display: 'inline-flex', gap: 6, justifyContent: 'flex-end' }}>
                <SkeletonLoader variant="rounded" width={26} height={26} />
                <SkeletonLoader variant="rounded" width={26} height={26} />
              </div>
            </td>
          )}
        </tr>
      ))}
    </>
  )
}

/**
 * Standalone table skeleton with wrapper and optional header
 */
export function TableSkeleton({
  rows = 5,
  columns = 5,
  hasHeader = true,
  hasSelection = false,
  hasActions = false,
  className = '',
  compact = false,
}: TableSkeletonProps) {
  return (
    <div className={`app-table-skeleton-wrap ${className}`}>
      <table className={`app-table-skeleton ${compact ? 'app-table-skeleton--compact' : ''}`}>
        {hasHeader && (
          <thead>
            <tr>
              {hasSelection && (
                <th style={{ width: 40, textAlign: 'center' }}>
                  <SkeletonLoader variant="rounded" width={16} height={16} />
                </th>
              )}
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i}>
                  <SkeletonLoader variant="text" width="60%" height={14} />
                </th>
              ))}
              {hasActions && (
                <th style={{ width: 90, textAlign: 'right' }}>
                  <SkeletonLoader variant="text" width="50%" height={14} />
                </th>
              )}
            </tr>
          </thead>
        )}
        <tbody>
          <TableSkeletonRows
            rows={rows}
            columns={columns}
            hasSelection={hasSelection}
            hasActions={hasActions}
          />
        </tbody>
      </table>
    </div>
  )
}
