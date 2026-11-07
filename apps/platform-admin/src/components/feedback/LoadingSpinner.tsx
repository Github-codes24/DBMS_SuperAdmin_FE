import type { ReactNode } from 'react'
import './feedback.css'

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type SpinnerTone = 'primary' | 'white' | 'muted' | 'success' | 'danger'
export type SpinnerLabelPlacement = 'right' | 'bottom'

export interface LoadingSpinnerProps {
  size?: SpinnerSize
  tone?: SpinnerTone
  label?: ReactNode
  labelPlacement?: SpinnerLabelPlacement
  className?: string
  ariaLabel?: string
}

export function LoadingSpinner({
  size = 'md',
  tone = 'primary',
  label,
  labelPlacement = 'right',
  className = '',
  ariaLabel = 'Loading',
}: LoadingSpinnerProps) {
  const isColumn = labelPlacement === 'bottom'

  return (
    <div
      className={`app-spinner-wrap ${isColumn ? 'app-spinner-wrap--col' : ''} ${className}`}
      role="status"
      aria-label={ariaLabel}
    >
      <span
        className={`app-spinner app-spinner--${size} app-spinner--${tone}`}
        aria-hidden="true"
      />
      {label && <span className="app-spinner-label">{label}</span>}
      <span className="visually-hidden">{ariaLabel}</span>
    </div>
  )
}

