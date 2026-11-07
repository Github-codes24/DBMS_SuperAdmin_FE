import type { ReactNode } from 'react'
import { SearchX, X } from 'lucide-react'
import './feedback.css'

export interface NoSearchResultsProps {
  query?: string
  onClearSearch?: () => void
  clearLabel?: string
  title?: ReactNode
  description?: ReactNode
  className?: string
}

export function NoSearchResults({
  query,
  onClearSearch,
  clearLabel = 'Clear search',
  title = 'No matching results',
  description,
  className = '',
}: NoSearchResultsProps) {
  return (
    <div className={`app-no-search-results ${className}`} role="status">
      <div className="app-no-search-results__icon">
        <SearchX size={26} strokeWidth={1.5} />
      </div>

      <h4 className="app-no-search-results__title">{title}</h4>

      <p className="app-no-search-results__description">
        {description || (
          <>
            No records matched your search query{' '}
            {query && <span className="app-no-search-results__query">"{query}"</span>}. Try
            checking your spelling or searching with different terms.
          </>
        )}
      </p>

      {onClearSearch && (
        <button
          type="button"
          className="app-no-search-results__clear-btn"
          onClick={onClearSearch}
        >
          <X size={14} />
          <span>{clearLabel}</span>
        </button>
      )}
    </div>
  )
}

