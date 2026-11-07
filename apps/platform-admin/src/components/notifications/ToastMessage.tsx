import { useEffect, useState, useCallback } from 'react'
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'
import './notifications.css'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
  id: string
  type: ToastType
  title?: string
  message: string
  duration?: number
  dismissible?: boolean
}

export interface ToastMessageProps {
  toast: ToastItem
  onDismiss: (id: string) => void
}

export function ToastMessage({ toast, onDismiss }: ToastMessageProps) {
  const [isExiting, setIsExiting] = useState(false)

  const handleDismiss = useCallback(() => {
    setIsExiting(true)
    setTimeout(() => {
      onDismiss(toast.id)
    }, 180)
  }, [onDismiss, toast.id])

  useEffect(() => {
    const duration = toast.duration ?? (toast.type === 'error' ? 5000 : 3500)
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleDismiss()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [toast.duration, toast.type, handleDismiss])

  const renderIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 size={18} className="app-toast-icon" aria-hidden="true" />
      case 'error':
        return <AlertCircle size={18} className="app-toast-icon" aria-hidden="true" />
      case 'warning':
        return <AlertTriangle size={18} className="app-toast-icon" aria-hidden="true" />
      case 'info':
      default:
        return <Info size={18} className="app-toast-icon" aria-hidden="true" />
    }
  }

  return (
    <div
      className={`app-toast app-toast--${toast.type} ${isExiting ? 'app-toast--exiting' : ''}`}
      role={toast.type === 'error' ? 'alert' : 'status'}
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
    >
      {renderIcon()}
      <div className="app-toast-body">
        {toast.title && <h4 className="app-toast-title">{toast.title}</h4>}
        <p className="app-toast-message">{toast.message}</p>
      </div>
      {toast.dismissible !== false && (
        <button
          type="button"
          className="app-toast-close"
          onClick={handleDismiss}
          aria-label="Dismiss notification"
        >
          <X size={15} />
        </button>
      )}
    </div>
  )
}

export default ToastMessage
