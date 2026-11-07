import type { ReactNode } from 'react'
import { LoadingSpinner, type SpinnerSize, type SpinnerTone } from './LoadingSpinner'
import './feedback.css'

export interface FullPageLoaderProps {
  title?: ReactNode
  subtitle?: ReactNode
  spinnerSize?: SpinnerSize
  spinnerTone?: SpinnerTone
  isContainer?: boolean
  className?: string
}

export function FullPageLoader({
  title = 'Loading...',
  subtitle = 'Please wait while we fetch the latest data.',
  spinnerSize = 'lg',
  spinnerTone = 'primary',
  isContainer = false,
  className = '',
}: FullPageLoaderProps) {
  return (
    <div
      className={`app-fullpage-loader ${isContainer ? 'app-fullpage-loader--container' : ''} ${className}`}
      role="alert"
      aria-busy="true"
    >
      <div className="app-fullpage-loader__card">
        <LoadingSpinner size={spinnerSize} tone={spinnerTone} />
        {title && <h3 className="app-fullpage-loader__title">{title}</h3>}
        {subtitle && <p className="app-fullpage-loader__subtitle">{subtitle}</p>}
      </div>
    </div>
  )
}

