import type { ReactNode } from 'react'
import { Filter, RotateCcw, Check } from 'lucide-react'
import './dataDisplay.css'

export interface FilterPanelProps {
  isOpen?: boolean
  onToggle?: () => void
  onApply?: () => void
  onReset?: () => void
  activeFiltersCount?: number
  title?: string
  children: ReactNode
  className?: string
  applyLabel?: string
  resetLabel?: string
  isApplying?: boolean
}

export function FilterPanel({
  isOpen = true,
  onApply,
  onReset,
  activeFiltersCount = 0,
  title = 'Filters',
  children,
  className = '',
  applyLabel = 'Apply Filters',
  resetLabel = 'Reset All',
  isApplying = false,
}: FilterPanelProps) {
  if (!isOpen) return null

  return (
    <div className={`app-filter-panel ${className}`}>
      <div className="app-filter-panel__header">
        <div className="app-filter-panel__title">
          <Filter size={16} color="var(--color-primary, #f96321)" aria-hidden="true" />
          <span>{title}</span>
          {activeFiltersCount > 0 && (
            <span className="app-filter-panel__count" title={`${activeFiltersCount} filters active`}>
              {activeFiltersCount}
            </span>
          )}
        </div>

        {onReset && (
          <button
            type="button"
            className="app-pagination__btn"
            onClick={onReset}
            style={{ padding: '4px 10px', fontSize: '0.78rem', gap: '4px' }}
          >
            <RotateCcw size={12} />
            <span>{resetLabel}</span>
          </button>
        )}
      </div>

      <div className="app-filter-panel__grid">{children}</div>

      {(onApply || onReset) && (
        <div className="app-filter-panel__actions">
          {onReset && (
            <button
              type="button"
              className="projects-button projects-button--secondary"
              onClick={onReset}
              style={{ padding: '6px 14px', fontSize: '0.825rem' }}
            >
              {resetLabel}
            </button>
          )}

          {onApply && (
            <button
              type="button"
              className="projects-button projects-button--primary"
              onClick={onApply}
              disabled={isApplying}
              style={{
                padding: '6px 16px',
                fontSize: '0.825rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Check size={14} />
              <span>{isApplying ? 'Applying...' : applyLabel}</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}

