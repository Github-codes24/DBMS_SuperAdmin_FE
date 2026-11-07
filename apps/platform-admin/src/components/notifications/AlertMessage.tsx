import { useState, type ReactNode } from 'react'
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'
import './notifications.css'

export type AlertType = 'success' | 'error' | 'warning' | 'info'

export interface AlertMessageProps {
  type?: AlertType
  variant?: AlertType
  title?: string
  description?: ReactNode
  message?: ReactNode
  children?: ReactNode
  icon?: ReactNode
  action?: ReactNode
  dismissible?: boolean
  onClose?: () => void
  className?: string
}

export function AlertMessage({
  type,
  variant,
  title,
  description,
  message,
  children,
  icon,
  action,
  dismissible = false,
  onClose,
  className = '',
}: AlertMessageProps) {
  const [isDismissed, setIsDismissed] = useState(false)

  if (isDismissed) return null

  const alertType = variant ?? type ?? 'info'
  const isDismissible = dismissible || Boolean(onClose)

  const handleClose = () => {
    setIsDismissed(true)
    onClose?.()
  }

  const renderIcon = () => {
    if (icon !== undefined) return icon
    switch (alertType) {
      case 'success':
        return <CheckCircle2 size={18} className="app-alert-icon" aria-hidden="true" />
      case 'error':
        return <AlertCircle size={18} className="app-alert-icon" aria-hidden="true" />
      case 'warning':
        return <AlertTriangle size={18} className="app-alert-icon" aria-hidden="true" />
      case 'info':
      default:
        return <Info size={18} className="app-alert-icon" aria-hidden="true" />
    }
  }

  const bodyContent = children || message || description

  return (
    <div
      className={`app-alert app-alert--${alertType} ${className}`}
      role={alertType === 'error' ? 'alert' : 'status'}
    >
      {renderIcon()}
      <div className="app-alert-content">
        {title && <h4 className="app-alert-title">{title}</h4>}
        {bodyContent && <div className="app-alert-desc">{bodyContent}</div>}
      </div>
      {action && <div className="app-alert-action">{action}</div>}
      {isDismissible && (
        <button
          type="button"
          className="app-alert-close"
          onClick={handleClose}
          aria-label="Dismiss alert"
        >
          <X size={15} />
        </button>
      )}
    </div>
  )
}

export default AlertMessage

