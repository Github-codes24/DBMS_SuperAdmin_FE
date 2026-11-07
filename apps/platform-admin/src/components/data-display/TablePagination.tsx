import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import './dataDisplay.css'

export interface TablePaginationProps {
  currentPage: number
  totalPages: number
  totalItems?: number
  pageSize?: number
  pageSizeOptions?: number[]
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  disabled?: boolean
  itemLabel?: string
  className?: string
  showFirstLast?: boolean
}

export function TablePagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  pageSizeOptions = [10, 25, 50, 100],
  onPageChange,
  onPageSizeChange,
  disabled = false,
  itemLabel = 'records',
  className = '',
  showFirstLast = true,
}: TablePaginationProps) {
  const safeTotalPages = Math.max(1, totalPages)
  const isFirstPage = currentPage <= 1
  const isLastPage = currentPage >= safeTotalPages

  // Calculate items range if totalItems and pageSize provided
  let itemsRangeText = ''
  if (totalItems !== undefined && pageSize !== undefined) {
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
    const endItem = Math.min(currentPage * pageSize, totalItems)
    itemsRangeText = `Showing ${startItem.toLocaleString()}–${endItem.toLocaleString()} of ${totalItems.toLocaleString()} ${itemLabel}`
  } else if (totalItems !== undefined) {
    itemsRangeText = `Total: ${totalItems.toLocaleString()} ${itemLabel}`
  }

  return (
    <div className={`app-pagination ${className}`}>
      <div className="app-pagination__info">
        {itemsRangeText ? (
          <span>{itemsRangeText}</span>
        ) : (
          <span>
            Page <strong>{currentPage}</strong> of <strong>{safeTotalPages}</strong>
          </span>
        )}
      </div>

      <div className="app-pagination__controls">
        {onPageSizeChange && pageSize && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Rows:</span>
            <select
              className="app-pagination__size-select"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              disabled={disabled}
              aria-label="Select rows per page"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="app-pagination__btn-group">
          {showFirstLast && (
            <button
              type="button"
              className="app-pagination__btn"
              onClick={() => onPageChange(1)}
              disabled={disabled || isFirstPage}
              title="First page"
              aria-label="First page"
            >
              <ChevronsLeft size={14} />
            </button>
          )}

          <button
            type="button"
            className="app-pagination__btn"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={disabled || isFirstPage}
            title="Previous page"
            aria-label="Previous page"
          >
            <ChevronLeft size={14} />
          </button>

          <span style={{ padding: '0 6px', fontWeight: 600 }}>
            {currentPage} / {safeTotalPages}
          </span>

          <button
            type="button"
            className="app-pagination__btn"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={disabled || isLastPage}
            title="Next page"
            aria-label="Next page"
          >
            <ChevronRight size={14} />
          </button>

          {showFirstLast && (
            <button
              type="button"
              className="app-pagination__btn"
              onClick={() => onPageChange(safeTotalPages)}
              disabled={disabled || isLastPage}
              title="Last page"
              aria-label="Last page"
            >
              <ChevronsRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

