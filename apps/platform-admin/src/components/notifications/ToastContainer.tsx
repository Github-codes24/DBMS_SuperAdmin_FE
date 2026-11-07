import { ToastMessage, type ToastItem } from './ToastMessage'
import './notifications.css'

export type ToastPosition =
  | 'top-right'
  | 'top-left'
  | 'top-center'
  | 'bottom-right'
  | 'bottom-left'
  | 'bottom-center'

export interface ToastContainerProps {
  toasts: ToastItem[]
  onDismiss: (id: string) => void
  position?: ToastPosition
}

export function ToastContainer({
  toasts,
  onDismiss,
  position = 'top-right',
}: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div
      className={`app-toast-container app-toast-container--${position}`}
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => (
        <ToastMessage key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

export default ToastContainer

