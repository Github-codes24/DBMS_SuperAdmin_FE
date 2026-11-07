import type { ReactNode } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import './feedback.css'

export interface ErrorStateProps {
  title?: ReactNode
  message?: ReactNode
  error?: Error | string
  onRetry?: () => void
  retryLabel?: string
  action?: ReactNode
  compact?: boolean
  className?: string
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  error,
  onRetry,
  retryLabel = 'Try Again',
  action,
  compact = false,
  className = '',
}: ErrorStateProps) {
  const displayMessage =
    message || (error instanceof Error ? error.message : typeof error === 'string' ? error : 'An unexpected error occurred while loading this section.')

  return (
    <div
      className={`app-error-state ${compact ? 'app-error-state--compact' : ''} ${className}`}
      role="alert"
    >
      <div className="app-error-state__icon-wrap">
        <AlertTriangle size={compact ? 20 : 26} strokeWidth={2} />
      </div>

      <div className="app-error-state__content">
        <h4 className="app-error-state__title">{title}</h4>
        {displayMessage && (
          <p className="app-error-state__message">{displayMessage}</p>
        )}
      </div>

      {(onRetry || action) && (
        <div className="app-error-state__actions">
          {onRetry && (
            <button
              type="button"
              className="app-error-state__retry-btn"
              onClick={onRetry}
            >
              <RotateCcw size={14} />
              <span>{retryLabel}</span>
            </button>
          )}
          {action}
        </div>
      )}
    </div>
  )
}

