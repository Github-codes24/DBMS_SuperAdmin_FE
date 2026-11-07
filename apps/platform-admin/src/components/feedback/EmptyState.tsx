import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'
import './feedback.css'

export type EmptyStateSize = 'sm' | 'md' | 'lg'

export interface EmptyStateProps {
  icon?: ReactNode
  title?: ReactNode
  description?: ReactNode
  action?: ReactNode
  secondaryAction?: ReactNode
  size?: EmptyStateSize
  className?: string
}

export function EmptyState({
  icon,
  title = 'No data available',
  description = 'There are no records to display at this time.',
  action,
  secondaryAction,
  size = 'md',
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`app-empty-state app-empty-state--${size} ${className}`} role="status">
      <div className="app-empty-state__icon-wrap">
        {icon || <Inbox size={size === 'sm' ? 22 : 28} strokeWidth={1.5} />}
      </div>

      <h3 className="app-empty-state__title">{title}</h3>

      {description && (
        <p className="app-empty-state__description">{description}</p>
      )}

      {(action || secondaryAction) && (
        <div className="app-empty-state__actions">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  )
}
