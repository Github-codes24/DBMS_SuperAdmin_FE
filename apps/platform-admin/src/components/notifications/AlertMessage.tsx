import { useState, useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
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
  /**
   * Whether to render the alert as a floating popup overlay at top-right.
   * Defaults to true. Pass false to render inline within page layout.
   */
  overlay?: boolean
  /**
   * Whether to auto-dismiss the alert after `duration` ms.
   * Defaults to true when overlay is true; defaults to false when overlay is false.
   */
  autoDismiss?: boolean
  /**
   * Auto-dismiss duration in milliseconds. Defaults to 3000ms.
   */
  duration?: number
}

function getOrCreateAlertContainer(): HTMLElement {
  let container = document.getElementById('app-alert-overlay-container')
  if (!container) {
    container = document.createElement('div')
    container.id = 'app-alert-overlay-container'
    container.className = 'app-alert-overlay-container'
    container.setAttribute('role', 'region')
    container.setAttribute('aria-label', 'Floating Alert Notifications')
    document.body.appendChild(container)
  }
  return container
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
  dismissible,
  onClose,
  className = '',
  overlay = true,
  autoDismiss,
  duration = 3000,
}: AlertMessageProps) {
  const [isDismissed, setIsDismissed] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const alertType = variant ?? type ?? 'info'
  const shouldAutoDismiss = autoDismiss !== undefined ? autoDismiss : overlay
  const isDismissible = dismissible !== undefined ? dismissible : (overlay ? true : Boolean(onClose))
  const bodyContent = children || message || description

  // Adjust state during render if content changes (official React pattern)
  const [prevContent, setPrevContent] = useState(bodyContent)
  if (bodyContent !== prevContent) {
    setPrevContent(bodyContent)
    setIsDismissed(false)
  }

  const clearTimer = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  // Handle auto-dismiss timer
  useEffect(() => {
    if (!shouldAutoDismiss || duration <= 0 || isDismissed) {
      return
    }

    clearTimer()

    timerRef.current = setTimeout(() => {
      setIsDismissed(true)
      onClose?.()
    }, duration)

    return () => {
      clearTimer()
    }
  }, [shouldAutoDismiss, duration, bodyContent, alertType, isDismissed, onClose])

  const handleManualClose = () => {
    clearTimer()
    setIsDismissed(true)
    onClose?.()
  }

  if (isDismissed) return null

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

  const alertContent = (
    <div
      className={`app-alert app-alert--${alertType} ${overlay ? 'app-alert--overlay' : ''} ${className}`.trim()}
      role={alertType === 'error' ? 'alert' : 'status'}
      aria-live={alertType === 'error' ? 'assertive' : 'polite'}
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
          onClick={handleManualClose}
          aria-label="Dismiss alert"
        >
          <X size={15} />
        </button>
      )}
    </div>
  )

  if (overlay) {
    if (typeof document === 'undefined') {
      return null
    }
    return createPortal(alertContent, getOrCreateAlertContainer())
  }

  return alertContent
}

export default AlertMessage
